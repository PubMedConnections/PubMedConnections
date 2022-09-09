from app import neo4j_session
from flask import jsonify
from datetime import datetime
from dateutil.relativedelta import relativedelta
from app.controller.snapshot_analyse import _create_query_from_filters
import json


def set_default_date(filters):
    if filters['published_after'] == '':
        # default: 40 years ago
        filters['published_after'] = datetime.now() - relativedelta(years=40)
    else:
        filters['published_after'] = datetime.strptime(filters['published_after'], '%Y-%m-%d')
    if filters['published_before'] == '':
        # default: now
        filters['published_before'] = datetime.now()
    else:
        filters['published_before'] = datetime.strptime(filters['published_before'], '%Y-%m-%d')
    return filters


def exist_edge(edge, author, coauthor):
    if (edge['from'] == author['id'] and edge['to'] == coauthor['id']) or \
            (edge['from'] == coauthor['id'] and edge['to'] == author['id']):
        return True
    return False


def add_root_mesh_headings(node, root_mesh_headings):
    if 'mesh' not in node:
        node['mesh'] = {}
        [node['mesh'].update({m: 1}) for m in root_mesh_headings]
    else:
        for m in root_mesh_headings:
            if m in node['mesh']:
                node['mesh'][m] += 1
            else:
                node['mesh'].update({m: 1})
    return node


def add_edge_node_value(nodes, edges, author, coauthor, coauthor_position, article):
    new_title = 'Mesh Heading: ' + ';'.join(article['mesh_heading']) + '\n' + \
                'Article Title: ' + article['article'] + '\n' + \
                'Date: ' + str(article['date']) + '\n' + \
                'Journal Title: ' + article['journal'] + '\n' + \
                'Positions: ' + \
                '#' + str(article['author_position']) + ' ' + author['label'] + '; ' + \
                '#' + str(coauthor_position) + ' ' + coauthor['label']
    # exists an edge between two nodes
    for j in range(len(edges)):
        if exist_edge(edges[j], author, coauthor):
            edges[j]['value'] += 1
            new_title = edges[j]['title'] + '\n\n' + new_title
            edges[j]['title'] = new_title
            return nodes, edges
    # no edges between two nodes
    # 1. add edge
    # 2. 2 nodes value + 1
    # 3. insert into nodes list
    edges.append({'from': author['id'],
                  'to': coauthor['id'],
                  'value': 1,
                  'title': new_title
                  })
    for j in range(len(nodes)):
        if nodes[j]['id'] == author['id'] or nodes[j]['id'] == coauthor['id']:
            nodes[j]['value'] += 1
            nodes[j] = add_root_mesh_headings(nodes[j], article['root_mesh_heading'])
    return nodes, edges


def query_by_filters(filters):
    # query for single author / first author/ last author & coauthor
    def cypher_author(tx):
        return list(tx.run(
            '''
            // mesh - author - coauthor           
            MATCH (mesh_heading: MeshHeading) <-[:CATEGORISED_BY]- (article: Article)
            WHERE SIZE($mesh_heading) = 0 OR toLower(mesh_heading.name) CONTAINS toLower($mesh_heading) 
            MATCH (root_mesh_heading:MeshHeading) 
            WHERE root_mesh_heading.tree_numbers[0]=substring(mesh_heading.tree_numbers[0], 0, 3)
            MATCH (author:Author) - [a: AUTHOR_OF] -> (article)
            WHERE 
            //no author
            (SIZE($author)=0 
                AND SIZE($first_author)=0 
                AND SIZE($last_author)=0 
                AND a.is_first_author = true)            
            
            //author
            OR (SIZE($author)<>0 
                AND toLower(author.name) 
                    CONTAINS toLower($author))
            
            //first author
            OR (SIZE($author)=0 
                AND SIZE($first_author)<>0 
                AND toLower(author.name) 
                    CONTAINS toLower($first_author) AND a.is_first_author = true)                        
            
                    
            //last author
            OR (SIZE($author)=0 
                AND SIZE($first_author)=0 
                AND SIZE($last_author)<>0 
                AND toLower(author.name) 
                    CONTAINS toLower($last_author) AND a.is_last_author = true)            
            
            //coauthor
            OPTIONAL MATCH (coauthor: Author) - [c:AUTHOR_OF] -> (article)          
            WHERE coauthor <> author
            
            MATCH (article) - [: PUBLISHED_IN] -> (journal : Journal)
            WHERE 
            (article.date >= date({year: $published_after.year, month:$published_after.month, 
                    day:$published_after.day}))
            AND (article.date <= date({year: $published_before.year, month:$published_before.month, 
                    day:$published_before.day}))
            AND (SIZE($journal) = 0 OR toLower(journal.title) CONTAINS toLower($journal))
            AND (SIZE($article) = 0 OR toLower(article.title) CONTAINS toLower($article))
            
            WITH
            article, a,c,mesh_heading,root_mesh_heading, journal,
            {
                label: author.name,
                id: author.id
            } AS author,
            {
                coauthor: {label: coauthor.name, id: coauthor.id},
                author_position: c.author_position           
            } AS coauthor
            
            WITH
            author,
            {
                article: article.title,
                journal: journal.title,
                date: article.date,
                author_position: a.author_position,
                mesh_heading: COLLECT(DISTINCT mesh_heading.name),
                root_mesh_heading: COLLECT(DISTINCT root_mesh_heading.name),
                coauthors: COLLECT(DISTINCT coauthor)
            } AS articles
                        
            RETURN 
            DISTINCT properties(author) AS author,
            COLLECT (DISTINCT properties(articles)) AS articles
            LIMIT $graph_size
            ''',
            {'mesh_heading': filters['mesh_heading'],
             'author': filters['author'],
             'first_author': filters['first_author'],
             'last_author': filters['last_author'],
             'published_before': filters['published_before'],
             'published_after': filters['published_after'],
             'journal': filters['journal'],
             'article': filters['article'],
             'graph_size': filters['graph_size']}
        ))

    results = neo4j_session.read_transaction(cypher_author)
    return process_query_author(results)


def process_query_author(results):
    nodes = []
    edges = []
    author_coauthor_set = set()
    for record in results:
        record = record.data()
        author = record['author']
        author['value'] = 1
        # a new author
        if author['id'] not in author_coauthor_set:
            author_coauthor_set.add(author['id'])
            nodes.append(author)
        # author - collect (article)
        # article = {article, author_position, collect(coauthors)}
        for article in record['articles']:
            # author who have no coauthor
            if article['coauthors'][0]['author_position'] is None:
                for j in range(len(nodes)):
                    if nodes[j]['id'] == author['id']:
                        new_title = 'Mesh Heading:' + '; '.join(article['mesh_heading']) + '\n' + \
                                    'Article Title:' + article['article'] + '\n' + \
                                    'Date: ' + str(article['date']) + '\n' + \
                                    'Journal Title:' + article['journal'] + '\n'
                        if 'title' not in nodes[j]:
                            nodes[j]['title'] = new_title
                        else:
                            nodes[j]['title'] = nodes[j]['title'] + '\n\n' + new_title
                        nodes[j] = add_root_mesh_headings(nodes[j], article['root_mesh_heading'])
                        break
                continue

            # article - collect(coauthor)
            # coauthor = {coauthor, author_position}
            for coauthor in article['coauthors']:
                coauthor_position = coauthor['author_position']
                coauthor = coauthor['coauthor']
                coauthor['value'] = 1
                if coauthor['id'] not in author_coauthor_set:
                    author_coauthor_set.add(coauthor['id'])
                    nodes.append(coauthor)
                nodes, edges = add_edge_node_value(nodes, edges, author, coauthor, coauthor_position, article)

    for node in nodes:
        node['title'] = json.dumps(node['mesh'], indent=4)

    return jsonify({"nodes": nodes,
                    "edges": edges,
                    'counts': {'nodes num': len(nodes),
                               'edges num': len(edges),
                               'records num': len(results)
                               }
                    })


def query_by_snapshot_id(snapshot_id):
    def cypher_snapshot(tx):
        snapshot = (tx.run(
            '''
            // mesh - author - coauthor
            MATCH (s:Snapshot)
            WHERE ID(s) = $snapshot_id 
            MATCH (d:DBMetadata)
            WHERE d.version = s.database_version
            WITH 
            properties(s) AS s,
            properties(d) AS d           
            RETURN s, d
            ''',
            {'snapshot_id': snapshot_id}
        ))
        snapshot = snapshot.single()['s']
        return snapshot

    filters = neo4j_session.read_transaction(cypher_snapshot)
    return query_by_filters(filters)


def get_author_graph(filters):
    filter_query_string = _create_query_from_filters(filters)
    # TODO 
    #   implement LIMIT in query
    #   deal with author with no co-authors
    #   add min_colaborations filter?
    def three_hop_author_neighbourhood_query(tx):
        # MATCH (a1:Author)-[:AUTHOR_OF*1..3]-(ar:Article)<--(a2:Author)        
        return list(
            tx.run(
                """
                CALL {{
                    MATCH (a1:Author)-[:AUTHOR_OF*1..3]-(ar:Article)<--(a2:Author)
                    WHERE EXISTS {{
                        MATCH (a1)-[w:AUTHOR_OF]->(ar1:Article)-[:CATEGORISED_BY]->(m1:MeshHeading)
                        WHERE {}
                    }}
                    RETURN ar
                }}

                MATCH (a1:Author)-[ao1:AUTHOR_OF]->(ar:Article)<-[ao2:AUTHOR_OF]-(a2:Author)
                MATCH (ar)-[:PUBLISHED_IN]->(j:Journal)
                MATCH (ar)-[:CATEGORISED_BY]->(m:MeshHeading)

                WITH {{ id: a1.id, name: a1.name }} as author1, {{ id: a2.id, name: a2.name }} as author2, {{ article_title: ar.title, journal_title: j.title, article_date: ar.date, a1_pos: ao1.author_position, a2_pos: ao2.author_position, meshes: COLLECT( DISTINCT m.name) }} as articles

                RETURN author1, author2, COLLECT(DISTINCT properties(articles)) AS articles
                """.format(filter_query_string)
            )
        )

    res = neo4j_session.read_transaction(three_hop_author_neighbourhood_query)

    return process_author_records(res)


def process_author_records(records):
    nodes = []
    edges = []

    author_and_coauthors = {}
    author_id_to_name = {}

    for record in records:
        record = record.data()

        author1 = record['author1']
        author2 = record['author2']

        num_articles_coauthored = len(record['articles'])

        if author1['id'] not in author_and_coauthors:
            # it's the first time we have seen this author
            author_and_coauthors[author1['id']] = {author2['id']}
            author_id_to_name[author1['id']] = author1['name']
        else:
            # we have seen this edge before
            if author2['id'] in author_and_coauthors[author1['id']]:
                continue
            else:
                author_and_coauthors[author1['id']].add(author2['id'])

        if author2['id'] not in author_and_coauthors:
            # it's the first time we have seen this author
            author_and_coauthors[author2['id']] = {author1['id']}
            author_id_to_name[author2['id']] = author2['name']
        else:
            author_and_coauthors[author2['id']].add(author1['id'])

        # construct edges
        for article in record['articles']:
            edges.append(
                {
                    'from': author1['id'],
                    'to': author2['id'],
                    'value': num_articles_coauthored,
                    'title':
                        'Mesh Heading:' + '; '.join(article['meshes']) + '\n' +
                        'Article Title:' + article['article_title'] + '\n' +
                        'Journal Title:' + article['journal_title'] + '\n'

                }
            )

    for author_id in author_and_coauthors:
        nodes.append(
            {
                'id': author_id,
                'label': author_id_to_name[author_id],
                'value': len(author_and_coauthors[author_id])
            }
        )

    # TODO what should records num equal to?

    return jsonify(
        {
            'nodes': nodes,
            'edges': edges,
            'counts':
                {
                    'nodes num': len(nodes),
                    'edges num': len(edges),
                    'records num': 0
                }
        }
    )
