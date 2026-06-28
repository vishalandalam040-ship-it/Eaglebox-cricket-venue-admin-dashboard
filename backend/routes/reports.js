const express = require('express');
const PDFDocument = require('pdfkit');
const { authorizeRole } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = (db) => {
  const router = express.Router();
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Helper to create basic PDF structure
  const createPdfStream = (res, title) => {
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_').toLowerCase()}.pdf"`);
    doc.pipe(res);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('VenueOS', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).font('Helvetica').text(title, { align: 'center' });
    doc.moveDown(2);

    return doc;
  };

  // GET /api/reports/revenue/pdf
  router.get('/revenue/pdf', authorizeRole(['Super Admin', 'Staff']), async (req, res) => {
    try {
      const bookings = await db.all('SELECT id, customername AS "customerName", phone, date, time, endtime AS "endTime", amount, status, userid AS "userId" FROM bookings WHERE status = \'Confirmed\'');
      
      const tournaments = await db.all('SELECT * FROM tournaments');
      const teams = await db.all('SELECT * FROM tournament_teams');
      
      let tournamentRevenue = 0;
      const teamDetails = [];
      for (const t of teams) {
        const tournament = tournaments.find(tour => tour.id === t.tournamentId);
        if (tournament) {
          const fee = tournament.entryFee || 0;
          tournamentRevenue += fee;
          teamDetails.push({
            id: t.id,
            teamName: t.teamName,
            playersCount: t.playersCount,
            tournamentName: tournament.name,
            tournamentStatus: tournament.status,
            fee: fee,
            paymentStatus: 'Paid'
          });
        }
      }

      const bookingsRevenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
      const totalRevenue = bookingsRevenue + tournamentRevenue;

      const doc = createPdfStream(res, 'Revenue Report');

      doc.fontSize(14).font('Helvetica-Bold').text('Financial Summary');
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').text(`Total Bookings: ${bookings.length}`);
      doc.text(`Total Teams Registered: ${teams.length}`);
      doc.text(`Total Revenue: INR ${totalRevenue} (Bookings: ${bookingsRevenue}, Tournaments: ${tournamentRevenue})`);
      doc.moveDown(2);

      doc.fontSize(14).font('Helvetica-Bold').text('Recent Bookings Transactions');
      doc.moveDown(0.5);

      bookings.slice(-10).forEach(b => {
        doc.fontSize(10).font('Helvetica').text(`${b.date} ${b.time} | ${b.customerName} | INR ${b.amount}`);
        doc.moveDown(0.2);
      });

      doc.moveDown(1.5);
      doc.fontSize(14).font('Helvetica-Bold').text('Tournament Team Registrations');
      doc.moveDown(0.5);

      teamDetails.slice(-10).forEach(t => {
        doc.fontSize(10).font('Helvetica').text(`Team: ${t.teamName} (${t.playersCount} players) | Tournament: ${t.tournamentName} [${t.tournamentStatus}] | Fee: INR ${t.fee} | Payment: ${t.paymentStatus}`);
        doc.moveDown(0.2);
      });

      doc.end();
    } catch (err) {
      console.error(err);
      res.status(500).send('Error generating report');
    }
  });

  // GET /api/reports/bookings/pdf
  router.get('/bookings/pdf', authorizeRole(['Super Admin', 'Staff']), async (req, res) => {
    try {
      const bookings = await db.all('SELECT id, customername AS "customerName", phone, date, time, endtime AS "endTime", amount, status, userid AS "userId" FROM bookings ORDER BY date DESC LIMIT 20');

      const doc = createPdfStream(res, 'Bookings Report');

      doc.fontSize(14).font('Helvetica-Bold').text('Recent Bookings');
      doc.moveDown(1);

      bookings.forEach(b => {
        doc.fontSize(10).font('Helvetica').text(`ID: ${b.id.substring(0, 8)} | ${b.date} ${b.time} | ${b.customerName} - ${b.status}`);
        doc.moveDown(0.2);
      });

      doc.end();
    } catch (err) {
      console.error(err);
      res.status(500).send('Error generating report');
    }
  });

  // GET /api/reports/business-summary/pdf
  router.get('/business-summary/pdf', authorizeRole(['Super Admin']), async (req, res) => {
    try {
      const bookings = await db.all('SELECT id, customername AS "customerName", phone, date, time, endtime AS "endTime", amount, status, userid AS "userId" FROM bookings');
      const customers = await db.all('SELECT * FROM customers');
      const confirmedBookings = bookings.filter(b => b.status === "Confirmed");
      const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.amount || 0), 0);

      const prompt = `You are an expert business analyst for a Box Cricket venue.
      Based on this data:
      - Total Bookings: ${bookings.length} (${confirmedBookings.length} Confirmed)
      - Total Revenue: INR ${totalRevenue}
      - Total Customers: ${customers.length}
      
      Provide a brief 3-paragraph executive summary with insights and 2 actionable growth recommendations. Do not use markdown formatting.`;

      const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
      const result = await model.generateContent(prompt);
      const text = await result.response.text();

      const doc = createPdfStream(res, 'AI Business Summary');

      doc.fontSize(14).font('Helvetica-Bold').text('AI Generated Insights & Recommendations');
      doc.moveDown(1);
      doc.fontSize(12).font('Helvetica').text(text, { align: 'justify', lineGap: 4 });

      doc.end();
    } catch (err) {
      console.error(err);
      res.status(500).send('Error generating AI report');
    }
  });

  return router;
};
