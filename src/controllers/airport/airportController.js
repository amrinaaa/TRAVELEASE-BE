import { getAirportServise } from "../../services/airport/airports.js";

export const getAirports = async (_req, res) => {
    /**
    #swagger.tags = ['Airport']
    #swagger.security = [{
            "bearerAuth": []
    }]
    */
    try {
        const result = await getAirportServise();
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
};