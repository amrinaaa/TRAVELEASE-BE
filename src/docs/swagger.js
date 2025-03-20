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
            }
        },
    },
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["../routes/auth.js"];
swaggerAutogen({openapi: "3.0.0"})(outputFile, endpointsFiles, doc);