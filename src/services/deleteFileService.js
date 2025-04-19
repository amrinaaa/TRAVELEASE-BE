import getBucket from '../../firebase/firebase.bucket.js';
import { FIREBASE_BUCKET } from '../utils/env.js';
import prisma from '../../prisma/prisma.client.js';

function extractFilePath(imageUrl) {
  try {
    const fileUrl = new URL(imageUrl);
    const filePath = fileUrl.pathname.split('/').slice(2).join('/');

    return filePath;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

export default {
  async deleteFile(filename) {
    const bucketName = FIREBASE_BUCKET;
    const bucket = getBucket(bucketName);
    const file = bucket.file(filename);
  
    try {
      const [exists] = await file.exists();
      if (exists) {
        await file.delete();
      }
      } catch (error) {
        throw new Error(error.message);
      }
  },

  async deleteProfileImage(userId) {
    try {
        const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (!user.profilePicture) {
        throw new Error("Profile image not found");
    }

    const filePath = extractFilePath(user.profilePicture);

    await this.deleteFile(filePath);

    await prisma.user.update({
        where: { id: userId },
        data: { profilePicture: null },
    });

    return { message: "Profile image deleted successfully" };
      } catch (error) {
        throw new Error(error.message);
      }
  },

  async deleteHotelImage(imageId) {
    try {
        const image = await prisma.hotelImage.findUnique({
        where: { id: imageId },
    });

    if (!image) {
        throw new Error("Hotel image not found");
    }

    const filePath = extractFilePath(image.imageUrl);

    await this.deleteFile(filePath);

    await prisma.hotelImage.delete({
        where: { id: imageId },
    });

    return { message: "Hotel image deleted successfully" };
      } catch (error) {
        throw new Error(error.message);
        }
  },

  async deleteRoomImage(imageId) {
      try {
          const image = await prisma.roomImage.findUnique({
          where: { id: imageId },
      });

          if (!image) {
          throw new Error("Room image not found");
      }

        const filePath = extractFilePath(image.urlImage);

        await this.deleteFile(filePath);

        await prisma.roomImage.delete({
          where: { id: imageId },
      });

      return { message: "Room image deleted successfully" };
      } catch (error) {
        throw new Error(error.message);
      }
      }
  };