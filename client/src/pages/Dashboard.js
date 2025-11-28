import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { progressService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await progressService.getDashboardStats();
      setStats(response.data.data.stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>{t('dashboard.welcome')}, {user?.firstName}! 👋</h1>
          <p>Continue your learning journey</p>
        </div>

        <div className="stats-overview">
          <div className="stat-box">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>{stats?.totalCourses || 0}</h3>
              <p>{t('dashboard.totalCourses')}</p>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats?.completedCourses || 0}</h3>
              <p>{t('dashboard.completedCourses')}</p>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>{stats?.inProgressCourses || 0}</h3>
              <p>{t('dashboard.inProgress')}</p>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>{stats?.points || 0}</h3>
              <p>{t('dashboard.points')}</p>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <h3>{stats?.badges?.length || 0}</h3>
              <p>{t('dashboard.badges')}</p>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">⏱</div>
            <div className="stat-content">
              <h3>{Math.round((stats?.totalTimeSpent || 0) / 60)}h</h3>
              <p>{t('dashboard.timeSpent')}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="recent-activity">
            <h2>{t('dashboard.recentActivity')}</h2>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="activity-list">
                {stats.recentActivity.map((activity) => (
                  <Link 
                    to={`/courses/${activity.course._id}`} 
                    key={activity._id}
                    className="activity-item"
                  >
                    <img 
                      src={activity.course.thumbnail || '/placeholder-course.png'} 
                      alt={activity.course.title}
                    />
                    <div className="activity-info">
                      <h4>{activity.course.title}</h4>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${activity.overallProgress}%` }}
                        ></div>
                      </div>
                      <p>{activity.overallProgress}% complete</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No recent activity</p>
                <Link to="/courses" className="btn btn-primary">
                  Browse Courses
                </Link>
              </div>
            )}
          </div>

          <div className="achievements">
            <h2>Achievements</h2>
            {stats?.badges && stats.badges.length > 0 ? (
              <div className="badges-grid">
                {stats.badges.map((badge, index) => (
                  <div key={index} className="badge-item">
                    <div className="badge-icon">{badge.icon || '🏅'}</div>
                    <h4>{badge.name}</h4>
                    <p>{badge.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Complete courses to earn badges!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
