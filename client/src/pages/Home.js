import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">{t('app.name')}</h1>
            <p className="hero-subtitle">{t('app.tagline')}</p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary btn-large">
                  {t('nav.dashboard')}
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-large">
                    {t('nav.register')}
                  </Link>
                  <Link to="/courses" className="btn btn-outline btn-large">
                    {t('nav.courses')}
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-placeholder">
              <span>🎓</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose TechBridge?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💻</div>
              <h3>Free Digital Literacy</h3>
              <p>Access quality computer skills training at no cost</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Interactive Learning</h3>
              <p>Engage with quizzes, lessons, and hands-on exercises</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Community Forums</h3>
              <p>Learn together with peers and mentors</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Track Progress</h3>
              <p>Monitor your learning journey and earn badges</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Multi-Language</h3>
              <p>Learn in English or Kinyarwanda</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Certificates</h3>
              <p>Earn certificates upon course completion</p>
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>1000+</h3>
              <p>Students Enrolled</p>
            </div>
            <div className="stat-card">
              <h3>50+</h3>
              <p>Courses Available</p>
            </div>
            <div className="stat-card">
              <h3>20+</h3>
              <p>Expert Instructors</p>
            </div>
            <div className="stat-card">
              <h3>95%</h3>
              <p>Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to Start Your Learning Journey?</h2>
          <p>Join thousands of students empowering themselves through digital literacy</p>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-primary btn-large">
              Get Started Free
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
