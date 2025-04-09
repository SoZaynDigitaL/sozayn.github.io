import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

// Configure the WebSocket constructor for Neon
neonConfig.webSocketConstructor = ws;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set.");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    // Check if environment column exists
    console.log("Checking if environment column exists in integrations table...");
    
    try {
      await db.execute(`
        SELECT environment FROM integrations LIMIT 1;
      `);
      console.log("Environment column already exists.");
    } catch (error) {
      // Add the environment column
      console.log("Adding environment column to integrations table...");
      await db.execute(`
        ALTER TABLE integrations ADD COLUMN environment TEXT DEFAULT 'sandbox';
      `);
      console.log("Environment column added successfully.");
    }

    // Check for other missing columns
    try {
      await db.execute(`
        SELECT developer_id, key_id, signing_secret, webhook_url, send_order_status FROM integrations LIMIT 1;
      `);
      console.log("All other columns exist.");
    } catch (error) {
      console.log("Adding missing columns to integrations table...");
      
      try {
        await db.execute(`
          ALTER TABLE integrations ADD COLUMN developer_id TEXT;
        `);
        console.log("developer_id column added successfully.");
      } catch (e) {
        console.log("developer_id column already exists or could not be added.");
      }
      
      try {
        await db.execute(`
          ALTER TABLE integrations ADD COLUMN key_id TEXT;
        `);
        console.log("key_id column added successfully.");
      } catch (e) {
        console.log("key_id column already exists or could not be added.");
      }
      
      try {
        await db.execute(`
          ALTER TABLE integrations ADD COLUMN signing_secret TEXT;
        `);
        console.log("signing_secret column added successfully.");
      } catch (e) {
        console.log("signing_secret column already exists or could not be added.");
      }
      
      try {
        await db.execute(`
          ALTER TABLE integrations ADD COLUMN webhook_url TEXT;
        `);
        console.log("webhook_url column added successfully.");
      } catch (e) {
        console.log("webhook_url column already exists or could not be added.");
      }
      
      try {
        await db.execute(`
          ALTER TABLE integrations ADD COLUMN send_order_status BOOLEAN DEFAULT TRUE;
        `);
        console.log("send_order_status column added successfully.");
      } catch (e) {
        console.log("send_order_status column already exists or could not be added.");
      }
    }

    console.log("Schema update completed successfully.");
  } catch (error) {
    console.error("Error updating schema:", error);
  } finally {
    await pool.end();
  }
}

main();