import { uploadService } from '../services/uploadService.js';

export const uploadFile = async (req, res) => {
    try {
        const file = req.file;
        const { type } = req.body;

        if (!file) {
            return res.status(400).json({
                message: "File not found",
            });
        }

        const url = await uploadService(file, type);
        return res.status(200).json({
            message: "Upload successful",
            data: url,
        });
    }
    catch (error) {
        console.error('Upload error:', error); 
        return res.status(500).json({
            message: "Internal Server Error",
            data: null,
        });
    }
}