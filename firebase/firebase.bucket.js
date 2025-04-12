import { Storage } from '@google-cloud/storage';
import { SERVICE_ACCOUNT_FOR_UPLOAD } from '../src/utils/env.js';

const storage = new Storage({
  projectId: SERVICE_ACCOUNT_FOR_UPLOAD.project_id,
  credentials: {
    client_email: SERVICE_ACCOUNT_FOR_UPLOAD.client_email,
    private_key: SERVICE_ACCOUNT_FOR_UPLOAD.private_key,
  },
});

const getBucket = (bucketName) => {
  return storage.bucket(bucketName);
};

export default getBucket;
