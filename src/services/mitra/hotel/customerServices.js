import prisma from "../../../../prisma/prisma.client.js";

export default {
    async getCustomerListService(hotelId) {
        const customers = await prisma.reservation.findMany({
            where: {
                transaction: {
                    user: {
                        role: 'USER',
                    },
                },
                roomReservations: {
                    some: {
                        room: {
                            roomType: {
                                hotelId: hotelId, // <- filter langsung berdasarkan hotelId
                            },
                        },
                    },
                },
            },
            select: {
                id: true,
                startDate: true,
                endDate: true,
                transaction: {
                    select: {
                        price: true,
                        user: {
                            select: {
                                name: true,
                                role: true,
                            }
                        }
                    }
                },
                roomReservations: {
                    select: {
                        room: {
                            select: {
                                id: true,
                                roomType: {
                                    select: {
                                        typeName: true,
                                    }
                                }
                            }
                        }
                    }
                }
            },
        });

        return customers.map((reservation) => ({
            idReservation: reservation.id,
            name: reservation.transaction.user.name,
            idRoom: reservation.roomReservations[0]?.room.id || null,
            roomType: reservation.roomReservations[0]?.room.roomType.typeName || null,
            startDate: reservation.startDate,
            endDate: reservation.endDate,
            price: reservation.transaction.price,
        }));
    }
}