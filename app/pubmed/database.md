# Database structure and queries

This document outlines the structure of the Neo4J database to be used for representing the PubMed data.
It outlines how the data can be extracted from the XML, as well as how to then contruct the Neo4J database using the Cipher query language.

## Features to extract from XML
Article ID
* `<ArticleID IdType='PubMed'>` value

Journal title
* `Article` -> `Journal` -> `Title`

Article title
* `Article` -> `ArticleTitle` or `VernacularTitle`

List of Authors
* `AuthorList` -> `Author`

List of Author affiliations
* `AuthorList` -> `Author` -> `AffiliationInfo` -> `Affiliation`.
* Note that very few entries appear to have this information included

Publication Date
* `Article` -> `Journal` -> `PubDate`

Primary MeshHeading(s)
* Record the `DescriptorName` value, when either the `QualifierNames` or `DescriptorNames` has `MajorTopicYN=’Y’` for the primary Mesh heading, `MeshHeadingList` -> `MeshHeading` -> `DescriptorName`/`QualifierName`

All MeshHeadings
* Record all `DescriptorName` values under `<MeshHeading>`

Citations to other papers
* based on `<ArticleID IdType='PubMed'>` value, `ReferenceList` -> `Reference` -> `ArticleIdList` -> `ArticleId`

## Neo4J structure

### Node types and fields

`Article`
* ID
* title
* Date

`Author`
* ID
* full_name

`Journal`
* ID
* name
* 
`MeshHeading`
* ID
* name
* tree_numbers

`Institution`
* ID
* name

#### Meta-node types

`DBMetadata`
* version: The database version number (integer).
* update_time: The time the update commenced.
* finish_time: The time the update finished (if finished, else this will be -1).
* status: Either 'updating' or 'normal' when the update is finished.
* file_names: The list of file names that was used or will be used to perform the update.
* file_hashes: The hashes of the files used in the update, in the same order as the file_names list. This will only be populated once the update has finished.

`Snapshot`
* id: `int`
* creation_time: `date`
* Filters used:
  * mesh_heading: `str`
  * author: `str`
  * date_from: `date`
  * date_to: `date`
  * first_author: `str`
  * last_author: `str`
* num_nodes: `int`
* Analytics results:
  * degree_centrality distribution: list
* DB version number (relationship to the DBMetadataNode)

### Relationships between nodes
* `AUTHOR_OF`: `Author` --> `Article`
  * Properties: `position`
* `PUBLISHED_IN`: `Article` --> `Journal`
  * Properties: `publication_date`
* `AFFILATED_WITH`: `Author` --> `Institution`
* `CATEGORISED_BY`: `Article` --> `MeshHeading`
  * Properties: `qualifiers`
* `CITES`: `Article` --> `Article`

#### Meta-node relationships
* `USING_VERSION`: `Snapshot` --> `DBMetadata`

### Cypher creation query examples

#### Creating nodes

Articles
```
CREATE (article7:Article {
ID: 7,
title: 'Maturation of the adrenal medulla--IV. Effects of morphine.',
})

CREATE (article999:Article {
ID: 999,
title: 'Referenced Article',
})
```

Authors
```
CREATE (author1:Author {
ID: 1,
full_name: 'TR Anderson'
})


CREATE (author2:Author {
ID: 2,
full_name: 'TA Slotkin'
})
```

Journals
```
CREATE (journal1:Journal {
ID: 1,
name: 'Biochemical pharmacology',
publication_date: date({year: 1975, month: 8, day: 15})
})
```

MeshHeadings
```
CREATE (heading1:MeshHeading {
ID: 1,
name: 'Adrenal Medulla'
})
CREATE (heading2:MeshHeading {
ID: 2,
name: 'Aging'
})
CREATE (heading3:MeshHeading {
ID: 3,
name: 'Animals'
})
```

Institutions
```
CREATE (institution1:Institution {
ID: 1,
name: 'Example University'
})
```

#### Defining relationships

Publication in a journal
```
CREATE (article7)-[:PUBLISHED_IN]->(journal1)
```

Author attribution
```
CREATE (author1)-[:AUTHOR_OF]->(article7)
CREATE (author2)-[:AUTHOR_OF]->(article7)
```

MESH Heading categorisation
```
CREATE (article7)-[:CATEGORISED_BY {qualifiers: ['enzymology', 'growth', 'metabolism']}]->(heading1)
CREATE (article7)-[:CATEGORISED_BY {qualifiers: []}]->(heading2)
CREATE (article7)-[:CATEGORISED_BY {qualifiers: []}]->(heading3)
```

Author affiliation
```
CREATE (author1)-[:AFFILIATED_WITH]->(institution1)
````

Article reference
```
CREATE (article7)-[:REFERENCES]->(article999)
```

### Indexes
```
CREATE INDEX mesh_heading_index FOR (h:MeshHeading) ON (h.name)

CREATE INDEX institution_index FOR (i:Institution) ON (i.name)

CREATE INDEX publication_date_index FOR (a:Article) ON (a.publicationDate)
```

### Unique constraints
```
CREATE CONSTRAINT unique_article_id FOR (article:Article) REQUIRE article.ID IS UNIQUE

CREATE CONSTRAINT unique_author_id FOR (author:Author) REQUIRE author.ID IS UNIQUE

CREATE CONSTRAINT unique_journal_id FOR (journal:Journal) REQUIRE journal.ID IS UNIQUE

CREATE CONSTRAINT unique_mesh_id FOR (meshHeading:MeshHeading) REQUIRE meshHeading.ID IS UNIQUE

CREATE CONSTRAINT unique_institution_id FOR (institution:Institution) REQUIRE institution.ID IS UNIQUE

```

## Testing data extraction
1. Create a directory `data/` at the root level of the repository.
2. Download Pub Med files to be processed and place them at `data/pubmed/updatefiles/`. 
Each file should be a `.xml.gz` file and should come with a corresponding `.xml.gz.md5` file.
3. Download MeSH heading description file from <https://www.nlm.nih.gov/databases/download/mesh.html> and place the `.xml` file under `data/mesh/`.
4. Run the extraction script with `python3 run.py extract`


## Prototype demonstration - database queries

Counts of all node types
`CALL apoc.meta.stats() YIELD labels RETURN labels;`

Relationships:
1. Author relationships: `MATCH p=()-[r:AUTHOR_OF]->() RETURN p LIMIT 25`
2. MeshHeading categories: `MATCH p=()-[r:CATEGORISED_BY]->() RETURN p LIMIT 25`
3. Journal publications: `MATCH p=()-[r:PUBLISHED_IN]->() RETURN p LIMIT 25`
4. Article references: `MATCH p=()-[r:REFERENCES]->() RETURN p LIMIT 25`


Filter query as per what happens in the backend prototype:
```
MATCH (author:Author {name:"Annalisa Patrizi"})
MATCH (author)-[r:AUTHOR_OF]-(article:Article)
OPTIONAL MATCH (article)<--(coauthor:Author) WHERE coauthor <> author
RETURN DISTINCT author.name AS author_name, 
article.title AS article_title, 
COLLECT(DISTINCT coauthor.name) AS coauthors
LIMIT 3
```

Query to show relationship between Authors, Articles, Journals and Mesh headings:
```
MATCH p=(m:MeshHeading)-[*]-(j:Journal) RETURN p LIMIT 10
```

Coauthor graph
```
CALL {
MATCH (a:Author)-[r:AUTHOR_OF*1..3]-(ar:Article)<--(target:Author)
WHERE a.name =~ ".*Annalisa Patrizi.*"
RETURN ar
}

MATCH (a1:Author)-[:AUTHOR_OF]->(ar:Article)<-[:AUTHOR_OF]-(a2:Author)

WITH a1, a2, count(*) AS c

RETURN a1, a2, apoc.create.vRelationship(a1, "COAUTHOR", {count: c}, a2) as rel
```

