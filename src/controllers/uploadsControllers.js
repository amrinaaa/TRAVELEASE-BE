import uploadsController from "../services/upload/uploadsService.js";

export default {
    async uploadProfile(req, res) {
        /**
        #swagger.tags = ['User']
        #swagger.consumes = ['multipart/form-data']
        #swagger.requestBody = {
            required: true,
            content: {
            "multipart/form-data": {
                schema: {
                type: "object",
                properties: {
                    file: {
                    type: "string",
                    format: "binary",
                    description: "File gambar yang akan diupload sebagai foto profil"
                    },
                },
                required: ["file"]
                }
            }
            }
        },
        #swagger.security = [{
            "bearerAuth": []
         }]
        */
        const file = req.file;
        const id = res.locals.payload.id;

        try {
            const imageUrl = await uploadsController.uploadProfile(file, id);

            return res.status(201).json({
                message: "Upload successful",
                imageUrl
            });

        } catch (error) {
            console.error('Upload error:', error);
            return res.status(500).json({
                message: "Internal Server Error"
            });
        }
    },

    async uploadHotelImage(req, res) {
        /**
        #swagger.tags = ['Hotel']
        #swagger.consumes = ['multipart/form-data']
        #swagger.requestBody = {
            required: true,
            content: {
            "multipart/form-data": {
                schema: {
                type: "object",
                properties: {
                    file: {
                    type: "string",
                    format: "binary",
                    description: "File gambar yang akan diupload sebagai foto hotel"
                    },
                },
                required: ["file"]
                }
            }
            }
        },
        #swagger.security = [{
            "bearerAuth": []
         }]
        */
        const file = req.file;
        const { hotelId } = req.params;

        try {
            await uploadsController.uploadHotelImage(file, hotelId);
            return res.status(201).json({
                message: "Upload successful"
            });

        } catch (error) {
            console.error('Upload error:', error);
            return res.status(500).json({
                message: error.message
            });
        }
    },

    async uploadRoomImage(req, res) {
        /**
        #swagger.tags = ['Hotel']
        #swagger.consumes = ['multipart/form-data']
        #swagger.requestBody = {
            required: true,
            content: {
            "multipart/form-data": {
                schema: {
                type: "object",
                properties: {
                    file: {
                    type: "string",
                    format: "binary",
                    description: "File gambar yang akan diupload sebagai foto ruangan hotel"
                    },
                },
                required: ["file"]
                }
            }
            }
        },
        #swagger.security = [{
            "bearerAuth": []
         }]
        */
        const file = req.file;
        const { roomId } = req.params;

        try {
            await uploadsController.uploadRoomImage(file, roomId);
            return res.status(201).json({
                message: "Upload successful"
            });

        }
        catch (error) {
            console.error('Upload error:', error);
            return res.status(500).json({
                message: error.message
            });
        }
    },

    async uploadAirportImage(req, res) {
        const file = req.file;
        const { airportId } = req.params;

        try {
            await uploadsController.uploadAirportImage(file, airportId);
            return res.status(201).json({
                message: "Upload successful"
            });

        } catch (error) {
            console.error('Upload error:', error);
            return res.status(500).json({
                message: error.message
            });
        }
    }
};