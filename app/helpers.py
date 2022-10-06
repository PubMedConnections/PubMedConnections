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
