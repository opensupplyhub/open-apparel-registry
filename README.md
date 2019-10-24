# Open Apparel Registry

The Open Apparel Registry (OAR) is a tool to identify every apparel facility worldwide.

- [Requirements](#requirements)
- [Setup](#setup)
- [Development](#development)
  - [Hot Reloading 🔥](#hot-reloading-)
  - [Development Data](#development-data)
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
Default region name [None]: eu-west-1
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

### Hot Reloading 🔥

Because the frontend uses [Create React App](https://github.com/facebook/create-react-app/), which integrates with webpack, the page will automatically reload if you make changes to the code.

In development, the [Django](https://www.djangoproject.com) app sits behind a [Gunicorn](https://www.gunicorn.org) worker that is passed the [`--reload` flag](https://docs.gunicorn.org/en/stable/settings.html#reload).

### Development Data

To destroy any existing development database and load fresh fixture data including users, facility lists, facility matches, and facilities run:

```bash
vagrant@vagrant:/vagrant$ ./scripts/resetdb
```

### Ports

| Service                    | Port                            |
| -------------------------- | ------------------------------- |
| React development server   | [`6543`](http://localhost:6543) |
| Gunicorn for Django app    | [`8081`](http://localhost:8081) |

## Scripts

| Name                                                   | Description                                                                                                                                                                                  |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bootstrap`                                            | Pull `.env` files from S3                                                                                                                                                                    |
| `infra`                                                | Plan and apply remote infrastructure changes                                                                                                                                                 |
| `resetdb`                                              | Clear development database & load fixture data including users, facility lists, matches, and facilities                                                                                      |
| `server`                                               | Run `docker-compose.yml` services                                                                                                                                                            |
| `setup`                                                | Provision Vagrant VM and run `update`                                                                                                                                                        |
| `test`                                                 | Run tests                                                                                                                                                                                    |
| `update`                                               | Builds and pulls container images using docker-compose                                                                                                                                       |
