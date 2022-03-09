<img src="/app/static/logo-with-name.png" height=160 />

PubMed Connections (real name pending...) is a project
to analyse the relationships between authors in the
PubMed database in near real-time.

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
