const appRoutes = require("./routes/auth");
const connectDB = require("./config/db");

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.use("/api/auth/", appRoutes);

app.listen(process.env.PORT);
