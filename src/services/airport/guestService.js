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
    
    async filterByDepartureAirportCityService(city) {
        const flights = await this.getFlightsService();
        return flights.filter(flight =>
            flight.departureAirport.city.toLowerCase().includes(city.toLowerCase())
        );
    },

    async filterByArrivalAirportCityService (city) {
        const flights = await this.getFlightsService();
        return flights.filter(flight =>
            flight.arrivalAirport.city.toLowerCase().includes(city.toLowerCase())
        );
    },

    async filterByDepartureAndArrivalAirportCityService (departureCity, arrivalCity) {
        const flights = await this.getFlightsService();
        return flights.filter(flight =>
            flight.departureAirport.city.toLowerCase().includes(departureCity.toLowerCase()) &&
            flight.arrivalAirport.city.toLowerCase().includes(arrivalCity.toLowerCase())
        );
    },

    async filterFlightsByDepartureOrReturnTimeService(departureDate, returnDate) {
        const flights = await this.getFlightsService();

        return flights.filter(flight => {
            const flightDeparture = new Date(flight.departureTime).setHours(0, 0, 0, 0);
            const filterDeparture = departureDate ? new Date(departureDate).setHours(0, 0, 0, 0) : null;
            const filterReturn = returnDate ? new Date(returnDate).setHours(0, 0, 0, 0) : null;

            return (!filterDeparture || flightDeparture === filterDeparture) ||
                (!filterReturn || flightDeparture === filterReturn);
        });
    },

    async filterFlightsBySeatCategoryService(seatCategory) {
        const flights = await this.getFlightsService();
    
        return flights
            .map(flight => {
                const filteredCategories = flight.plane.seatCategories.filter(category =>
                    category.name.toLowerCase().includes(seatCategory.toLowerCase())
                );
                if (filteredCategories.length === 0) {
                    return null; }

                return {
                    ...flight,
                    plane: {
                        ...flight.plane, seatCategories: filteredCategories } }; })
            .filter(flight => flight !== null);
    },


    async filterFlightsByAllService({ from, to, departureDate, returnDate, seatClass }) {
        try {
            let departureFilters = {};
            let returnFilters = {};

            if (departureDate) {
                departureFilters.departureTime = {
                    gte: new Date(new Date(departureDate).setHours(0, 0, 0, 0)),
                    lte: new Date(new Date(departureDate).setHours(23, 59, 59, 999)) }; }

            if (returnDate) {
                returnFilters.departureTime = {
                    gte: new Date(new Date(returnDate).setHours(0, 0, 0, 0)),
                    lte: new Date(new Date(returnDate).setHours(23, 59, 59, 999)) }; }

            const departureFlights = await prisma.flight.findMany({
                where: {
                    AND: [
                        from ? { departureAirport: { city: { contains: from, mode: "insensitive" } } } : {},
                        to ? { arrivalAirport: { city: { contains: to, mode: "insensitive" } } } : {},
                        departureFilters.departureTime ? { departureTime: departureFilters.departureTime } : {} ] },
                include: {
                    plane: {
                        include: {
                            seatCategories: {
                                where: seatClass ? { name: seatClass } : {},
                                include: {
                                    seats: {
                                        select: {
                                            name: true,
                                            tickets: { select: { id: true } } } } } } } },
                    departureAirport: { select: { name: true, code: true, city: true } },
                    arrivalAirport: { select: { name: true, code: true, city: true } } } });

            let returnFlights = [];
            if (returnDate) {
                returnFlights = await prisma.flight.findMany({
                    where: {
                        AND: [
                            to ? { departureAirport: { city: { contains: to, mode: "insensitive" } } } : {},
                            from ? { arrivalAirport: { city: { contains: from, mode: "insensitive" } } } : {},
                            returnFilters.departureTime ? { departureTime: returnFilters.departureTime } : {} ] },
                    include: {
                        plane: {
                            include: {
                                seatCategories: {
                                    where: seatClass ? { name: seatClass } : {},
                                    include: {
                                        seats: {
                                            select: {
                                                name: true,
                                                tickets: { select: { id: true } } } } } } } },
                        departureAirport: { select: { name: true, code: true, city: true } },
                        arrivalAirport: { select: { name: true, code: true, city: true } }
                    } }); 
                }
            
            const formatFlight = (flight) => ({
                flightCode: flight.flightCode,
                departureTime: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(flight.departureTime)),
                arrivalTime: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(flight.arrivalTime)),
                departureAirport: flight.departureAirport,
                arrivalAirport: flight.arrivalAirport,
                plane: {
                    name: flight.plane.name,
                    seatCategories: flight.plane.seatCategories.map(({ name, price, seats }) => {
                        const availableSeats = seats.filter(seat => seat.tickets.length === 0).map(({ name }) => name);
                        const notAvailableSeats = seats.filter(seat => seat.tickets.length > 0).map(({ name }) => name);
                        return { name, price, availableSeats, notAvailableSeats }; }) } });
            
            return {
                departureFlights: departureFlights.map(formatFlight),
                returnFlights: returnFlights.map(formatFlight) };
        
        } catch (error) {
            console.error("Error fetching flights:", error);
            return { departureFlights: [], returnFlights: [] }; } }};