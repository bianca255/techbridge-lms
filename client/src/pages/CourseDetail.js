import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { courseService, lessonService, progressService, certificateService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import './CourseDetail.css';

const CourseDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        courseService.getCourse(id),
        lessonService.getLessonsByCourse(id)
      ]);

      setCourse(courseRes.data.data.course);
      setIsEnrolled(courseRes.data.data.isEnrolled);
      setLessons(lessonsRes.data.data.lessons);

      if (courseRes.data.data.isEnrolled) {
        const progressRes = await progressService.getCourseProgress(id);
        setProgress(progressRes.data.data.progress);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);
      await courseService.enrollCourse(id);
      setIsEnrolled(true);
      await fetchCourseDetails();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (window.confirm('Are you sure you want to unenroll from this course?')) {
      try {
        await courseService.unenrollCourse(id);
        setIsEnrolled(false);
        setProgress(null);
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to unenroll');
      }
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      const response = await certificateService.downloadCertificate(id);
      
      // Create blob from response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate_${course.title.replace(/\\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download certificate');
      console.error('Download error:', error);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!course) return <div>Course not found</div>;

  return (
    <div className="course-detail-page">
      <div className="course-hero">
        <div className="container">
          <div className="course-hero-content">
            <div className="course-info">
              <div className="course-badges">
                <span className="badge badge-primary">{course.level}</span>
                <span className="badge badge-success">{course.category}</span>
              </div>
              <h1>{course.title}</h1>
              <p className="course-description">{course.description}</p>
              
              <div className="course-meta">
                <div className="meta-item">
                  <strong>Instructor:</strong> {course.instructor.firstName} {course.instructor.lastName}
                </div>
                <div className="meta-item">
                  <strong>Duration:</strong> {course.duration} hours
                </div>
                <div className="meta-item">
                  <strong>Students:</strong> {course.enrolledStudents?.length || 0}
                </div>
                <div className="meta-item">
                  <strong>Rating:</strong> ⭐ {course.rating.average.toFixed(1)} ({course.rating.count} reviews)
                </div>
              </div>

              <div className="course-actions">
                {isEnrolled ? (
                  <>
                    {progress && (
                      <div className="progress-info">
                        <p>Progress: {progress.overallProgress}%</p>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${progress.overallProgress}%` }}
                          ></div>
                        </div>
                        {progress.overallProgress >= 100 && (
                          <button 
                            onClick={handleDownloadCertificate}
                            className="btn btn-success"
                            style={{ marginTop: '15px' }}
                          >
                            🏆 Download Certificate
                          </button>
                        )}
                      </div>
                    )}
                    <button onClick={handleUnenroll} className="btn btn-outline">
                      {t('courses.unenroll')}
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleEnroll} 
                    className="btn btn-primary btn-large"
                    disabled={enrolling}
                  >
                    {enrolling ? 'Enrolling...' : t('courses.enroll')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="course-content">
          <div className="content-section">
            <h2>{t('courses.whatYouLearn')}</h2>
            <ul className="learning-objectives">
              {course.learningObjectives.map((obj, index) => (
                <li key={index}>✓ {obj}</li>
              ))}
            </ul>
          </div>

          <div className="content-section">
            <h2>{t('courses.lessons')} ({lessons.length})</h2>
            <div className="lessons-list">
              {lessons.map((lesson) => {
                const isCompleted = progress?.completedLessons.some(
                  cl => cl.lesson._id === lesson._id
                );
                
                return (
                  <div key={lesson._id} className="lesson-item">
                    <div className="lesson-number">{lesson.order}</div>
                    <div className="lesson-info">
                      <h4>{lesson.title}</h4>
                      <p>{lesson.description}</p>
                      <span className="lesson-duration">⏱ {lesson.duration} min</span>
                    </div>
                    <div className="lesson-status">
                      {isCompleted && <span className="completed-badge">✓ Completed</span>}
                      {isEnrolled && (
                        <Link 
                          to={`/lessons/${lesson._id}`} 
                          className="btn btn-primary btn-sm"
                        >
                          {isCompleted ? 'Review' : 'Start'}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {course.prerequisites && course.prerequisites.length > 0 && (
            <div className="content-section">
              <h2>{t('courses.prerequisites')}</h2>
              <ul>
                {course.prerequisites.map((prereq, index) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
