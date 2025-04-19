import prisma from "./prisma.client.js";


async function rollback() {
    await prisma.location.deleteMany();
    await prisma.hotel.deleteMany();
    await prisma.hotelImage.deleteMany();
    await prisma.hotelPartner.deleteMany();
    await prisma.roomType.deleteMany();
    await prisma.facility.deleteMany();
    await prisma.roomTypeFacility.deleteMany();
    await prisma.room.deleteMany();
    await prisma.roomImage.deleteMany();
    await prisma.reservation.deleteMany();
    // await prisma.user.deleteMany();
}

async function main() {
    await rollback();

    const users = await prisma.user.findMany({ where: { role: 'USER' }, take: 2 });
    
    if (users.length < 2) throw new Error('Minimal 2 user dengan role USER diperlukan');

    const [wifi, ac] = await Promise.all([
        prisma.facility.upsert({
        where: { facilityName: 'WiFi' },
        update: {},
        create: { facilityName: 'WiFi' }
        }),
        prisma.facility.upsert({
        where: { facilityName: 'AC' },
        update: {},
        create: { facilityName: 'AC' }
        })
    ]);

    const location1 = await prisma.location.create({
        data: { city: 'Jakarta', country: 'Indonesia' }
    });
    const location2 = await prisma.location.create({
        data: { city: 'Yogyakarta', country: 'Indonesia' }
    });

    const createHotelWithDetails = async (location, partnerUser, index) => {
        const hotel = await prisma.hotel.create({
        data: {
            name: `Hotel Ceria ${index}`,
            description: `Deskripsi hotel ceria ${index}`,
            contact: `+62-812-0000-00${index}`,
            address: `Jl. Bahagia No.${index}`,
            locationId: location.id,
            hotelImages: {
            create: [
                { imageUrl: `https://example.com/hotel${index}-1.jpg` },
                { imageUrl: `https://example.com/hotel${index}-2.jpg` }
            ]
            },
            hotelPartners: {
            create: {
                partnerId: partnerUser.id
            }
        },
        roomTypes: {
            create: [
                {
                typeName: `Superior Room ${index}`,
                capacity: 2,
                price: 750000,
                roomTypeFacilities: {
                    create: [
                    { facilityId: wifi.id, amount: 1 },
                    { facilityId: ac.id, amount: 1 }
                ]
                },
                rooms: {
                    create: [
                    {
                        name: `Room ${index}A`,
                        isAvailable: true,
                        roomImages: {
                        create: {
                            urlImage: `https://example.com/room${index}A.jpg`
                        }
                        }
                    },
                    {
                        name: `Room ${index}B`,
                        isAvailable: true,
                        roomImages: {
                        create: {
                            urlImage: `https://example.com/room${index}B.jpg`
                        }
                    }
                    }
                ]
                }
            }
        ]
        }
        },
        include: {
            roomTypes: {
            include: {
                rooms: true
            }
        }
        }
    });

    return hotel;
    };

    const hotel1 = await createHotelWithDetails(location1, users[0], 1);
    const hotel2 = await createHotelWithDetails(location2, users[1], 2);

    const transaction1 = await prisma.transaction.create({
        data: {
        userId: users[0].id,
        price: 750000,
        transactionType: 'PURCHASE',
        status: 'ORDERED'
        }
    });

    const transaction2 = await prisma.transaction.create({
        data: {
        userId: users[1].id,
        price: 1500000,
        transactionType: 'PURCHASE',
        status: 'ORDERED'
        }
    });

    const today = new Date('2025-04-18T05:38:07.533Z');
    const nextWeek = new Date('2025-04-25T05:38:07.533Z');

    const reservation1 = await prisma.reservation.create({
    data: {
        transactionId: transaction1.id,
        startDate: today,
        endDate: nextWeek
        }
    });

    const reservation2 = await prisma.reservation.create({
        data: {
        transactionId: transaction2.id,
        startDate: today,
        endDate: nextWeek
        }
    });

    await prisma.roomReservation.createMany({
        data: [
        {
            reservationId: reservation1.id,
            roomId: hotel1.roomTypes[0].rooms[0].id,
            amount: 1
        },
        {
            reservationId: reservation2.id,
            roomId: hotel2.roomTypes[0].rooms[1].id,
            amount: 1
        }
    ]
    });

    console.log('✅ Seeder selesai! Semua data berhasil dimasukkan.');
}

main()
    .catch(e => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());