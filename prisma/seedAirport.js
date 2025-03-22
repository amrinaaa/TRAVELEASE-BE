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
            { name: "Mitra A", email: "mitraa@example.com", password: "hashedpassword1", role: "MITRA", currentAmount: 0, profilePicture: "" },
            { name: "Mitra B", email: "mitrab@example.com", password: "hashedpassword2", role: "MITRA", currentAmount: 0, profilePicture: "" },
            { name: "Admin", email: "admin@example.com", password: "hashedpassword3", role: "ADMIN", currentAmount: 0, profilePicture: "" },
            { name: "Customer", email: "customer@example.com", password: "hashedpassword4", role: "USER", currentAmount: 0, profilePicture: "" }
        ]
    });
    
    await prisma.airport.createMany({
        data: [
            { name: "Soekarno-Hatta International Airport", code: "CGK", city: "Jakarta" },
            { name: "Ngurah Rai International Airport", code: "DPS", city: "Bali" },
            { name: "Juanda International Airport", code: "SUB", city: "Surabaya" }
        ]
    });
    
    await prisma.airline.createMany({
        data: [
            { name: "Garuda Indonesia", description: "National airline of Indonesia" },
            { name: "Lion Air", description: "Low-cost airline in Indonesia" },
            { name: "Batik Air", description: "Full-service airline under Lion Air Group" }
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
    
    const garudaPlane = await prisma.plane.create({
        data: {
            name: "Garuda Boeing 737",
            planeTypeId: (await prisma.planeType.findFirst({ where: { name: "Boeing 737" } })).id,
            airlineId: (await prisma.airline.findFirst({ where: { name: "Garuda Indonesia" } })).id
        }
    });
    
    const lionPlane = await prisma.plane.create({
        data: {
            name: "Lion Airbus A320",
            planeTypeId: (await prisma.planeType.findFirst({ where: { name: "Airbus A320" } })).id,
            airlineId: (await prisma.airline.findFirst({ where: { name: "Lion Air" } })).id
        }
    });
    
    await prisma.seatCategory.createMany({
        data: [
            { name: "Economy", price: 1000000, planeId: garudaPlane.id },
            { name: "Business", price: 5000000, planeId: lionPlane.id }
        ]
    });
    
    const flight1 = await prisma.flight.create({
        data: {
            planeId: garudaPlane.id,
            departureAirportId: (await prisma.airport.findFirst({ where: { code: "CGK" } })).id,
            arrivalAirportId: (await prisma.airport.findFirst({ where: { code: "DPS" } })).id,
            flightCode: "GA123",
            departureTime: new Date(),
            arrivalTime: new Date()
        }
    });
    
    const economyCategory = await prisma.seatCategory.findFirst({ where: { name: "Economy" } });
    const businessCategory = await prisma.seatCategory.findFirst({ where: { name: "Business" } });
    
    await prisma.seat.createMany({
        data: [
            { name: "A1", seatCategoryId: economyCategory.id },
            { name: "A2", seatCategoryId: economyCategory.id },
            { name: "B1", seatCategoryId: businessCategory.id }
        ]
    });
    
    const customer = await prisma.user.findFirst({ where: { name: "Customer" } });
    
    const transaction1 = await prisma.transaction.create({
        data: { 
            userId: customer.id, 
            price: 1000000, 
            status: "PAID" 
        }
    });
    
    await prisma.ticket.createMany({
        data: [
            { transactionId: transaction1.id, seatId: (await prisma.seat.findFirst({ where: { name: "A1" } })).id, flightId: flight1.id, name: "John Doe", nik: "1234567890", type: "ADULT", gender: "MALE" },
            { transactionId: transaction1.id, seatId: (await prisma.seat.findFirst({ where: { name: "A2" } })).id, flightId: flight1.id, name: "Jane Doe", nik: "0987654321", type: "CHILDREN", gender: "FEMALE" }
        ]
    });
    
    console.log("Seeding completed");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
