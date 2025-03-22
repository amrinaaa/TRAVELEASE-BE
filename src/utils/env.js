import dotenv from "dotenv";

dotenv.config();

export const DATABASE_URL = process.env.DATABASE_URL;

export const SECRET = process.env.SECRET;
export const FIREBASE_CONFIG = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

export const FIREBASE_SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT;
export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;

export const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET;

export const MAIL_MAILER = process.env.MAIL_MAILER;
export const MAIL_HOST = process.env.MAIL_HOST;
export const MAIL_PORT = process.env.MAIL_PORT;
export const MAIL_USERNAME = process.env.MAIL_USERNAME;
export const MAIL_PASSWORD = process.env.MAIL_PASSWORD;
export const MAIL_FROM_ADDRESS = process.env.MAIL_FROM_ADDRESS;
export const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME;
export const MAIL_ENCRYPTION = process.env.MAIL_ENCRYPTION;

export const FRONTEND_URL = process.env.FRONTEND_URL;