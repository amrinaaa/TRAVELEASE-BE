export default {
    mitraPenerbangan(_req, res, next) {
        const isMitra = res.locals.payload.role;
        if (!(isMitra === "MITRA_PENERBANGAN" || isMitra === "ADMIN")) {
            return res.status(401).json({
                message: "You do not have access"
            });
        };

        next();
    },

    mitraHotel(_req, res, next) {
        const isMitra = res.locals.payload.role;
        if (!(isMitra === "MITRA_HOTEL" || isMitra === "ADMIN")) {
            return res.status(401).json({
                message: "You do not have access"
            });
        };

        next();
    },
};