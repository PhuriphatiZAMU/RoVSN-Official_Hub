# Deployment Guide : RoV SN Tournament Official

โปรเจกต์นี้แยกส่วน Frontend (Next.js) และ Backend (Express/Node.js) โดยแนะนำให้ Deploy ดังนี้:

- **Frontend:** [Vercel](https://vercel.com)
- **Backend:** [Render](https://render.com) (หรือ VPS/DigitalOcean)

---

## 🚀 1. Backend Deployment (Render.com)

Backend ควร Deploy ก่อนเพื่อให้ได้ URL มาใส่ใน Frontend

1. เข้าไปที่ [dashboard.render.com](https://dashboard.render.com/)
2. กดปุ่ม **New +** -> เลือก **Blueprints**
3. เชื่อมต่อ Git Repository นี้
4. Render จะอ่านไฟล์ `render.yaml` และสร้าง Service ชื่อ `rov-sn-tournament-api` ให้
5. **สำคัญ:** ต้องเข้าไปกรอก **Environment Variables** (ที่ไม่ใช่ sync: false) ดังนี้:

| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `MONGO_URI` | Connection String ของ MongoDB Atlas | `mongodb+srv://user:pass@cluster...` |
| `JWT_SECRET` | Secret Key สำหรับเข้ารหัส Token | (ตั้งรหัสอะไรก็ได้ที่ยากๆ เช่น `MySuperSecretKey2026`) |
| `ADMIN_USERNAME` | Username สำหรับเข้า Admin | `admin` |
| `ADMIN_PASSWORD_HASH` | (Optional) Bcrypt Hash ของรหัสผ่าน | (ถ้าไม่ใส่ จะใช้รหัส default: `admin123`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Name (สำหรับอัปโหลดรูป) | `dpnrq5nso` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `7839...` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | (ดูจาก Dashboard Cloudinary) |
| `GEMINI_API_KEY` | Google Gemini AI Key | (สำหรับฟีเจอร์ AI Scan) |
| `CLIENT_URL` | URL ของ Frontend ที่จะอนุญาต CORS | `https://your-project.vercel.app` (ใส่หลังจาก Deploy Frontend แล้วค่อยมาเติม) |

6. กด **Apply** เพื่อเริ่ม Deploy

เมื่อ Deploy เสร็จ คุณจะได้ URL ของ Backend มา (เช่น `https://rov-api.onrender.com`) **ให้ Copy เก็บไว้**

---

## 🌐 2. Frontend Deployment (Vercel)

1. เข้าไปที่ [vercel.com](https://vercel.com)
2. กด **Add New...** -> **Project**
3. Import Git Repository นี้
4. **Build Settings:**
   - **Framework Preset:** Next.js (Automatic)
   - **Root Directory:** กด Edit และเลือกโฟลเดอร์ `client` (สำคัญมาก!)
5. **Environment Variables:** เพิ่มค่าดังนี้:

| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | **สำคัญ:** URL ของ Backend ที่ได้จากข้อ 1 | `https://rov-api.onrender.com` (ห้ามมี slash ปิดท้าย) |
| `JWT_COOKIE_NAME` | (Optional) ชื่อ Cookie | `rov_auth_token` |

6. กด **Deploy**

---

## ✅ 3. Post-Deployment Check

1. เมื่อ Frontend Deploy เสร็จ ให้เอา URL ของ Frontend (เช่น `https://project.vercel.app`) กลับไปใส่ใน Environment Variable `CLIENT_URL` ของฝั่ง Backend (Render) เพื่อแก้ปัญหา CORS (ถ้ามีการตั้งค่า CORS ไว้เข้มงวด)
2. ลองเข้าเว็บ Frontend -> Login Admin (`admin`/`admin123` หรือรหัสที่ตั้งไว้)
3. ตรวจสอบหน้า Data ต่างๆ ว่าโหลดขึ้นหรือไม่

---

## 🛠 Troubleshooting

- **Error CORS:** เช็คว่าใส่ `CLIENT_URL` ใน Backend ถูกต้องหรือไม่ และใน `next.config.ts` ของ Frontend มีการระบุ Domain Backend ใน `securityHeaders` หรือไม่
- **Hydration Error:** มักเกิดจากส่วน Time/Date ให้ลอง Refresh หน้าเว็บ หรือเช็ค console
- **Upload รูปไม่ได้:** เช็คค่า Config Cloudinary ใน Backend
