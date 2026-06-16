# VenueOS: Eaglebox Cricket Venue Admin Dashboard

A comprehensive, full-stack venue management solution designed specifically for Box Cricket grounds. VenueOS streamlines daily operations, from managing bookings and customer relationships to organizing tournaments and analyzing revenue.

![VenueOS Dashboard Overview](frontend/public/stadium.png)

## 🚀 Features

* **Advanced Dashboard:** Real-time analytics with Recharts, displaying revenue, active bookings, and customer growth dynamically with timeframe filters (7 days / 30 days).
* **Booking Management:** Seamlessly create, edit, and cancel slot bookings with automatic conflict resolution (overlap checking).
* **Customer CRM:** Automatically tracks unique customers, total bookings, and calculates Lifetime Value (LTV) across all transactions.
* **Tournament System:** Host and manage cricket tournaments, register participating teams, and display dynamic live countdowns until the start date.
* **Membership Plans:** Manage recurring users with VIP/Pro subscription tiers.
* **Role-Based Access Control (RBAC):** Secure login system with distinct privileges for Super Admins, Staff, and Viewers.
* **Venue AI Assistant:** Integrated Google Gemini AI assistant to help admins query venue rules, check statistics, and get instant management advice.

## 🛠 Tech Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS (Custom Dark Mode UI)
* Recharts (Data Visualization)
* Lucide React (Icons)
* React Router v6

**Backend:**
* Node.js & Express.js
* SQLite3 (Local persistent database)
* JSON Web Tokens (JWT) for secure Auth
* Google Generative AI (Gemini Flash 3.5 API)

## ⚙️ Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vishalandalam040-ship-it/Eaglebox-cricket-venue-admin-dashboard.git
   cd Eaglebox-cricket-venue-admin-dashboard
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Backend Environment:**
   Create a `.env` file in the `backend` directory and add your credentials:
   ```env
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. **Start the Backend Server:**
   ```bash
   npm run start
   # Server will run on http://localhost:5000 and initialize the SQLite database
   ```

5. **Install Frontend Dependencies:**
   Open a new terminal and navigate to the frontend:
   ```bash
   cd frontend
   npm install
   ```

6. **Start the Frontend Application:**
   ```bash
   npm run dev
   # Access the dashboard at http://localhost:5173
   ```

## 🔒 Security
Sensitive files such as `.env`, `serviceAccountKey.json`, and local `database.sqlite` files are actively ignored via `.gitignore` to ensure credentials remain secure.

---
*Built for the future of Box Cricket management.*
