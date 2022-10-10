import boto3
import time
import zipfile

s3 = boto3.resource('s3')


def make_trace_file_name():
    return f'trace_{time.time()}.html'


def write_trace_to_bucket(source_file_path='trace.html'):
    # archive_name = f'trace_{time.time()}.zip'
    archive_name = f'{source_file_path}.zip'
    with zipfile.ZipFile(archive_name, 'w') as z:
        z.write(source_file_path,
                compress_type=zipfile.ZIP_DEFLATED)
    with open(archive_name, 'rb') as f:
        s3.Object('opensupplyhub-staging-files-eu-west-1',
                  f'tracing/{archive_name}').put(Body=f)
