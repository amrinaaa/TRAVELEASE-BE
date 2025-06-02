import prisma from "../../../prisma/prisma.client.js";

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default {
    async totalUsersService({role}) {
        try {
            const count = await prisma.user.count({
                where: { role },
            });

            return count;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    async graphUsersService({role}) {
        try {
            const users = await prisma.user.findMany({
            where: { role },
            select: {
                createdAt: true,
            },
            });

            const countByMonth = {};

            for (const user of users) {
            const date = new Date(user.createdAt);
            const year = date.getFullYear();
            const monthIndex = date.getMonth(); // 0-11
            const monthKey = `${monthNames[monthIndex]} ${year}`;

            if (!countByMonth[monthKey]) {
                countByMonth[monthKey] = 0;
            }

            countByMonth[monthKey]++;
            }

            const result = Object.entries(countByMonth)
            .sort((a, b) => {
                const [monthA, yearA] = a[0].split(" ");
                const [monthB, yearB] = b[0].split(" ");
                const indexA = monthNames.indexOf(monthA);
                const indexB = monthNames.indexOf(monthB);
                return yearA - yearB || indexA - indexB;
            })
            .map(([month, count]) => ({
                month,
                count,
            }));

            return result;
        } catch (error) {
            throw new Error(error.message);
        }
    },
};