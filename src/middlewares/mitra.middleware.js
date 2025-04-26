export default {
    mitraPenerbangan(_req, res, next) {
        const isMitra = res.locals.payload.role;
        if (!(isMitra === "MITRA_PENERBANGAN")) {
            return res.status(401).json({
                message: "You do not have access"
            });
        };

        next();
    },

    mitraHotel(_req, res, next) {
        const isMitra = res.locals.payload.role;
        if (!(isMitra === "MITRA_HOTEL")) {
            return res.status(401).json({
                message: "You do not have access"
            });
        };

        next();
    },
};