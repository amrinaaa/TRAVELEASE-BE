export default (_req, res, next) => {
    const isAdmin = res.locals.payload.role;
    if(!(isAdmin === "USER")){
        return res.status(401).json({
            message: "You do not have access"
        });
    };

    next();
};