import prisma from "../../../prisma/prisma.client.js";

export default {
    async getFlightsByCityService(city) {
        try {
            const flights = await prisma.flight.findMany({
                where: {
                    arrivalAirport: {
                        city: {
                            equals: city,
                            mode: "insensitive",
                        }
                    }
                },
                select: {
                    id: true,
                    flightCode: true,
                    departureTime: true,
                    arrivalTime: true,
                    price: true,
                    departureAirport: {
                        select: {
                            name: true,
                            city: true,
                            code: true,
                            imageUrl: true,
                        },
                    },
                    arrivalAirport: {
                        select: {
                            name: true,
                            city: true,
                            code: true,
                            imageUrl: true,
                        },
                    },
                    plane: {
                        select: {
                            name: true,
                            airline: {
                                select: {
                                    name: true,
                                },
                            },
                            planeType: {
                                select: {
                                    name: true,
                                    manufacture: true,
                                },
                            },
                            seatCategories: {
                                select: {
                                    name: true,
                                    price: true,
                                },
                            },
                        },
                    },
                },
            });

            const formattedFlights = flights.map(flight => {
                const { price: basePrice, ...restFlight } = flight;

                let minTotalPrice = Number.MAX_SAFE_INTEGER;
                let maxTotalPrice = 0;

                const formattedCategories = flight.plane.seatCategories.map(category => {
                    const totalPrice = basePrice + category.price;

                    if (totalPrice < minTotalPrice) minTotalPrice = totalPrice;
                    if (totalPrice > maxTotalPrice) maxTotalPrice = totalPrice;

                    return {
                        name: category.name,
                        categoryPrice: category.price,
                        totalPrice
                    };
                });

                if (formattedCategories.length === 0) {
                    minTotalPrice = basePrice;
                    maxTotalPrice = basePrice;
                }

                const priceRange = minTotalPrice === maxTotalPrice
                    ? `${minTotalPrice}`
                    : `${minTotalPrice} - ${maxTotalPrice}`;

                const formattedPlane = {
                    ...flight.plane,
                    seatCategories: formattedCategories
                };

                return {
                    ...restFlight,
                    basePrice,
                    priceRange,
                    plane: formattedPlane
                };
            });

            return formattedFlights;
        } catch (error) {
            throw new Error(`Gagal mengambil data flight: ${error.message}`);
        }
    },

    async getFlightsService() {
        try {
            const today = new Date();
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + 1);
            targetDate.setHours(0, 0, 0, 0); // akhir hari +1

            const flights = await prisma.flight.findMany({
            where: {
                departureTime: {
                gt: targetDate, // hanya flight dengan departureTime > hari ini + 1 hari
                },
            },
            select: {
                id: true,
                flightCode: true,
                departureTime: true,
                arrivalTime: true,
                price: true,
                departureAirport: {
                select: {
                    name: true,
                    city: true,
                    code: true,
                    imageUrl: true,
                },
                },
                arrivalAirport: {
                select: {
                    name: true,
                    city: true,
                    code: true,
                    imageUrl: true,
                },
                },
                plane: {
                select: {
                    name: true,
                    airline: {
                    select: {
                        name: true,
                    },
                    },
                    planeType: {
                    select: {
                        name: true,
                        manufacture: true,
                    },
                    },
                    seatCategories: {
                    select: {
                        name: true,
                        price: true,
                    },
                    },
                },
                },
            },
            orderBy: {
                departureTime: 'asc', // opsional: urutkan dari yang paling dekat
            },
            });

            const formattedFlights = flights.map(flight => {
            const { price: basePrice, ...restFlight } = flight;

            let minTotalPrice = Number.MAX_SAFE_INTEGER;
            let maxTotalPrice = 0;

            const formattedCategories = flight.plane.seatCategories.map(category => {
                const totalPrice = basePrice + category.price;

                if (totalPrice < minTotalPrice) minTotalPrice = totalPrice;
                if (totalPrice > maxTotalPrice) maxTotalPrice = totalPrice;

                return {
                name: category.name,
                categoryPrice: category.price,
                totalPrice,
                };
            });

            if (formattedCategories.length === 0) {
                minTotalPrice = basePrice;
                maxTotalPrice = basePrice;
            }

            const priceRange = minTotalPrice === maxTotalPrice
                ? `${minTotalPrice}`
                : `${minTotalPrice} - ${maxTotalPrice}`;

            const formattedPlane = {
                ...flight.plane,
                seatCategories: formattedCategories,
            };

            return {
                ...restFlight,
                basePrice,
                priceRange,
                plane: formattedPlane,
            };
            });

            return formattedFlights;
        } catch (error) {
            throw new Error(`Gagal mengambil data flight: ${error.message}`);
        }
    },
};
