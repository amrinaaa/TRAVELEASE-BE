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
                email: "example@gmail.com",
            },

            DeleteUsersRequest: {
                uid: "cm8jygpq50000up74xxny591x",
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
                email: "example@gmail.com",
                role: "MITRA_PENERBANGAN",
            },

            TopupRequest: {
                uid: "cm8jygpq50000up74xxny591x",
                amount: 50000,
                type: "adding",
            },
        },
    },
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["../routes/api.js"];
swaggerAutogen({openapi: "3.0.0"})(outputFile, endpointsFiles, doc);