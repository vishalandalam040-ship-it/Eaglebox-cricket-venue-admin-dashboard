require('dotenv').config();
const { Pool } = require('pg');

(async () => {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    const res = await pool.query('SELECT * FROM tournaments');
    console.log("Tournaments:", res.rows);
    
    const res2 = await pool.query('SELECT * FROM tournament_teams');
    console.log("Teams:", res2.rows);

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
