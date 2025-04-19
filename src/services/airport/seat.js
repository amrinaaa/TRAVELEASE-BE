import prisma from "../../../prisma/prisma.client.js";

export default {
  async getSeatService(flightId) {
    try {
      const flight = await prisma.flight.findUnique({
        where: { id: flightId },
      });

      const planeId = flight.planeId;
      const seatCategories = await prisma.seatCategory.findMany({
        where: { planeId: planeId },
        include: {
          seats: true
        }
      });

      const bookedTickets = await prisma.ticket.findMany({
        where: { flightId: flightId },
        select: { seatId: true }
      });
      const allSeatIds = seatCategories.flatMap(category =>
        category.seats.map(seat => seat.id)
      );

      const bookedSeatIds = new Set(bookedTickets.map(ticket => ticket.seatId));

      const formattedCategories = seatCategories.map(category => {
        return {
          categoryId: category.id,
          categoryName: category.name,
          price: category.price,
          availableSeats: category.seats.filter(seat => !bookedSeatIds.has(seat.id)).length,
          totalSeats: category.seats.length,
          seats: category.seats.map(seat => {
            return {
              id: seat.id,
              name: seat.name,
              isAvailable: !bookedSeatIds.has(seat.id)
            }
          })
        }
      });

      return {
        totalAvailableSeats: allSeatIds.length - bookedSeatIds.size,
        totalSeats: allSeatIds.length,
        bookedSeats: bookedSeatIds.size,
        seatCategories: formattedCategories
      }
    } catch (error) {
      throw new Error(error.messasge);
    };
  },
};