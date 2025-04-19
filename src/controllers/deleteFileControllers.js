import deleteFileService from "../services/deleteFileService.js";

export default {
    async deleteProfileImage(req, res) {
        try {
            const id = res.locals.payload.id;
            if (!id) {
                return res.status(400).json({ 
                    message: "User ID is required" });
            }
            await deleteFileService.deleteProfileImage(id);
            res.status(200).json({
                message: "Deleted successful"
                });
        } catch (error) {
            console.error("Error deleting profile image:", error);
            res.status(500).json({ 
                message: error.message });
        }          
    },

    async deleteHotelImage(req, res) {
        try {
            const imageId = req.params.id;
            if (!imageId) {
                return res.status(400).json({ 
                    message: "Image ID is required" });
            }

            await deleteFileService.deleteHotelImage(imageId);
            res.status(200).json({
                message: "Deleted successful"
                });

        } catch (error) {
            console.error("Error deleting hotel image:", error);
            res.status(500).json({ 
                message: error.message });
        }
    },

    async deleteRoomImage(req, res) {
        try {
            const imageId = req.params.id;
            if (!imageId) {
                return res.status(400).json({ 
                    message: "Image ID is required" });
            }

            await deleteFileService.deleteRoomImage(imageId);
            return res.status(200).json({
                message: "Deleted successful"
                });

        } catch (error) {
            console.error("Error deleting hotel image:", error);
            return res.status(500).json({ 
                message: error.message });
        }
    }
};