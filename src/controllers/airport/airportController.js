import AirportServise from "../../services/airport/airports.js";

export default {
    async getAirports(_req, res) {
        /**
        #swagger.tags = ['Airport']
        #swagger.security = [{
                "bearerAuth": []
        }]
        */
        try {
            const result = await AirportServise.getAirportServise();
            res.status(200).json({
                message: "success",
                data: result,
            });
        } catch (error) {
            res.status(200).json({
                message: error.message,
                data: null,
            });
        };
    },

    async addAirport(req, res) {
        /**
        #swagger.tags = ['Airport']
        #swagger.requestBody = {
            required: true,
            schema: {$ref: "#/components/schemas/AddAirportRequest"}
        },
        #swagger.security = [{
                "bearerAuth": []
        }]
        */
        const {name, code, city} = req.body;
        try {
            const result = await AirportServise.addAirportServise(name, code, city);
            res.status(200).json({
                message: "success",
                data: result,
            });
        } catch (error) {
            res.status(200).json({
                message: error.message,
                data: null,
            });
        };
    },
};