FROM neo4j:4.4

# Neo4J
ENV NEO4JLABS_PLUGINS='["apoc","graph-data-science"]'
ENV NEO4J_AUTH=none

COPY deployment/neo4j.conf /conf/neo4j.conf
COPY deployment/apoc.conf /conf/apoc.conf


# Miniconda
RUN apt-get update && \
    apt-get install -y wget && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV CONDA_DIR /opt/conda
RUN wget --quiet https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda.sh && \
     /bin/bash ~/miniconda.sh -b -p /opt/conda

# Put conda in path so we can use conda activate
ENV PATH=$CONDA_DIR/bin:$PATH


# PubMed Connections
RUN mkdir -p /pmc
COPY app /pmc/app
COPY config.py /pmc/config.py
COPY environment.yml /pmc/environment.yml
COPY LICENSE.txt /pmc/LICENSE.txt
COPY README.md /pmc/README.md
COPY run.py /pmc/run.py


# Build Conda Environment
RUN conda init bash && \
    conda env create -f /pmc/environment.yml


# Entrypoint
COPY deployment/docker-entrypoint.sh /usr/local/bin/pmc-entrypoint.sh
RUN chmod u+x /usr/local/bin/pmc-entrypoint.sh
SHELL ["conda", "run", "-n", "pubmed-connections", "/bin/bash", "-c"]
ENTRYPOINT ["/usr/local/bin/pmc-entrypoint.sh"]
WORKDIR "/pmc"
CMD ["python3", "-m", "run"]
