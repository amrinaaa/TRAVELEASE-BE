export default {
    dummy(req, res) {
        res.status(200).json({
            message: "Success hit endpoint /dummy",
            data: "OK"
        });
    },
};