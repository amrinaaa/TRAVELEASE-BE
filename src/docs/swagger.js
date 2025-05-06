import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        version: "v0.0.1",
        title: "Dokumentasi API booking hotel dan penerbangan - Travelease",
        description: "Jika ada yang ingin ditanyakan hubungi AMRINA"
    },

    servers: [
        {
            url: "http://localhost:3000/api",
            description: "Local Server",
        },
        {
            url: "https://be-travelease.vercel.app/api",
            description: "Deploy Server",
        }
    ],

    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer"
            },
        },

        schemas: {
            LoginRequest: {
                email: "example@gmail.com",
                password: "Password123",
            },

            RegisterRequest: {
                name: "Jhon Doe",
                email: "example@gmail.com",
                password: "Password123",
                confirmation_password: "Password123",
            },

            ForgotPasswordRequest: {
                email: "example@gmail.com",
            },

            ResetPasswordRequest: {
                oobCode: "Aghiheohaogngas",
                newPassword: "Password123",
                confirmation_password: "Password123",
            },

            AddUsersRequest: {
                name: "Nama",
                email: "example@gmail.com",
                password: "Password123",
            },

            SearchUsersRequest: {
                identifier: "name or email",
            },

            DeleteUsersRequest: {
                uid: "cm8jygpq50000up74xxny591x",
            },

            EditUsersRequest: {
                uid: "cm8jygpq50000up74xxny591x",
                name: "Nama Baru / Kosong",
                email: "EmailBaru@gmail.com / Kosong"
            },

            AddMitraRequest: {
                name: "Nama",
                email: "example@gmail.com",
                password: "Password123",
                role: "MITRA_PENERBANGAN",
            },

            GetMitraRequest: {
                role: "MITRA_PENERBANGAN"
            },

            SearchMitraRequest: {
                identifier: "name or email",
                role: "MITRA_PENERBANGAN",
            },

            FilterFLightRequest: {
                departureCity: "Jakarta",
                arrivalCity: "Bali",
                departureDate: "28 Maret 2025",
                returnDate: "29 Maret 2025",
                seatCategory: "Economy",
            },

            TopupRequest: {
                uid: "cm8jygpq50000up74xxny591x",
                amount: 50000,
                type: "adding",
            },

            AddPlaneTypeRequest: {
                name: "",
                manufacture: "",
            },

            GetPlanesRequest: {
                airlineId: "",
            },

            AddPlaneSeatRequest: {
                planeId: "",
                seatCategoryId: "",
                seatArrangement: [
                    { line: "A", start: "1", end: "6" },
                ],
            },

            AddAirlineRequest: {
                name: "Super Air Jet",
                description: "Sangat Cepat",
            },

            UpdateAirlineRequest: {
                airlineId: "",
                name: "",
                description: "",
            },

            DeleteAirlineRequest: {
                airlineId: "",
            },

            AddPlaneRequest: {
                planeTypeId: "",
                airlineId: "",
                name: "",
                seatCategories: [
                    {
                        "name": "Economy",
                        "price": 100000,
                    },
                ],
            },

            DeletePlaneRequest: {
                planeId: "",
            },

            AddSeatCategoryRequest: {
                planeId: "",
                name: "",
                price: 1000000,
            },

            GetSeatCategoryRequest: {
                planeId: "",
            },

            GetPlaneSeatsRequest: {
                planeId: "",
            },

            DeletePlaneSeatRequest: {
                seatId: "",
            },

            AddFlightRequest: {
                planeId: "",
                departureAirportId: "",
                arrivalAirportId: "",
                flightCode: "",
                departureTime: "",
                arrivalTime: "",
            },

            GetPassangersRequest: {
                flightId: "",
            },

            // addHotelRequest: {
            //     locationId: "",
            //     name: "",
            //     description: "",
            //     address: "",
            //     contact: "",
            // },

            // editHotelRequest: {
            //     hotelId: "",
            //     locationId: "",
            //     name: "",
            //     description: "",
            //     address: "",
            //     contact: "",
            // },

            deleteHotelRequest: {
                hotelId: "",
            },

            getCustomerListRequest: {
                mitraId: "",
            },
        },
    },
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["../routes/api.js"];
swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);