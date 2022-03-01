# Open Apparel Registry

The Open Apparel Registry (OAR) is a tool to identify every apparel facility worldwide.

- [Requirements](#requirements)
- [Setup](#setup)
  - [Google Maps Platform](#google-maps-platform)
- [Development](#development)
  - [Hot Reloading 🔥](#hot-reloading-)
  - [Debugging Django](#debugging-django)
  - [Ports](#ports)
- [Scripts 🧰](#scripts-)
- [Management](#management)
  - [Making Superusers](#making-superusers)

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

Without an API key, facility detail maps will not load on the client and geocoding will not function on the server. The basemap will also be low-resolution and watermarked with "for development purposes only."

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

### Debugging Django

Breakpoint debugging of the Python back-end is available via Visual Studio Code. To get started, run the Django development server by passing the `--debug` flag to the `server` script. Note that you have to run the application in Docker for Mac directly and not within Vagrant to be able to debug.

```
./scripts/server --debug
```

In Visual Studio Code, select the "Run and Debug" view from the sidebar. At the top of the "Run and Debug" pane, click the green arrow next to the "Debug Django" menu item.

<img width="288" alt="image" src="https://user-images.githubusercontent.com/1042475/153924321-3c60a9de-b528-4dad-92b3-8eb8184987fc.png">

If Visual Studio Code can connect, you should see a play/pause/next menu bar in the top right of the window.

Set a breakpoint by clicking in the column next to the line numbers for a `.py` file. A red dot should appear. Now, if the breakpoint is hit when you visit a page of the app in the browser (note that you must access the site via the React development server port), Visual Studio Code should highlight the line in the file, the "Run and Debug" window should be populated with information about currently set variables, and execution of the code should be paused.

Note that, due to the way static files are managed for the normal development environment, the Django server at 8081 is not available when running the `server` script with the `--debug` flag.

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

## Tools ⚒️

| Name                   | Description                                                                                            |
|------------------------|--------------------------------------------------------------------------------------------------------|
| `batch_process`        | Given a list id argument run parse, geocode, and match via the batch_process Django management command |
| `devhealthcheck.sh`    | Simulate application load balancer health checks in development                                        |
| `postfacilitiescsv.py` | POST the rows of a CSV containing facility information to the facilities API                           |

## Management

### Making Superusers

In staging and production we do not have access to the Django Shell so granting
superuser permissions to a member of the OAR team or development team that needs
to manage the system requires the use SQL statements to adjust the permissions.

- Connect to the staging or production database via the bastion instance
- Run the following command

```sql
UPDATE api_user
SET is_staff = true, is_superuser = true
WHERE email ilike '{the user's email address}';
```

- You should see `UPDATE 1` printed to the console. If not, check the email
  address and verify that the user has in fact registered an account in the
  environment (staging or production).
