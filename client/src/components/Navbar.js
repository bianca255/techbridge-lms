import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand">
          <h2>{t('app.name')}</h2>
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="nav-link">{t('nav.home')}</Link>
          <Link to="/courses" className="nav-link">{t('nav.courses')}</Link>
          
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="nav-link">{t('nav.dashboard')}</Link>
              <Link to="/forums" className="nav-link">{t('nav.forums')}</Link>
              <Link to="/certificates" className="nav-link">Certificates</Link>
              
              {user?.role === 'admin' && (
                <Link to="/admin" className="nav-link">Admin</Link>
              )}
              
              {(user?.role === 'teacher' || user?.role === 'admin') && (
                <Link to="/teacher" className="nav-link">Teacher</Link>
              )}
            </>
          )}
        </div>

        <div className="navbar-actions">
          <div className="language-switcher">
            <button 
              onClick={() => changeLanguage('en')}
              className={i18n.language === 'en' ? 'active' : ''}
            >
              EN
            </button>
            <button 
              onClick={() => changeLanguage('rw')}
              className={i18n.language === 'rw' ? 'active' : ''}
            >
              RW
            </button>
          </div>

          {isAuthenticated ? (
            <div className="user-menu">
              <Link to="/profile" className="nav-link">
                {user?.firstName} ({user?.points} pts)
              </Link>
              <button onClick={handleLogout} className="btn btn-outline">
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">{t('nav.login')}</Link>
              <Link to="/register" className="btn btn-primary">{t('nav.register')}</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
