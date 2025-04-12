import prisma from "../../../prisma/prisma.client.js";

export default {
    async getSeatService (flightId) {
        try {
            const flight = await prisma.flight.findUnique({
                where: { id: flightId },
                select: {
                  id: true,
                  planeId: true,
                  plane: {
                    include: {
                      seatCategories: {
                        include: {
                          seats: true
                        }
                      }
                    }
                  }
                }
              });
              
            if (!flight) throw new Error("Flight not found");
        
            const bookedTickets = await prisma.ticket.findMany({
                where: { flightId },
                select: { seatId: true }
            });
        
            const bookedSeatIds = new Set(bookedTickets.map(ticket => ticket.seatId));
        
            const allSeats = flight.plane.seatCategories.flatMap(sc =>
                sc.seats.map(seat => ({
                  seatId: seat.id,
                  seatName: seat.name,
                  seatCategory: sc.name,
                  available: !bookedSeatIds.has(seat.id)
                }))
            );
        
            return allSeats;
        }catch (error) {
            throw new Error(error.messasge);
        };
    },
};