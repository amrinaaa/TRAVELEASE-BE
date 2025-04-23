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
        seatCategoryId, //seharusnya category name bukan id
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

            //disini ambil id nya, berdasarkan name dan planeId
            const seatCategory = await prisma.seatCategory.findFirst({
                where: {
                    id: seatCategoryId,
                    planeId: planeId
                }
            });

            //jika ingin menambahkan kursi yg dari ketergori yang belum ada bisa di buat didalam IF
            //tujuannya agar ketika mitra menambah pesawat baru,
            //cukup pakai endpoint/service ini
            if (!seatCategory) {
                throw new Error('Kategori kursi tidak ditemukan untuk pesawat ini')
            };

            const createdSeats = [];

            for (const seatName of seatNames) {
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