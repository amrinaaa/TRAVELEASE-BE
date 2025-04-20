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
import { FIREBASE_CONFIG, FIREBASE_SERVICE_ACCOUNT } from "../src/utils/env.js";

const app = initializeApp(FIREBASE_CONFIG);

const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default {
  app, admin
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