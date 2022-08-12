# Database queries for use initiated via the UI


Get latest database version number and the database status. As well as start & end time of the update.
```
MATCH (m:DBMetadata)
WITH max(m.version) AS max_version
MATCH (d:DBMetadata)
WHERE d.version = max_version
RETURN d.version, d.update_time, d.finish_time, d.status
```

Create a snapshot
```
CREATE (s:Snapshot {
id: 1,
creation_time: datetime('2022-06-24T12:50:35.556+0800'),
mesh_heading: 'cancer',
author: 'jim',
date_from: datetime('2015-01-01'),
date_to: datetime('2020-01-01'),
first_author: '',
last_author: '',
num_nodes: 5,
degree_centrality: [1,2,3,2,1]
});
```

Create a snapshot using the latest version:
```
MATCH (m:DBMetadata)
WITH max(m.version) AS max_version
MATCH (d:DBMetadata)
WHERE d.version = max_version

CREATE (s:Snapshot {
id: $snapshot_id,
creation_time: $creation_time,
mesh_heading: $mesh_heading,
author: $author,
date_from: $date_from,
date_to: $date_to,
first_author: $first_author,
last_author: $last_author,
num_nodes: $num_nodes,
degree_centrality: $degree_centrality
}) - [u:USING_VERSION] -> (d)
```

E.g. with literals:
```
MATCH (m:DBMetadata)
WITH max(m.version) AS max_version
MATCH (d:DBMetadata)
WHERE d.version = max_version

CREATE (s:Snapshot {
id: 1,
creation_time: datetime('2022-06-24T12:50:35.556+0800'),
mesh_heading: 'cancer',
author: 'jim',
date_from: datetime('2015-01-01'),
date_to: datetime('2020-01-01'),
first_author: '',
last_author: '',
num_nodes: 5,
degree_centrality: [1,2,3,2,1]
}) - [u:USING_VERSION] -> (d)
```

Delete a snapshot:
```
MATCH (s:Snapshot {id: $id})
DETACH DELETE s
```

Get a snapshot
```
MATCH (s:Snapshot {id: $id}) -- (v:DBMetadata)
RETURN s, v.version
```

Get all snapshots
```
MATCH (m:DBMetadata)
WITH max(m.version) AS max_version
MATCH (s:Snapshot) -- (v:DBMetadata)
RETURN s, v.version, v.version = max_version
```