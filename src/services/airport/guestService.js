import prisma from "../../../prisma/prisma.client.js";

export default {
    async getCityFlightService (city) {
        const airport = await prisma.airport.findMany({
            where: { 
                city: { equals: city, mode: "insensitive", }, }, }); 
            return airport; 
        },

    async getFlightsService() {
        const now = new Date();
    
        const flights = await prisma.flight.findMany({
            select: {
                flightCode: true,
                departureTime: true,
                arrivalTime: true,
                departureAirport: {
                    select: { name: true, city: true, code: true },
                },
                arrivalAirport: {
                    select: { name: true, city: true, code: true },
                },
                plane: {
                    select: { name: true,
                        seatCategories: {
                            select: { name: true, price: true,
                                seats: {
                                    select: { name: true,
                                        tickets: {
                                            select: { flight: {
                                                    select: { arrivalTime: true }, }, }, }, }, }, }, }, }, }, }, });
    
        return flights.map((flight) => ({
            ...flight,
            plane: {
                ...flight.plane,
                seatCategories: flight.plane.seatCategories.map((category) => {
                    const { availableSeats, notAvailableSeats } = category.seats.reduce(
                        (acc, seat) => {
                            const isBooked = seat.tickets.some(ticket => ticket.flight.arrivalTime > now);
    
                            if (isBooked) {
                                acc.notAvailableSeats.push(seat.name);
                            } else {
                                acc.availableSeats.push(seat.name);
                            }
                            return acc;
                        },
                        { availableSeats: [], notAvailableSeats: [] }
                    );
    
                    return {
                        name: category.name, price: category.price, availableSeats, notAvailableSeats, }; }), }, }));
    },

    async filterFlightsByAllService({ departureCity, arrivalCity, departureDate, returnDate, seatCategory }) {
        const flights = await this.getFlightsService();
    
        const filterSeatsByCategory = (flight) => {
            if (!seatCategory) return flight;
    
            const filteredSeatCategories = flight.plane.seatCategories
                .filter(category => category.name.toLowerCase() === seatCategory.toLowerCase())
                .map(category => ({
                    name: category.name,
                    price: category.price,
                    availableSeats: category.availableSeats,
                    notAvailableSeats: category.notAvailableSeats
                }));
    
            return { ...flight, plane: { ...flight.plane, seatCategories: filteredSeatCategories } };
        };
    
        const filteredFlights = flights
            .filter(flight => {
                const flightDepartureDate = new Date(flight.departureTime).setHours(0, 0, 0, 0);
                const inputDepartureDate = new Date(departureDate).setHours(0, 0, 0, 0);
    
                return (
                    flight.departureAirport.city.toLowerCase() === departureCity.toLowerCase() &&
                    flight.arrivalAirport.city.toLowerCase() === arrivalCity.toLowerCase() &&
                    flightDepartureDate === inputDepartureDate
                );
            })
            .map(filterSeatsByCategory);
    
        let returnFlights = [];
        if (returnDate) {
            returnFlights = flights
                .filter(flight => {
                    const flightReturnDate = new Date(flight.departureTime).setHours(0, 0, 0, 0);
                    const inputReturnDate = new Date(returnDate).setHours(0, 0, 0, 0);
    
                    return (
                        flight.departureAirport.city.toLowerCase() === arrivalCity.toLowerCase() &&
                        flight.arrivalAirport.city.toLowerCase() === departureCity.toLowerCase() &&
                        flightReturnDate === inputReturnDate
                    );
                })
                .map(filterSeatsByCategory);
        }
    
        return [...filteredFlights, ...returnFlights];
    }
    
};    