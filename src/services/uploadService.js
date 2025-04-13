import { v4 as uuidv4 } from 'uuid';
import getBucket from '../../firebase/firebase.bucket.js';
import { FIREBASE_BUCKET, FIREBASE_PUBLIC_URL, PATH_DEFAULT, PATH_PROFILE, PATH_AIRPORT, PATH_HOTEL } from '../utils/env.js';


export default {
  async deleteService(filename) {
    const bucketName = FIREBASE_BUCKET;
    const bucket = getBucket(bucketName);
    const file = bucket.file(filename);

    try {
      await file.delete();
    } catch (error) {
      console.error('Error deleting file:', error.message);
      throw new Error(error.message);
    }
  },

  async uploadFile(file, type = 'default', customFilename = null) {
    return new Promise((resolve, reject) => {
      const bucketName = FIREBASE_BUCKET;

      let folderPath;
      switch (type) {
        case 'profile':
          folderPath = PATH_PROFILE;
          break;
        case 'airport':
          folderPath = PATH_AIRPORT;
          break;
        case 'hotel':
          folderPath = PATH_HOTEL;
          break;
        default:
          folderPath = PATH_DEFAULT;
      }

      const filename = customFilename
        ? `${folderPath}/${customFilename}`
        : `${folderPath}/${uuidv4()}_${file.originalname}`;

      const bucket = getBucket(bucketName);
      const blob = bucket.file(filename);
      const stream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      stream.on('error', (err) => reject(err));
      stream.on('finish', () => {
        const publicUrl = `${FIREBASE_PUBLIC_URL}${bucketName}/${blob.name}`;
        resolve(publicUrl);
      });

      stream.end(file.buffer);
    });
  },
};
