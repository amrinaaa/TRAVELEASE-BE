import uploadsController from "../services/upload/uploadsService.js";

export default {
    async uploadProfile(req, res) {
        /**
        #swagger.tags = ['Profile Mitra dan User']
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

    async uploadProfilebyAdmin(req, res) {
        /**
        #swagger.tags = ['Admin']
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
        const id = req.params.id;

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

    async uploadRoomImage(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
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
        /**
        #swagger.tags = ['Mitra Penerbangan']
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
                    description: "File gambar yang akan diupload sebagai foto airport"
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