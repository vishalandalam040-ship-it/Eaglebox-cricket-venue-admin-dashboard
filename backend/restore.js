const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

(async () => {
  try {
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0];

    await db.run(
      'INSERT INTO memberships (id, customerName, phone, email, planType, startDate, endDate, amountPaid, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['MEM-RESTORED', 'Vishal', '9876543210', 'vishalandalam040@gmail.com', 'Gold (3 Months)', startDate, endDate, 2500, 'Active']
    );
    console.log("Restored membership successfully");
  } catch (err) {
    console.error(err);
  }
})();
