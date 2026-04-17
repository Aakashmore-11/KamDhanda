# KamDhanda: Railway + Vercel Deployment Guide

Follow these steps to deploy your backend to Railway and your frontend to Vercel.

---

## 🏗️ 1. Backend: Railway Deployment
Railway will host your Node.js API and handle all database connections.

1. **GitHub**: Push your entire project to a GitHub repository.
2. **Railway Dashboard**: Click **"New Project"** -> **"Deploy from GitHub repo"**.
3. **Configuration**:
   - **Root Directory**: Set this to `server`. (Very Important!)
   - **Build Command**: `npm install`
   - **Start Command**: `node app.js`
4. **Variables**: Add all from `server/.env`, plus:
   - `CLIENT_URL`: `https://your-project.vercel.app` (Add this *after* your Vercel deployment is finished).
   - `PORT`: `3000` (Railway often provides this automatically).

---

## 🎨 2. Frontend: Vercel Deployment
Vercel is the fastest way to host your Vite-based React frontend.

1. **Vercel Dashboard**: Click **"Add New"** -> **"Project"**.
2. **Import Repo**: Select your project from GitHub.
3. **Configuration**:
   - **Framework Preset**: Vite (detected automatically).
   - **Root Directory**: Set this to `client`. (Very Important!)
4. **Environment Variables**:
   - `VITE_SERVER_URL`: `https://your-railway-url.up.railway.app` (Paste your Railway URL here).
5. **Deploy**: Click the Deploy button.

---

## 🔒 3. Final Security Sync (The "CORS" Step)
Since your frontend and backend are on different domains, they need to "trust" each other:

1. Once Vercel finishes, **copy your live Vercel URL** (e.g. `https://kam-dhanda.vercel.app`).
2. Go back to **Railway**, click on your service -> **Variables**.
3. Update `CLIENT_URL` with your actual Vercel link.
4. Railway will automatically redeploy, and your app will be live!

---

## 💡 Pro-Tips for Railway/Vercel
- **Images/Files**: Since you are using Cloudinary, your files will persist perfectly even if the servers restart.
- **Database**: Ensure you are using a **MongoDB Atlas** connection string. Railway does not persist local databases unless you add a MongoDB "plugin" in Railway.
- **WebSockets**: Railway supports WebSockets perfectly for your messaging system. No extra config needed.
