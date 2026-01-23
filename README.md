# 🏆 RoV SN Tournament Official Website

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**RoV SN Tournament Official** is a comprehensive full-stack web application designed to manage and showcase the **RoV (Arena of Valor)** e-sports tournament. It provides a seamless experience for fans to track standings and schedules, while offering a robust admin dashboard for organizers to manage the competition data in real-time.

---

## ✨ Features

### 🌍 Public Interface (For Fans)
- **📊 Standings:** updates of team points, wins, and losses.
- **📅 Match Schedule:** View upcoming fixtures and past match results.
- **📈 Player & Hero Stats:** Detailed statistics including MVP, KDA, Most Picked/Banned Heroes.
- **📰 News & Updates:** Latest announcements regarding the tournament.
- **🌐 Multi-Language Support:** Toggle between **Thai (TH)** and **English (EN)**.

### 🛡️ Admin Dashboard (For Organizers)
- **🔐 Secure Authentication:** Protected login system for administrators.
- **🛠️ Data Management:**
  - CRUD operations for **Teams** and **Players**.
  - Update **Match Results** and scores.
  - Manage **Hero Pool** and images.
- **⚡ Automated Calculations:** Automatically updates standings based on match results.

---

## 🛠️ Tech Stack

### **Frontend (Client)**
- **Framework:** React 18 (Vite)
- **Language:** TypeScript
- **Styling:** CSS Modules / Custom CSS
- **Routing:** React Router DOM
- **State Management:** Context API (Auth, Data, Language)

### **Backend (Server)**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Language:** TypeScript
- **Image Handling:** Cloudinary / Local Uploads (Multer)

---

## 📂 Project Structure

```bash
rov-sn-tournament-official/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, Footer, etc.)
│   │   ├── context/        # Global state (Auth, Language)
│   │   ├── pages/          # Page views (Home, Standings, AdminDashboard)
│   │   └── services/       # API integration logic
│   └── public/             # Static assets (Logos, Icons)
│
├── server/                 # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Mongoose schemas (Hero, Match, Player)
│   │   ├── routes/         # API endpoints
│   │   └── middleware/     # Auth and validation middleware
│   └── uploads/            # Local file storage
└── README.md

```

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### 1. Prerequisites

* Node.js (v16 or higher)
* MongoDB (Local or Atlas URL)

### 2. Setup Backend (Server)

Navigate to the server directory and install dependencies:

```bash
cd server
npm install

```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
# Optional: Cloudinary Config
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

```

Start the server:

```bash
npm run dev
# Server will run on http://localhost:5000

```

### 3. Setup Frontend (Client)

Open a new terminal, navigate to the client directory:

```bash
cd client
npm install

```

Start the development server:

```bash
npm run dev
# Application will run on http://localhost:5173

```

---

## 👤 Author

**Phuriphat Hemkul**

* GitHub: [@PhuriphatiZAMU](https://github.com/PhuriphatiZAMU)
* Email: [phuriphathem@gmail.com](mailto:phuriphathem@gmail.com)

---

<div align="center">
<i>Developed for the RoV SN Tournament Community 🎮</i>
</div>

```

```
