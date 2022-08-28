FROM neo4j:4.4

# Neo4J
ENV NEO4JLABS_PLUGINS='["apoc","graph-data-science"]'
ENV NEO4J_AUTH=none

COPY deployment/neo4j.conf /conf/neo4j.conf
COPY deployment/apoc.conf /conf/apoc.conf
RUN mkdir -p data && mkdir -p logs


# Miniconda
RUN apt-get update && \
    apt-get install -y wget && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV CONDA_DIR /opt/conda
RUN wget --quiet https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda.sh && \
     /bin/bash ~/miniconda.sh -b -p /opt/conda

ENV PATH=$CONDA_DIR/bin:$PATH


# Build Conda Environment
COPY environment.yml /environment.yml
RUN conda init bash && \
    conda env create -f /environment.yml


# PubMed Connections
COPY app /app
COPY config.py /config.py
COPY LICENSE.txt /LICENSE.txt
COPY README.md /README.md
COPY run.py /run.py


# Entrypoint
COPY deployment/docker-entrypoint.sh /usr/local/bin/pmc-entrypoint.sh
RUN chmod u+x /usr/local/bin/pmc-entrypoint.sh
SHELL ["conda", "run", "-n", "pubmed-connections", "/bin/bash", "-c"]
ENTRYPOINT ["/usr/local/bin/pmc-entrypoint.sh"]
WORKDIR "/"
CMD ["echo", "If this printed, then something went wrong..."]
