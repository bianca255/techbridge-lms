import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminUserManagement.css';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    search: '',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(
        Object.entries(filters).filter(([_, v]) => v !== '')
      ).toString();
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/users?${queryParams}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Change user role to ${newRole}?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('User role updated successfully');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/admin/users/${userId}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('User status updated successfully');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/admin/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('User deleted successfully');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt('Enter new password (minimum 8 characters):');
    if (!newPassword || newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/users/${userId}/reset-password`,
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Password reset successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleViewDetails = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  if (loading && users.length === 0) return <LoadingSpinner />;

  return (
    <div className="admin-user-management">
      <div className="container">
        <div className="page-header">
          <h1>👥 User Management</h1>
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search by name, email, username..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Role:</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="filter-select"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="filter-select"
            >
              <option value="createdAt">Join Date</option>
              <option value="lastLogin">Last Login</option>
              <option value="firstName">First Name</option>
              <option value="email">Email</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Order:</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="filter-select"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="users-summary">
          <p>
            Showing <strong>{users.length}</strong> of{' '}
            <strong>{pagination.totalUsers || 0}</strong> users
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Users Table */}
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Points</th>
                <th>Badges</th>
                <th>Joined</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="user-id">{user.id.substring(0, 8)}...</td>
                  <td>
                    <div className="user-info">
                      <strong>{user.firstName} {user.lastName}</strong>
                      <small>@{user.username}</small>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className={`role-badge ${user.role}`}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? '✓ Active' : '✗ Inactive'}
                    </span>
                    {user.mfaEnabled && <span className="mfa-badge">🔒 MFA</span>}
                  </td>
                  <td>{user.points || 0}</td>
                  <td>{user.badges?.length || 0}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-action view"
                        onClick={() => handleViewDetails(user.id)}
                        title="View Details"
                      >
                        👁️
                      </button>
                      <button
                        className="btn-action toggle"
                        onClick={() => handleToggleStatus(user.id)}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {user.isActive ? '🔒' : '🔓'}
                      </button>
                      <button
                        className="btn-action reset"
                        onClick={() => handleResetPassword(user.id)}
                        title="Reset Password"
                      >
                        🔑
                      </button>
                      <button
                        className="btn-action delete"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete User"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page === 1}
            >
              « Previous
            </button>
            
            <span className="pagination-info">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page === pagination.totalPages}
            >
              Next »
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;
