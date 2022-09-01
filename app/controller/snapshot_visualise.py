from app import neo4j_session
from flask import jsonify
from datetime import datetime
from dateutil.relativedelta import relativedelta


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


def add_node_value(nodes, author):
    for j in range(len(nodes)):
        if nodes[j]['id'] == author['id']:
            nodes[j]['value'] += 1
            break
    return nodes


def query_by_filters(filters):
    # query for single author / first author/ last author & coauthor
    def cypher_author(tx):
        return list(tx.run(
            '''
            // mesh - author - coauthor           
            MATCH (mesh_heading: MeshHeading) <-[:CATEGORISED_BY]- (article: Article)
            WHERE SIZE($mesh_heading) = 0 OR toLower(mesh_heading.name) = toLower($mesh_heading) 
            
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
            article, a,c,mesh_heading, journal,
            {
                label: author.name,
                id: author.id
            } AS author,
            {
                coauthor: {label: coauthor.name, id: coauthor.id},
                coauthor_position: c.author_position           
            } AS coauthor
            
            WITH
            author,
            {
                article: article.title,
                journal: journal.title,
                date: article.date,
                author_position: a.author_position,
                mesh_heading: COLLECT(DISTINCT mesh_heading.name),
                coauthors: COLLECT(DISTINCT coauthor)
            } AS articles
                        
            RETURN 
            DISTINCT properties(author) AS author,
            COLLECT (DISTINCT properties(articles)) AS articles
            LIMIT 100
            ''',
            {'mesh_heading': filters['mesh_heading'],
             'author': filters['author'],
             'first_author': filters['first_author'],
             'last_author': filters['last_author'],
             'published_before': filters['published_before'],
             'published_after': filters['published_after'],
             'journal': filters['journal'],
             'article': filters['article'],
             'num_nodes': filters['num_nodes']}
        ))

    results = neo4j_session.read_transaction(cypher_author)
    return process_query_author(results)


def process_query_author(results):
    nodes = []
    edges = []
    author_set = set()
    for record in results:
        record = record.data()
        author = record['author']
        author['value'] = 0

        # a new author
        new_author = False
        if author['id'] not in author_set:
            author_set.add(author['id'])
            new_author = True

        # author - collect (article)
        # article = {article, author_position, collect(coauthors)}
        for article in record['articles']:
            # no coauthor
            if article['coauthors'][0]['coauthor_position'] is None:
                edges.append({'from': author['id'],
                              'to': author['id'],
                              'title':
                                  'Mesh Heading:' + ' \n'.join(article['mesh_heading']) + '\n' +
                                  'Article Title:' + article['article'] + '\n' +
                                  'Journal Title:' + article['journal'] + '\n' +
                                  'Positions: \n' +
                                  '#' + str(article['author_position']) + ' ' + author['label'] + '\n'
                              })
                continue

            # article - collect(coauthor)
            # coauthor = {coauthor, coauthor_position}
            for coauthor in article['coauthors']:

                # old coauthor, new author
                #   1. old coauthor value + 1   2. new author value + 1
                if coauthor['coauthor']['id'] in author_set and new_author:
                    author['value'] += 1
                    nodes = add_node_value(nodes, coauthor['coauthor'])

                # old coauthor, old author
                # todo: edge value + 1
                # elif coauthor['coauthor']['id'] in author_set and not new_author:
                #     pass

                # new coauthor, old author
                # 1. add coauthor to set, 2. old author value + 1, 3. add coauthor to nodes
                elif coauthor['coauthor']['id'] not in author_set and not new_author:
                    author_set.add(coauthor['coauthor']['id'])
                    nodes = add_node_value(nodes, author)
                    coauthor['coauthor']['value'] = 1
                    nodes.append(coauthor['coauthor'])

                # new coauthor, new author
                # 1. add coauthor to set, 2. new author value + 1, 3. add coauthor to nodes
                elif coauthor['coauthor']['id'] not in author_set and new_author:
                    author_set.add(coauthor['coauthor']['id'])
                    author['value'] += 1
                    coauthor['coauthor']['value'] = 1
                    nodes.append(coauthor['coauthor'])
                # edges
                edges.append({'from': author['id'],
                              'to': coauthor['coauthor']['id'],
                              'title':
                                  'Mesh Heading: ' + ' & '.join(article['mesh_heading']) + '\n' +
                                  'Article Title: ' + article['article'] + '\n' +
                                  'Journal Title:' + article['journal'] + '\n' +
                                  'date: ' + str(article['date']) + '\n' +
                                  'Positions: \n' +
                                  '#' + str(article['author_position']) + ' ' + author['label'] + '\n' +
                                  '#' + str(coauthor['coauthor_position']) + ' ' + coauthor['coauthor']['label']
                              })
        # add new author
        if new_author:
            nodes.append(author)
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
