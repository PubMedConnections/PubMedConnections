from typing import Any

from neo4j.exceptions import ClientError
from graphdatascience import GraphDataScience

import json
import threading
from app.controller.snapshot_get import get_snapshot
from app.helpers import set_default_date, remove_snapshot_metadata
from app import neo4j_conn
from app.controller.snapshot_visualise import construct_graph_filter, construct_query_settings
from app.PubMedErrors import PubMedSnapshotDoesNotExistError, PubMedUpdateSnapshotError, PubMedAnalyticsError


class AnalyticsThreading(object):
    def __init__(self, graph_type: str, snapshot_id: int, filters):
        thread = threading.Thread(target=get_analytics, args=(graph_type, snapshot_id, filters))
        thread.daemon = True
        thread.start()


# TODO
# force timeing out of analytics
# testing
# GDS working with docker

# prevent creating a snapshot if no nodes returned or node limit is reached

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

    # print(node_query)
    # print(relationship_query)

    analytics_response = {}

    with neo4j_conn.new_session() as session:
        # try project graph into memory
        try:
            G, _ = gds.graph.project.cypher(
                graph_name,
                node_query,
                relationship_query,
                parameters=parameter_map,
                validateRelationships=False
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
            for row in res.head(5).itertuples():
                top_5_betweenness.append(
                    {
                        "id": row.nodeId,
                        "name": gds.util.asNode(row.nodeId).get('name'),
                        "centrality": int(row.score)
                    }
                )

            # compute the betweenness distributions
            betweenness_distributions = []
            for score, count in res['score'].value_counts().sort_index().iteritems():
                betweenness_distributions.append(
                    {
                        "score": int(score),
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

            print("analytics completed")

            analytics_response = {
                "degree": {
                    "top_5": top_5_degree,
                    "distributions": degree_distributions
                },
                "betweenness": {
                    "top_5": top_5_betweenness,
                    "distributions": betweenness_distributions
                }
            }

        except ClientError as err:
            raise PubMedAnalyticsError(err.code, err.message)
        
        finally:
            # drop projected graph
            if gds.graph.exists(graph_name)["exists"]:
                G = gds.graph.get(graph_name)
                G.drop()

    return analytics_response


def get_analytics(snapshot_id: int):
    """
    Gets analytics for the snapshot. If the analytics have been previously computed,
    retrieve the stored results from the DB, otherwise project the snapshot graph and 
    compute them.
    """

    snapshot = get_snapshot(snapshot_id)

    if len(snapshot) == 0:
        raise PubMedSnapshotDoesNotExistError(f"There is no snapshot with the id: {snapshot_id}")
    
    snapshot = snapshot[0]

    analytics_results = retrieve_analytics(snapshot_id)

    if analytics_results == {} or \
            'degree' not in analytics_results or \
            'betweenness' not in analytics_results:

        print("starting analytics")

        graph_name = "coauthors" + str(snapshot_id)

        # parse date strings into date time
        snapshot = set_default_date(snapshot)

        snapshot = remove_snapshot_metadata(snapshot)

        # construct filter object from snapshot
        query_settings = construct_query_settings(snapshot)
        query_settings.query_authors = True
        snapshot_filter = construct_graph_filter(snapshot)

        # query author nodes
        node_query = snapshot_filter.build(query_settings, node_query=True).query

        # create co-author relationships between these authors
        relationship_query = snapshot_filter.build(query_settings, relationship_query=True).query

        analytics_results = project_graph_and_run_analytics(
            graph_name, node_query, relationship_query, snapshot_filter.get_parameter_map(), snapshot_id
        )

    return analytics_results


def retrieve_analytics(snapshot_id: int):
    """
    Returns a JSON object containing the analytics results for a given snapshot.
    """

    analytics_response = {}

    with neo4j_conn.new_session() as session:

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

    return analytics_response
