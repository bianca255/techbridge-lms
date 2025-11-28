import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { courseService, forumService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import './Forums.css';

const Forums = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchForums();
    }
  }, [selectedCourse]);

  const fetchMyCourses = async () => {
    try {
      const response = await courseService.getMyCourses();
      setCourses(response.data.data.courses);
      if (response.data.data.courses.length > 0) {
        setSelectedCourse(response.data.data.courses[0]._id);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchForums = async () => {
    try {
      setLoading(true);
      const response = await forumService.getForumsByCourse(selectedCourse);
      setForums(response.data.data.data);
    } catch (error) {
      console.error('Error fetching forums:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) return <LoadingSpinner />;

  if (courses.length === 0) {
    return (
      <div className="forums-page">
        <div className="container">
          <div className="empty-state">
            <h2>No enrolled courses</h2>
            <p>Enroll in a course to access forums</p>
            <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forums-page">
      <div className="container">
        <div className="forums-header">
          <h1>{t('forum.title')}</h1>
          <Link to={`/forums/new?course=${selectedCourse}`} className="btn btn-primary">
            {t('forum.newPost')}
          </Link>
        </div>

        <div className="course-selector">
          <label>Select Course:</label>
          <select 
            value={selectedCourse || ''} 
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div className="forums-list">
          {forums.length > 0 ? (
            forums.map(forum => (
              <Link to={`/forums/${forum._id}`} key={forum._id} className="forum-item">
                <div className="forum-badges">
                  {forum.isPinned && <span className="badge badge-warning">📌 Pinned</span>}
                  {forum.isLocked && <span className="badge badge-secondary">🔒 Locked</span>}
                  <span className={`badge badge-${getCategoryColor(forum.category)}`}>
                    {forum.category}
                  </span>
                </div>
                
                <h3>{forum.title}</h3>
                <p className="forum-content">{forum.content.substring(0, 150)}...</p>
                
                <div className="forum-meta">
                  <div className="meta-left">
                    <span className="author">
                      By {forum.author.firstName} {forum.author.lastName}
                    </span>
                    <span className="date">{formatDate(forum.createdAt)}</span>
                  </div>
                  <div className="meta-right">
                    <span>👁 {forum.views} views</span>
                    <span>💬 {forum.replies.length} replies</span>
                    <span>👍 {forum.likes.length} likes</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="empty-state">
              <p>No forum posts yet. Be the first to start a discussion!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getCategoryColor = (category) => {
  const colors = {
    question: 'primary',
    discussion: 'success',
    announcement: 'warning',
    help: 'danger'
  };
  return colors[category] || 'primary';
};

export default Forums;
