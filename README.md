# Open Apparel Registry

The Open Apparel Registry (OAR) is a tool to identify every apparel facility worldwide.

- [Requirements](#requirements)
- [Setup](#setup)
- [Development](#development)
  - [Legacy API](#legacy-api)
  - [Hot Reloading 🔥](#hot-reloading-)
  - [Ports](#ports)
- [Scripts](#scripts)

## Requirements

- Vagrant 2.1+
- VirtualBox 5.0+
- AWS CLI 1.1+
- IAM credentials (for artifacts, secrets, etc)

## Setup

First, configure a local AWS profile with access to an S3 bucket with files containing project specific environment variables:

```bash
$ aws configure --profile open-apparel-registry
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-east-1
Default output format [None]:
```

Next, use `setup` to bring up the development environment:

```bash
$ ./scripts/setup
```

`setup` will provision a Vagrant VM, using `vboxsf` to mount `./` (relative to `Vagrantfile`) to `/vagrant`, as well as `~/.aws` to `/home/vagrant/.aws`, and execute `update`.

After running `setup`, you can access the VM by running:

```bash
$ vagrant ssh
vagrant@vagrant:/vagrant$
```

## Development

To start the application, run:

```bash
# Access the VM console
$ vagrant ssh

# Start the application
vagrant@vagrant:/vagrant$ ./scripts/server
```

### Legacy API

The legacy API is included in this repository. It uses [Restify](http://restify.com), a NodeJS framework, and MongoDB with ElasticSearch.

To start this version of OAR, first, bootstrap the database:

```bash
# Access the VM console
$ vagrant ssh

# Import database dumps from Sourcemap and run ElasticSearch indexing
vagrant@vagrant:/vagrant$ export OAR_SETTINGS_BUCKET=openapparelregistry-development-config-us-east-1
vagrant@vagrant:/vagrant$ ./scripts/bootstrap --restify
```

Next, run:

```bash
# Start the application
vagrant@vagrant:/vagrant$ ./scripts/server --restify
```

There is a separate `docker-compose.restify.yml` file that contains the legacy Docker Compose services.

The NodeJS backend uses [Nodemon](https://nodemon.io) to monitor for any source code changes and will automatically restart.

### Hot Reloading 🔥

Because the frontend uses [Create React App](https://github.com/facebook/create-react-app/), which integrates with webpack, the page will automatically reload if you make changes to the code.

In development, the [Django](https://www.djangoproject.com) app sits behind a [Gunicorn](https://www.gunicorn.org) worker that is passed the [`--reload` flag](https://docs.gunicorn.org/en/stable/settings.html#reload).

### Ports

| Service                    | Port                            |
| -------------------------- | ------------------------------- |
| React development server   | [`6543`](http://localhost:6543) |
| Gunicorn for Django app    | [`8081`](http://localhost:8081) |
| Restify development server | [`8000`](http://localhost:8000) |

## Scripts

| Name                                                   | Description                                                                                                                                                                                  |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bootstrap`                                            | Pull `.env` files from S3                                                                                                                                                                    |
| `generate_fixed_dumps`                                 | Import database dumps from Sourcemap, run `create_master_account_api_key.js`, and export new database dumps                                                                                  |
| `infra`                                                | Plan and apply remote infrastructure changes                                                                                                                                                 |
| `server`                                               | Run `docker-compose.yml` services                                                                                                                                                            |
| `setup`                                                | Provision Vagrant VM and run `update`                                                                                                                                                        |
| `test`                                                 | Run tests                                                                                                                                                                                    |
| `update`                                               | Builds and pulls container images using docker-compose                                                                                                                                       |
| `src/restify/scripts/create_master_account_api_key.js` | Generate a new API key associated with the UID defined by `MASTER_ACCOUNT` (in `.env.backend`) and print it in the console                                                                   |
| `src/restify/scripts/synchronize.js`                   | Index existing `Factory`, `Address`, and `Geo` MongoDB collections for ElasticSearch ([with `.synchronize()`](https://github.com/mongoosastic/mongoosastic#indexing-an-existing-collection)) |
