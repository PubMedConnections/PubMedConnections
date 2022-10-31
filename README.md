<p align="center">
  <img src="/app/static/logo-with-name.png" alt="PubMed Connections Logo" height="160" />
</p>


PubMed Connections is a web application that facilitates
the analysis of the relationships between authors in the
PubMed database.

## Config

The [config.py](app/config.py) file is used to hold user
specific settings for the project. This includes
secret keys or email addresses. These values should
not be committed to the GitHub repository, but by
default git will want to include them in commits.
The following command can be used to keep
config.py from your commits,

```shell
git update-index --skip-worktree config.py
```

However, sometimes you may wish to push changes
that include changes within config.py. In these
cases, you should first manually remove all private
information from [config.py](app/config.py). After you
have done this, you can use the following command
to allow config.py to be included in commits,

```shell
git update-index --no-skip-worktree config.py
```

Once you have committed the changes to config.py,
you can mark the file as skip-worktree again, and
add your private information back.


## Conda Environment

This project uses a conda environment to manage its
dependencies. Instructions to install conda can be
found in the
[conda documentation](https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html).

**1. Creating the environment**

This only has to be done once. This command will
create a new conda environment that can be used
to run the website locally.
```shell
conda env create -f environment.yml
```

**2. Activating the environment**

This will activate the environment so that you
can run the website with all its dependencies
loaded.
```shell
conda activate pubmed-connections
```

**3. Updating the environment**

This will update the environment to include any
new dependencies that were added to the
`environment.yml` file.
```shell
conda env update --name pubmed-connections --file environment.yml --prune
```

## Neo4J Configuration
Neo4J stores recent transactions in a log by default, but this can use up huge amounts
of disk-space when we create the entire database. Therefore, adding the following
options to your Neo4J configuration will disable storing more than one transaction
at a time, which will greatly reduce the size of the Neo4J database on-disk after
its extraction.

```
# Retention policy for transaction logs needed to perform recovery and backups.
dbms.tx_log.rotation.retention_policy=1 files
dbms.tx_log.rotation.size=56M
dbms.tx_log.rotation.retention_policy=keep_none
```

## Example Graph
An example graph that was generated from academics at the University of Western Australia is shown below.

<p align="center">
  <img src="/app/static/example-graph.png" alt="Example PubMed Connections Graph" width="600" />
</p>
