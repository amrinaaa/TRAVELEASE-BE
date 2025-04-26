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
        #swagger.parameters['mitraId'] = {
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
        const mitraId = req.query.mitraId; //sementara pake body buat test aja, nnti pake payload;
        try {
            const result = await mitraPenerbangan.getPlanesService(mitraId);
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

    //sudah berhasil, tinggal di sempurnakan 
    async addSeatAvailability(req, res) {
        /**
        #swagger.tags = ['Mitra Penerbangan']
        #swagger.requestBody = {
            required: true,
            schema: {$ref: "#/components/schemas/AddSeatAvailabilityRequest"}
        }
        */
        // const mitraId = res.locals.payload.id;   tidak perlu sepertinya
        const {
            planeId,
            seatCategoryName, //bisa dibuat markdown
            seatNames //sebuah list / array
        } = req.body;

        try {
            const result = await mitraPenerbangan.addSeatAvailabilityService(
                planeId,
                seatCategoryName,
                seatNames,
            );

            res.status(200).json({
                message: "Add Seat Successful",
                data: result,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                data: null,
            });
        }
    },
};