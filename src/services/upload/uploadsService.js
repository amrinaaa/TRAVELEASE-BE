import uploadService from "./uploadService.js";
import deleteService from "../deleteFileService.js";
import prisma from "../../../prisma/prisma.client.js";
import path from "path";

export default {
    async uploadProfile(file, userId) {
    try {
        if (!file) {
        throw new Error("File not found");
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (user?.profilePicture) {
        const fileUrl = new URL(user.profilePicture);

        const bucketPath = fileUrl.pathname.split('/').slice(2).join('/');

        await deleteService.deleteFile(bucketPath);
        }

        const ext = path.extname(file.originalname);
        const filename = `${userId}${ext}`;

        const url = await uploadService.uploadFile(
            file, "profile", 
            filename);

        await prisma.user.update({
        where: { 
            id: userId },
        data: { 
            profilePicture: url },
        });

        } catch (error) {
            console.error('Upload error:', error);
            throw new Error("Failed to upload profile image");
        }
    },

    async uploadHotelImage(file, hotelId) {
        try {
            if (!file) {
                throw new Error("File not found");
            }
        
            const ext = path.extname(file.originalname);
            const uniqueSuffix = Date.now();
            const filename = `${hotelId}-${uniqueSuffix}${ext}`; 
        
            const url = await uploadService.uploadFile(file, "hotel", filename);
        
            await prisma.hotelImage.create({
            data: {
                hotelId: hotelId,
                imageUrl: url,
            },
        });
        
        } catch (error) {
            console.error("Error:", error);
            throw new Error("Failed to upload hotel image");
        }
    },

    async uploadRoomImage(file, roomId) {
        try {
            if (!file) {
                throw new Error("File not found");
            }

            const room = await prisma.room.findUnique({
                where: { id: roomId }
            });
    
            if (!room) {
                throw new Error("Room ID not found in database");
            }
        
            const ext = path.extname(file.originalname);
            const uniqueSuffix = Date.now();
            const filename = `${roomId}-${uniqueSuffix}${ext}`; 
        
            const url = await uploadService.uploadFile(file, "room", filename);
        
            await prisma.roomImage.create({
            data: {
                roomId: roomId,
                urlImage: url,
            },
        });
        
        } catch (error) {
            console.error("Error:", error);
            throw new Error("Failed to upload hotel image");
        }
    },
};