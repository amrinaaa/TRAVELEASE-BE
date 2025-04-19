import uploadsController from "../services/upload/uploadsService.js";

export default {
    async uploadProfile(req, res) {
        const file = req.file;
        const id = res.locals.payload.id;

        try {
            if (!file) {
            return res.status(400).json({ 
                message: "File not found" });
            }
        
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
        const file = req.file;
        const { hotelId } = req.params;

        try {
            if (!file) {
            return res.status(400).json({ 
                message: "File not found" });
            }

            await uploadsController.uploadHotelImage(file, hotelId);
            return res.status(201).json({
            message: "Upload successful"
            });

        }   catch (error) {
            console.error('Upload error:', error);
            return res.status(500).json({
            message: error.message
            });
        }
    },

    async uploadRoomImage(req, res) {
        const file = req.file;
        const { roomId } = req.params;

        try {
            if (!file) {
            return res.status(400).json({ 
                message: "File not found" });
            }

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
    }
};