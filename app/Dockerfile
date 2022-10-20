FROM debian:bullseye-slim
ENV JAVA_HOME=/opt/java/openjdk
COPY --from=eclipse-temurin:11 $JAVA_HOME $JAVA_HOME
ENV PATH="${JAVA_HOME}/bin:${PATH}"


# Volumes
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
COPY ./ /app
COPY ./config.py /config.py
COPY run.py /run.py


# Entrypoint
COPY docker-entrypoint.sh /usr/local/bin/pmc-backend-entrypoint.sh
RUN chmod u+x /usr/local/bin/pmc-backend-entrypoint.sh
SHELL ["conda", "run", "-n", "pmc", "/bin/bash", "-c"]
WORKDIR "/"
ENTRYPOINT ["/usr/local/bin/pmc-backend-entrypoint.sh"]
CMD ["echo", "If this printed, then something went wrong..."]
