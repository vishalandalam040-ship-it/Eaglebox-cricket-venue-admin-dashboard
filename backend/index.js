const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { verifyToken, authorizeRole } = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize application
(async () => {
  try {
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    console.log('Connected to SQLite database.');

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
    const exists = await db.get('SELECT * FROM settings WHERE key = "hourlyRate"');
    if (!exists) {
      await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['hourlyRate', '1000']);
    }

    // Initialize default minTournamentFee if it doesn't exist
    const existsTournamentFee = await db.get('SELECT * FROM settings WHERE key = "minTournamentFee"');
    if (!existsTournamentFee) {
      await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['minTournamentFee', '2500']);
    }

    console.log('Tables initialized.');

    // Mount Auth and Reports Routes
    app.use('/api/auth', require('./routes/auth')(db));
    app.use('/api/reports', verifyToken, require('./routes/reports')(db));

    // Basic health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'OK', message: 'Venue Admin Dashboard Backend is running with SQLite' });
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
        await db.run('UPDATE settings SET value = ? WHERE key = "hourlyRate"', [hourlyRate.toString()]);
        res.json({ message: 'Settings updated successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.put('/api/settings/minTournamentFee', verifyToken, authorizeRole(['Super Admin', 'Staff']), async (req, res) => {
      try {
        const { minTournamentFee } = req.body;
        await db.run('UPDATE settings SET value = ? WHERE key = "minTournamentFee"', [minTournamentFee.toString()]);
        res.json({ message: 'Settings updated successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // --- API for Booking ---
    app.get('/api/bookings', verifyToken, async (req, res) => {
      try {
        const bookings = await db.all('SELECT * FROM bookings');
        res.json(bookings);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/bookings', verifyToken, async (req, res) => {
      try {
        const { id, customerName, phone, date, time, endTime, amount, status } = req.body;
        
        // Slot overlap check
        const overlapping = await db.get(
          `SELECT * FROM bookings WHERE date = ? AND status != 'Cancelled' AND time < ? AND endTime > ?`,
          [date, endTime, time]
        );
        if (overlapping) {
          return res.status(400).json({ error: 'This slot has been already booked. Try to select another slot.' });
        }

        await db.run(
          'INSERT INTO bookings (id, customerName, phone, date, time, endTime, amount, status, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [id, customerName, phone, date, time, endTime, amount, status, req.user.id]
        );
        res.status(201).json({ message: 'Booking created successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.put('/api/bookings/:id', verifyToken, async (req, res) => {
      try {
        const booking = await db.get('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        
        if (req.user.role === 'Viewer' && booking.userId !== req.user.id) {
          return res.status(403).json({ error: 'You do not have permission to edit this booking.' });
        }
        
        const { customerName, phone, date, time, endTime, amount, status } = req.body;

        // Slot overlap check
        const overlapping = await db.get(
          `SELECT * FROM bookings WHERE date = ? AND status != 'Cancelled' AND id != ? AND time < ? AND endTime > ?`,
          [date, req.params.id, endTime, time]
        );
        if (overlapping) {
          return res.status(400).json({ error: 'This slot has been already booked. Try to select another slot.' });
        }

        await db.run(
          'UPDATE bookings SET customerName = ?, phone = ?, date = ?, time = ?, endTime = ?, amount = ?, status = ? WHERE id = ?',
          [customerName, phone, date, time, endTime, amount, status, req.params.id]
        );
        res.json({ message: 'Booking updated successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.put('/api/bookings/:id/cancel', verifyToken, authorizeRole(['Super Admin', 'Staff']), async (req, res) => {
      try {
        await db.run('UPDATE bookings SET status = "Cancelled" WHERE id = ?', [req.params.id]);
        res.json({ message: 'Booking cancelled successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // --- API for Customers ---
    app.get('/api/customers', verifyToken, async (req, res) => {
      try {
        const bookings = await db.all('SELECT * FROM bookings');
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
        const tournaments = await db.all('SELECT * FROM tournaments');
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
        await db.run('DELETE FROM tournaments WHERE id = ?', [req.params.id]);
        await db.run('DELETE FROM tournament_teams WHERE tournamentId = ?', [req.params.id]);
        res.json({ message: 'Tournament deleted successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get('/api/tournaments/:id/teams', verifyToken, authorizeRole(['Super Admin', 'Staff']), async (req, res) => {
      try {
        const teams = await db.all('SELECT * FROM tournament_teams WHERE tournamentId = ?', [req.params.id]);
        res.json(teams);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.delete('/api/tournaments/:tournamentId/teams/:teamId', verifyToken, authorizeRole(['Super Admin', 'Staff']), async (req, res) => {
      try {
        const { tournamentId, teamId } = req.params;
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
        const { id, teamName, playersCount } = req.body;
        const tournamentId = req.params.id;
        const userId = req.user.id;
        
        // Check if user already registered for this tournament (only applies to Viewers)
        if (req.user.role === 'Viewer') {
          const existing = await db.get('SELECT * FROM tournament_teams WHERE tournamentId = ? AND userId = ?', [tournamentId, userId]);
          if (existing) {
            return res.status(400).json({ error: 'You have already registered a team for this tournament.' });
          }
        }
        
        await db.run(
          'INSERT INTO tournament_teams (id, tournamentId, userId, teamName, playersCount) VALUES (?, ?, ?, ?, ?)',
          [id, tournamentId, userId, teamName, playersCount]
        );
        
        // Increment the tournament team count
        await db.run('UPDATE tournaments SET teams = teams + 1 WHERE id = ?', [tournamentId]);
        
        res.status(201).json({ message: 'Team registered successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // --- API for Memberships ---
    app.get('/api/memberships', verifyToken, async (req, res) => {
      try {
        const memberships = await db.all('SELECT * FROM memberships');
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
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
        
        let roleInstructions = "";
        if (req.user && req.user.role === 'Viewer') {
          roleInstructions = `\nCRITICAL SECURITY INSTRUCTION: The user you are speaking to is a "Viewer". Viewers do NOT have permission to see sensitive business data. You MUST NOT answer any questions regarding revenue, financial reports, total bookings, membership counts/details, business summaries, or Average LTV (Lifetime Value). If the user asks about any of these topics, politely refuse and state that they do not have the required administrative permissions to view financial or sensitive business data.`;
        } else {
          roleInstructions = `\nThe user you are speaking to is an Admin/Owner. You have full permission to disclose all revenue, reports, memberships, and business metrics.`;
        }

        const prompt = `You are a Venue Admin AI Assistant for a Box Cricket venue. 
Answer concisely and professionally. Help the user manage their ground.${roleInstructions}
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

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('Failed to initialize application', err);
    process.exit(1);
  }
})();

