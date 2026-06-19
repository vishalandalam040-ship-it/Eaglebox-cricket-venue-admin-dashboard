require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

(async () => {
  try {
    if (!process.env.DATABASE_URL) {
      console.error("No DATABASE_URL found in environment variables.");
      process.exit(1);
    }
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    const db = {
      get: async (text, params) => {
        let i = 1;
        const pgText = text.replace(/\?/g, () => `$${i++}`);
        const res = await pool.query(pgText, params);
        return res.rows[0];
      },
      run: async (text, params) => {
        let i = 1;
        const pgText = text.replace(/\?/g, () => `$${i++}`);
        await pool.query(pgText, params);
      },
      exec: async (text) => {
        await pool.query(text);
      }
    };

    // Ensure table exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        password_hash TEXT,
        role TEXT
      );
    `);

    const email = 'admin@venueos.com';
    const password = 'password123';
    const role = 'Super Admin';

    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      console.log('Super Admin already exists with email:', email);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const id = crypto.randomUUID();

    await db.run(
      'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [id, email, hashedPassword, role]
    );

    console.log(`Successfully seeded Super Admin!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    process.exit(0);

  } catch (err) {
    console.error('Failed to seed Super Admin', err);
    process.exit(1);
  }
})();
