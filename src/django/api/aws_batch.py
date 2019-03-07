import boto3

from datetime import datetime
from django.db import transaction

from api.constants import ProcessingAction


def fetch_batch_queue_arn(client, environment):
    queue_name = 'queue{0}Default'.format(environment)
    response = client.describe_job_queues(jobQueues=[queue_name])
    if 'jobQueues' in response:
        for queue in response['jobQueues']:
            if 'state' in queue and queue['state'] == 'ENABLED':
                return queue['jobQueueArn']
        raise RuntimeError(
            'No ENABLED queue named {0}. Response: {1}'.format(
                queue_name, response))
    else:
        raise RuntimeError(
            'Failed to fetch queue. Response {0}'.format(response))


def fetch_latest_active_batch_job_definition_arn(client, environment):
    job_def_name = 'job{0}Default'.format(environment)
    response = client.describe_job_definitions(
        jobDefinitionName=job_def_name,
        status='ACTIVE')
    if 'jobDefinitions' in response:
        latest_job_def = None
        for job_def in response['jobDefinitions']:
            if latest_job_def is None \
              or job_def['revision'] > latest_job_def['revision']:
                latest_job_def = job_def
        if latest_job_def is None:
            raise RuntimeError(
                'No ACTIVE job definition named {0}. Response {1}'.format(
                    job_def_name, response))
        return latest_job_def['jobDefinitionArn']
    else:
        raise RuntimeError(
            'No job queues available. Response {0}'.format(response))


def submit_jobs(environment, facility_list):
    """
    Submit AWS Batch jobs to process each FacilityListItem in a FacilityList
    through all processing steps.
    https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/batch.html#Batch.Client.submit_job
    """
    client = boto3.client('batch')
    queue_arn = fetch_batch_queue_arn(client, environment)
    job_def_arn = fetch_latest_active_batch_job_definition_arn(client,
                                                               environment)
    job_time = (datetime.utcnow().isoformat()
                .replace(':', '-').replace('.', '-').replace('T', '-'))

    def submit_job(action, is_array=False, depends_on=None):
        if depends_on is None:
            depends_on = []
        array_properties = {}
        if is_array:
            array_properties = {
                'size': facility_list.facilitylistitem_set.count()
            }
        job_name = 'list-{0}-{1}-{2}'.format(
            facility_list.id, action, job_time)
        job = client.submit_job(
            jobName=job_name,
            jobQueue=queue_arn,
            jobDefinition=job_def_arn,
            dependsOn=depends_on,
            arrayProperties=array_properties,
            parameters={
                'listid': str(facility_list.id),
                'action': action,
            }
        )
        if 'jobId' in job:
            return job['jobId']
        else:
            raise RuntimeError(
                'Failed to submit job {0}. Response {1}'.format(job_name, job))

    # PARSE
    started = str(datetime.utcnow())
    # The parse task is just quick string manipulation. We submit it as a
    # normal job rather than as an array job to avoid extra overhead that just
    # slows things down.
    parse_job_id = submit_job('parse')
    finished = str(datetime.utcnow())
    with transaction.atomic():
        for item in facility_list.facilitylistitem_set.all():
            item.processing_results.append({
                'action': ProcessingAction.SUBMIT_JOB,
                'type': 'parse',
                'job_id': parse_job_id,
                'error': False,
                'started_at': started,
                'finished_at': finished,
            })
            item.save()

    # GEOCODE
    started = str(datetime.utcnow())
    geocode_job_id = submit_job('geocode',
                                depends_on=[{'jobId': parse_job_id}],
                                is_array=True)
    finished = str(datetime.utcnow())
    facility_list.refresh_from_db()
    with transaction.atomic():
        for item in facility_list.facilitylistitem_set.all():
            item.processing_results.append({
                'action': ProcessingAction.SUBMIT_JOB,
                'type': 'geocode',
                'job_id': '{0}:{1}'.format(geocode_job_id, item.row_index),
                'error': False,
                'started_at': started,
                'finished_at': finished,
            })
            item.save()

    # MATCH
    started = str(datetime.utcnow())
    match_job_id = submit_job('match',
                              depends_on=[{'jobId': geocode_job_id}])
    finished = str(datetime.utcnow())
    facility_list.refresh_from_db()
    with transaction.atomic():
        for item in facility_list.facilitylistitem_set.all():
            item.processing_results.append({
                'action': ProcessingAction.SUBMIT_JOB,
                'type': 'match',
                'job_id': '{0}'.format(match_job_id),
                'error': False,
                'started_at': started,
                'finished_at': finished,
            })
            item.save()
