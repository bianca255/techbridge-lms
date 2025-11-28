import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import LessonView from './pages/LessonView';
import QuizView from './pages/QuizView';
import Forums from './pages/Forums';
import ForumDetail from './pages/ForumDetail';
import Profile from './pages/Profile';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminUserDetails from './pages/AdminUserDetails';
import Certificates from './pages/Certificates';

// Components
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route wrapper
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Dashboard Route - redirects based on role
const DashboardRoute = () => {
  const { user } = useAuth();
  
  if (user?.role === 'admin') {
    return <Navigate to="/admin" />;
  } else if (user?.role === 'teacher') {
    return <Navigate to="/teacher" />;
  } else {
    return <Navigate to="/student" />;
  }
};

function AppRoutes() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/courses" element={<Courses />} />
        <Route 
          path="/courses/create" 
          element={
            <ProtectedRoute roles={['teacher', 'admin']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/courses/:id" element={<CourseDetail />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardRoute />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/student" 
          element={
            <ProtectedRoute roles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminUserManagement />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/users/:userId" 
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminUserDetails />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/teacher" 
          element={
            <ProtectedRoute roles={['teacher', 'admin']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/lessons/:id" 
          element={
            <ProtectedRoute>
              <LessonView />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/quizzes/:id" 
          element={
            <ProtectedRoute>
              <QuizView />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/forums" 
          element={
            <ProtectedRoute>
              <Forums />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/forums/:id" 
          element={
            <ProtectedRoute>
              <ForumDetail />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/certificates" 
          element={
            <ProtectedRoute>
              <Certificates />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
