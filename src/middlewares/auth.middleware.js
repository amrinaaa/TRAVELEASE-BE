import { getUserData } from "../utils/jwt.js";

export default (req, res, next) => {
    const authorization = req.headers?.authorization;
    if (!authorization) {
        return res.status(403).json({
            message: "Unauthorized",
        });
    };

    const [prefix, token] = authorization.split(" ");
    if (!(prefix === "Bearer" && token)) {
        return res.status(403).json({
            message: "Unauthorized",
        });
    };

    const payload = getUserData(token);
    if (!payload) {
        return res.status(403).json({
            message: "Unauthorized",
        });
    };

    res.locals.payload = payload;
    next();
};