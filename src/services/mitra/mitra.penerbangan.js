import prisma from "../../../prisma/prisma.client.js";

export default {
    async getPlanesService(mitraId) {
        try {
            const partnerRelation = await prisma.airlinePartner.findFirst({
                where: {
                    partnerId: mitraId,
                }
            });
            if (!partnerRelation.airlineId) {
                throw new Error('Airline not found')
            };

            const plane = await prisma.plane.findMany({
                where: {
                    airlineId: partnerRelation.airlineId
                },
                select: {
                    id: true,
                    name: true,
                    planeType: {
                        select: {
                            name: true,
                            manufacture: true,
                        },
                    },
                },
            });

            return plane;
        } catch (error) {
            throw new Error(error.message);
        };
    },

    //seharusnya udah bisa di coba, tapi buat endpoint untuk melihat daftar pesawatnya dulu
    async addSeatAvailabilityService(
        mitraId,
        // airlineId,
        planeId,
        seatCategoryId,
        seatNames,
    ) {
        try {
            const partnerRelation = await prisma.airlinePartner.findFirst({
                where: {
                    partnerId: mitraId,
                    // airlineId: airlineId
                }
            });
            if (!partnerRelation.airlineId) {
                throw new Error('Anda tidak memiliki akses ke maskapai ini')
            };

            const plane = await prisma.plane.findFirst({
                where: {
                    id: planeId,
                    airlineId: partnerRelation.airlineId
                }
            });
            if (!plane) {
                throw new Error('Pesawat tidak ditemukan atau bukan milik maskapai Anda')
            };

            const seatCategory = await prisma.seatCategory.findFirst({
                where: {
                    id: seatCategoryId,
                    planeId: planeId
                }
            });

            //jika ingin dibuat agar bisa menambahkan kategori didalam if buat daftar kategorinya
            if (!seatCategory) {
                throw new Error('Kategori kursi tidak ditemukan untuk pesawat ini')
            };

            const createdSeats = [];

            for (const seatName of seatNames) {
                // Periksa apakah kursi dengan nama tersebut sudah ada
                const existingSeat = await prisma.seat.findFirst({
                    where: {
                        seatCategoryId: seatCategoryId,
                        name: seatName
                    }
                });

                if (existingSeat) {
                    createdSeats.push({
                        name: seatName,
                        status: 'already_exists'
                    });
                    continue;
                }

                // Buat kursi baru
                const newSeat = await prisma.seat.create({
                    data: {
                        seatCategoryId: seatCategoryId,
                        name: seatName
                    }
                });

                createdSeats.push({
                    id: newSeat.id,
                    name: newSeat.name,
                    status: 'created'
                });
            };

            return createdSeats;
        } catch (error) {
            throw new Error(error.message);
        }
    },
}