# 🚀 DEPLOYMENT INSTRUCTIONS - GET YOUR +5 POINTS!

## Current Status: 25/30 → Target: 30/30

### STEP 1: Deploy Backend to Render.com (2-3 minutes)

#### A. Go to Render.com
1. **Visit:** https://render.com
2. **Click:** "Get Started for Free" 
3. **Sign up/Login** with GitHub account

#### B. Create Web Service
1. **Click:** "New +" → "Web Service"
2. **Connect GitHub** → Select `bianca255/techbridge-lms`
3. **Configure Service:**
   ```
   Name: techbridge-backend
   Runtime: Node
   Region: Oregon (US West)
   Branch: main
   Root Directory: server
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

#### C. Environment Variables (CRITICAL!)
**Add these in "Environment" tab:**
```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secure-production-secret-key-2024
MONGODB_URI=mongodb+srv://your-atlas-connection-string
CORS_ORIGIN=*
RATE_LIMIT_MAX_REQUESTS=5000
```

#### D. Deploy Backend
1. **Click:** "Create Web Service"
2. **Wait** ~3-5 minutes for deployment
3. **Get URL:** Something like `https://techbridge-backend-xyz.onrender.com`
4. **Test:** Visit `https://your-url.onrender.com/api/health`

---

### STEP 2: Deploy Frontend to Vercel.com (2-3 minutes)

#### A. Go to Vercel.com
1. **Visit:** https://vercel.com
2. **Click:** "Start Deploying"
3. **Sign up/Login** with GitHub

#### B. Import Project
1. **Click:** "Import Project"
2. **Select:** `bianca255/techbridge-lms` repository
3. **Configure:**
   ```
   Project Name: techbridge-lms
   Framework: Create React App
   Root Directory: client
   ```

#### C. Environment Variables
**Add in "Environment Variables" section:**
```
REACT_APP_API_URL=https://your-render-backend-url.onrender.com
```
*(Replace with your actual Render URL from Step 1)*

#### D. Deploy Frontend
1. **Click:** "Deploy"
2. **Wait** ~2-3 minutes
3. **Get URL:** Something like `https://techbridge-lms-xyz.vercel.app`

---

### STEP 3: Test Full System
1. **Visit your Vercel URL**
2. **Register/Login as student**
3. **Enroll in course and take quiz**
4. **Verify everything works**

---

## 🎯 EXPECTED OUTCOME

**Frontend URL:** https://techbridge-lms-xyz.vercel.app  
**Backend URL:** https://techbridge-backend-xyz.onrender.com  
**Rubric Points:** +5 (Deployment) = 30/30 TOTAL! 🎉

---

## 🆘 Quick Help

**If MongoDB is needed:**
1. Go to https://cloud.mongodb.com
2. Create free cluster
3. Get connection string
4. Use in Render environment variables

**If deployment fails:**
- Check logs in Render/Vercel dashboard
- Verify environment variables
- Ensure GitHub repo is public

---

## ✅ READY TO START?
**Begin with Step 1 (Render Backend) now!**