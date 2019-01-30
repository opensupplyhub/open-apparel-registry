# Deployment

* [AWS Credentials](#aws-credentials)
* [Publish Container Images](#publish-container-images)
* [Terraform](#terraform)

## AWS Credentials

Using the AWS CLI, create an AWS profile named `open-apparel-registry`:

```bash
$ aws configure --profile open-apparel-registry
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-east-1
Default output format [None]:
```

You will be prompted to enter your AWS credentials, along with a default region. These credentials will be used to authenticate calls to the AWS API when using Terraform and the AWS CLI.


## Publish Container Images

Before we can deploy this project's core infrastructure, we will need to build a container image and publish it somewhere accessible to Amazon's services. 

AWS Elastic Container Registry (ECR) is a good candidate because ECR authentication with AWS Elastic Container Service (ECS) is handled transparently. If we wanted to use private images hosted on Quay, for example, we'd have to make [changes](https://docs.quay.io/issues/ecs-auth-failure.html) to configuration files on the EC2 Container Instances.

To do this, we can use the `cibuild` and `cipublish` scripts:

```bash
$ vagrant ssh
vagrant@vagrant:/vagrant$ export OAR_SETTINGS_BUCKET=openapparelregistry-testing-config-us-east-1
vagrant@vagrant:/vagrant$ export OAR_AWS_ECR_ENDPOINT=555555EXAMPLE.dkr.ecr.us-east-1.amazonaws.com
vagrant@vagrant:/vagrant$ ./scripts/cibuild
vagrant@vagrant:/vagrant$ ./scripts/cipublish
```

## Terraform

First, we need to make sure there is a `terraform.tfvars` file in the project settings bucket on S3. The `.tfvars` file is where we can change specific attributes of the project's infrastructure, not defined in the `variables.tf` file.

Here is an example `terraform.tfvars` for this project:

```hcl
project = "OpenApparelRegistry"
environment = "Staging"

aws_key_name = "oar-stg"

r53_private_hosted_zone = "oar.internal"
r53_public_hosted_zone = "staging.openapparel.org"

cloudfront_price_class = "PriceClass_100"

external_access_cidr_block = ""

bastion_ami = "ami-0ff8a91507f77f867"
bastion_instance_type = "t3.nano"

google_geocoding_api_key = ""

django_secret_key = "secret"

rds_database_identifier = "openapparelregistry"
rds_database_name = "openapparelregistry"
rds_database_username = "openapparelregistry"
rds_database_password = "password"

```

This file lives at `s3://openapparelregistry-staging-config-us-east-1/terraform/terraform.tfvars`.

To deploy this project's core infrastructure, use the `infra` wrapper script to lookup the remote state of the infrastructure and assemble a plan for work to be done:

```bash
vagrant@vagrant:/vagrant$ docker-compose -f docker-compose.ci.yml run --rm terraform ./scripts/infra plan
```

Once the plan has been assembled, and you agree with the changes, apply it:

```bash
vagrant@vagrant:/vagrant$ docker-compose -f docker-compose.ci.yml run --rm terraform ./scripts/infra apply
```

This will attempt to apply the plan assembled in the previous step using Amazon's APIs.
