# Neo4J Database queries

## Filter query
Filtering data by the following parameters:
* Author (`$author`)
* Article title (`$article_title`)
* Publication date (e.g. before a date or after a date) (`published_before`, `published_after`)
* Institution (`$institution`)
* Journal name (`$journal`)
* MESH heading (`$mesh_heading`)

The query will also allow for a limit on the number of entries returned (`$limit`).

This applies to the `/api/snapshot/visualise/<string:graph_type>` route.

### Returning the filtered graph subset
The following query should return the subset of the larger graph matching the query.
```
CALL {
    MATCH (article:Article)-[:CATEGORISED_BY]->(heading:MeshHeading)
    WHERE article.name =~ ".*" + $article_title + ".*"
    AND heading.name =~ ".*" + $mesh_heading + ".*"
    RETURN article
}

MATCH (institution:Institution)<-[:AFFILIATED_WITH]-(author:Author)-[:AUTHOR_OF]->(article)-[:PUBLISHED_IN]->(journal:Journal)
WHERE author.full_name =~ ".*" + $author + ".*"
AND institution.name =~ ".*" + $institution + ".*"
AND journal.name =~ ".*" + $journal + ".*"
AND journal.publication_date >= date({year: $published_after.year, month:$published_after.month, day:$published_after.day}
AND journal.publication_date <= date({year: $published_before.year, month:$published_abeforemonth, day:$published_before.day}
RETURN article, author, institution, journal, heading
LIMIT $limit
```