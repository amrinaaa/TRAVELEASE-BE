import prisma from "../../../../prisma/prisma.client.js";

export default {
    async getCustomerListService(){
            const customers = await prisma.reservation.findMany({
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
                    where: {
                    transaction: {
                        user: {
                        role: 'USER',
                        }
                    }
                    }
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