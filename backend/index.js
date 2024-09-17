import express from "express";
const app = express();
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
dotenv.config();
const port = process.env.PORT || 3000;
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());
app.use("/users", userRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
