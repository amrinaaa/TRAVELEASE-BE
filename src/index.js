import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import router from "./routes/api.js";

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
// app.use(cors());

app.use("/api", router);

app.listen( PORT, () => {
    console.log(`Server run in http://localhost:${PORT}`);
});