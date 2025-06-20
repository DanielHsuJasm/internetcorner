import os, uuid
from PIL import Image
import boto3
from botocore.config import Config as BotoConfig
from flask import current_app

ALLOWED_EXTENSIONS = {'png','jpg','jpeg','gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.',1)[1].lower() in ALLOWED_EXTENSIONS

def get_r2_client():
    cfg = BotoConfig(signature_version='s3v4')
    return boto3.client(
        's3',
        endpoint_url=current_app.config['R2_ENDPOINT_URL'],
        aws_access_key_id=current_app.config['R2_ACCESS_KEY_ID'],
        aws_secret_access_key=current_app.config['R2_SECRET_ACCESS_KEY'],
        config=cfg
    )

def upload_image(file_storage):
    filename = file_storage.filename
    ext = filename.rsplit('.',1)[1].lower()
    object_key = f"{uuid.uuid4().hex}.{ext}"

    file_storage.stream.seek(0)
    try:
        img = Image.open(file_storage.stream)
        img.thumbnail((1024,1024), Image.ANTIALIAS)
        tmp_path = os.path.join('/tmp', object_key)
        img.save(tmp_path, optimize=True, quality=85)
        upload_path = tmp_path; use_stream=False
    except Exception:
        file_storage.stream.seek(0)
        upload_path = file_storage.stream; use_stream=True

    client = get_r2_client()
    bucket = current_app.config['R2_BUCKET_NAME']
    if use_stream:
        client.upload_fileobj(upload_path, bucket, object_key)
    else:
        client.upload_file(upload_path, bucket, object_key)
        try: os.remove(upload_path)
        except: pass

    # presigned URL（7 天到期，可依需求調整）
    try:
        presigned_url = client.generate_presigned_url(
            'get_object',
            Params={'Bucket':bucket,'Key':object_key},
            ExpiresIn=7*24*3600
        )
    except Exception:
        presigned_url = f"{current_app.config['R2_ENDPOINT_URL']}/{bucket}/{object_key}"

    current_app.logger.debug(f"Uploaded to R2: {object_key}")
    return object_key, presigned_url

def delete_image(object_key):
    client = get_r2_client()
    bucket = current_app.config['R2_BUCKET_NAME']
    try:
        client.delete_object(Bucket=bucket, Key=object_key)
        current_app.logger.debug(f"Deleted from R2: {object_key}")
    except Exception as e:
        current_app.logger.error(f"Failed deleting R2 object {object_key}: {e}")
        raise
