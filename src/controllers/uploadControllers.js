import uploadService from '../services/uploadService.js';
import prisma from "../../prisma/prisma.client.js";
import path from "path";

export default {
    async uploadProfile (req, res) {
        const file = req.file;
        const id  = res.locals.payload.id;
        
        try {
            if (!file) {
                return res.status(400).json({
                    message: "File not found",
                });
            }
            const user = await prisma.user.findUnique({ where: { id } });
            if (user?.profilePicture) {
                const fileUrl = new URL(user.profilePicture);
                const bucketPath = fileUrl.pathname.split('/').slice(2).join('/');
                console.log(`Deleting file from Firebase Storage: ${bucketPath}`);
                await uploadService.deleteService(bucketPath);
            }

            const ext = path.extname(file.originalname);
            const filename = `${id}${ext}`;
            const imgUrl = await uploadService.uploadFile(file, 'profile', filename);

            await prisma.user.update({
                where: { id },
                data: {
                    profilePicture: imgUrl
                }
            });

            return res.status(201).json({
                message: "Upload successful",
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
}