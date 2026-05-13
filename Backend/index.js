import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import bookRoute from "./route/book.route.js";
import userRoute from "./route/user.route.js";
import orderRoute from "./route/order.route.js";
import voucherRoute from "./route/voucher.route.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 4000;
const URI = process.env.MongoDBURI;

// connect to mongoDB
mongoose
  .connect(URI)
  .then(() => {
    console.log("Connected to mongoDB");
  })
  .catch((error) => {
    console.log("Error: ", error);
  });
app.get("/health", (req, res) => {
  return res.status(200).json({
    ok: true,
    dbState: mongoose.connection.readyState,
  });
});

// defining routes
app.use("/book", bookRoute);
app.use("/user", userRoute);
app.use("/order", orderRoute);
app.use("/voucher", voucherRoute);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
