# Quick MongoDB Atlas Setup (if needed)

## If you need a cloud database for deployment:

### 1. Create Free MongoDB Atlas Account
1. Go to: https://cloud.mongodb.com
2. Sign up with Google/GitHub
3. Choose "Free" tier

### 2. Create Cluster
1. Choose "M0 Sandbox" (Free)
2. Select region closest to you
3. Cluster Name: "TechBridge"
4. Click "Create Cluster"

### 3. Setup Access
1. **Database User:**
   - Username: `techbridge`
   - Password: Generate secure password
   - Database User Privileges: "Read and write to any database"

2. **Network Access:**
   - Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
   - Or add your current IP

### 4. Get Connection String
1. Click "Connect" → "Connect your application"
2. Copy connection string like:
   ```
   mongodb+srv://techbridge:<password>@techbridge.abc123.mongodb.net/techbridge?retryWrites=true&w=majority
   ```
3. Replace `<password>` with your actual password

### 5. Use in Render Environment Variables
```
MONGODB_URI=mongodb+srv://techbridge:yourpassword@techbridge.abc123.mongodb.net/techbridge?retryWrites=true&w=majority
```

**Total time: 3-5 minutes**