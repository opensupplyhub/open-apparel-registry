# Open Apparel Registry

The Open Apparel Registry (OAR) is a tool to identify every apparel facility worldwide.

* [Requirements](#requirements)
* [Setup](#setup)
  * [Setting Development Environment Variables](#setting-development-environment-variables)
* [Development](#development)
  * [Hot Reloading 🔥](#hot-reloading-)
  * [Indexing production database](#indexing-production-database)
  * [Upload a batch of files in for each account](#upload-a-batch-of-files-in-for-each-account)
* [Ports](#ports)
* [Scripts](#scripts)

# Requirements
- Vagrant 2.1+
- VirtualBox 5.0+

# Setup

Setup the project's development environment:

```bash
$ ./scripts/setup
```

`setup` will provision a Vagrant VM, using `vboxsf` to mount `./` (relative to `Vagrantfile`) to `/vagrant`, as well as `~/.aws` to `/home/vagrant/.aws`.

After running `setup`, you can access the VM by running:

```bash
$ vagrant ssh
vagrant@vagrant:/vagrant$
```

## Setting Development Environment Variables

The `.env.template` file is a template file with environment variables that get injected into running containers during development. This needs to be copied into a file named `.env` and provisioned with a Mapbox API token. 

# Development

To start the application, run:

```bash
# Access the VM console
$ vagrant ssh

# Start the application
vagrant@vagrant:/vagrant$ ./scripts/server
```

## Hot Reloading 🔥

Because the frontend uses [Create React App](https://github.com/facebook/create-react-app/), which integrates with webpack, the page will automatically reload if you make changes to the code. 

In development, the backend uses [Nodemon](https://nodemon.io) to monitor for any source code changes and will automatically restart the API server.

## Indexing production database
- connect to prod database, update .env file
- Uncomment indexing code in `addressSchema.js`, `factorySchema.js` and `geoSchema.js`
- In app.js, comment out `// if (process.env.NODE_ENV === 'development') {` and `// } else if (process.env.NODE_ENV === 'production') { Raven.config(process.env.SENTRY_KEY).install()}`
- Run $`NODE_ENV=production node src/app.js`


## Upload a batch of files in for each account
Uncomment `routes.js`, `app.get('/uploadMultipleFiles', temp.uploadMultipleFiles);`
Create a folder `files` at the root directory, put all the CSV files in it.
Update `accounts` in `uploadFiles.js` with your uid, file_name, file_description, csv_file_name.
`csv_file_name` is the name of the CSV file in the `files` folder

```
GET localhost:8000/uploadMultipleFiles
```

# Ports

| Service                          | Port                            |
| -------------------------------- | ------------------------------- |
| React development server         | [`3000`](http://localhost:3000) |
| API server         			   | [`8000`](http://localhost:8000) |

# Scripts

| Name             | Description                                                   |
| --------------   | ------------------------------------------------------------- |
| `infra`      	   | Plan and apply remote infrastructure changes 			       |
| `server`         | Run `docker-compose.yml` services                             |
| `setup`          | Provision Vagrant VM and run `update`                         |
| `test`           | Runs tests                                                    |
| `update`         | Build container images and update frontend dependencies       |
