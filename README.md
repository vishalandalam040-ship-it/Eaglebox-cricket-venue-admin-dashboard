# VenueOS: Eaglebox Cricket Venue Admin Dashboard

A comprehensive, full-stack venue management solution designed specifically for Box Cricket grounds. VenueOS streamlines daily operations, from managing bookings and customer relationships to organizing tournaments, tracking memberships, and analyzing revenue.

![VenueOS Dashboard Overview](frontend/public/stadium.png)

## 🚀 Features

* **Advanced Dashboard:** Real-time analytics with Recharts, displaying revenue, active bookings, and customer growth dynamically with timeframe filters.
* **Booking Management:** Seamlessly create, edit, and cancel slot bookings with automatic conflict resolution (overlap checking).
* **Customer CRM & Memberships:** Automatically tracks unique customers and their total bookings. Manage recurring users with VIP/Pro subscription tiers, and automated email confirmations using EmailJS.
* **Tournament System:** Host and manage cricket tournaments, register participating teams, and display dynamic live countdowns until the start date.
* **Role-Based Access Control (RBAC):** Secure login system with distinct privileges and tailored UI views for Super Admins, Staff, and Viewers.
* **Venue AI Assistant:** Integrated Google Gemini AI assistant with markdown support to help admins query venue rules, check statistics, and get instant management advice.
* **Modern UI/UX:** Responsive design, beautiful animations with Framer Motion, and a built-in Dark/Light mode toggle.

## 🛠 Tech Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS (Custom Dark/Light Mode UI)
* Framer Motion (Animations)
* Recharts (Data Visualization)
* EmailJS (Email Notifications)
* React Router v6
* React Markdown

**Backend:**
* Node.js & Express.js
* PostgreSQL (Persistent Relational Database)
* JSON Web Tokens (JWT) for secure Auth
* Google Generative AI (Gemini API)
* Firebase Admin & PDFKit

## ⚙️ Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vishalandalam040-ship-it/Eaglebox-cricket-venue-admin-dashboard.git
   cd Eaglebox-cricket-venue-admin-dashboard
   ```

2. **Configure PostgreSQL Database:**
   Ensure you have PostgreSQL installed and running. Create a database for the project.

3. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

4. **Configure Backend Environment:**
   Create a `.env` file in the `backend` directory and add your credentials:
   ```env
   PORT=5000
   DATABASE_URL=postgres://user:password@localhost:5432/your_database_name
   JWT_SECRET=your_super_secret_jwt_key
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

5. **Start the Backend Server:**
   ```bash
   npm run start
   # Server will run on http://localhost:5000 and initialize the database schema
   ```

6. **Install Frontend Dependencies:**
   Open a new terminal and navigate to the frontend:
   ```bash
   cd frontend
   npm install
   ```

7. **Start the Frontend Application:**
   ```bash
   npm run dev
   # Access the dashboard at http://localhost:5173
   ```

## 🔒 Security
Sensitive files such as `.env` and database credentials are actively ignored via `.gitignore` to ensure credentials remain secure. Role-based API endpoints ensure strict data isolation across admin tiers.

## 🚀 Deployment
The frontend is built for static deployment (like GitHub Pages), and the backend seamlessly connects to cloud PostgreSQL instances for production data persistence.

---
*Built for the future of Box Cricket management.*
