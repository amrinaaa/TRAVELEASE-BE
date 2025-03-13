import jwt from "jsonwebtoken";
import { SECRET } from "./env.js";

export const generateToken = (user) => {
    const token = jwt.sign(user, SECRET)
    return token;
};

export const getUserData = (token) => {
    try {
        const user = jwt.verify(token, SECRET);
        return user; 
    } catch (error) {
        return null;
    }
};