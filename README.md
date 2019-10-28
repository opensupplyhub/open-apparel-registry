# Open Apparel Registry

The Open Apparel Registry (OAR) is a tool to identify every apparel facility worldwide.

- [Requirements](#requirements)
- [Setup](#setup)
  - [Google Maps Platform](#google-maps-platform)
- [Development](#development)
  - [Hot Reloading 🔥](#hot-reloading-)
  - [Ports](#ports)
- [Scripts 🧰](#scripts-)

## Requirements

- [Vagrant](https://www.vagrantup.com/docs/installation/) 2.1+
- [VirtualBox](https://www.virtualbox.org/wiki/Downloads) 5.0+

## Setup

Run `setup` to bring up the development environment:

```bash
./scripts/setup
```

`setup` will provision a virtual machine (VM) that contains the tools needed to get started.

After executing `setup`, you can access the VM with:

```bash
$ vagrant ssh
vagrant@vagrant:/vagrant$
```

### Google Maps Platform

The OAR requires a Google Maps Platform API key to interface with the Maps JavaScript API, Maps Static API, and Maps Geocoding API. 

Without an API key, facility detail maps will not load on the client and geocoding will not function on the server. The basemap will also be low-resolution and watermarked with "for development purposes only." Since geocoding is 

See [Getting Started with Google Maps Platform](https://developers.google.com/maps/gmp-get-started#procedures) and [Get the API key](https://developers.google.com/maps/documentation/javascript/get-api-key#get-the-api-key) for an overview on how to get setup. 

`setup` will stub out an environment variables file (`.env`) in the root of the project. To wire up your API key, simply update `.env`:

```diff
-GOOGLE_SERVER_SIDE_API_KEY=
-REACT_APP_GOOGLE_CLIENT_SIDE_API_KEY=
+GOOGLE_SERVER_SIDE_API_KEY=YOUR_API_KEY
+REACT_APP_GOOGLE_CLIENT_SIDE_API_KEY=YOUR_API_KEY
 REACT_APP_GOOGLE_ANALYTICS_KEY=
 ```

 _Note: Google Maps Platfom requires creation of a billing account, but [they offer](https://cloud.google.com/maps-platform/pricing/) $200 of free monthly usage, which is enough to support development._

## Development

To destroy the existing development database and load fresh fixture data, including users, facility lists, facility matches, and facilities, run:

```bash
# Access the VM console
$ vagrant ssh

# Load fixtures
vagrant@vagrant:/vagrant$ ./scripts/resetdb
```

To start the application, run:

```bash
vagrant@vagrant:/vagrant$ ./scripts/server
```

### Hot Reloading 🔥

The frontend uses [Create React App](https://github.com/facebook/create-react-app/). When running `server`, the page will automatically [reload](https://github.com/facebook/create-react-app/#whats-included) if you make changes to the code.

The [Django](https://www.djangoproject.com) app runs inside a [Gunicorn](https://www.gunicorn.org) worker. The worker will [restart](https://docs.gunicorn.org/en/stable/settings.html#reload) if you make changes to the code.

### Ports

| Service                    | Port                            |
| -------------------------- | ------------------------------- |
| React development server   | [`6543`](http://localhost:6543) |
| Gunicorn for Django app    | [`8081`](http://localhost:8081) |

## Scripts 🧰

| Name                                                   | Description                                                                                                                                                                                  |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bootstrap`                                            | Update environment variables file                                                                                                                                                                    |
| `infra`                                                | Plan and apply remote infrastructure changes                                                                                                                                                 |
| `resetdb`                                              | Clear development database & load fixture data including users, facility lists, matches, and facilities                                                                                      |
| `server`                                               | Run `docker-compose.yml` services                                                                                                                                                            |
| `setup`                                                | Provision Vagrant VM and run `update`                                                                                                                                                        |
| `test`                                                 | Run tests                                                                                                                                                                                    |
| `update`                                               | Build container images and execute database migrations                                                                                                                                       |
