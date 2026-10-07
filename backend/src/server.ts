import "reflect-metadata";
import dotenv from "dotenv";
import { app } from "./app";
import { initializeDatabase } from "./config/database";

console.log(" Server");

if (!process.env.DB_HOST) {
  dotenv.config();
}

console.log("env:", {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  DB_HOST: process.env.DB_HOST,
  DB_DATABASE: process.env.DB_DATABASE,
});

const PORT = process.env.PORT || 8008;

process.on("error", (reason, promise) => {
  //For unhandled errors
  console.error("error:", promise, "reason:", reason);
});

process.on("error", (error) => {
  console.error("error:", error); //Uncaught Exception
  process.exit(1);
});

const startServer = async () => {
  try {
    console.log("Initializing db connection...");

    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Env: ${process.env.NODE_ENV}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Server Error:", error);
    process.exit(1);
  }
};

startServer();
