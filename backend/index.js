const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Pool } = require('pg');
const { verifyToken, authorizeRole } = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Initialize application
(async () => {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn("WARNING: No DATABASE_URL found. Please set it in your environment variables.");
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
      all: async (text, params) => {
        let i = 1;
        const pgText = text.replace(/\?/g, () => `$${i++}`);
        const res = await pool.query(pgText, params);
        return res.rows;
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

    console.log('Connected to PostgreSQL database.');

    // Create Tables
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        password_hash TEXT,
        role TEXT
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        customerName TEXT,
        phone TEXT,
        date TEXT,
        time TEXT,
        endTime TEXT,
        amount INTEGER,
        status TEXT,
        userId TEXT
      );
      
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT,
        phone TEXT,
        totalBookings INTEGER,
        lifetimeRevenue INTEGER
      );
      
      CREATE TABLE IF NOT EXISTS tournaments (
        id TEXT PRIMARY KEY,
        name TEXT,
        teams INTEGER,
        maxTeams INTEGER,
        prizePool INTEGER,
        entryFee INTEGER,
        status TEXT
      );

      CREATE TABLE IF NOT EXISTS tournament_teams (
        id TEXT PRIMARY KEY,
        tournamentId TEXT,
        userId TEXT,
        teamName TEXT,
        playersCount INTEGER
      );

      CREATE TABLE IF NOT EXISTS tournament_players (
        id TEXT PRIMARY KEY,
        teamId TEXT,
        playerName TEXT
      );

      CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        userId TEXT,
        customerEmail TEXT,
        details TEXT,
        timestamp TEXT
      );

      CREATE TABLE IF NOT EXISTS booking_logs (
        id TEXT PRIMARY KEY,
        bookingId TEXT,
        action TEXT,
        details TEXT,
        timestamp TEXT
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE TABLE IF NOT EXISTS memberships (
        id TEXT PRIMARY KEY,
        customerName TEXT,
        phone TEXT,
        email TEXT,
        planType TEXT,
        startDate TEXT,
        endDate TEXT,
        amountPaid INTEGER,
        status TEXT
      );
    `);

    // Migration: Add entryFee to existing tournaments table safely
    try {
      await db.run('ALTER TABLE tournaments ADD COLUMN entryFee INTEGER DEFAULT 0;');
    } catch (e) {
      // Ignore if column already exists
    }

    // Initialize default hourly rate if it doesn't exist
    const exists = await db.get("SELECT * FROM settings WHERE key = 'hourlyRate'");
    if (!exists) {
      await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['hourlyRate', '1000']);
    }

    // Initialize default minTournamentFee if it doesn't exist
    const existsTournamentFee = await db.get("SELECT * FROM settings WHERE key = 'minTournamentFee'");
    if (!existsTournamentFee) {
      await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['minTournamentFee', '2500']);
    }

    // Seed Staff User
    const staffEmail = 'staff@eagleboxcricket.com';
    const staffExists = await db.get('SELECT * FROM users WHERE email = ?', [staffEmail]);
    if (!staffExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Staff@123', salt);
      const staffId = crypto.randomUUID();
      await db.run(
        'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [staffId, staffEmail, hashedPassword, 'Staff']
      );
      console.log('Seeded default Staff account.');
    }

    console.log('Tables initialized.');

    // Mount Auth and Reports Routes
    app.use('/api/auth', require('./routes/auth')(db));
    app.use('/api/reports', verifyToken, require('./routes/reports')(db));

    // Basic health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'OK', message: 'Venue Admin Dashboard Backend is running with PostgreSQL' });
    });

    // --- API for Settings ---
    app.get('/api/settings', async (req, res) => {
      try {
        const rows = await db.all('SELECT * FROM settings');
        const settings = {};
        rows.forEach(r => settings[r.key] = r.value);
        res.json(settings);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.put('/api/settings/hourlyRate', verifyToken, authorizeRole(['Super Admin', 'Staff']), async (req, res) => {
      try {
        const { hourlyRate } = req.body;
        await db.run("UPDATE settings SET value = ? WHERE key = 'hourlyRate'", [hourlyRate.toString()]);
        res.json({ message: 'Settings updated successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.put('/api/settings/minTournamentFee', verifyToken, authorizeRole(['Super Admin', 'Staff']), async (req, res) => {
      try {
        const { minTournamentFee } = req.body;
        await db.run("UPDATE settings SET value = ? WHERE key = 'minTournamentFee'", [minTournamentFee.toString()]);
        res.json({ message: 'Settings updated successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // --- API for Booking ---
    app.get('/api/bookings', verifyToken, async (req, res) => {
      try {
        let bookings = await db.all('SELECT id, customername AS "customerName", phone, date, time, endtime AS "endTime", amount, status, userid AS "userId" FROM bookings ORDER BY date DESC, time DESC');
        if (req.user.role === 'Viewer') {
          bookings = bookings.filter(b => b.userId === req.user.id);
        }
        res.json(bookings);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/bookings', verifyToken, async (req, res) => {
      try {
        const { id, customerName, phone, date, time, endTime, amount, status } = req.body;

        const normalizeTime = (t) => parseInt(t.split(':')[0]) * 60 + parseInt(t.split(':')[1]);
        const newStart = normalizeTime(time);
        let newEnd = normalizeTime(endTime);
        if (newEnd <= newStart) newEnd += 24 * 60;

        const dayBookings = await db.all(`SELECT * FROM bookings WHERE date = ? AND status != 'Cancelled'`, [date]);
        const overlapping = dayBookings.find(b => {
          const bStart = normalizeTime(b.time);
          let bEnd = normalizeTime(b.endTime);
          if (bEnd <= bStart) bEnd += 24 * 60;
          return newStart < bEnd && newEnd > bStart;
        });

        if (overlapping) {
          return res.status(400).json({ error: 'This slot has been already booked. Try to select another slot.' });
        }

        await db.run(
          'INSERT INTO bookings (id, customerName, phone, date, time, endTime, amount, status, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [id, customerName, phone, date, time, endTime, amount, status, req.user.id]
        );
        
        await db.run(
          'INSERT INTO booking_logs (id, bookingId, action, details, timestamp) VALUES (?, ?, ?, ?, ?)',
          ['log' + Date.now() + Math.floor(Math.random() * 1000), id, 'Created', JSON.stringify({ amount, date, time, endTime }), new Date().toISOString()]
        );
        
        res.status(201).json({ message: 'Booking created successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.put('/api/bookings/:id', verifyToken, async (req, res) => {
      try {
        const booking = await db.get('SELECT id, customername AS "customerName", phone, date, time, endtime AS "endTime", amount, status, userid AS "userId" FROM bookings WHERE id = ?', [req.params.id]);
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        if (req.user.role === 'Viewer' && booking.userId !== req.user.id) {
          return res.status(403).json({ error: 'You do not have permission to edit this booking.' });
        }

        const { customerName, phone, date, time, endTime, amount, status } = req.body;

        const normalizeTime = (t) => parseInt(t.split(':')[0]) * 60 + parseInt(t.split(':')[1]);
        const newStart = normalizeTime(time);
        let newEnd = normalizeTime(endTime);
        if (newEnd <= newStart) newEnd += 24 * 60;

        const dayBookings = await db.all(`SELECT * FROM bookings WHERE date = ? AND status != 'Cancelled' AND id != ?`, [date, req.params.id]);
        const overlapping = dayBookings.find(b => {
          const bStart = normalizeTime(b.time);
          let bEnd = normalizeTime(b.endTime);
          if (bEnd <= bStart) bEnd += 24 * 60;
          return newStart < bEnd && newEnd > bStart;
        });

        if (overlapping) {
          return res.status(400).json({ error: 'This slot has been already booked. Try to select another slot.' });
        }

        await db.run(
          'UPDATE bookings SET customerName = ?, phone = ?, date = ?, time = ?, endTime = ?, amount = ?, status = ? WHERE id = ?',
          [customerName, phone, date, time, endTime, amount, status, req.params.id]
        );
        
        await db.run(
          'INSERT INTO booking_logs (id, bookingId, action, details, timestamp) VALUES (?, ?, ?, ?, ?)',
          ['log' + Date.now() + Math.floor(Math.random() * 1000), req.params.id, 'Updated', JSON.stringify({ amount, date, time, endTime, status }), new Date().toISOString()]
        );
        
        res.json({ message: 'Booking updated successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.put('/api/bookings/:id/cancel', verifyToken, authorizeRole(['Super Admin', 'Staff']), async (req, res) => {
      try {
        await db.run("UPDATE bookings SET status = 'Cancelled' WHERE id = ?", [req.params.id]);
        
        await db.run(
          'INSERT INTO booking_logs (id, bookingId, action, details, timestamp) VALUES (?, ?, ?, ?, ?)',
          ['log' + Date.now() + Math.floor(Math.random() * 1000), req.params.id, 'Cancelled', '{}', new Date().toISOString()]
        );
        
        res.json({ message: 'Booking cancelled successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get('/api/bookings/:id/logs', verifyToken, authorizeRole(['Super Admin']), async (req, res) => {
      try {
        const logs = await db.all('SELECT id, bookingid AS "bookingId", action, details, timestamp FROM booking_logs WHERE bookingid = ? ORDER BY timestamp ASC', [req.params.id]);
        res.json(logs);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // --- API for Customers ---
    app.get('/api/customers', verifyToken, authorizeRole(['Super Admin', 'Staff']), async (req, res) => {
      try {
        const bookings = await db.all('SELECT id, customername AS "customerName", phone, date, time, endtime AS "endTime", amount, status, userid AS "userId" FROM bookings');
        const users = await db.all('SELECT * FROM users');

        const customerMap = {};

        // Add users as customers
        users.forEach(u => {
          if (!customerMap[u.email]) {
            customerMap[u.email] = {
              id: u.id,
              name: u.email.split('@')[0],
              phone: '-',
              email: u.email,
              totalBookings: 0,
              lifetimeRevenue: 0
            };
          }
        });

        // Add bookings stats
        bookings.forEach(b => {
          // match by userId if they are logged in, else use phone or name
          let key = b.customerName;

          if (b.userId) {
            const user = users.find(u => u.id === b.userId);
            if (user) key = user.email;
          } else {
            // Fallback to searching if we have a customer by this name
            // For simplicity in this demo, use customerName as key if no userId
            key = b.customerName;
          }

          if (!customerMap[key]) {
            customerMap[key] = {
              id: 'CUST-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
              name: b.customerName,
              phone: b.phone,
              email: '-',
              totalBookings: 0,
              lifetimeRevenue: 0
            };
          }

          customerMap[key].totalBookings += 1;
          if (b.status === 'Confirmed') {
            customerMap[key].lifetimeRevenue += Number(b.amount || 0);
          }
        });

        res.json(Object.values(customerMap));
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // --- API for Tournaments ---
    app.get('/api/tournaments', verifyToken, async (req, res) => {
      try {
        const tournaments = await db.all('SELECT id, name, teams, maxteams AS "maxTeams", prizepool AS "prizePool", entryfee AS "entryFee", status FROM tournaments');
        res.json(tournaments);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/tournaments', verifyToken, authorizeRole(['Super Admin', 'Staff']), async (req, res) => {
      try {
        const { id, name, teams, maxTeams, prizePool, entryFee, status } = req.body;
        const parsedMaxTeams = parseInt(maxTeams, 10);
        await db.run(
          'INSERT INTO tournaments (id, name, teams, maxTeams, prizePool, entryFee, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [id, name, teams, isNaN(parsedMaxTeams) ? 16 : parsedMaxTeams, prizePool, entryFee || 0, status]
        );
        res.status(201).json({ message: 'Tournament created successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.put('/api/tournaments/:id/fee', verifyToken, authorizeRole(['Super Admin', 'Staff']), async (req, res) => {
      try {
        const { entryFee } = req.body;
        await db.run('UPDATE tournaments SET entryFee = ? WHERE id = ?', [entryFee, req.params.id]);
        res.json({ message: 'Tournament fee updated successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.delete('/api/tournaments/:id', verifyToken, authorizeRole(['Super Admin', 'Staff']), async (req, res) => {
      try {
        await db.run('DELETE FROM tournament_players WHERE teamId IN (SELECT id FROM tournament_teams WHERE tournamentId = ?)', [req.params.id]);
        await db.run('DELETE FROM tournaments WHERE id = ?', [req.params.id]);
        await db.run('DELETE FROM tournament_teams WHERE tournamentId = ?', [req.params.id]);
        res.json({ message: 'Tournament deleted successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get('/api/tournaments/:id/teams', verifyToken, async (req, res) => {
      try {
        let teams = await db.all('SELECT id, tournamentid AS "tournamentId", userid AS "userId", teamname AS "teamName", playerscount AS "playersCount" FROM tournament_teams WHERE tournamentid = ?', [req.params.id]);
        if (req.user.role === 'Viewer') {
          teams = teams.filter(t => t.userId === req.user.id);
        }
        
        for (let team of teams) {
          team.players = await db.all('SELECT id, playername AS "playerName" FROM tournament_players WHERE teamId = ?', [team.id]);
        }

        res.json(teams);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.delete('/api/tournaments/:tournamentId/teams/:teamId', verifyToken, authorizeRole(['Super Admin', 'Staff']), async (req, res) => {
      try {
        const { tournamentId, teamId } = req.params;
        await db.run('DELETE FROM tournament_players WHERE teamId = ?', [teamId]);
        await db.run('DELETE FROM tournament_teams WHERE id = ? AND tournamentId = ?', [teamId, tournamentId]);

        // Decrement the tournament team count
        await db.run('UPDATE tournaments SET teams = teams - 1 WHERE id = ? AND teams > 0', [tournamentId]);

        res.json({ message: 'Team removed successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/tournaments/:id/teams', verifyToken, async (req, res) => {
      try {
        const { id, teamName, playersCount, players } = req.body;
        const tournamentId = req.params.id;
        const userId = req.user.id;

        // Check if user already registered for this tournament (only applies to Viewers)
        if (req.user.role === 'Viewer') {
          const existing = await db.get('SELECT * FROM tournament_teams WHERE tournamentId = ? AND userId = ?', [tournamentId, userId]);
          if (existing) {
            return res.status(400).json({ error: 'You have already registered a team for this tournament.' });
          }
        }

        // Check if tournament is full
        const tournament = await db.get('SELECT teams, maxTeams FROM tournaments WHERE id = ?', [tournamentId]);
        if (tournament && tournament.teams >= (tournament.maxTeams || 16)) {
          return res.status(400).json({ error: 'This tournament is already full.' });
        }

        await db.run(
          'INSERT INTO tournament_teams (id, tournamentId, userId, teamName, playersCount) VALUES (?, ?, ?, ?, ?)',
          [id, tournamentId, userId, teamName, playersCount]
        );

        // Insert players
        if (players && Array.isArray(players)) {
          for (let name of players) {
            const playerId = 'p' + Date.now() + Math.floor(Math.random() * 1000);
            await db.run(
              'INSERT INTO tournament_players (id, teamId, playerName) VALUES (?, ?, ?)',
              [playerId, id, name]
            );
          }
        }

        // Increment the tournament team count
        await db.run('UPDATE tournaments SET teams = teams + 1 WHERE id = ?', [tournamentId]);

        res.status(201).json({ message: 'Team registered successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // --- API for Feedback ---
    app.get('/api/feedback', verifyToken, async (req, res) => {
      try {
        let feedbackList = await db.all('SELECT id, userid AS "userId", customeremail AS "customerEmail", details, timestamp FROM feedback ORDER BY timestamp DESC');
        if (req.user.role === 'Viewer') {
          feedbackList = feedbackList.filter(f => f.userId === req.user.id);
        }
        res.json(feedbackList);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/feedback', verifyToken, async (req, res) => {
      try {
        const { id, customerEmail, details } = req.body;
        const timestamp = new Date().toISOString();
        await db.run(
          'INSERT INTO feedback (id, userId, customerEmail, details, timestamp) VALUES (?, ?, ?, ?, ?)',
          [id, req.user.id, customerEmail, details, timestamp]
        );
        res.status(201).json({ message: 'Feedback submitted successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // --- API for Memberships ---
    app.get('/api/memberships', verifyToken, authorizeRole(['Super Admin', 'Staff']), async (req, res) => {
      try {
        const memberships = await db.all('SELECT id, customername AS "customerName", phone, email, plantype AS "planType", startdate AS "startDate", enddate AS "endDate", amountpaid AS "amountPaid", status FROM memberships');
        res.json(memberships);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/memberships', verifyToken, authorizeRole(['Super Admin', 'Staff']), async (req, res) => {
      try {
        const { id, customerName, phone, email, planType, startDate, endDate, amountPaid, status } = req.body;
        await db.run(
          'INSERT INTO memberships (id, customerName, phone, email, planType, startDate, endDate, amountPaid, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [id, customerName, phone, email, planType, startDate, endDate, amountPaid, status]
        );
        res.status(201).json({ message: 'Membership created successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.delete('/api/memberships/:id', verifyToken, authorizeRole(['Super Admin', 'Staff']), async (req, res) => {
      try {
        await db.run('DELETE FROM memberships WHERE id = ?', [req.params.id]);
        res.json({ message: 'Membership deleted successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // --- API for AI ---
    app.post('/api/ai/chat', verifyToken, async (req, res) => {
      try {
        const { message } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

        const settingsRows = await db.all('SELECT * FROM settings');
        const settings = {};
        settingsRows.forEach(r => settings[r.key] = r.value);

        let bookings = await db.all('SELECT id, customername AS "customerName", phone, date, time, endtime AS "endTime", amount, status, userid AS "userId" FROM bookings');
        let tournaments = await db.all('SELECT id, name, teams, maxteams AS "maxTeams", prizepool AS "prizePool", entryfee AS "entryFee", status FROM tournaments');
        let teams = await db.all('SELECT id, tournamentid AS "tournamentId", userid AS "userId", teamname AS "teamName", playerscount AS "playersCount" FROM tournament_teams');
        let memberships = [];

        let roleInstructions = "";
        if (req.user && req.user.role === 'Viewer') {
          roleInstructions = `\nCRITICAL SECURITY INSTRUCTION: The user you are speaking to is a "Viewer". Viewers do NOT have permission to see sensitive business data. You MUST NOT answer any questions regarding overall revenue, financial reports, total bookings, membership counts/details, business summaries, or Average LTV (Lifetime Value). If the user asks about any of these topics, politely refuse. HOWEVER, the user CAN ask about their own bookings, their own tournament registrations, and the current slot hour pricing. You must answer using ONLY the provided system data for them. ALL monetary values MUST be formatted in INR (e.g. ₹5,000).`;
          bookings = bookings.filter(b => b.userId === req.user.id);
          teams = teams.filter(t => t.userId === req.user.id);
        } else {
          roleInstructions = `\nThe user you are speaking to is an Admin/Owner. You have full permission to disclose all revenue, reports, memberships, and business metrics. ALL monetary values MUST be formatted in Indian National Rupees (INR), e.g. ₹5,000 or 5,000 INR. Never use dollars.`;
          memberships = await db.all('SELECT id, customername AS "customerName", phone, email, plantype AS "planType", startdate AS "startDate", enddate AS "endDate", amountpaid AS "amountPaid", status FROM memberships');
        }

        const systemData = {
           today: new Date().toISOString().split('T')[0],
           settings,
           bookings,
           tournaments,
           teams,
           memberships
        };

        const prompt = `You are a Venue Admin AI Assistant for a Box Cricket venue. 
Answer concisely and professionally. Help the user manage their ground.${roleInstructions}

Here is the current system database information you MUST use to answer the user's request. NEVER invent fake data:
${JSON.stringify(systemData)}

User's request: ${message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });
      } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ response: "I encountered an error connecting to my core processing unit. Please ensure the API key is valid." });
      }
    });

    // --- Automated Email Reminders ---
    setInterval(async () => {
      try {
        console.log("Running automated membership expiry check...");
        const memberships = await db.all('SELECT * FROM memberships WHERE status = ?', ['Active']);
        const now = new Date();

        for (const m of memberships) {
          const endDate = new Date(m.endDate);
          const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

          if (daysLeft <= 10 && daysLeft > 0) {
            // Send email using EmailJS REST API
            const payload = {
              service_id: 'service_jjrbdlf',
              template_id: 'template_48wbbl9',
              user_id: 'FwnHDTuxpHD_Hsv8l',
              template_params: {
                customerName: m.customerName,
                email: m.email || 'customer@example.com',
                date: 'Membership Expiry Alert',
                time: `${daysLeft} Days Left`,
                endTime: 'Expiring: ' + m.endDate,
                amount: 'N/A',
                message: `Hello ${m.customerName}, your ${m.planType} membership is expiring in ${daysLeft} days on ${m.endDate}. Please renew soon!`
              }
            };

            await fetch('https://api.emailjs.com/api/v1.0/email/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            console.log(`Sent expiry reminder to ${m.email} (${daysLeft} days left)`);
          }
        }
      } catch (err) {
        console.error("Automated check failed:", err.message);
      }
    }, 24 * 60 * 60 * 1000); // Once every 24 hours

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);

      // Ping the server to keep it awake if deployed (e.g. Render)
      const externalUrl = process.env.RENDER_EXTERNAL_URL;
      if (externalUrl) {
        setInterval(() => {
          fetch(`${externalUrl}/api/health`)
            .then(res => console.log(`Keep-alive ping status: ${res.status}`))
            .catch(err => console.error(`Keep-alive ping failed:`, err.message));
        }, 14 * 60 * 1000); // Every 14 minutes
      }
    });

  } catch (err) {
    console.error('Failed to initialize application', err);
    process.exit(1);
  }
})();

