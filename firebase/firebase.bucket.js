import { FIREBASE_STORAGE_BUCKET } from "../src/utils/env.js";
import { bucket } from "./firebase.admin.js";

const storage_url = FIREBASE_STORAGE_BUCKET;

export const uploadFile = async (fileBuffer, destination) => {
    try {
        const file = bucket.file(destination);
        await file.save(
            fileBuffer,
            {
                public: true,
                metadata: {
                    contentType: 'image/jpeg',
                },
            },
        );

        return `${storage_url}${bucket.name}/${destination}`;
    } catch (error) {
        console.log(error);
    }
};