import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerFilePath = path.resolve(__dirname, "../docs/swagger_output.json");
const swaggerOutput = JSON.parse(fs.readFileSync(swaggerFilePath, "utf-8"));

export default function docs(app) {
    // Anda bisa tetap menggunakan customCss lokal jika mau, atau memuatnya dari CDN juga
    // const localCss = fs.readFileSync(
    //     path.resolve(
    //         __dirname, "../../node_modules/swagger-ui-dist/swagger-ui.css"
    //     ),
    //     "utf-8"
    // );

    const swaggerOptions = {
        // customCss: localCss, // Jika masih ingin menggunakan CSS lokal
        customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.css', // Ganti dengan versi yang sesuai atau terbaru
        customJs: [
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.js', // Ganti dengan versi yang sesuai atau terbaru
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.js' // Ganti dengan versi yang sesuai atau terbaru
        ],
        // Opsi lain bisa ditambahkan di sini jika perlu
        // swaggerUiOptions: {
        //    docExpansion: 'none' // Contoh opsi untuk Swagger UI
        // }
    };

    app.use(
        "/api-docs",
        swaggerUi.serve, // Middleware ini penting untuk beberapa kasus, meski aset utama dari CDN
        swaggerUi.setup(swaggerOutput, swaggerOptions)
    );
}