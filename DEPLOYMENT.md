# RoV SN Tournament - Deployment Guide

## Prerequisites
- **Node.js**: Version 18.17 or higher
- **Database**: MongoDB (Local or MongoDB Atlas)
- **Git**: Installed

## Environment Variables
The application requires `.env` files in both `server` and `client` directories.
Refer to example files or `ecosystem.config.js` for required keys.

**Critical for Production:**
In `client/.env.production` (create if missing):
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
# OR if running on same VPS with IP
# NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:3001
```
> **Warning**: Do NOT use `localhost` for `NEXT_PUBLIC_API_URL` in production, as external users cannot access your localhost.

---

## Option 1: Deploy on VPS (PM2) - Recommended for Windows/Linux
This project is configured with `ecosystem.config.js` for easy management with PM2.

1. **Install Dependencies & Build**
   ```bash
   # Server
   cd server
   npm install
   npm run build
   cd ..

   # Client
   cd client
   npm install
   npm run build
   cd ..
   ```

2. **Start Services**
   Run the following command at the project root:
   ```bash
   pm2 start ecosystem.config.js
   ```

3. **Monitor**
   ```bash
   pm2 status
   pm2 logs
   ```

4. **Save Configuration (Auto-start on reboot)**
   ```bash
   pm2 save
   pm2 startup
   ```

---

## Option 2: Cloud Deployment (Vercel + Render/Railway)

### Server (API)
Deploy the `server` folder to a service like **Render** or **Railway**.
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node dist/index.js`
- **Environment Variables**: Add all variables from `ecosystem.config.js` (MONGO_URI, JWT_SECRET, etc.).

### Client (Frontend)
Deploy the `client` folder to **Vercel**.
- **Framework Preset**: Next.js
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: The URL of your deployed Server (from step above).

## Troubleshooting

### Content Security Policy (CSP)
If API requests are blocked by the browser, verify `client/next.config.ts`.
Add your API domain to the `connect-src` directive:
```typescript
"connect-src 'self' ... https://your-api-domain.com ..."
```

### Automation Testing
Playwright tests are located in `client/tests/`. To run them locally:
```bash
cd client
npx playwright test
```
