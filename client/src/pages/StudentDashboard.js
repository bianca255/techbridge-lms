import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseService, progressService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    points: 0,
    badges: [],
    timeSpent: 0
  });
  const [courses, setCourses] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const coursesResponse = await courseService.getMyCourses();
      const coursesData = coursesResponse.data.data.courses || [];
      
      setCourses(coursesData);
      
      // Calculate stats
      const completed = coursesData.filter(c => c.progress >= 100).length;
      const inProgress = coursesData.filter(c => c.progress > 0 && c.progress < 100).length;
      
      setStats({
        totalCourses: coursesData.length,
        completedCourses: completed,
        inProgressCourses: inProgress,
        points: coursesData.reduce((sum, c) => sum + (c.pointsEarned || 0), 0),
        badges: [], // Will be populated from user data
        timeSpent: coursesData.reduce((sum, c) => sum + (c.timeSpent || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setCourses([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="student-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>My Learning Dashboard</h1>
          <Link to="/courses" className="btn btn-primary">
            Browse Courses
          </Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>{stats.totalCourses}</h3>
              <p>Enrolled Courses</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.completedCourses}</h3>
              <p>Completed Courses</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>{stats.inProgressCourses}</h3>
              <p>In Progress</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>{stats.points}</h3>
              <p>Total Points</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <h3>{stats.badges.length}</h3>
              <p>Badges Earned</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <h3>{Math.floor(stats.timeSpent / 60)}</h3>
              <p>Hours Learned</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="main-content">
            <section className="courses-section">
              <h2>Continue Learning</h2>
              {courses && courses.filter(c => c.progress > 0 && c.progress < 100).length > 0 ? (
                <div className="courses-list">
                  {courses
                    .filter(c => c.progress > 0 && c.progress < 100)
                    .map(course => (
                      <Link to={`/courses/${course._id}`} key={course._id} className="course-item">
                        <img src={course.thumbnail || '/placeholder.jpg'} alt={course.title} />
                        <div className="course-info">
                          <h3>{course.title}</h3>
                          <p>{course.instructor?.firstName} {course.instructor?.lastName}</p>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <span className="progress-text">{course.progress}% complete</span>
                        </div>
                      </Link>
                    ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No courses in progress</p>
                  <Link to="/courses" className="btn btn-outline">Start Learning</Link>
                </div>
              )}
            </section>

            <section className="completed-section">
              <h2>Completed Courses</h2>
              {courses && courses.filter(c => c.progress >= 100).length > 0 ? (
                <div className="completed-grid">
                  {courses
                    .filter(c => c.progress >= 100)
                    .map(course => (
                      <div key={course._id} className="completed-card">
                        <img src={course.thumbnail || '/placeholder.jpg'} alt={course.title} />
                        <h4>{course.title}</h4>
                        <div className="completed-badge">✓ Completed</div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="empty-text">No completed courses yet</p>
              )}
            </section>
          </div>

          <aside className="sidebar">
            <div className="sidebar-card">
              <h3>Quick Stats</h3>
              <div className="quick-stats">
                <div className="quick-stat">
                  <span className="label">Average Progress</span>
                  <span className="value">
                    {courses && courses.length > 0 
                      ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
                      : 0}%
                  </span>
                </div>
                <div className="quick-stat">
                  <span className="label">Lessons Completed</span>
                  <span className="value">
                    {courses.reduce((sum, c) => sum + (c.completedLessons || 0), 0)}
                  </span>
                </div>
                <div className="quick-stat">
                  <span className="label">Quizzes Passed</span>
                  <span className="value">
                    {courses.reduce((sum, c) => sum + (c.quizzesPassed || 0), 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="sidebar-card">
              <h3>Achievements</h3>
              {stats.badges && stats.badges.length > 0 ? (
                <div className="badges-grid">
                  {stats.badges.map((badge, index) => (
                    <div key={index} className="badge-item">
                      <span className="badge-icon">{badge.icon}</span>
                      <span className="badge-name">{badge.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-text">No badges yet. Keep learning!</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
