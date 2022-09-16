FROM neo4j:4.4.9

# Neo4J
ENV NEO4JLABS_PLUGINS='["apoc","graph-data-science"]'
ENV NEO4J_AUTH=none
COPY extension-script.sh /extension_script.sh
ENV EXTENSION_SCRIPT=/extension_script.sh

COPY neo4j.conf /conf/neo4j.conf
COPY apoc.conf /conf/apoc.conf
