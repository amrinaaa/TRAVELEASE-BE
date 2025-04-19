import uploadService from "./uploadService.js";
import deleteService from "../deleteFileService.js";
import prisma from "../../../prisma/prisma.client.js";
import path from "path";

function generateFileName(originalName, prefixId) {
    const ext = path.extname(originalName);
    const uniqueSuffix = Date.now();
    return `${prefixId}-${uniqueSuffix}${ext}`;
}

function generateFileNamee(airportId, originalFileName) {
    const ext = path.extname(originalFileName);
    const filename = `${airportId}${ext}`;
    return filename;
}

export default {
    async uploadProfile(file, userId) {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            throw new Error("User Id not found in database");
        }

        if (user?.profilePicture) {
        const filePath = deleteService.extractFilePath(user.profilePicture);

        await deleteService.deleteFile(filePath);
        }

        const filename = generateFileNamee(userId, file.originalname);

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
            console.error('Error:', error);
            throw new Error("Failed to upload profile image");
        }
    },

    async uploadHotelImage(file, hotelId) {
        try {
            const hotel = await prisma.hotel.findUnique({
                where: { id: hotelId }
            });
    
            if (!hotel) {
                throw new Error("Hotel ID not found in database");
            }
        
            const filename = generateFileName(file.originalname, hotelId);
            const url = await uploadService.uploadFile(file, "hotel", filename);
        
            await prisma.hotelImage.create({
            data: {
                hotelId: hotelId,
                imageUrl: url,
            },
        });
        
        } catch (error) {
            console.error("Error:", error);
            throw new Error(error.message);
        }
    },

    async uploadRoomImage(file, roomId) {
        try {
            const room = await prisma.room.findUnique({
                where: { id: roomId }
            });
    
            if (!room) {
                throw new Error("Room ID not found in database");
            }
        
            const filename = generateFileName(file.originalname, roomId);
            const url = await uploadService.uploadFile(file, "room", filename);
        
            await prisma.roomImage.create({
            data: {
                roomId: roomId,
                urlImage: url,
            },
        });
        
        } catch (error) {
            console.error("Error:", error);
            throw new Error(error.message);
        }
    },

    async uploadAirportImage(file, airportId) {
        try {
            const airport = await prisma.airport.findUnique({ where: { id: airportId } });
    
            if (!airport) {
                throw new Error("Airport Id not found in database");
            }

            if (airport?.imageUrl) {
            const filePath = deleteService.extractFilePath(airport.imageUrl);
    
            await deleteService.deleteFile(filePath);
            }
    
            const filename = generateFileNamee(airportId, file.originalname);

            const url = await uploadService.uploadFile(
                file, "airport", 
                filename);
                
            await prisma.airport.update({
            where: { 
                id: airportId },
            data: { 
                imageUrl: url },
            });
    
            } catch (error) {
                console.error('Error:', error);
                throw new Error(error.message);
            }
        }
};