import mitraPenerbangan from "../services/mitra/mitra.penerbangan.js";

export default {
    async addAirline(req, res) {
        /**
        #swagger.tags = ['Mitra Penerbangan']
        #swagger.requestBody = {
            required: true,
            schema: {$ref: "#/components/schemas/AddAirlineRequest"}
        },
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const mitraId = res.locals.payload.id;
        const { name, description } = req.body;
        try {
            const result = await mitraPenerbangan.addAirlineService(mitraId, name, description);
            res.status(200).json({
                message: "Success",
                data: result,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                data: null,
            });
        }
    },

    async getAirlines(req, res) {
        /**
        #swagger.tags = ['Mitra Penerbangan']
        #swagger.security = [{
            "bearerAuth": []
         }]
        */
        const mitraId = res.locals.payload.id;
        try {
            const result = await mitraPenerbangan.getAirlinesService(mitraId);
            res.status(200).json({
                message: "Success",
                data: result,
            });
        } catch (error) {
            return res.status(400).json({
                message: error.message,
                data: null,
            });
        };
    },

    async getPlaneType(_req, res) {
        /**
        #swagger.tags = ['Mitra Penerbangan']
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        try {
            const planeTypes = await mitraPenerbangan.getPlaneTypesService();
            res.status(200).json({
                message: "Success",
                data: planeTypes,
            });
        } catch (error) {
            return res.status(400).json({
                message: error.message,
                data: null,
            });
        };
    },

    async getPlanes(req, res) {
        /**
        #swagger.tags = ['Mitra Penerbangan']
        #swagger.parameters['airlineId'] = {
            in: 'query',
            required: true,
            schema: {
                $ref: "#/components/schemas/GetPlanesRequest"
            }
        },
        #swagger.security = [{
            "bearerAuth": []
         }]
        */
        const airlineId = req.query.airlineId;
        try {
            const result = await mitraPenerbangan.getPlanesService(airlineId);
            res.status(200).json({
                message: "Success",
                data: result,
            });
        } catch (error) {
            return res.status(400).json({
                message: error.message,
                data: null,
            });
        };
    },

    async addPlane(req, res) {
        /**
        #swagger.tags = ['Mitra Penerbangan']
        #swagger.requestBody = {
            required: true,
            schema: {$ref: "#/components/schemas/AddPlaneRequest"}
        },
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const { planeTypeId, airlineId, name } = req.body;
        try {
            const result = await mitraPenerbangan.addPlaneService(planeTypeId, airlineId, name);
            res.status(200).json({
                message: "success",
                data: result,
            })
        } catch (error) {
            return res.status(400).json({
                message: error.message,
                data: null,
            });
        };
    },

    async addSeatCategory(req, res) {
        /**
        #swagger.tags = ['Mitra Penerbangan']
        #swagger.requestBody = {
            required: true,
            schema: {$ref: "#/components/schemas/AddSeatCategoryRequest"}
        },
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const { planeId, name, price } = req.body;
        try {
            const result = await mitraPenerbangan.addSeatCategoryService(planeId, name, price);
            res.status(200).json({
                message: "success",
                data: result,
            });
        } catch (error) {
            return res.status(400).json({
                message: error.message,
                data: null,
            });
        };
    },

    async getSeatCategory(req, res) {
        /**
        #swagger.tags = ['Mitra Penerbangan']
        #swagger.parameters['planeId'] = {
            in: 'query',
            required: true,
            schema: {
                $ref: "#/components/schemas/GetSeatCategoryRequest"
            }
        },
        #swagger.security = [{
            "bearerAuth": []
         }]
        */
        const planeId = req.query.planeId;
        try {
            const result = await mitraPenerbangan.getSeatCategoryService(planeId);
            res.status(200).json({
                message: "success",
                data: result,
            });
        } catch (error) {
            return res.status(400).json({
                message: error.message,
                data: null,
            });
        }
    },

    async getPlaneSeats(req, res) {
        /**
        #swagger.tags = ['Mitra Penerbangan']
        #swagger.parameters['planeId'] = {
            in: 'query',
            required: true,
            schema: {
                $ref: "#/components/schemas/GetPlaneSeatsRequest"
            }
        },
        #swagger.security = [{
            "bearerAuth": []
         }]
        */
        const planeId = req.query.planeId;
        try {
            const result = await mitraPenerbangan.getPlaneSeatsService(planeId);
            res.status(200).json({
                message: "success",
                data: result,
            });
        } catch (error) {
            return res.status(400).json({
                message: error.message,
                data: null,
            });
        }
    },

    async addSeatAvailability(req, res) {
        /**
        #swagger.tags = ['Mitra Penerbangan']
        #swagger.requestBody = {
            required: true,
            schema: {$ref: "#/components/schemas/AddSeatAvailabilityRequest"}
        },
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const {
            planeId,
            seatCategoryId,
            seatNames //sebuah list / array
        } = req.body;

        try {
            const result = await mitraPenerbangan.addSeatAvailabilityService(
                planeId,
                seatCategoryId,
                seatNames,
            );

            res.status(200).json({
                message: "Add Seat Successful",
                data: result,
            });
        } catch (error) {
            return res.status(400).json({
                message: error.message,
                data: null,
            });
        }
    },

    async deletePlaneSeat(req, res) {
        /**
        #swagger.tags = ['Mitra Penerbangan']
        #swagger.requestBody = {
            required: true,
            schema: {$ref: "#/components/schemas/DeletePlaneSeatRequest"}
        },
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const { seatId } = req.body;
        try {
            const result = await mitraPenerbangan.deletePlaneSeatService(seatId);
            res.status(200).json({
                message: "success",
                data: result,
            });
        } catch (error) {
            return res.status(400).json({
                message: error.message,
                data: null,
            });
        };
    },
};