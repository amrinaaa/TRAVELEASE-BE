import { v4 as uuidv4 } from 'uuid';
import getBucket from '../../firebase/firebase.bucket.js';

export default {
  async deleteService(filename) {
    const bucketName = 'tes-online-ippl.appspot.com';
    const bucket = getBucket(bucketName);
    const file = bucket.file(filename);

    try {
      await file.delete();
      console.log(`File deleted: ${filename}`);
    } catch (error) {
      console.error('Error deleting file:', error.message);
      throw new Error(error.message);
    }
  },

  async uploadFile(file, type = 'default', customFilename = null) {
    return new Promise((resolve, reject) => {
      const bucketName = 'tes-online-ippl.appspot.com';

      let folderPath;
      switch (type) {
        case 'profile':
          folderPath = 'travelease/profile';
          break;
        case 'airport':
          folderPath = 'travelease/airport';
          break;
        case 'hotel':
          folderPath = 'travelease/hotel';
          break;
        default:
          folderPath = 'travelease/default';
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
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
        resolve(publicUrl);
      });

      stream.end(file.buffer);
    });
  },
};
