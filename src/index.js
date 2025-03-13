import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import router from "./routes/api.js";
import docs from "./docs/route.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/api", router);
docs(app);

app.listen( PORT, () => {
    console.log(`Server run in http://localhost:${PORT}`);
});