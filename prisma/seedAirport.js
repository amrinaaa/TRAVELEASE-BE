import prisma from "./prisma.client.js";

async function rollback() {
    await prisma.ticket.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.flight.deleteMany();
    await prisma.seat.deleteMany();
    await prisma.seatCategory.deleteMany();
    await prisma.plane.deleteMany();
    await prisma.planeType.deleteMany();
    await prisma.airlinePartner.deleteMany();
    await prisma.airline.deleteMany();
    await prisma.airport.deleteMany();
    await prisma.user.deleteMany();
}

async function main() {
    await rollback();
    
    await prisma.user.createMany({
        data: [
            { name: "Mitra A", email: "mitraa@example.com", password: "hashedpassword1", role: "MITRA_PENERBANGAN", currentAmount: 0, profilePicture: "" },
            { name: "Mitra B", email: "mitrab@example.com", password: "hashedpassword2", role: "MITRA_PENERBANGAN", currentAmount: 0, profilePicture: "" },
            { name: "Admin", email: "admin@example.com", password: "hashedpassword3", role: "ADMIN", currentAmount: 0, profilePicture: "" },
            { name: "Customer", email: "customer@example.com", password: "hashedpassword4", role: "USER", currentAmount: 0, profilePicture: "" }
        ]
    });
    
    await prisma.airport.createMany({
        data: [
            { name: "Soekarno-Hatta International Airport", code: "CGK", city: "Jakarta" },
            { name: "Ngurah Rai International Airport", code: "DPS", city: "Bali" },
            { name: "Juanda International Airport", code: "SUB", city: "Surabaya" },
            { name: "Adisutjipto International Airport", code: "JOG", city: "Yogyakarta" }
        ]
    });
    
    await prisma.airline.createMany({
        data: [
            { name: "Garuda Indonesia", description: "National airline of Indonesia" },
            { name: "Lion Air", description: "Low-cost airline in Indonesia" }
        ]
    });

    await prisma.airlinePartner.createMany({
        data: [
            {
                airlineId: (await prisma.airline.findFirst({ where: { name: "Garuda Indonesia" } }))?.id,
                partnerId: (await prisma.user.findFirst({ where: { email: "mitraa@example.com" } }))?.id
            },
            {
                airlineId: (await prisma.airline.findFirst({ where: { name: "Lion Air" } }))?.id,
                partnerId: (await prisma.user.findFirst({ where: { email: "mitrab@example.com" } }))?.id
            }
        ]
    });

    await prisma.planeType.createMany({
        data: [
            { name: "Boeing 737", manufacture: "Boeing" },
            { name: "Airbus A320", manufacture: "Airbus" }
        ]
    });

    // Ambil semua planeType dan airline terlebih dahulu
    const planeTypes = await prisma.planeType.findMany();
    const airlines = await prisma.airline.findMany();

    // Buat mapping agar lebih cepat diakses
    const planeTypeMap = Object.fromEntries(planeTypes.map(pt => [pt.name, pt.id]));
    const airlineMap = Object.fromEntries(airlines.map(al => [al.name, al.id]));
    
    await prisma.plane.createMany({
        data: [
            { name: "Garuda Boeing 737", planeTypeId: planeTypeMap["Boeing 737"], airlineId: airlineMap["Garuda Indonesia"] },
            { name: "Lion Airbus A320", planeTypeId: planeTypeMap["Airbus A320"], airlineId: airlineMap["Lion Air"] },
        ]
    });

    const planes = await prisma.plane.findMany();
    const planeMap = Object.fromEntries(planes.map(p => [p.name, p.id]));
    
    await prisma.seatCategory.createMany({
        data: [
            { name: "Economy", price: 1000000, planeId: planeMap["Garuda Boeing 737"] },
            { name: "Business", price: 5000000, planeId: planeMap["Garuda Boeing 737"] },
            { name: "Economy", price: 1000000, planeId: planeMap["Lion Airbus A320"] },
            { name: "Business", price: 5000000, planeId: planeMap["Lion Airbus A320"] }
        ]
    });
    
    await prisma.flight.createMany({
        data: [
            {
                planeId: planeMap["Garuda Boeing 737"],
                departureAirportId: (await prisma.airport.findFirst({ where: { code: "CGK" } }))?.id || null,
                arrivalAirportId: (await prisma.airport.findFirst({ where: { code: "DPS" } }))?.id || null,
                flightCode: "GA123",
                departureTime: new Date(),
                arrivalTime: new Date()
            },
            {
                planeId: planeMap["Lion Airbus A320"],
                departureAirportId: (await prisma.airport.findFirst({ where: { code: "DPS" } }))?.id || null,
                arrivalAirportId: (await prisma.airport.findFirst({ where: { code: "CGK" } }))?.id || null,
                flightCode: "JT456",
                departureTime: new Date(),
                arrivalTime: new Date()
            }
        ]
    });
    const flights = await prisma.flight.findMany();
    const flightMap = Object.fromEntries(flights.map(f => [f.flightCode, f.id]));
    
    const economyCategory = await prisma.seatCategory.findFirst({ where: { name: "Economy" } });
    const businessCategory = await prisma.seatCategory.findFirst({ where: { name: "Business" } });
    
    await prisma.seat.createMany({
        data: [
            { name: "A1", seatCategoryId: businessCategory.id },
            { name: "A2", seatCategoryId: businessCategory.id },
            { name: "A3", seatCategoryId: businessCategory.id },
            { name: "B1", seatCategoryId: businessCategory.id },
            { name: "B2", seatCategoryId: businessCategory.id },
            { name: "B3", seatCategoryId: businessCategory.id },
            { name: "D1", seatCategoryId: businessCategory.id },
            { name: "D2", seatCategoryId: businessCategory.id },
            { name: "D3", seatCategoryId: businessCategory.id },
            { name: "F1", seatCategoryId: businessCategory.id },
            { name: "F2", seatCategoryId: businessCategory.id },
            { name: "F3", seatCategoryId: businessCategory.id },
            { name: "A4", seatCategoryId: economyCategory.id },
            { name: "A5", seatCategoryId: economyCategory.id },
            { name: "A6", seatCategoryId: economyCategory.id },
            { name: "A7", seatCategoryId: economyCategory.id },
            { name: "A8", seatCategoryId: economyCategory.id },
            { name: "A9", seatCategoryId: economyCategory.id },
            { name: "A10", seatCategoryId: economyCategory.id },
            { name: "A11", seatCategoryId: economyCategory.id },
            { name: "A12", seatCategoryId: economyCategory.id },
            { name: "A13", seatCategoryId: economyCategory.id },
            { name: "A14", seatCategoryId: economyCategory.id },
            { name: "A15", seatCategoryId: economyCategory.id },
            { name: "A16", seatCategoryId: economyCategory.id },
            { name: "A17", seatCategoryId: economyCategory.id },
            { name: "A18", seatCategoryId: economyCategory.id },
            { name: "A19", seatCategoryId: economyCategory.id },
            { name: "A20", seatCategoryId: economyCategory.id },
            { name: "B4", seatCategoryId: economyCategory.id },
            { name: "B5", seatCategoryId: economyCategory.id },
            { name: "B6", seatCategoryId: economyCategory.id },
            { name: "B7", seatCategoryId: economyCategory.id },
            { name: "B8", seatCategoryId: economyCategory.id },
            { name: "B9", seatCategoryId: economyCategory.id },
            { name: "B10", seatCategoryId: economyCategory.id },
            { name: "B11", seatCategoryId: economyCategory.id },
            { name: "B12", seatCategoryId: economyCategory.id },
            { name: "B13", seatCategoryId: economyCategory.id },
            { name: "B14", seatCategoryId: economyCategory.id },
            { name: "B15", seatCategoryId: economyCategory.id },
            { name: "B16", seatCategoryId: economyCategory.id },
            { name: "B17", seatCategoryId: economyCategory.id },
            { name: "B18", seatCategoryId: economyCategory.id },
            { name: "B19", seatCategoryId: economyCategory.id },
            { name: "B20", seatCategoryId: economyCategory.id },
            { name: "C4", seatCategoryId: economyCategory.id },
            { name: "C5", seatCategoryId: economyCategory.id },
            { name: "C6", seatCategoryId: economyCategory.id },
            { name: "C7", seatCategoryId: economyCategory.id },
            { name: "C8", seatCategoryId: economyCategory.id },
            { name: "C9", seatCategoryId: economyCategory.id },
            { name: "C10", seatCategoryId: economyCategory.id },
            { name: "C11", seatCategoryId: economyCategory.id },
            { name: "C12", seatCategoryId: economyCategory.id },
            { name: "C13", seatCategoryId: economyCategory.id },
            { name: "C14", seatCategoryId: economyCategory.id },
            { name: "C15", seatCategoryId: economyCategory.id },
            { name: "C16", seatCategoryId: economyCategory.id },
            { name: "C17", seatCategoryId: economyCategory.id },
            { name: "C18", seatCategoryId: economyCategory.id },
            { name: "C19", seatCategoryId: economyCategory.id },
            { name: "C20", seatCategoryId: economyCategory.id },
            { name: "E4", seatCategoryId: economyCategory.id },
            { name: "E5", seatCategoryId: economyCategory.id },
            { name: "E6", seatCategoryId: economyCategory.id },
            { name: "E7", seatCategoryId: economyCategory.id },
            { name: "E8", seatCategoryId: economyCategory.id },
            { name: "E9", seatCategoryId: economyCategory.id },
            { name: "E10", seatCategoryId: economyCategory.id },
            { name: "E11", seatCategoryId: economyCategory.id },
            { name: "E12", seatCategoryId: economyCategory.id },
            { name: "E13", seatCategoryId: economyCategory.id },
            { name: "E14", seatCategoryId: economyCategory.id },
            { name: "E15", seatCategoryId: economyCategory.id },
            { name: "E16", seatCategoryId: economyCategory.id },
            { name: "E17", seatCategoryId: economyCategory.id },
            { name: "E18", seatCategoryId: economyCategory.id },
            { name: "E19", seatCategoryId: economyCategory.id },
            { name: "E20", seatCategoryId: economyCategory.id },
            { name: "F4", seatCategoryId: economyCategory.id },
            { name: "F5", seatCategoryId: economyCategory.id },
            { name: "F6", seatCategoryId: economyCategory.id },
            { name: "F7", seatCategoryId: economyCategory.id },
            { name: "F8", seatCategoryId: economyCategory.id },
            { name: "F9", seatCategoryId: economyCategory.id },
            { name: "F10", seatCategoryId: economyCategory.id },
            { name: "F11", seatCategoryId: economyCategory.id },
            { name: "F12", seatCategoryId: economyCategory.id },
            { name: "F13", seatCategoryId: economyCategory.id },
            { name: "F14", seatCategoryId: economyCategory.id },
            { name: "F15", seatCategoryId: economyCategory.id },
            { name: "F16", seatCategoryId: economyCategory.id },
            { name: "F17", seatCategoryId: economyCategory.id },
            { name: "F18", seatCategoryId: economyCategory.id },
            { name: "F19", seatCategoryId: economyCategory.id },
            { name: "F20", seatCategoryId: economyCategory.id }
        ],
        skipDuplicates: true,
    });

    const seat1 = await prisma.seat.findFirst({ where: { name: "A1" } });
    const flight1 = await prisma.flight.findFirst({ where: { flightCode: "GA123" } });

    await prisma.transaction.createMany({
        data: [
            { 
                userId: (await prisma.user.findFirst({ where: { email: "customer@example.com" } }))?.id,
                transactionType: "PURCHASE",
                price: 1000000,
                status: "PAID",
            }
        ]
    });

    const transaction1 = await prisma.transaction.findFirst();

    await prisma.ticket.createMany({
        data: [
            { 
                seatId: seat1.id, 
                flightId: flight1.id, 
                transactionId: transaction1.id, 
                name: "John Doe", 
                nik: "1234567890", 
                type: "ADULT", 
                gender: "MALE" 
            }
        ]
    });
    
    console.log("Seeding completed");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
