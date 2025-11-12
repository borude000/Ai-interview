import { db, sql } from "../db";
import fs from 'fs';
import path from 'path';

const MIGRATIONS_DIR = path.join(process.cwd(), 'migrations');

export async function runMigrations() {
  try {
    // Reduce NOTICE noise (e.g., "relation already exists") during startup migrations
    await sql`SET client_min_messages TO warning`;

    // Create migrations table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Get all migration files
    const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Get already executed migrations
    const executedMigrations = await sql<{ name: string }[]>`
      SELECT name FROM _migrations ORDER BY name
    `;

    const executedMigrationNames = new Set(executedMigrations.map(m => m.name));

    // Execute new migrations
    for (const file of migrationFiles) {
      if (!executedMigrationNames.has(file)) {
        console.log(`Running migration: ${file}`);
        
        const migrationSQL = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

        try {
          await sql.begin(async (trx) => {
            // Run the migration within a transaction
            await trx.unsafe(migrationSQL);
            // Record the migration
            await trx`
              INSERT INTO _migrations (name) VALUES (${file})
            `;
          });
          console.log(`✓ Successfully applied migration: ${file}`);
        } catch (error) {
          console.error(`✗ Failed to apply migration ${file}:`, error);
          throw error;
        }
      }
    }
    
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

export default runMigrations;
