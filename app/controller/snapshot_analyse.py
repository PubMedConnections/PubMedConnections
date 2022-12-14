import traceback
from typing import Any

from neo4j.exceptions import ClientError
from graphdatascience import GraphDataScience

import json
import threading

from app.controller.graph_queries import query_graph, CoAuthorGraph, parse_dates
from app.controller.snapshot_get import get_snapshot
from app.helpers import remove_snapshot_metadata
from app import neo4j_conn
from app.PubMedErrors import PubMedSnapshotDoesNotExistError, PubMedUpdateSnapshotError, PubMedAnalyticsError

class AnalyticsThreading(object):
    def __init__(self, snapshot_id: int):
        thread = threading.Thread(target=compute_analytics, args=(snapshot_id,))
        thread.daemon = True
        thread.start()


update_degree_centrality_query = \
    """
    MATCH (m:DBMetadata)
    WITH max(m.version) AS max_version
    MATCH (d:DBMetadata)
    WHERE d.version = max_version

    MATCH (s:Snapshot { id: $snapshot_id })
    SET s.degree_centrality = $centrality_record
    RETURN s
    """

update_betweenness_centrality_query = \
    """
    MATCH (m:DBMetadata)
    WITH max(m.version) AS max_version
    MATCH (d:DBMetadata)
    WHERE d.version = max_version

    MATCH (s:Snapshot { id: $snapshot_id })
    SET s.betweenness_centrality = $centrality_record
    RETURN s
    """

retrieve_degree_centrality_query = \
    """
    MATCH (m:DBMetadata)
    WITH max(m.version) AS max_version
    MATCH (d:DBMetadata)
    WHERE d.version = max_version

    MATCH (s: Snapshot { id: $snapshot_id })
    RETURN s.degree_centrality AS degree_centrality
    """

retrieve_betweenness_centrality_query = \
    """
    MATCH (m:DBMetadata)
    WITH max(m.version) AS max_version
    MATCH (d:DBMetadata)
    WHERE d.version = max_version

    MATCH (s: Snapshot { id: $snapshot_id })
    RETURN s.betweenness_centrality AS betweenness_centrality
    """

set_analytics_status_query = \
    """
    MATCH (m:DBMetadata)
    WITH max(m.version) AS max_version
    MATCH (d:DBMetadata)
    WHERE d.version = max_version

    MATCH (s:Snapshot { id: $snapshot_id })
    SET s.analytics_status = $status
    RETURN s
    """

retrieve_analytics_status_query = \
    """
    MATCH (m:DBMetadata)
    WITH max(m.version) AS max_version
    MATCH (d:DBMetadata)
    WHERE d.version = max_version

    MATCH (s: Snapshot { id: $snapshot_id })
    RETURN s.analytics_status AS status
    """

def _update_snapshot_centrality(tx, update_snapshot_centrality_query: str, snapshot_id: int, centrality_record):
    """
    Helper function that updates a snapshot with the corresponding centrality results.
    """
    result = tx.run(
        update_snapshot_centrality_query, 
        snapshot_id=snapshot_id, 
        centrality_record=centrality_record
    )

    if result is None:
        raise PubMedUpdateSnapshotError("Unable to update snapshot with centrality results.")


def _retrieve_centrality(tx, retrieve_centrality_query: str, snapshot_id: int):
    """
    Helper function to retrieve centrality results.
    """

    result = tx.run(
        retrieve_centrality_query,
        snapshot_id=snapshot_id
    )

    return result.single()

def _set_analytics_status(tx, status_update_query: str, snapshot_id: int, status: str):
    result = tx.run(
        status_update_query,
        snapshot_id=snapshot_id,
        status=status
    )

    if result is None:
        raise PubMedUpdateSnapshotError("Unable to update snapshot analytics status.")

def _retrieve_analytics_status(tx, retrieve_status_query: str, snapshot_id: int):
    result = tx.run(
        retrieve_status_query,
        snapshot_id=snapshot_id
    )

    return result.single()

def project_graph_and_run_analytics(
        graph_name: str,
        node_query: str,
        relationship_query: str,
        parameter_map: dict[str, Any],
        snapshot_id: int):
    """
    Projects the graph which the analytics are to be computed on, then computes these analytics.
    """
    gds = GraphDataScience(neo4j_conn.driver)

    with neo4j_conn.new_session() as session:
        # try project graph into memory
        try:
            session.write_transaction(_set_analytics_status, 
                                    set_analytics_status_query, 
                                    snapshot_id,
                                    status="In Progress")

            # make sure graph has not already been projected
            if gds.graph.exists(graph_name)["exists"]:
                G = gds.graph.get(graph_name)
                G.drop()

            G, _ = gds.graph.project.cypher(
                graph_name,
                node_query,
                relationship_query,
                parameters=parameter_map,
                validateRelationships=True
            )

            # compute degree centrality
            res = gds.degree.stream(G)
            res = res.sort_values(by=['score'], ascending=False, ignore_index=True)

            # get the top 5 nodes by degree centrality
            top_5_degree = []
            for row in res.head(5).itertuples():
                top_5_degree.append(
                    {
                        "id": row.nodeId,
                        "name": gds.util.asNode(row.nodeId).get('name'),
                        "centrality": int(row.score)
                    }
                )

            # compute the degree distributions
            degree_distributions = []
            for score, count in res['score'].value_counts().sort_index().iteritems():
                degree_distributions.append(
                    {
                        "score": score,
                        "count": count
                    }
                )

            # construct degree centrality record and save to db
            degree_centrality_record = json.dumps(
                {
                    "top_5": top_5_degree,
                    "distributions": degree_distributions
                }
            )

            session.write_transaction(
                _update_snapshot_centrality,
                update_degree_centrality_query,
                snapshot_id,
                degree_centrality_record
            )

            # compute betweenness centrality
            res = gds.betweenness.stream(G)
            res = res.sort_values(by=['score'], ascending=False, ignore_index=True)

            # get the top 5 nodes by betweenness centrality
            top_5_betweenness = []
            res['score'] = res['score'].astype(int)
            for row in res.head(5).itertuples():
                top_5_betweenness.append(
                    {
                        "id": row.nodeId,
                        "name": gds.util.asNode(row.nodeId).get('name'),
                        "centrality": row.score
                    }
                )

            # compute the betweenness distributions
            betweenness_distributions = []
            for score, count in res['score'].value_counts().sort_index().iteritems():
                betweenness_distributions.append(
                    {
                        "score": score,
                        "count": count
                    }
                )

            betweenness_centrality_record = json.dumps(
                {
                    "top_5": top_5_betweenness,
                    "distributions": betweenness_distributions
                }
            )

            session.write_transaction(
                _update_snapshot_centrality,
                update_betweenness_centrality_query,
                snapshot_id,
                betweenness_centrality_record
            )

            session.write_transaction(_set_analytics_status, 
                                set_analytics_status_query,
                                snapshot_id,
                                status="Completed")

        except ClientError as err:
            traceback.print_exc()
            session.write_transaction(_set_analytics_status, 
                                set_analytics_status_query, 
                                snapshot_id,
                                status="Error")
        
        finally:
            # drop projected graph
            if gds.graph.exists(graph_name)["exists"]:
                G = gds.graph.get(graph_name)
                G.drop()

def compute_analytics(snapshot_id: int):
    """
    Computes the analytics for the snapshot. Builds the node and relationship queries which are then 
    passed to a helper function for computation and storing of results in the db.
    """
    try:
        # Fetch the snapshot settings from the database.
        snapshot = get_snapshot(snapshot_id)
        if len(snapshot) == 0:
            raise PubMedSnapshotDoesNotExistError(f"There is no snapshot with the id: {snapshot_id}")
        
        snapshot = snapshot[0]

        graph_name = "coauthors" + str(snapshot_id)
        snapshot_filters = remove_snapshot_metadata(snapshot)
        snapshot_filters = parse_dates(snapshot_filters)

        # Query the graph to perform the analytics on.
        graph = query_graph(snapshot_filters)
        if not isinstance(graph, CoAuthorGraph):
            raise Exception("Only co-author graphs are supported for analytics")

        # Build the queries for projecting the graph for analytics.
        query_params = {
            "author_ids": list(graph.authors_with_coauthors_ids),
            "article_ids": list(graph.article_ids)
        }
        node_query = """
        UNWIND $author_ids AS id
        RETURN id
        """
        relationship_query = """
        MATCH (author) -[:IS_AUTHOR]-> (:ArticleAuthor) -[:AUTHOR_OF]-> (article:Article)
                        <-[:AUTHOR_OF]- (:ArticleAuthor) <-[IS_AUTHOR]- (coauthor:Author)
        WHERE
            id(author) IN $author_ids
            AND id(coauthor) IN $author_ids
            AND author <> coauthor
            AND id(article) in $article_ids
        RETURN
            id(author) AS source,
            id(coauthor) AS target,
            apoc.create.vRelationship(author, 'COAUTHOR', {count: COUNT(DISTINCT article)}, coauthor) as rel
        """

        project_graph_and_run_analytics(
            graph_name, node_query, relationship_query, query_params, snapshot_id
        )
    
    except Exception as e:
        traceback.print_exc()
        with neo4j_conn.new_session() as session:
            session.write_transaction(_set_analytics_status, 
                            set_analytics_status_query, 
                            snapshot_id,
                            status="Error")

def retrieve_analytics(snapshot_id: int):
    """
    Returns the status of the analytics computation, including the results (should they have been completed)
    of a given snapshot.
    """

    analytics_response = {}

    with neo4j_conn.new_session() as session:
        snapshot = get_snapshot(snapshot_id)
        if len(snapshot) == 0:
            raise PubMedSnapshotDoesNotExistError(f"There is no snapshot with the id: {snapshot_id}")
    
        snapshot = snapshot[0]

        status = session.read_transaction(
            _retrieve_analytics_status, 
            retrieve_analytics_status_query, 
            snapshot_id
        )
        
        if status is not None:
            status = status.data()['status']

        # Retrieve the degree centrality record.
        degree_centrality_record = session.read_transaction(
            _retrieve_centrality,
            retrieve_degree_centrality_query,
            snapshot_id
        )

        degree_data = degree_centrality_record.data()
        if degree_data is not None:
            # If the degree centrality record is the empty string it means the analytics results
            # have not yet been added to the db.
            degree_centrality_json = degree_data['degree_centrality']
            if degree_centrality_json is not None and len(degree_centrality_json) > 0:
                degree_centrality = json.loads(degree_centrality_json)
                analytics_response['degree'] = degree_centrality

        # Retrieve the betweenness_centrality record.
        betweenness_centrality_record = session.read_transaction(
            _retrieve_centrality,
            retrieve_betweenness_centrality_query,
            snapshot_id
        )

        betweenness_data = betweenness_centrality_record.data()
        if betweenness_data is not None:
            betweenness_centrality_json = betweenness_data['betweenness_centrality']
            if betweenness_centrality_json is not None and len(betweenness_centrality_json) > 0:
                betweenness_centrality = json.loads(betweenness_centrality_json)
                analytics_response['betweenness'] = betweenness_centrality

    if status == "In Progress" or status is None:
        analytics_response = {
            'status': 'In Progress' 
        }
    elif status == "Error" or status == "Completed" and len(analytics_response) != 2:
        analytics_response = {
            'status': 'Error' 
        }
    else:
        analytics_response['status'] = 'Completed'

    return analytics_response
