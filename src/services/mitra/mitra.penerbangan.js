import prisma from "../../../prisma/prisma.client.js";

export default {
    async addAirlineService(mitraId, name, description) {
        try {
            const existingAirline = await prisma.airline.findFirst({
                where: { name }
            });

            if (existingAirline) {
                throw new Error('Airline is exist')
            };

            const result = await prisma.$transaction(async (tx) => {
                // Buat airline baru
                const newAirline = await tx.airline.create({
                    data: {
                        name,
                        description
                    }
                });

                // Periksa apakah mitra/partner ada
                const partner = await tx.user.findUnique({
                    where: { id: mitraId }
                });

                if (!partner) {
                    throw new Error('Partner not found');
                }

                // Buat relasi airlinePartner
                await tx.airlinePartner.create({
                    data: {
                        airlineId: newAirline.id,
                        partnerId: mitraId
                    }
                });

                // Ambil data airline lengkap dengan relasi
                const airlineWithRelations = await tx.airline.findUnique({
                    where: { id: newAirline.id },
                    include: {
                        airlinePartners: {
                            include: {
                                partner: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    }
                });

                return airlineWithRelations;
            });

            return result;
        } catch (error) {
            throw new Error(error.message);
        };
    },

    async getAirlinesService(mitraId) {
        try {
            const mitra = await prisma.user.findUnique({
                where: { id: mitraId }
            });

            if (!mitra) {
                throw new Error('Partner not found');
            }

            const mitraAirlines = await prisma.airlinePartner.findMany({
                where: {
                    partnerId: mitraId
                },
                include: {
                    airline: {
                        include: {
                            planes: true
                        }
                    }
                }
            });

            // Format output agar lebih mudah dikonsumsi frontend
            const formattedAirlines = mitraAirlines.map(item => ({
                id: item.airline.id,
                name: item.airline.name,
                description: item.airline.description,
                planes: item.airline.planes,
                partnershipId: item.id
            }));

            return formattedAirlines;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    async getPlaneTypesService() {
        try {
            const planeTypes = await prisma.planeType.findMany({
                orderBy: {
                    name: 'asc'
                }
            });

            return planeTypes;
        } catch (error) {
            throw new Error(error.message);
        }
    },

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