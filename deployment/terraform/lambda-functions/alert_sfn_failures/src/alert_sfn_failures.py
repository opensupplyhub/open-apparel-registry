import os
import re
import json
import rollbar

ECS_TASK_URL = "https://console.aws.amazon.com/ecs/home?region={region}#/clusters/{cluster}/tasks/{task}/details"

environment = os.getenv("ENVIRONMENT", "Staging")
rollbar_token = os.getenv("ROLLBAR_SERVER_SIDE_ACCESS_TOKEN")
rollbar.init(rollbar_token, environment)


@rollbar.lambda_function
def handler(event, context):
    try:
        cause = json.loads(event["Cause"])

        task_name = cause["TaskDefinitionArn"].split("/")[1].split(":")[0]

        reason = cause["StoppedReason"]

        command = " ".join(cause["Overrides"]["ContainerOverrides"][0]["Command"])

        if reason.endswith("."):
            reason = reason[:-1]

        # Container exit reason takes precedence
        for container in cause["Containers"]:
            if "Reason" in container:
                reason = container["Reason"]

        # Extract "OutOfMemoryError" from "OutOfMemoryError: ..."
        if re.match("^(.+): (.+)$", reason):
            reason = reason.partition(":")[0]
        # Extract "Error" from "Error (...)":
        elif re.match("^(.+) \((.+)\)$", reason):
            reason = reason.partition(" (")[0]

        ecs_url = ECS_TASK_URL.format(
            region=cause["AvailabilityZone"][:-1],
            cluster=cause["ClusterArn"].split("/")[1],
            task=cause["TaskArn"].split("/")[2],
        )

        msg = f"""
    {task_name} `{command}` failed: {reason}
    {ecs_url}
        """
        rollbar.report_message(msg, level="error", extra_data=event)

    except json.decoder.JSONDecodeError:
        error = event["Error"]
        rollbar.report_message(
            f"A State Machine has failed: {error}", level="error", extra_data=event
        )
