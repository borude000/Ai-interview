import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create the PostgreSQL client
const client = postgres(process.env.DATABASE_URL);

// Create the Drizzle instance
export const db = drizzle(client, { schema });

// Export the raw client for raw queries
export const sql = client;
