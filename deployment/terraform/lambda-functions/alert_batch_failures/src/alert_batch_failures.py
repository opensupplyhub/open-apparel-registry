import os
import rollbar

environment = os.getenv('ENVIRONMENT', 'Staging')
rollbar_token = os.getenv('ROLLBAR_SERVER_SIDE_ACCESS_TOKEN')
rollbar.init(rollbar_token, environment)

CLOUDWATCH_LOGS_URL = "https://console.aws.amazon.com/cloudwatch/home?region=eu-west-1#logEventViewer:group=/aws/batch/job;stream={logstream}"  # NOQA


@rollbar.lambda_function
def handler(event, context):
    cloudwatch_urls = \
        list(map(lambda attempt:
                 CLOUDWATCH_LOGS_URL.format(
                     logstream=attempt["container"]["logStreamName"]),
                 event["detail"]["attempts"]))

    msg = """
{jobname} (JobID {jid}) entered state {state}. Reason: {reason}.

CloudWatch URLs:


- {cloudwatchurls}
    """.format(jobname=event["detail"]["jobName"].split("-")[0],
               jid=event["detail"]["jobId"],
               state=event["detail"]["status"],
               reason=event["detail"]["statusReason"],
               cloudwatchurls="\n\n-".join(cloudwatch_urls))

    rollbar.report_message(
        msg,
        level='error',
        # Give each CloudWatch URL its own column in the occurrences tab
        extra_data=dict(map(lambda x: ("cloudwatch_url_{}".format(x[0]), x[1]),
                            enumerate(cloudwatch_urls))))
