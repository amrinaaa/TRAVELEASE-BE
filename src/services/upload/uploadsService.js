import uploadService from "./uploadService.js";
// import deleteService from "../deleteFileService.js";
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