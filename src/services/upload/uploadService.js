import { v4 as uuidv4 } from 'uuid';
import getBucket from '../../../firebase/firebase.bucket.js';
import { FIREBASE_BUCKET, FIREBASE_PUBLIC_URL, PATH_DEFAULT, PATH_PROFILE, PATH_AIRPORT, PATH_HOTEL, PATH_ROOM } from '../../utils/env.js';

export default {
  async uploadFile(file, type = 'default', customFilename = null) {
    return new Promise(async (resolve, reject) => {
      try {
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
          case 'room':
            folderPath = PATH_ROOM;
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
      stream.on('finish', async () => {
        const publicUrl = `${FIREBASE_PUBLIC_URL}${bucketName}/${blob.name}`;
        resolve(publicUrl);
      });

      stream.end(file.buffer);
    } catch (error) {
      reject(error);
    }
  });
}
};