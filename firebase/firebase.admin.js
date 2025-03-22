import admin from "firebase-admin";
import { 
  FIREBASE_PROJECT_ID, 
  FIREBASE_SERVICE_ACCOUNT, 
} from "../src/utils/env.js";

const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${FIREBASE_PROJECT_ID}.appspot.com`,
  });

const bucket = admin.storage().bucket();

export default {
    admin, bucket
};