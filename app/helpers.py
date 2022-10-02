
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

def remove_snapshot_metadata(snapshot):
    metadata_keys = ['creation_time', 
                    'database_version', 
                    'id', 
                    'betweenness_centrality', 
                    'degree_centrality',
                    'snapshot_name',
                    'graph_node_size']

    for key in metadata_keys:
        if key in snapshot:
            del snapshot[key]
            
    return snapshot
