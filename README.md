# 🏆 RoV SN Tournament Official Website

เว็บไซต์อย่างเป็นทางการสำหรับการแข่งขัน **RoV SN Tournament** ระบบจัดการแข่งขัน eSports ครบวงจรที่รวมทั้งระบบหน้าบ้านสำหรับผู้ชมและระบบหลังบ้านสำหรับผู้ดูแลการแข่งขัน

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Next.js](https://img.shields.io/badge/Frontend-Next.js_15-black)
![Node.js](https://img.shields.io/badge/Backend-Express-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)

---

## 🚀 ฟีเจอร์หลัก (Key Features)

### 👥 สำหรับผู้ชม (Public)
- **ตารางคะแนน (Standings):** อัปเดตคะแนน Real-time
- **ตารางการแข่งขัน (Schedule):** ดูโปรแกรมแข่งล่วงหน้าและย้อนหลัง
- **สถิติ (Statistics):** ข้อมูล MVP, Most Kills, Most Assists, Highest Damage ฯลฯ
- **ข้อมูลทีม (Teams):** รายชื่อนักแข่งและโลโก้ทีม

### 🛠️ สำหรับผู้ดูแล (Admin Dashboard)
- **จัดการผลการแข่งขัน:** บันทึกคะแนนและอัปโหลดรูป Screenshot
- **จัดการตารางแข่ง:** สร้าง/แก้ไข Match และกำหนดเวลาแข่ง
- **ระบบ Import/Export:** นำเข้าข้อมูลผู้เล่นและทีมผ่านไฟล์ CSV
- **Game Data:** ระบบจัดการ Hero และข้อมูล Meta ของเกม
- **History Log:** ระบบตรวจสอบประวัติการแก้ไขคะแนนย้อนหลัง

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

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
- **File Storage:** Local Storage / Cloudinary (Optional)

---

## ⚙️ การติดตั้งและใช้งาน (Installation & Usage)

โปรเจกต์นี้แยกส่วน Frontend และ Backend ชัดเจน (Monorepo Structure)

### 1. Prerequisites
- Node.js (v18 หรือสูงกว่า)
- MongoDB Database

### 2. ติดตั้ง Dependencies
```bash
# ติดตั้งฝั่ง Server
cd server
npm install

# ติดตั้งฝั่ง Client
cd ../client
npm install

```

### 3. การตั้งค่า Environment Variables (.env)

สร้างไฟล์ `.env` ในโฟลเดอร์ `server/` และ `client/` ตามตัวอย่าง:

**Server (`server/.env`):**

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/rov-tournament
JWT_SECRET=your_super_secret_key
# Optional for Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

```

**Client (`client/.env.local`):**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api

```

---

## 🖥️ การรันในโหมดพัฒนา (Development)

ต้องเปิด Terminal 2 หน้าต่างเพื่อรันคู่กัน:

**Terminal 1 (Backend):**

```bash
cd server
npm run dev
# Server จะรันที่ http://localhost:3001

```

**Terminal 2 (Frontend):**

```bash
cd client
npm run dev
# Client จะรันที่ http://localhost:3000

```

---

## 🚀 การรันในโหมด Production (Deployment)

โปรเจกต์นี้รองรับการรันด้วย **PM2** เพื่อจัดการ Process ทั้งสองฝั่งพร้อมกัน

1. **Build โปรเจกต์:**
```bash
# Build Server
cd server
npm run build

# Build Client
cd ../client
npm run build

```


2. **Start ด้วย PM2:**
รันคำสั่งที่ root ของโปรเจกต์ (ที่มีไฟล์ `ecosystem.config.js`)
```bash
pm2 start ecosystem.config.js

```


3. **ตรวจสอบสถานะ:**
```bash
pm2 status
pm2 logs

```



---

## 📂 โครงสร้างโฟลเดอร์ (Folder Structure)

```
.
├── client/                 # Next.js Frontend
│   ├── app/                # App Router Pages
│   ├── components/         # UI Components
│   ├── lib/                # API Clients & Utils
│   └── public/             # Static Assets
│
├── server/                 # Express Backend
│   ├── src/
│   │   ├── controllers/    # Route Logic
│   │   ├── models/         # MongoDB Schemas
│   │   ├── routes/         # API Routes
│   │   └── middleware/     # Auth & Validation
│   └── uploads/            # Local File Storage
│
└── ecosystem.config.js     # PM2 Configuration

```

---

## 📄 License

This project is licensed under the MIT License.

```

### สิ่งที่เปลี่ยนแปลง:
1.  **Tech Stack:** เปลี่ยนจาก Vite/React เป็น **Next.js 15 (App Router)**
2.  **Deployment:** เพิ่มส่วนการใช้งาน **PM2** และ `ecosystem.config.js`
3.  **Commands:** ปรับคำสั่งติดตั้งและการรันแยก folder `client` และ `server` ชัดเจน
4.  **Structure:** อัปเดตผังโฟลเดอร์ให้ตรงกับปัจจุบัน

```