import { v4 as uuidv4 } from 'uuid';
import getBucket from '../../firebase/firebase.bucket.js';

export const uploadService = (file, type = 'default') => {
  return new Promise((resolve, reject) => {
    const bucketName = 'tes-online-ippl.appspot.com';

    let folderPath;
    switch(type) {
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

    const filename = `${folderPath}/${uuidv4()}_${file.originalname}`;
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
};
