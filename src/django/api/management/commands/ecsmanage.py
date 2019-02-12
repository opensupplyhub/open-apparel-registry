import boto3
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Run a one-off management command on an ECS cluster.'

    def add_arguments(self, parser):
        parser.add_argument(
            '-e', '--env',
            type=str,
            choices=['staging', 'production'],
            default='staging',
            help="Environment to run the task in (staging or production)"
        )

        parser.add_argument(
            'cmd',
            type=str,
            nargs='+',
            help="Command override for the ECS container (e.g. 'migrate')"
        )

    def handle(self, *args, **options):
        """
        Run the given command on the latest app CLI task definition and print
        out a URL to view the status.
        """
        self.env = options['env'].title()
        cmd = options['cmd']

        self.ecs_client = boto3.client('ecs')
        self.ec2_client = boto3.client('ec2')

        task_def_arn = self.get_task_def()
        security_group_id = self.get_security_group()
        subnet_id = self.get_subnet()

        task_id = self.run_task(task_def_arn,
                                security_group_id,
                                subnet_id,
                                cmd)

        url = (
            f'https://console.aws.amazon.com/ecs/home?region=us-east-1#'
            f'/clusters/ecs{self.env}Cluster/tasks/{task_id}/details'
        )

        self.stdout.write(self.style.SUCCESS('Task started! View here:\n'))
        self.stdout.write(self.style.SUCCESS(url))

    def parse_response(self, response, key, idx=None):
        """
        Perform a key-value lookup on a response from the AWS API, wrapping it
        in error handling such that if the lookup fails the response body
        will get propagated to the end user.
        """
        if not response.get(key):
            msg = f'Unexpected response from ECS API: {response}'
            raise KeyError(msg)
        else:
            if idx is not None:
                try:
                    return response[key][0]
                except (IndexError, TypeError):
                    msg = (
                        f"Unexpected value for '{key}' in response: "
                        f'{response}'
                    )
                    raise IndexError(msg)
            else:
                return response[key]

    def get_task_def(self):
        """
        Get the ARN of the latest ECS task definition for the app CLI.
        """
        task_def_response = self.ecs_client.list_task_definitions(
            familyPrefix=f'{self.env}AppCLI',
            sort='DESC',
            maxResults=1
        )

        return self.parse_response(task_def_response, 'taskDefinitionArns', 0)

    def get_security_group(self):
        """
        Get the ID of the security group to use for the app CLI.
        """
        filters = [
            {
                'Name': 'tag:Name',
                'Values': ['sgAppEcsService']
            },
            {
                'Name': 'tag:Environment',
                'Values': [self.env]
            },
            {
                'Name': 'tag:Project',
                'Values': ['OpenApparelRegistry']
            }
        ]

        sg_response = self.ec2_client.describe_security_groups(
            Filters=filters,
        )

        security_group = self.parse_response(sg_response, 'SecurityGroups', 0)
        return security_group['GroupId']

    def get_subnet(self):
        """
        Get a subnet ID to use for the app CLI.
        """
        filters = [
            {
                'Name': 'tag:Name',
                'Values': ['PrivateSubnet']
            },
            {
                'Name': 'tag:Environment',
                'Values': [self.env]
            },
            {
                'Name': 'tag:Project',
                'Values': ['OpenApparelRegistry']
            }
        ]

        subnet_response = self.ec2_client.describe_subnets(
            Filters=filters,
        )

        subnet = self.parse_response(subnet_response, 'Subnets', 0)
        return subnet['SubnetId']

    def run_task(self, task_def_arn, security_group_id, subnet_id, cmd):
        """
        Run a task for a given task definition ARN using the given security
        group and subnets, and return the task ID.
        """
        overrides = {
            'containerOverrides': [
                {
                    'name': 'django',
                    'command': cmd
                }
            ]
        }

        network_configuration = {
            'awsvpcConfiguration': {
                'subnets': [subnet_id],
                'securityGroups': [security_group_id]
            }
        }

        task_response = self.ecs_client.run_task(
            cluster=f'ecs{self.env}Cluster',
            taskDefinition=task_def_arn,
            overrides=overrides,
            networkConfiguration=network_configuration,
            count=1,
            launchType='FARGATE'
        )

        task = self.parse_response(task_response, 'tasks', 0)

        # Parse the ask ARN, since ECS doesn't return the task ID.
        # Task ARNS look like: arn:aws:ecs:<region>:<aws_account_id>:task/<id>
        task_id = task['taskArn'].split('/')[1]
        return task_id
