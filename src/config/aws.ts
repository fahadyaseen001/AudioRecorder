import { S3Client } from '@aws-sdk/client-s3';
import {
  APP_AWS_ACCESS_KEY,
  APP_AWS_REGION,
  APP_AWS_SECRET_KEY,
  APP_S3_BUCKET,
} from '@env';

// Configure AWS S3 client
export const s3Client = new S3Client({
  region: APP_AWS_REGION,
  credentials: {
    accessKeyId: APP_AWS_ACCESS_KEY,
    secretAccessKey: APP_AWS_SECRET_KEY,
  },
});

export const BUCKET_NAME = APP_S3_BUCKET;
