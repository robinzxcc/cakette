import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { requestLogger } from "./middleware/requestLogger.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import cakesRouter from "./routes/cakes.js";
import customersRouter from "./routes/customers.js";
import ordersRouter from "./routes/orders.js";
import promotionsRouter from "./routes/promotions.js";
import reviewsRouter from "./routes/reviews.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import miscRouter from "./routes/misc.js";
import { connectMongo, isUsingMemoryMongo } from "./utils/mongo.js";
import Cake from "./models/Cake.js";
import { seedDatabase } from "./seed/seed.js";

const app = express();
const PORT = Number(process.env.PORT || 8000);
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("Missing MONGO_URI. Copy server/.env.example to server/.env and set your Atlas connection string.");
  process.exit(1);
}

app.set("etag", false);

const allowedOrigins = new Set(
  [
    process.env.CLIENT_ORIGIN,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ].filter(Boolean)
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(null, false);
    },
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.use(requestLogger);

app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1 ? "connected" : dbState === 2 ? "connecting" : dbState === 3 ? "disconnecting" : "disconnected";

  res.json({
    status: dbState === 1 ? "ok" : "degraded",
    service: "cakette-api",
    database: {
      status: dbStatus,
      mode: isUsingMemoryMongo() ? "memory" : "atlas-or-local",
      gradingReady: dbState === 1 && !isUsingMemoryMongo(),
    },
  });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/cakes", cakesRouter);
app.use("/api/customers", customersRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/promotions", promotionsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api", miscRouter);

app.use(notFound);
app.use(errorHandler);

connectMongo(MONGO_URI)
  .then(async () => {
    const cakeCount = await Cake.countDocuments();
    if (cakeCount === 0) {
      console.log("Empty database — seeding demo data...");
      await seedDatabase();
    }
    app.listen(PORT, () => {
      console.log(`cakette API running at http://localhost:${PORT}/api`);
      if (isUsingMemoryMongo()) {
        console.log("Using in-memory MongoDB (set Atlas MONGO_URI for grading).");
      }
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });

export default app;
