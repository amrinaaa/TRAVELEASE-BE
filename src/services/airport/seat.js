import prisma from "../../../prisma/prisma.client.js";

export default {
    async getSeatService (flightId) {
        try {
            const allSeats = await prisma.seat.findMany({
                select: {
                  id: true,
                  name: true,
                  seatCategory: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              });
              
            const usedTickets = await prisma.ticket.findMany({
                where: {
                  flightId: flightId,
                },
                select: {
                  seatId: true,
                },
            });
              
            const usedSeatIds = new Set(usedTickets.map(ticket => ticket.seatId));
              
            const result = allSeats.map(seat => ({
                id: seat.id,
                name: seat.name,
                seatCategory: {
                  name: seat.seatCategory.name,
                },
                isAvailable: !usedSeatIds.has(seat.id),
            }));
            
            return result;
        }catch (error) {
            throw new Error(error.messasge);
        };
    },
};