# TechBridge Learning Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)

> A comprehensive learning management system designed to bridge the digital divide for underprivileged African children (aged 8-18).

## 📋 Quick Start Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v5.0 or higher) - [Install guide](https://docs.mongodb.com/manual/installation/)
- **Git** - [Download here](https://git-scm.com/downloads)

### Installation & Setup

**Step 1: Clone Repository**
```bash
git clone https://github.com/yourusername/techbridge.git
cd techbridge
```

**Step 2: Install Dependencies**
```bash
# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../client
npm install
```

**Step 3: Configure Environment**
Create `.env` file in `server` directory:
```env
MONGODB_URI=mongodb://localhost:27017/techbridge
JWT_SECRET=your-super-secure-secret-key
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Step 4: Start MongoDB**
```bash
# Windows
net start MongoDB

# macOS/Linux
brew services start mongodb/brew/mongodb-community
# or
sudo systemctl start mongod
```

**Step 5: Seed Database**
```bash
cd server
node seed.js
```

**Step 6: Start Application**
```bash
# Terminal 1 - Backend (from server directory)
npm start

# Terminal 2 - Frontend (from client directory)  
cd ../client
npm start
```

**Step 7: Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Demo Accounts
- **Teacher:** teacher@techbridge.com / Teacher123!
- **Student:** Register new account or use existing credentials

## 🌟 Features

### Core Learning Features
- **Interactive Courses**: Video, text, and interactive content
- **Quiz System**: Multiple question types with automated grading (3 attempts max, 24hr cooldown)
- **Assignment System**: Due dates with late penalties (10% per day, max 7 days)
- **Progress Tracking**: Real-time monitoring with grading formula (40% quizzes + 40% assignments + 20% participation)
- **Certificate Generation**: Professional PDF certificates upon course completion
- **Discussion Forums**: Community-driven learning environment

### Security & Compliance
- **Role-Based Access Control**: Student, Teacher, and Admin roles with granular permissions
- **Secure Authentication**: JWT-based with session management (30-minute timeout)
- **Account Protection**: 5 failed login attempts = temporary lock
- **Parental Consent**: Guardian information required for users under 18
- **Audit Logging**: Complete activity tracking with 1-year retention
- **File Upload Security**: Type validation, 50MB limit, malware scanning ready

### Accessibility & Offline Support
- **Multi-language Support**: English and Kinyarwanda (Ikinyarwanda)
- **Offline Mode**: Service Worker for cached lessons and offline access
- **Responsive Design**: Mobile-first, child-friendly interface
- **Low-Bandwidth Optimized**: Designed for rural African infrastructure

### Gamification & Engagement
- **Points System**: Earn points for completed quizzes and courses
- **Badges & Achievements**: Unlock badges for milestones
- **Leaderboards**: Compete with peers (backend ready)
- **Course Limits**: Max 500 students per course for quality learning

## 🚀 Tech Stack

### Backend
- **Node.js** v18+
- **Express.js** - REST API framework
- **MongoDB** - Database (Atlas for production)
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **PDFKit** - Certificate generation
- **Multer** - File uploads
- **Helmet** - Security middleware
- **speakeasy** - TOTP for MFA
- **qrcode** - QR code generation for MFA

### Frontend
- **React** v18.2.0
- **React Router** v6 - Navigation
- **Axios** - HTTP client
- **i18next** - Internationalization
- **Chart.js** - Analytics visualization
- **marked** - Markdown parser for lesson content

## 📋 Prerequisites

- Node.js v18 or higher
- MongoDB (local or MongoDB Atlas account)
- npm or yarn package manager

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/techbridge.git
cd techbridge
```

### 2. Backend Setup

```bash
cd server
npm install
```

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/techbridge
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd ../client
npm install
```

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🏃‍♂️ Running Locally

### Start Backend Server

```bash
cd server
npm run dev
```

Server runs on `http://localhost:5000`

### Start Frontend

```bash
cd client
npm start
```

Frontend runs on `http://localhost:3000`

## 📁 Project Structure

```
techbridge/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context (Auth)
│   │   ├── i18n/           # Translations
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── styles/         # Global styles
│   │   ├── App.js
│   │   └── index.js
│   ├── .env
│   ├── package.json
│   └── vercel.json         # Vercel deployment config
│
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth, validation, etc.
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helper functions, audit logger, backup system
│   │   └── server.js       # Entry point
│   ├── uploads/            # File uploads directory
│   ├── backups/            # Automated database backups
│   ├── .env
│   ├── package.json
│   ├── seed.js             # Database seeding script
│   └── addQuizzes.js       # Quiz generation script
│
├── .github/
│   └── copilot-instructions.md
├── USER_GUIDE.md           # Complete user documentation
├── IMPLEMENTATION_SUMMARY.md  # Technical implementation details
├── SRS_FEATURES.md         # Software Requirements Specification
├── render.yaml             # Render deployment config
└── README.md
```

## 🔐 Default User Roles

### Admin
- Full system access and platform-wide analytics
- **User Management**: View, edit, delete users; change roles; reset passwords
- **Dashboard**: Platform statistics, popular courses, user growth charts, recent activity
- **System Monitoring**: Audit logs, backup management, inactive user tracking
- Course approval and content moderation
- Access to all teacher and student features

### Teacher
- Create and manage courses, lessons, quizzes, and assignments
- **Analytics Dashboard**: Course performance, student progress, grading statistics
- View detailed student performance and identify students needing attention
- Grade assignments with automated late penalties
- Forum moderation (pin, lock threads)
- Track enrolled students and completion rates

### Student
- Enroll in courses (max 500 students per course)
- Complete lessons, quizzes (3 attempts, 24hr cooldown), and assignments
- Track personal progress and view earned points/badges
- Earn certificates upon course completion (60% minimum)
- Participate in forums and community discussions
- Offline lesson access via Service Worker

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (with parental consent for <18)
- `POST /api/auth/login` - Login with account locking after 5 failed attempts
- `GET /api/auth/me` - Get current user with session validation
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Admin Routes (Admin only)
- `GET /api/admin/dashboard` - Platform-wide statistics and analytics
- `GET /api/admin/users` - Get all users (with filters, search, pagination)
- `GET /api/admin/users/:userId` - Get detailed user information
- `PUT /api/admin/users/:userId/role` - Change user role
- `PUT /api/admin/users/:userId/toggle-status` - Activate/deactivate user
- `DELETE /api/admin/users/:userId` - Delete user account
- `POST /api/admin/users/:userId/reset-password` - Reset user password
- `GET /api/admin/stats` - Quick platform statistics

### Multi-Factor Authentication (Admin only)
- `POST /api/mfa/setup` - Setup MFA with TOTP
- `POST /api/mfa/verify-enable` - Verify and enable MFA
- `POST /api/mfa/verify-token` - Verify MFA token during login
- `POST /api/mfa/disable` - Disable MFA (requires password)

### Teacher Analytics (Teacher/Admin)
- `GET /api/analytics/teacher/dashboard` - Teacher dashboard statistics
- `GET /api/analytics/teacher/course/:courseId/students` - Student performance details

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (Teacher/Admin)
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `POST /api/courses/:id/enroll` - Enroll in course
- `POST /api/courses/:id/unenroll` - Unenroll from course

### Lessons
- `GET /api/lessons/course/:courseId` - Get course lessons
- `GET /api/lessons/:id` - Get lesson details
- `POST /api/lessons` - Create lesson
- `PUT /api/lessons/:id/complete` - Mark lesson complete

### Quizzes
- `GET /api/quizzes/:id` - Get quiz
- `POST /api/quizzes/:id/submit` - Submit quiz answers (3 attempts max, 24hr cooldown)
- `GET /api/quizzes/:id/attempts` - Get user attempts
- `POST /api/quizzes` - Create quiz (Teacher/Admin)
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz

### Assignments (Teacher/Admin)
- `GET /api/assignments/course/:courseId` - Get course assignments
- `POST /api/assignments` - Create assignment
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment
- `POST /api/assignments/:assignmentId/submit` - Submit assignment
- `PUT /api/assignments/submissions/:submissionId/grade` - Grade submission
- `GET /api/assignments/:assignmentId/submissions` - Get all submissions

### Progress
- `GET /api/progress/course/:courseId` - Get course progress
- `GET /api/progress/user` - Get user progress

### Certificates
- `GET /api/certificates/my-certificates` - Get user certificates
- `GET /api/certificates/:courseId` - Download certificate PDF
- `GET /api/certificates/verify/:certificateId` - Verify certificate

### Forums
- `GET /api/forums` - Get all forums
- `GET /api/forums/:id` - Get forum details
- `POST /api/forums` - Create forum post
- `POST /api/forums/:id/reply` - Reply to post
- `PUT /api/forums/:id/like` - Like/unlike post

## 🎨 Features in Detail

### Certificate Generation
Automatic PDF certificate generation upon course completion with:
- Professional design with borders and signatures
- Unique certificate ID for verification
- Course details and completion date
- Final score display

### Progress Tracking
Real-time tracking of:
- Lesson completion
- Quiz scores and attempts
- Overall course progress
- Time spent learning
- Badge achievements

### Multi-language Support
Full internationalization support:
- English (en)
- Kinyarwanda (rw)
- Easy to add more languages

## 🚢 Deployment

### Backend (Render.com)

1. Push code to GitHub
2. Create new Web Service in Render
3. Connect repository (select `server` directory as root)
4. Set Build Command: `npm install`
5. Set Start Command: `node src/server.js`
6. Set environment variables:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - Your secure JWT secret
   - `NODE_ENV=production`
   - `CORS_ORIGIN` - Your frontend URL
7. Deploy

### Frontend (Render.com Static Site)

1. Create new Static Site in Render
2. Connect same GitHub repository
3. Set Root Directory: `client`
4. Set Build Command: `npm install && npm run build`
5. Set Publish Directory: `build`
6. Set environment variable:
   - `REACT_APP_API_URL` - Your backend API URL
7. Deploy

**Live URLs:**
- Backend: https://techbridge-lms.onrender.com
- Frontend: https://techbridge-lms-frontend.onrender.com

## 🔒 Security Features

- JWT authentication with httpOnly cookies
- Password hashing with bcryptjs (10 rounds)
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation and sanitization
- Account locking after 5 failed login attempts (30-minute cooldown)
- Session timeout (30 minutes of inactivity)
- Parental consent requirement for users under 18
- MFA/2FA support for admin accounts (TOTP)
- Audit logging with 1-year retention
- File upload restrictions (PDF, DOCX, PPTX, MP4, MP3, JPG, PNG - 50MB max)
- Inactive user auto-deactivation (2-year inactivity)
- Automated backup system (daily + monthly)

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/techbridge
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=TechBridge
REACT_APP_VERSION=1.0.0
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **HAGUMA Iradukunda Ange Bianca** - Initial work

## 🙏 Acknowledgments

- Inspired by the mission to bridge the digital divide in Africa
- Built with ❤️ for children's education
- Thanks to all contributors and supporters

## 📞 Support

For support, email support@techbridge.org or open an issue in the GitHub repository.

## 🗺️ Roadmap

- [x] Offline mode support with Service Worker
- [x] Gamification features (points, badges, leaderboards)
- [x] Quiz attempt limits and cooldown system
- [x] Assignment system with late penalties
- [x] Grading formula (40% quizzes + 40% assignments + 20% participation)
- [x] Admin panel with user management
- [x] Teacher analytics dashboard
- [x] MFA for admin accounts
- [x] Automated backup and recovery system
- [x] Audit logging and security features
- [ ] Mobile app (React Native)
- [ ] Payment integration
- [ ] Live video classes
- [ ] Parent portal
- [ ] More language support (French, Swahili)
- [ ] Advanced AI-powered learning recommendations

---

Made with ❤️ for empowering children through education
#   T r i g g e r   r e d e p l o y   -   1 1 / 2 8 / 2 0 2 5   1 3 : 4 0 : 0 8 
 
 