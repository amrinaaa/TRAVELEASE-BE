import admin from "firebase-admin";
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updatePassword,
  confirmPasswordReset,
  applyActionCode,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import { FIREBASE_CONFIG, FIREBASE_PROJECT_ID, FIREBASE_SERVICE_ACCOUNT } from "../src/utils/env.js";

const app = initializeApp(FIREBASE_CONFIG);
const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${FIREBASE_PROJECT_ID}.appspot.com`,
  });

const bucket = admin.storage().bucket();

export default {
    app, admin, bucket
};

export { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updatePassword,
  confirmPasswordReset,
  applyActionCode,
};