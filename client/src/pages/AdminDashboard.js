import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  const { statistics, popularCourses, recentActivity, userGrowth } = dashboardData || {};

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome to the TechBridge Admin Panel</p>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Total Users</h3>
              <p className="stat-number">{statistics?.users?.total || 0}</p>
              <div className="stat-breakdown">
                <span>Students: {statistics?.users?.students || 0}</span>
                <span>Teachers: {statistics?.users?.teachers || 0}</span>
                <span>Admins: {statistics?.users?.admins || 0}</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>Total Courses</h3>
              <p className="stat-number">{statistics?.courses?.total || 0}</p>
              <div className="stat-breakdown">
                <span>Published: {statistics?.courses?.published || 0}</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <h3>Active Students</h3>
              <p className="stat-number">{statistics?.users?.active || 0}</p>
              <div className="stat-breakdown">
                <span>Last 30 days</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎓</div>
            <div className="stat-content">
              <h3>Total Enrollments</h3>
              <p className="stat-number">{statistics?.enrollments?.total || 0}</p>
              <div className="stat-breakdown">
                <span>Completed: {statistics?.enrollments?.completed || 0}</span>
                <span>Rate: {statistics?.enrollments?.completionRate || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="info-section">
          <div className="info-badge">
            <span className="badge-icon">🆕</span>
            <span className="badge-text">
              {statistics?.users?.recentRegistrations || 0} new registrations in the last 7 days
            </span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="dashboard-content">
          {/* Popular Courses */}
          <div className="dashboard-card">
            <h2>📈 Popular Courses</h2>
            {popularCourses && popularCourses.length > 0 ? (
              <div className="popular-courses-list">
                {popularCourses.map((course, index) => (
                  <div key={course._id} className="popular-course-item">
                    <span className="course-rank">#{index + 1}</span>
                    <span className="course-name">{course.courseName}</span>
                    <span className="course-enrollments">
                      {course.enrollments} enrollments
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No course data available</p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card">
            <h2>🔔 Recent Activity</h2>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="activity-list">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-user">{activity.user}</div>
                    <div className="activity-action">{activity.action}</div>
                    <div className="activity-time">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No recent activity</p>
            )}
          </div>
        </div>

        {/* User Growth Chart */}
        {userGrowth && userGrowth.length > 0 && (
          <div className="dashboard-card full-width">
            <h2>📊 User Growth (Last 6 Months)</h2>
            <div className="growth-chart">
              {userGrowth.map((data) => (
                <div key={data.month} className="growth-bar-container">
                  <div
                    className="growth-bar"
                    style={{
                      height: `${Math.min((data.count / Math.max(...userGrowth.map(g => g.count))) * 200, 200)}px`
                    }}
                  >
                    <span className="growth-count">{data.count}</span>
                  </div>
                  <span className="growth-label">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button
              className="action-btn primary"
              onClick={() => navigate('/admin/users')}
            >
              👥 Manage Users
            </button>
            <button
              className="action-btn"
              onClick={() => navigate('/courses')}
            >
              📚 Browse Courses
            </button>
            <button
              className="action-btn"
              onClick={() => navigate('/my-courses')}
            >
              📖 My Courses
            </button>
            <button
              className="action-btn"
              onClick={() => navigate('/progress')}
            >
              📊 View Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
