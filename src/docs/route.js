import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerFilePath = path.resolve(__dirname, "../docs/swagger_output.json");
const swaggerOuput = JSON.parse(fs.readFileSync(swaggerFilePath, "utf-8"));

export default function docs(app) {
    const css = fs.readFileSync(
        path.resolve(
            __dirname, "../../node_modules/swagger-ui-dist/swagger-ui.css"
        ), 
        "utf-8"
    );

    app.use(
        "/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(
            swaggerOuput, 
            {
                customCss: css
            },
        )
    );
}