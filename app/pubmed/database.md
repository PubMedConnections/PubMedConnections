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

`Author`
* ID
* full_name

`Journal`
* ID
* name
* publication_date

`MeshHeading`
* ID
* name

`Institution`
* ID
* name

### Relationships between nodes
* `AUTHOR_OF`: `Author` --> `Article`
* `PUBLISHED_IN`: `Article` --> `Journal`
* `AFFILATED_WITH`: `Author` --> `University`
* `CATEGORISED_BY`: `Article` --> `MeshHeading`
  * Properties: `qualifiers`
* `REFERENCES`: `Article` --> `Article`


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
