import "dotenv/config";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { pool } from "../src/db.js";

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  await pool.query(
    'INSERT INTO "User" (id, email, "passwordHash", role, "createdAt") VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT (email) DO NOTHING',
    [randomUUID(), "admin@example.com", passwordHash, "ADMIN"]
  );

  await pool.query(
    'INSERT INTO "User" (id, email, "passwordHash", role, "createdAt") VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT (email) DO NOTHING',
    [randomUUID(), "user@example.com", passwordHash, "USER"]
  );
}

main()
  .then(async () => {
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await pool.end();
    process.exit(1);
  });
