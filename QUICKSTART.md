# TechBridge - Quick Start Guide

## 🚀 You're Ready to Start!

All dependencies are installed and configured. Here's how to run the application locally:

### Option 1: Using PowerShell Scripts (Easiest)

**Quick Start (Both servers):**
```powershell
.\start-dev.ps1
```
This will start both backend and frontend in separate windows.

**Setup Check:**
```powershell
.\setup.ps1
```
This verifies your environment and configuration.

### Option 2: Using VS Code Tasks (Recommended)

1. Press `Ctrl+Shift+B` (or `Cmd+Shift+B` on Mac)
2. Select **"Start Full Stack (Dev)"**
3. Both servers will start automatically

### Option 3: Manual Start

**Terminal 1 - Backend:**
```powershell
cd server
npm run dev
```
Backend runs on: http://localhost:5000

**Terminal 2 - Frontend:**
```powershell
cd client
npm start
```
Frontend runs on: http://localhost:3000
Browser opens automatically.

## ⚙️ Configuration

### MongoDB Setup

**Option A: Local MongoDB (Recommended for development)**
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use default connection: `mongodb://localhost:27017/techbridge`

**Option B: MongoDB Atlas (Cloud - Production ready)**
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create cluster and get connection string
3. Update `server\.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/techbridge
   ```

### Environment Variables

**Backend (`server\.env`):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/techbridge
JWT_SECRET=techbridge_dev_secret_key_2025
CORS_ORIGIN=http://localhost:3000
```

**Frontend (`client\.env`):**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🧪 Testing the Application

### 1. Health Check
Visit: http://localhost:5000/api/health

Expected response:
```json
{
  "status": "success",
  "message": "TechBridge API is running",
  "timestamp": "2025-11-27T...",
  "environment": "development"
}
```

### 2. Create Test Account

**Register as Student:**
- Go to http://localhost:3000/register
- Fill in details (age 18+ to skip parental consent)
- Login with credentials

**Create Admin Account (via MongoDB):**
```javascript
// Connect to MongoDB and run:
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### 3. Test Features

✅ **Authentication**: Register → Login → Profile  
✅ **Courses**: Browse → Enroll → View Lessons  
✅ **Lessons**: Complete lessons → Track progress  
✅ **Quizzes**: Take quiz → Submit → View results  
✅ **Forums**: Create post → Reply → Like  
✅ **Certificates**: Complete course → Download PDF  
✅ **Dashboards**: Student/Teacher/Admin views  

## 📊 Available Roles

### Student Dashboard (`/student`)
- View enrolled courses
- Track progress
- Earn certificates
- View achievements

### Teacher Dashboard (`/teacher`)
- Create/manage courses
- View student analytics
- Manage content

### Admin Dashboard (`/admin`)
- User management
- System analytics
- Course approval

## 🛠️ Development Tools

### Available npm scripts:

**Backend:**
```powershell
cd server
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production
npm test         # Run tests
```

**Frontend:**
```powershell
cd client
npm start        # Development server
npm run build    # Production build
npm test         # Run tests
```

### VS Code Tasks:
- `Install All Dependencies`
- `Start Backend Server`
- `Start Frontend`
- `Start Full Stack (Dev)` ⭐
- `Build Frontend`
- `Test Backend`
- `Test Frontend`

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Kill process on port 5000 (backend)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force

# Kill process on port 3000 (frontend)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
```

### MongoDB Connection Error
- Ensure MongoDB service is running
- Check connection string in `server\.env`
- Try MongoDB Atlas if local connection fails

### Dependencies Issues
```powershell
# Clean install
cd server
Remove-Item node_modules -Recurse -Force
npm install

cd ..\client
Remove-Item node_modules -Recurse -Force
npm install
```

### Clear Browser Cache
- Press `Ctrl+Shift+R` to hard reload
- Clear browser cookies/cache if login issues persist

## 📚 API Documentation

Full API docs available at: http://localhost:5000/api/health

Key endpoints:
- `/api/auth/*` - Authentication
- `/api/courses/*` - Course management
- `/api/lessons/*` - Lesson content
- `/api/quizzes/*` - Quiz system
- `/api/forums/*` - Discussion forums
- `/api/certificates/*` - Certificate generation
- `/api/progress/*` - Progress tracking

## 🎉 Next Steps

1. ✅ Start both servers
2. ✅ Open http://localhost:3000
3. ✅ Register a test account
4. ✅ Explore the application
5. 📝 Create your first course (as teacher/admin)
6. 🎓 Test the complete learning flow
7. 🏆 Earn your first certificate!

## 📞 Need Help?

- Check README.md for full documentation
- Review code comments in source files
- Open an issue on GitHub

---

Happy coding! 🚀
