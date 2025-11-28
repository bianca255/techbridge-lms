import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { courseService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    totalStudents: 0,
    totalLessons: 0
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      const response = await courseService.getTeacherCourses();
      const coursesData = response.data.data.data || [];
      
      setCourses(coursesData);
      
      const published = coursesData.filter(c => c.isPublished).length;
      const totalStudents = coursesData.reduce((sum, c) => sum + (c.enrolledStudents?.length || 0), 0);
      const totalLessons = coursesData.reduce((sum, c) => sum + (c.lessons?.length || 0), 0);
      
      setStats({
        totalCourses: coursesData.length,
        publishedCourses: published,
        totalStudents,
        totalLessons
      });
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      setCourses([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    navigate('/courses/create');
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseService.deleteCourse(courseId);
        alert('Course deleted successfully');
        fetchTeacherData();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete course');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="teacher-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Teacher Dashboard</h1>
          <button onClick={handleCreateCourse} className="btn btn-primary">
            + Create New Course
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>{stats.totalCourses}</h3>
              <p>Total Courses</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.publishedCourses}</h3>
              <p>Published Courses</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{stats.totalStudents}</h3>
              <p>Total Students</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <h3>{stats.totalLessons}</h3>
              <p>Total Lessons</p>
            </div>
          </div>
        </div>

        <div className="courses-management">
          <h2>My Courses</h2>
          
          {courses && courses.length > 0 ? (
            <div className="courses-table">
              <table>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Students</th>
                    <th>Lessons</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => (
                    <tr key={course._id}>
                      <td>
                        <div className="course-cell">
                          <img src={course.thumbnail || '/placeholder.jpg'} alt={course.title} />
                          <div>
                            <strong>{course.title}</strong>
                            <p>{course.category}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${course.isPublished ? 'published' : 'draft'}`}>
                          {course.isPublished ? '✓ Published' : '○ Draft'}
                        </span>
                      </td>
                      <td>{course.enrolledStudents?.length || 0} / {course.maxStudents || 500}</td>
                      <td>{course.lessons?.length || 0}</td>
                      <td>
                        ⭐ {course.rating?.average?.toFixed(1) || 'N/A'} 
                        ({course.rating?.count || 0})
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link to={`/courses/${course._id}/edit`} className="btn-icon" title="Edit">
                            ✏️
                          </Link>
                          <Link to={`/courses/${course._id}`} className="btn-icon" title="View">
                            👁️
                          </Link>
                          <button 
                            onClick={() => handleDeleteCourse(course._id)} 
                            className="btn-icon" 
                            title="Delete"
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
          ) : (
            <div className="empty-state">
              <p>No courses created yet</p>
              <button onClick={handleCreateCourse} className="btn btn-primary">
                Create Your First Course
              </button>
            </div>
          )}
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              <p className="empty-text">No recent activity</p>
            </div>
          </div>

          <div className="card">
            <h3>Top Performing Courses</h3>
            {courses
              .sort((a, b) => (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0))
              .slice(0, 5)
              .map(course => (
                <div key={course._id} className="top-course-item">
                  <span>{course.title}</span>
                  <span className="students-count">{course.enrolledStudents?.length || 0} students</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
