import crypto from "crypto";
import { SECRET } from "./env.js";

export const encrypt = (password) => {
    const encrypted = crypto
        .pbkdf2Sync(password, SECRET, 1000, 64, "sha512")
        .toString("hex"); //parameter 1 = password, parameter 2 = key, 3 parameter terakhir adalah kebutuhan dari functionnya
    return encrypted;
};