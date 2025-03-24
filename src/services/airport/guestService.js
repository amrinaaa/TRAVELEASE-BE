import prisma from "../../../prisma/prisma.client.js";

export default {
    async getCityFlightService (city) {
        const airport = await prisma.airport.findMany({
            where: { 
                city: { equals: city, mode: "insensitive", }, }, }); 
            return airport; 
        },

    async getFlightsService() {
        const flights = await prisma.flight.findMany({
            select: { flightCode: true, departureTime: true, arrivalTime: true, departureAirport: {
                select: {name: true, city: true, code: true, },}, 
                arrivalAirport: { 
                    select: {name: true, city: true, code: true, },},
                plane: {
                    select: { name: true, 
                        seatCategories: {
                            select: { name: true, price: true, seats: {
                                where: {
                                    tickets: { none: {} } },
                                    select: { name: true, }, }, }, }, }, }, }, 
                                });
                                return flights.map(flight => ({
                                    ...flight, plane: {
                                        ...flight.plane,  
                                        seatCategories: flight.plane.seatCategories.map(category => ({ 
                                            name: category.name, price: category.price, availableSeats: category.seats.map(seat => seat.name) }))}})); 
                                        },
    
    async getFlightsByDepartureAirportService (airportIds) {
        const flights = await prisma.flight.findMany({
            where: {
                departureAirportId: { in: airportIds, }, },
            select: { flightCode: true, departureTime: true, arrivalTime: true, 
                departureAirport: {
                    select: { name: true, city: true, code: true, }, },  
                    arrivalAirport: {
                        select: { name: true, city: true, code: true, }, },
                    plane: {
                        select: { name: true,
                            seatCategories: {
                                select: { name: true, price: true, 
                                    seats: { 
                                        where: { 
                                            tickets: { none: {} } }, 
                                            select: { name: true, } } }, }, }, }, }, }); 
                                            
                                            return flights.map(flight => ({  
                                                ...flight, plane: { 
                                                    ...flight.plane, 
                                                    seatCategories: flight.plane.seatCategories.map(category => ({  
                                                        name: category.name, price: category.price, availableSeats: category.seats.map(seat => seat.name) })) } }));  
                                                    },

    async getFlightsByArrivalAirportService (airportIds) {
        const flights = await prisma.flight.findMany({
            where: { 
                arrivalAirportId: { in: airportIds, }, },
            select: { flightCode: true, departureTime: true, arrivalTime: true, 
                departureAirport: {
                    select: { name: true, city: true, code: true, }, },
                arrivalAirport: {
                    select: { name: true, city: true, code: true, }, },
                plane: {
                    select: { name: true,
                        seatCategories: {
                            select: { name: true, price: true,
                                seats: {
                                    where: {
                                        tickets: { none: {} } },
                                        select: { name: true, } } }, }, }, }, }, }); 
                                    
                                        return flights.map(flight => ({
                                            ...flight,
                                            plane: {
                                                ...flight.plane,
                                                seatCategories: flight.plane.seatCategories.map(category => ({
                                                    name: category.name, price: category.price, availableSeats: category.seats.map(seat => seat.name)  })) } }));
                                                },

    async getFlightsByDepartureAndArrivalAirportService (departureAirportIds, arrivalAirportIds) {
        const flights = await prisma.flight.findMany({
            where: {
                departureAirportId: { in: departureAirportIds, },
                arrivalAirportId: { in: arrivalAirportIds, }, },
            select: { flightCode: true, departureTime: true, arrivalTime: true, 
                departureAirport: {
                    select: { name: true, city: true, code: true, }, },
                arrivalAirport: {
                    select: { name: true, city: true, code: true, }, },
                plane: {
                    select: { name: true,
                        seatCategories: {
                            select: { name: true, price: true,
                                seats: {
                                    where: {
                                        tickets: { none: {} } },
                                        select: { name: true } } }, }, }, }, }, });
                                    
                                        return flights.map(flight => ({
                                            ...flight,
                                            plane: {
                                                ...flight.plane,
                                                seatCategories: flight.plane.seatCategories.map(category => ({
                                                    name: category.name, price: category.price, availableSeats: category.seats.map(seat => seat.name) })) } }));
                                                },

    async searchByDepartureAirportCityService (city) {
        const airports = await prisma.airport.findMany({
            where: {
                city: { contains: city, mode: "insensitive", }, }, });
                if (airports.length === 0) {
                    return [];
                }
                const airportIds = airports.map((airport) => airport.id);
                return await this.getFlightsByDepartureAirportService(airportIds);
            },

    async searchByArrivalAirportCityService (city) {
        const airports = await prisma.airport.findMany({
            where: {
                city: { contains: city, mode: "insensitive", }, }, });
                if (airports.length === 0) {
                    return [];
                }
                const airportIds = airports.map((airport) => airport.id);
                return await this.getFlightsByArrivalAirportService(airportIds);
            },

    async searchByDepartureAndArrivalAirportCityService (departureCity, arrivalCity) {
        const departureAirports = await prisma.airport.findMany({
            where: {
                city: { contains: departureCity, mode: "insensitive", }, }, });
                const arrivalAirports = await prisma.airport.findMany({
            where: {
                city: { contains: arrivalCity, mode: "insensitive", }, }, });
                if (departureAirports.length === 0 || arrivalAirports.length === 0) {
                    return { message: "No matching airports found", data: null };
                }
                const departureAirportIds = departureAirports.map(airport => airport.id);
                const arrivalAirportIds = arrivalAirports.map(airport => airport.id);
                return await this.getFlightsByDepartureAndArrivalAirportService(departureAirportIds, arrivalAirportIds);
            },

    async searchFlightsByDepartureOrReturnTimeService(departureDate, returnDate) {
        let filters = [];
        if (departureDate) {
            filters.push({
                departureTime: {
                    gte: new Date(departureDate.setHours(0, 0, 0, 0)),
                    lte: new Date(departureDate.setHours(23, 59, 59, 999)) } }); 
                }
                if (returnDate) {
                    filters.push({
                        arrivalTime: {
                            gte: new Date(returnDate.setHours(0, 0, 0, 0)),
                            lte: new Date(returnDate.setHours(23, 59, 59, 999)) } });
                        }
                        const flights = await prisma.flight.findMany({
                            where: {
                                OR: filters.length > 0 ? filters : undefined, },
                                select: { flightCode: true, departureTime: true, arrivalTime: true,
                                    departureAirport: { 
                                        select: { name: true, city: true, code: true } },
                                        arrivalAirport: { 
                                            select: { name: true, city: true, code: true } },
                                            plane: {
                                                select: { name: true,
                                                    seatCategories: { 
                                                        select: { name: true, price: true,
                                                            seats: { 
                                                                where: { tickets: { none: {} } },
                                                                select: { name: true } } } } } } } });
                                                                return flights.map((flight) => ({
                                                                    ...flight, departureTime: new Intl.DateTimeFormat("id-ID", {
                                                                        day: "2-digit", month: "long", year: "numeric"
                                                                    }).format(new Date(flight.departureTime)),
                                                                    arrivalTime: new Intl.DateTimeFormat("id-ID", {
                                                                        day: "2-digit", month: "long", year: "numeric"
                                                                    }).format(new Date(flight.arrivalTime)),
                                                                    plane: {
                                                                        ...flight.plane,
                                                                        seatCategories: flight.plane.seatCategories.map(category => ({
                                                                            name: category.name, price: category.price, availableSeats: category.seats.map(seat => seat.name)
                                                                        }))}}));
                                                                    },

    async searchFlightsBySeatCategoryService () {
        const flights = await prisma.flight.findMany({
            where: {
                plane: {
                    seatCategories: {
                        some: {
                            name: {  in: ["Business", "Economy"], }, }, }, }, },
                            select: { flightCode: true, departureTime: true, arrivalTime: true,
                                departureAirport: {
                                    select: { name: true, city: true, code: true, }, },
                                    arrivalAirport: {
                                        select: { name: true, city: true, code: true, }, },
                                        plane: {
                                            select: { name: true,
                                                seatCategories: {
                                                    select: { name: true, price: true,
                                                        seats: {
                                                            where: { tickets: { none: {}, }, },
                                                            select: { name: true, } }, }, }, }, }, }, });
                                                            return flights.map(flight => ({
                                                                ...flight, plane: {
                                                                    ...flight.plane, seatCategories: flight.plane.seatCategories.map(category => ({ name: category.name, price: category.price, availableSeats: category.seats.map(seat => seat.name) }))}}));
                                                                },

    async searchFlightsByAllService({ from, to, departureDate, returnDate, seatClass }) {
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
                        departureFilters.departureTime ? { departureTime: departureFilters.departureTime } : {}
                    ]
                },
                include: {
                    plane: {
                        include: {
                            seatCategories: {
                                where: seatClass ? { name: seatClass } : {},
                                include: {
                                    seats: { select: { name: true } } }
                            } } 
                        },
                    departureAirport: { select: { name: true, code: true, city: true } },
                    arrivalAirport: { select: { name: true, code: true, city: true } }
                } });

            let returnFlights = [];
            if (returnDate) {
                returnFlights = await prisma.flight.findMany({
                    where: {
                        AND: [
                            to ? { departureAirport: { city: { contains: to, mode: "insensitive" } } } : {},
                            from ? { arrivalAirport: { city: { contains: from, mode: "insensitive" } } } : {},
                            returnFilters.departureTime ? { departureTime: returnFilters.departureTime } : {}
                        ] },
                    include: {
                        plane: {
                            include: {
                                seatCategories: {
                                    where: seatClass ? { name: seatClass } : {},
                                    include: { seats: { select: { name: true } } } } 
                                }
                            },
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
                    seatCategories: flight.plane.seatCategories.map(({ name, price, seats }) => ({
                        name,
                        price,
                        availableSeats: seats.map(({ name }) => name) })) 
                    } 
                });
    
            return {
                departureFlights: departureFlights.map(formatFlight),
                returnFlights: returnFlights.map(formatFlight)
            };
    
        } catch (error) {
            console.error("Error fetching flights:", error);
            return { departureFlights: [], returnFlights: [] };
        } } 
    };    