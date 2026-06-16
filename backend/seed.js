const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const seedData = async () => {
  try {
    console.log("Adding bookings...");
    await db.collection('bookings').add({ customerName: 'Rahul Kumar', phone: '919876543210', date: '2026-06-11', time: '19:00', amount: 1500, status: 'Confirmed' });
    await db.collection('bookings').add({ customerName: 'Anjali Sharma', phone: '919876543211', date: '2026-06-12', time: '20:00', amount: 1500, status: 'Pending' });

    console.log("Adding customers...");
    await db.collection('customers').add({ name: 'Rahul Kumar', phone: '+919876543210', totalBookings: 5, lifetimeRevenue: 7500 });
    await db.collection('customers').add({ name: 'Anjali Sharma', phone: '+919876543211', totalBookings: 2, lifetimeRevenue: 3000 });

    console.log("Adding tournaments...");
    await db.collection('tournaments').add({ name: 'Summer Cup 2026', teams: 8, prizePool: 50000, status: 'Upcoming' });

    console.log("Database seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("Error seeding database: ", error);
    process.exit(1);
  }
};

seedData();
