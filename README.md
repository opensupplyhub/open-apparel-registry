# Open Apparel Registry

The Open Apparel Registry (OAR) is a tool to identify every apparel facility worldwide.

* [Requirements](#requirements)
* [Setup](#setup)
  * [AWS](#aws)
* [Development](#development)
  * [Hot Reloading 🔥](#hot-reloading-)
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

`setup` will:

* provision a Vagrant VM, using `vboxsf` to mount `./` (relative to `Vagrantfile`) to `/vagrant`, as well as `~/.aws` to `/home/vagrant/.aws`.
* build container images and update frontend dependencies.
* pull down development environment variables and import database dumps.


After running `setup`, you can access the VM by running:

```bash
$ vagrant ssh
vagrant@vagrant:/vagrant$
```

#### AWS

Before running `setup`, you need to configure an AWS profile with IAM credentials from the Open Apparel Registry account.

```bash
$ aws configure --profile open-apparel-registry
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-east-1
Default output format [None]:
```

# Development

To start the application, run:

```bash
# Access the VM console
$ vagrant ssh

# Start the application
vagrant@vagrant:/vagrant$ ./scripts/server
```

#### Hot Reloading 🔥

Because the frontend uses [Create React App](https://github.com/facebook/create-react-app/), which integrates with webpack, the page will automatically reload if you make changes to the code. 

In development, the backend uses [Nodemon](https://nodemon.io) to monitor for any source code changes and will automatically restart the API server.

#### Upload a batch of files in for each account

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

| Name                   | Description                                                                  |
| ---------------------- | ---------------------------------------------------------------------------- |
| `bootstrap`            | Pull (from S3) `.env` files and import database dumps 		                    |
| `generate_fixed_dumps` | Import database dumps from Sourcemap, run `create_master_account_api_key.js`, and export new database dumps |
| `infra`      	         | Plan and apply remote infrastructure changes 			                    |
| `server`               | Run `docker-compose.yml` services                                            |
| `setup`                | Provision Vagrant VM and run `update`                                        |
| `test`                 | Run tests                                                                   |
| `update`               | Build container images and update frontend dependencies                      |
| `src/api/scripts/create_master_account_api_key.js` | Generate a new API key associated with the UID defined by `MASTER_ACCOUNT` (in `.env.backend`) and print it in the console |
| `src/api/scripts/synchronize.js` | Index existing `Factory`, `Address`, and `Geo` MongoDB collections for ElasticSearch ([with `.synchronize()`](https://github.com/mongoosastic/mongoosastic#indexing-an-existing-collection)) |
