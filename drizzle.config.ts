import { defineConfig } from "drizzle-kit";

// Use SQLite for local development if no DATABASE_URL is provided
const databaseUrl = process.env.DATABASE_URL || "file:./local.db";
const isPostgres = databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://");

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: isPostgres ? "postgresql" : "sqlite",
  dbCredentials: isPostgres 
    ? { url: databaseUrl }
    : { url: databaseUrl },
});
