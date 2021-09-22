# COMP3900 Capstone Project - CLOG

[![Backend Build Status](https://github.com/unsw-cse-comp3900-9900-21T1/capstone-project-3900-w13b-wastedpotential/actions/workflows/backend.yml/badge.svg)](https://github.com/unsw-cse-comp3900-9900-21T1/capstone-project-3900-w13b-wastedpotential/actions/workflows/backend.yml)

## Docker

To install Docker, you can follow the instructions [here](https://docs.docker.com/get-docker/)

You can use `docker compose` to set up both the client and server components

### Trying out
To start a client and server session, run from the current directory

```bash
docker compose up --detach --build
```

To stop and delete the containers, run from the current directory
```bash
docker compose down --rmi all
```

### Development
To start a client and server session, run from the current directory

```bash
docker compose up --build
```

To stop and delete the containers, run from the current directory
```bash
docker compose down --rmi all
```

## Setup

We assume that you are running Python 3.8

### Setup a virtual environment

Refer to <https://docs.python.org/3/tutorial/venv.html> on how to setup a virtual environment

### Install python dependencies

Install dependencies in requirements.txt in your virtual environment
`pip install -r requirements.txt`

### Setup pre-commit hooks

The command `pre-commit` should be installed via the requirements.txt.
Check the version by running `pre-commit --version`.

It should look something like this

```bash
$ pre-commit --version
pre-commit 2.10.1
```

Install the git hook scripts by running `pre-commit install`

It should look something like this

```bash
$ pre-commit install
pre-commit install at .git/hooks/pre-commit
```

`pre-commit` will now run automatically each time `git commit` is run

Some things to be aware of:

- When `pre-commit` is run and one of the hooks automatically edit a file,
you will need to add the modified file to the git staging area and commit again
- `pre-commit` runs `black` as a python code formatter follow up by `flake8`
as a style checker. Sometimes `flake8` may pick up extra errors that `black`
doesn't fix itself automatically; this is intentional. If it still doesn't look right,
chuck a message in the Discord
- One of the `pre-commit` hooks has disabled committing to the `main` branch (pushing is
still enabled). Committing directly to `develop` is enabled,
