# Database structure and queries

This document outlines the structure of the Neo4J database to be used for representing the PubMed data.
It outlines how the data can be extracted from the XML, as well as how to then contruct the Neo4J database using the Cipher query language.

## Features to extract from XML
Article ID
* `<ArticleID IdType=”PubMed”>` value

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
* based on `<ArticleID IdType=”PubMed”>` value, `ReferenceList` -> `Reference` -> `ArticleIdList` -> `ArticleId`

## Neo4J structure

### Node types and fields

`Article`
* ID
* articleTitle
* publicationDate

`Author`
* ID
* name

`Journal`
* ID
* name

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


### Cypher query examples

#### Creating nodes

Articles
```
CREATE (article7:Article {
ID: 7,
articleTitle: “Maturation of the adrenal medulla--IV. Effects of morphine.”,
publicationDate: date({year: 1975, month: 8, day: 15}),
})

CREATE (article999:Article {
ID: 999,
articleTitle: “Referenced Article”
publicationDate: date({year: 1975, month: 1, day: 1}),
})
```

Authors
```
CREATE (author1:Author {
ID: 1,
name: “TR Anderson”,
})


CREATE (author2:Author {
ID: 2,
name: “TA Slotkin”,
})
```

Journals
```
CREATE (journal1:Journal {
ID: 1,
name: “Biochemical pharmacology”,
})
```

MeshHeadings
```
CREATE (heading1:MeshHeading {
ID: 1,
name: “Adrenal Medulla”,
})
CREATE (heading2:MeshHeading {
ID: 2,
Name: “Aging”,
})
CREATE (heading2:MeshHeading {
ID: 2,
name: “Animals”,
})
```

Institutions
```
CREATE (institution1:Institution {
ID: 1,
name: “Example University”,
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
CREATE (article7)-[:CATEGORISED_BY-{qualifiers: [“enzymology”, “growth”, “metabolism”]}]->(heading1)
CREATE (article7)-[:CATEGORISED_BY-{qualifiers: []}]->(heading2)
CREATE (article7)-[:CATEGORISED_BY-{qualifiers: []}]->(heading3)
```

Author affiliation
```
CREATE (author1)-[:AFFILIATED_WITH]->(institution1)
````

Article reference
```
CREATE (article7)-[:REFERENCES]->(article999)
```
