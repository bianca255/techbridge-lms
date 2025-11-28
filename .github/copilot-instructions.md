# TechBridge Project - Copilot Instructions

## Project Overview
TechBridge is a full-stack learning management system designed to bridge the digital divide for underprivileged African children (aged 8-18).

## Technology Stack
- **Frontend**: React, React Router, Axios, i18next
- **Backend**: Node.js, Express, MongoDB Atlas
- **Authentication**: JWT with RBAC (Admin, Teacher, Student)
- **Deployment**: Vercel (frontend), Render (backend)

## Project Structure
```
techbridge/
├── client/          # React frontend
├── server/          # Node.js backend
├── .github/         # GitHub configs
└── README.md        # Project documentation
```

## Checklist

- [x] Verify copilot-instructions.md file created
- [x] Clarify project requirements (completed via user input)
- [ ] Scaffold backend project structure
- [ ] Scaffold frontend project structure
- [ ] Configure environment and deployment files
- [ ] Install dependencies
- [ ] Create VS Code tasks
- [ ] Verify compilation
- [ ] Complete documentation

## Development Guidelines
- Use JWT for authentication with role-based access control
- Implement security best practices (rate limiting, input validation, CORS)
- Support English and Kinyarwanda languages
- Child-friendly UI with accessible design
- MongoDB models: Users, Courses, Lessons, Quizzes, Forums, Progress
- RESTful API design with proper error handling
