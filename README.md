# 🏆 RoV SN Tournament Official Website

The official website for **RoV SN Tournament**, a comprehensive eSports tournament management system featuring both a public-facing portal for spectators and a robust backend for tournament administrators.

[![Live Demo](https://img.shields.io/badge/Demo-Live_Website-blue?style=for-the-badge&logo=vercel)](https://rov-sn-tournament-official.vercel.app/)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Frontend-Next.js_15-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Backend-Express-green?style=for-the-badge&logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green?style=for-the-badge&logo=mongodb)

---

## 🌐 Live
You can view the live application here:  
👉 **[https://rov-sn-tournament-official.vercel.app/](https://rov-sn-tournament-official.vercel.app/)**

---

## 🚀 Key Features

### 👥 Public Portal (Spectators)
- **Real-time Standings:** Live score updates and group rankings.
- **Match Schedule:** View upcoming fixtures and past match results.
- **Player Statistics:** In-depth stats including MVP, Most Kills, Most Assists, and Highest Damage.
- **Team Information:** Profiles for participating teams and player rosters.

### 🛠️ Admin Dashboard
- **Match Management:** Record scores, update statuses, and upload match screenshots.
- **Schedule Manager:** Create, drag-and-drop, and organize tournament schedules.
- **Data Import/Export:** Bulk import players and teams easily via CSV files.
- **Game Data:** Manage meta data such as Hero pools and team logos.
- **Audit Log:** Track result editing history and maintain data integrity.

---

## 🛠️ Tech Stack

**Frontend (`/client`):**
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Framer Motion
- **State Management:** React Context API
- **Icons:** Lucide React

**Backend (`/server`):**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT (JSON Web Token)
- **File Storage:** Local Storage / Cloudinary (Supported)

---

## ⚙️ Installation & Setup

This project follows a **Monorepo** structure (Frontend and Backend in one repository).

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB Database (Local or Atlas)

### 2. Install Dependencies
```bash
# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install

```

### 3. Environment Variables (.env)

Create `.env` files in both `server/` and `client/` directories based on the examples below:

**Server (`server/.env`):**

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/rov-tournament
JWT_SECRET=your_super_secret_key
# Optional: Cloudinary for image storage
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

```

**Client (`client/.env.local`):**

```env
# For local development
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# For production (change to your deployed backend URL)
# NEXT_PUBLIC_API_URL=[https://your-backend-url.com/api](https://your-backend-url.com/api)

```

---

## 🖥️ Development Mode

To run the project locally, open **two terminal windows**:

**Terminal 1 (Backend):**

```bash
cd server
npm run dev
# Server starts at http://localhost:3001

```

**Terminal 2 (Frontend):**

```bash
cd client
npm run dev
# Client starts at http://localhost:3000

```

---

## 🚀 Production Deployment

### Option 1: VPS (Self-Hosted with PM2)

The project includes an `ecosystem.config.js` for easy management with PM2.

1. **Build the project:**
```bash
cd server && npm run build
cd ../client && npm run build

```


2. **Start with PM2:**
```bash
pm2 start ecosystem.config.js

```



### Option 2: Cloud (Vercel + Render/Railway)

* **Frontend:** Deploy the `client` folder to **Vercel**.
* **Backend:** Deploy the `server` folder to **Render** or **Railway**.
* **Database:** Use **MongoDB Atlas**.

---

## 📂 Folder Structure

```
.
├── client/                 # Next.js Frontend application
│   ├── app/                # App Router Pages & Layouts
│   ├── components/         # Reusable UI Components
│   ├── lib/                # API Clients & Utility functions
│   └── public/             # Static Assets (Images, Icons)
│
├── server/                 # Express Backend API
│   ├── src/
│   │   ├── controllers/    # Business Logic & Request Handlers
│   │   ├── models/         # MongoDB Mongoose Schemas
│   │   ├── routes/         # API Route Definitions
│   │   └── middleware/     # Auth & Validation Middleware
│   └── uploads/            # Local File Storage Directory
│
└── ecosystem.config.js     # PM2 Configuration for VPS deployment

```

---

## 📄 License

This project is licensed under the MIT License.
