import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import router from "./routes/api.js";
import docs from "./docs/route.js";

import { FRONTEND_URL } from "./utils/env.js";

async function init() {
    try {
        const app = express();
        const PORT = 3000;

        app.use(cors({
            credentials: true,
        }));

        app.use(bodyParser.json());
        app.use(cookieParser());

        app.get("/", (_req, res) => {
            res.status(200).json({
                message: "Server is running",
                data: null,
            });
        });

        app.use("/api", router);
        docs(app);


        app.listen(PORT, () => {
            console.log(`Server run in http://localhost:${PORT}`);
        });
    } catch (error) {
        console.log(error)
    }
};

init();
