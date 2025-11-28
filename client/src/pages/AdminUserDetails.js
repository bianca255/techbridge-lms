import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminUserDetails.css';

const AdminUserDetails = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserData(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user details');
      console.error('Fetch user details error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="admin-user-details">
        <div className="container">
          <div className="error-message">{error}</div>
          <button className="btn-back" onClick={() => navigate('/admin/users')}>
            ← Back to Users
          </button>
        </div>
      </div>
    );
  }

  const { user, enrollments, recentActivity } = userData || {};

  return (
    <div className="admin-user-details">
      <div className="container">
        <div className="page-header">
          <h1>User Details</h1>
          <button className="btn-back" onClick={() => navigate('/admin/users')}>
            ← Back to Users
          </button>
        </div>

        {/* User Information Card */}
        <div className="details-card">
          <h2>👤 Personal Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>User ID:</label>
              <span>{user?.id}</span>
            </div>
            <div className="info-item">
              <label>Full Name:</label>
              <span>{user?.firstName} {user?.lastName}</span>
            </div>
            <div className="info-item">
              <label>Username:</label>
              <span>@{user?.username}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{user?.email}</span>
            </div>
            <div className="info-item">
              <label>Role:</label>
              <span className={`role-badge ${user?.role}`}>
                {user?.role?.toUpperCase()}
              </span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span className={`status-badge ${user?.isActive ? 'active' : 'inactive'}`}>
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="info-item">
              <label>Date of Birth:</label>
              <span>
                {user?.dateOfBirth 
                  ? new Date(user.dateOfBirth).toLocaleDateString()
                  : 'Not provided'}
              </span>
            </div>
            <div className="info-item">
              <label>Joined:</label>
              <span>{new Date(user?.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <label>Last Login:</label>
              <span>
                {user?.lastLogin 
                  ? new Date(user.lastLogin).toLocaleString()
                  : 'Never'}
              </span>
            </div>
          </div>
        </div>

        {/* Security Information */}
        <div className="details-card">
          <h2>🔒 Security Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>MFA Enabled:</label>
              <span className={user?.mfaEnabled ? 'text-success' : 'text-muted'}>
                {user?.mfaEnabled ? '✓ Yes' : '✗ No'}
              </span>
            </div>
            <div className="info-item">
              <label>Failed Login Attempts:</label>
              <span className={user?.failedLoginAttempts > 0 ? 'text-warning' : ''}>
                {user?.failedLoginAttempts || 0}
              </span>
            </div>
            <div className="info-item">
              <label>Account Locked:</label>
              <span className={user?.accountLockedUntil ? 'text-danger' : ''}>
                {user?.accountLockedUntil 
                  ? `Until ${new Date(user.accountLockedUntil).toLocaleString()}`
                  : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Parental Consent (if applicable) */}
        {user?.parentalConsent && (
          <div className="details-card">
            <h2>👨‍👩‍👧 Parental Consent</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Parent Name:</label>
                <span>{user.parentalConsent.parentName}</span>
              </div>
              <div className="info-item">
                <label>Parent Email:</label>
                <span>{user.parentalConsent.parentEmail}</span>
              </div>
              <div className="info-item">
                <label>Consent Given:</label>
                <span>{new Date(user.parentalConsent.consentDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Gamification Stats */}
        <div className="details-card">
          <h2>🎮 Gamification</h2>
          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">{user?.points || 0}</div>
              <div className="stat-label">Points</div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">🏅</div>
              <div className="stat-value">{user?.badges?.length || 0}</div>
              <div className="stat-label">Badges</div>
            </div>
          </div>
          {user?.badges && user.badges.length > 0 && (
            <div className="badges-list">
              {user.badges.map((badge, index) => (
                <span key={index} className="badge-item">{badge}</span>
              ))}
            </div>
          )}
        </div>

        {/* Enrollments */}
        <div className="details-card">
          <h2>📚 Course Enrollments ({enrollments?.length || 0})</h2>
          {enrollments && enrollments.length > 0 ? (
            <div className="enrollments-list">
              {enrollments.map((enrollment) => (
                <div key={enrollment.courseId} className="enrollment-item">
                  <div className="enrollment-header">
                    <h3>{enrollment.courseName}</h3>
                    <span className={`level-badge ${enrollment.level}`}>
                      {enrollment.level}
                    </span>
                  </div>
                  <div className="enrollment-details">
                    <div className="detail">
                      <label>Category:</label>
                      <span>{enrollment.category}</span>
                    </div>
                    <div className="detail">
                      <label>Progress:</label>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${enrollment.progress}%` }}
                        >
                          {enrollment.progress}%
                        </div>
                      </div>
                    </div>
                    <div className="detail">
                      <label>Status:</label>
                      <span className={enrollment.isCompleted ? 'text-success' : ''}>
                        {enrollment.isCompleted ? '✓ Completed' : 'In Progress'}
                      </span>
                    </div>
                    <div className="detail">
                      <label>Points Earned:</label>
                      <span>{enrollment.points || 0}</span>
                    </div>
                    <div className="detail">
                      <label>Enrolled:</label>
                      <span>{new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                    </div>
                    <div className="detail">
                      <label>Last Accessed:</label>
                      <span>
                        {enrollment.lastAccessed
                          ? new Date(enrollment.lastAccessed).toLocaleDateString()
                          : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No enrollments yet</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="details-card">
          <h2>🔔 Recent Activity (Last 20)</h2>
          {recentActivity && recentActivity.length > 0 ? (
            <div className="activity-log">
              {recentActivity.map((activity, index) => (
                <div key={index} className="activity-log-item">
                  <div className="activity-timestamp">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                  <div className="activity-details">
                    <strong>{activity.action}</strong>
                    {activity.details && <p>{activity.details}</p>}
                    {activity.ipAddress && (
                      <small className="ip-address">IP: {activity.ipAddress}</small>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetails;
