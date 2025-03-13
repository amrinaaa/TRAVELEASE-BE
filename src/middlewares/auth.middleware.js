import { getUserData } from "../utils/jwt.js";

export default ( req, res, next ) => {
    const token = req.cookies.token;
    const payload = getUserData(token);

    if(!payload){
        res.status(401).json({
            message: "Unauthorized",
        });
        return;
    };

    res.locals.payload = payload;
    next();
};