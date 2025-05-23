import prisma from "../../../../prisma/prisma.client.js";

export default {
    async getCustomerListService(mitraId){
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
                                    hotel: {
                                        hotelPartners: {
                                            some: {
                                                partnerId: mitraId,
                                            },
                                        },
                                    },
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
                
                const formatted = customers.map((reservation) => {
                    return {
                    idReservation: reservation.id,
                    name: reservation.transaction.user.name,
                    idRoom: reservation.roomReservations[0]?.room.id || null,
                    roomType: reservation.roomReservations[0]?.room.roomType.typeName || null,
                    startDate: reservation.startDate,
                    endDate: reservation.endDate,
                    price: reservation.transaction.price,
                    };
                });
                
                return formatted;
            },
}