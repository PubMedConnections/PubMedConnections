from neo4j.exceptions import ClientError
from graphdatascience import GraphDataScience
from config import NEO4J_URI, NEO4J_REQUIRES_AUTH
import json
import threading
from app.controller.snapshot_get import get_snapshot
from app.helpers import set_default_date
from app import neo4j_conn
from app.PubMedErrors import PubMedSnapshotDoesNotExistError, PubMedUpdateSnapshotError, PubMedAnalyticsError

class AnalyticsThreading(object):
    def __init__(self, graph_type: str, snapshot_id: int, filters):
        thread = threading.Thread(target=get_analytics, args=(graph_type, snapshot_id, filters))
        thread.daemon = True
        thread.start()

# TODO
# prevent creating a snapshot if no nodes returned
# deal with empty string filters 

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


def _create_query_from_filters(snapshot):
    """
    Helper function to map the snapshot filters to query conditions. The query conditions are returned as a string.
    """

    filter_queries = []

    if snapshot['mesh_heading'] != "":
        filter_queries.append("toLower(m1.name) CONTAINS '{}'".format(snapshot['mesh_heading'].lower()))
    if snapshot['author'] != "":
        filter_queries.append("toLower(a1.name) CONTAINS '{}'".format(snapshot['author'].lower()))
    if snapshot['first_author'] != "":
        filter_queries.append("w.is_first_author = '{}'".format(snapshot['first_author']))
    if snapshot['last_author'] != "":
        filter_queries.append("w.is_last_author = '{}'".format(snapshot['last_author']))
    if snapshot['published_after'] != "":
        filter_queries.append(
            "ar1.date >= date({year: %i, month:%i, day:%i})" % (
                snapshot['published_after'].year,
                snapshot['published_after'].month,
                snapshot['published_after'].day))
    if snapshot['published_before'] != "":
        filter_queries.append(
            "ar1.date <= date({year: %i, month:%i, day:%i})" % (
                snapshot['published_before'].year,
                snapshot['published_before'].month,
                snapshot['published_before'].day))
    if snapshot['journal'] != "":
        filter_queries.append(
            """
            EXISTS {{
                MATCH (ar)-[:PUBLISHED_IN]->(j:Journal)
                WHERE toLower(j.title) CONTAINS '{}'
            }}
            """.format(snapshot['journal'].lower())
        )
    if snapshot['article'] != "":
        filter_queries.append("toLower(ar.title) CONTAINS '{}'".format(snapshot['article'].lower()))

    return " AND ".join(filter_queries)


def build_generic_query(snapshot):
    query = ""

    query_journals = 'journal' in snapshot
    query_mesh = 'mesh_heading' in snapshot

    if query_journals:
        query += "MATCH (journal:Journal)\n"
        query += f"WHERE\n\ttoLower(journal.title) CONTAINS '{snapshot['journal'].lower()}'\n"
    
    if query_mesh:
        query += "MATCH (mesh_heading:MeshHeading)\n"
        query += f"WHERE\n\ttoLower(mesh_heading.name) CONTAINS '{snapshot['mesh_heading'].lower()}'\n"
    
    article_filters = []
    if 'article' in snapshot:
        article_filters.append(f"toLower(article.title) CONTAINS '{snapshot['article'].lower()}'")
    if 'published_after' in snapshot:
        article_filters.append(
            "article.date >= date({year: %i, month:%i, day:%i})" % (
                snapshot['published_after'].year,
                snapshot['published_after'].month,
                snapshot['published_after'].day))
    if 'published_before' in snapshot:
        article_filters.append(
            "article.date <= date({year: %i, month:%i, day:%i})" % (
                snapshot['published_before'].year,
                snapshot['published_before'].month,
                snapshot['published_before'].day))
    
    if len(article_filters) > 0 or snapshot['author'] != "" or snapshot['first_author'] != "" or snapshot['last_author'] != "":
        left = ""
        right = ""
        if query_journals:
            left = "(journal) <-[article_published_in:PUBLISHED_IN]- "
        if query_mesh:
            right = " -[article_categorised_by:CATEGORISED_BY]-> (mesh_heading)"

        query += f"MATCH {left}(article:Article){right}\n"

        if len(article_filters) > 0:
            query += "WHERE\n\t"
            query += "\n\tAND ".join(article_filters) + "\n"

    query += "MATCH (author:Author) -[author_rel:AUTHOR_OF]-> (article)\n"
    author_filters = []
    if 'author' in snapshot:
        author_filters.append(f"toLower(author.name) CONTAINS '{snapshot['author'].lower()}'")
    if 'first_author' in snapshot:
        article_filters.append(f"author_rel.is_first_author = '{snapshot['first_author']}'")
    if 'last_author' in snapshot:
        article_filters.append(f"author_rel.is_last_author = '{snapshot['last_author']}'")

    if len(author_filters) > 0:
        query += "WHERE\n\t"
        query += "\n\tAND ".join(author_filters) + "\n"

    query += "OPTIONAL MATCH (author:Author) --> (article) <-- (coauthor:Author)\n"
    # query += "RETURN\n"
    # query += "\tDISTINCT author, coauthor"

    return query

def build_node_query(snapshot):

    node_limit = snapshot['graph_size'] if 'graph_size' in snapshot else 1000

    query = build_generic_query(snapshot)
    
    query += "WITH COLLECT(id(author)) + COLLECT(id(coauthor)) AS ids\n"
    query += "UNWIND ids as id\n"
    query += "RETURN DISTINCT id\n"
    
    # query += "WITH COLLECT(author) + COLLECT(coauthor) AS authors\n"
    # query += "UNWIND authors as a\n"
    # query += "RETURN DISTINCT a\n"

    query += f"LIMIT {node_limit}"

    return query

def build_relationship_query(snapshot):
    query = build_generic_query(snapshot)
    

    central_author = True if 'author' in snapshot or 'first_author' in snapshot or 'last_author' in snapshot else False

    # build sub-query section
    query = "CALL {\n" + query
    if central_author:
        query += "WITH COLLECT(DISTINCT author) as authors, COLLECT(DISTINCT article) as articles\n"
        query += "UNWIND authors as author\n"
        query += "UNWIND articles as article\n"
        query += "RETURN author, article\n"
    else:
        query += "RETURN DISTINCT article\n"
    query += "}\n\n"

    # build main query
    query += "MATCH (author1:Author)-[:AUTHOR_OF]->(article:Article)<-[:AUTHOR_OF]-(author2:Author)\n"
    if central_author:
        # we need to make the graph directed, as the graph cypher projection does not support undirected relationships
        query += "WHERE author1 = author OR author2 = author\n"
    query += "RETURN id(author1) as source, id(author2) as target, apoc.create.vRelationship(author1, 'COAUTHOR', {count: count(*)}, author2) as rel"
    
    return query

def _project_graph_and_run_analytics(graph_name: str, node_query: str, relationship_query: str, snapshot_id: int):
    if NEO4J_REQUIRES_AUTH:
        from config import NEO4J_PASSWORD, NEO4J_USER
        gds = GraphDataScience(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    else:
        gds = GraphDataScience(NEO4J_URI)

    print(node_query)
    print(relationship_query)

    analytics_response = {}

    with neo4j_conn.new_session() as session:
        # try project graph into memory
        try:
            G, _ = gds.graph.project.cypher(
                graph_name,
                node_query,
                relationship_query,
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
            # TODO may need to use a cut-off for very large graphs
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

            session.write_transaction(_update_snapshot_centrality, update_degree_centrality_query, snapshot_id, degree_centrality_record)

            # compute degree centrality
            res = gds.betweenness.stream(G)
            res = res.sort_values(by=['score'], ascending=False, ignore_index=True)

            # get the top 5 nodes by degree centrality
            top_5_betweenness = []
            for row in res.head(5).itertuples():
                top_5_betweenness.append(
                    {
                        "id": row.nodeId,
                        "name": gds.util.asNode(row.nodeId).get('name'),
                        "centrality": int(row.score)
                    }
                )

            # print(top_5_betweenness)

            # compute the betweenness distributions
            # TODO may need to use a cut-off for very large graphs
            betweenness_distributions = []
            for score, count in res['score'].value_counts().sort_index().iteritems():
                betweenness_distributions.append(
                    {
                        "score": int(score),
                        "count": count
                    }
                )

            # print(betweenness_distributions)

            betweenness_centrality_record = json.dumps(
                {
                    "top_5": top_5_betweenness,
                    "distributions": betweenness_distributions
                }
            )

            session.write_transaction(_update_snapshot_centrality, update_betweenness_centrality_query, snapshot_id, betweenness_centrality_record)

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

    if snapshot == []:
        raise PubMedSnapshotDoesNotExistError(f"There is no snapshot with the id: {snapshot_id}")
    
    snapshot = snapshot[0]

    analytics_results = retrieve_analytics(snapshot_id)

    if analytics_results == {} or \
        'degree' not in analytics_results or \
        'betweenness' not in analytics_results:

        print("starting analytics")

        # parse date strings into date time
        snapshot = set_default_date(snapshot)

        graph_name = "coauthors" + str(snapshot_id)

        # return matching author nodes
        node_query = build_node_query(snapshot)

        # create co-author relationships between these authors
        relationship_query = build_relationship_query(snapshot)

        analytics_results = _project_graph_and_run_analytics(graph_name, node_query, relationship_query, snapshot_id)

    return analytics_results


def retrieve_analytics(snapshot_id: int):
    """
    Returns a JSON object containing the analytics results for a given snapshot.
    """

    analytics_response = {}

    with neo4j_conn.new_session() as session:

        # retrieve the degree centrality record
        degree_centrality_record = session.read_transaction(_retrieve_centrality, retrieve_degree_centrality_query, snapshot_id)

        if degree_centrality_record.data() is not None:

            # if the degree centrality record is the empty string it means the analytics results
            # have not yet been added to the db
            if (degree_centrality_record.data()['degree_centrality'] is not None and degree_centrality_record.data()['degree_centrality'] != ""):
                degree_centrality = json.loads(degree_centrality_record.data()['degree_centrality'])
                analytics_response['degree'] = degree_centrality

        # retrieve the betweenness_centrality record
        betweenness_centrality_record = session.read_transaction(_retrieve_centrality, retrieve_betweenness_centrality_query, snapshot_id)

        if betweenness_centrality_record.data() is not None:
            if (betweenness_centrality_record.data()['betweenness_centrality'] is not None and betweenness_centrality_record.data()['betweenness_centrality'] != ""):
                betweenness_centrality = json.loads(betweenness_centrality_record.data()['betweenness_centrality'])
                analytics_response['betweenness'] = betweenness_centrality
        
    return analytics_response
