import prisma from "../../../prisma/prisma.client.js";

export default {
  async updateUserNameService(userId, newName) {
    try {
      // Validasi input
      if (!newName || typeof newName !== "string" || newName.trim() === "") {
        throw new Error("New name is required and cannot be empty.");
      }

      // Pastikan pengguna ada (opsional, karena userId dari token seharusnya valid)
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        throw new Error("User not found."); // Seharusnya tidak terjadi jika token valid
      }

      // Update nama pengguna
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: newName.trim(), // Trim spasi di awal dan akhir
        },
        select: {
          // Pilih field yang ingin dikembalikan, hindari password
          id: true,
          name: true,
          email: true,
          role: true,
          profilePicture: true,
          currentAmount: true,
          updatedAt: true,
          createdAt: true,
        },
      });

      return updatedUser;
    } catch (error) {
      console.error(`Error in updateUserNameService: ${error.message}`);
      // Melempar error agar bisa ditangani oleh controller
      throw error;
    }
  },

  async getUserProflieService(userId) {
    try {
      const userProfile = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          name: true,
          email: true,
          currentAmount: true,
          profilePicture: true,
        },
      });

      return userProfile;
    } catch (error) {
      throw new Error(error);
    }
  },
};
