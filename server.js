import express from "express";
import dotenv from "dotenv";
import connectDB from "./connectDB.js";
import { errorHandler, notFound } from "./Middleware/error.js";
import Route from "./Routes/authRoute.js";

dotenv.config();
connectDB();
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use("/user", Route);
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Working on ${port}`);
});
