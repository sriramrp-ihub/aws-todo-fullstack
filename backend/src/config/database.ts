import { DataSource } from "typeorm";
import dotenv from "dotenv";

if (!process.env.DB_HOST) {
  dotenv.config();
}
// Use javascript files in production (compiled), ts in development
const isProduction = process.env.NODE_ENV === "production";
const entitiesPath = isProduction
  ? ["dist/entities/**/*.js"]
  : ["src/entities/**/*.ts"];

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "todoapp",
  synchronize: true,
  //synchronize: process.env.NODE_ENV === "development", // Auto-create tables in dev
  logging: process.env.NODE_ENV === "development",
  entities: entitiesPath,
  migrations: ["src/migrations/**/*.ts"],
  subscribers: [],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Db connected successfully");
    console.log(`Db: ${process.env.DB_DATABASE}`);
    console.log(` Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  } catch (error) {
    console.error("connection failed:", error);
    throw error;
  }
};
