import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonService, progressService, quizService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import { marked } from 'marked';
import './LessonView.css';

const LessonView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [startTime] = useState(Date.now());

  // Configure marked options
  marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: true,
    mangle: false
  });

  useEffect(() => {
    fetchLesson();
  }, [id]);

  const fetchLesson = async () => {
    try {
      const response = await lessonService.getLesson(id);
      setLesson(response.data.data.lesson);
      
      const lessonsRes = await lessonService.getLessonsByCourse(response.data.data.lesson.course._id);
      setAllLessons(lessonsRes.data.data.lessons);
      
      // Fetch quizzes for this course and filter by lesson
      try {
        const quizzesRes = await quizService.getQuizzesByCourse(response.data.data.lesson.course._id);
        console.log('All quizzes for course:', quizzesRes.data.data.quizzes);
        const lessonQuizzes = quizzesRes.data.data.quizzes.filter(q => {
          const quizLessonId = typeof q.lesson === 'object' ? q.lesson._id : q.lesson;
          console.log('Comparing quiz lesson:', quizLessonId, 'with current lesson:', id);
          return quizLessonId === id || String(quizLessonId) === String(id);
        });
        console.log('Filtered quizzes for this lesson:', lessonQuizzes);
        setQuizzes(lessonQuizzes);
      } catch (quizError) {
        console.error('Error fetching quizzes:', quizError);
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setCompleting(true);
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      await lessonService.completeLesson(id, { timeSpent });
      alert('Lesson marked as complete! +10 points');
      
      const nextLesson = allLessons.find(l => l.order === lesson.order + 1);
      if (nextLesson) {
        navigate(`/lessons/${nextLesson._id}`);
      } else {
        navigate(`/courses/${lesson.course._id}`);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to complete lesson');
    } finally {
      setCompleting(false);
    }
  };

  const goToNextLesson = () => {
    const nextLesson = allLessons.find(l => l.order === lesson.order + 1);
    if (nextLesson) {
      navigate(`/lessons/${nextLesson._id}`);
    }
  };

  const goToPreviousLesson = () => {
    const prevLesson = allLessons.find(l => l.order === lesson.order - 1);
    if (prevLesson) {
      navigate(`/lessons/${prevLesson._id}`);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!lesson) return <div>Lesson not found</div>;

  return (
    <div className="lesson-view-page">
      <div className="lesson-header">
        <div className="container">
          <div className="breadcrumb">
            <button onClick={() => navigate(`/courses/${lesson.course._id}`)}>
              ← Back to Course
            </button>
          </div>
          <h1>{lesson.title}</h1>
          <p>Lesson {lesson.order}</p>
        </div>
      </div>

      <div className="container">
        <div className="lesson-content-wrapper">
          <div className="lesson-main-content">
            {/* Render content - support both string and object formats */}
            {typeof lesson.content === 'string' ? (
              <div className="lesson-text">
                <div dangerouslySetInnerHTML={{ __html: marked.parse(lesson.content) }} />
              </div>
            ) : (
              <>
                {lesson.content?.text && (
                  <div className="lesson-text" dangerouslySetInnerHTML={{ __html: marked.parse(lesson.content.text) }} />
                )}

                {lesson.content?.videoUrl && (
                  <div className="lesson-video">
                    <iframe
                      width="100%"
                      height="500"
                      src={lesson.content.videoUrl}
                      title={lesson.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}

                {lesson.content?.images && lesson.content.images.length > 0 && (
                  <div className="lesson-images">
                    {lesson.content.images.map((img, index) => (
                      <div key={index} className="lesson-image">
                        <img src={img.url} alt={img.caption} />
                        {img.caption && <p>{img.caption}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Video URL at root level (for backward compatibility) */}
            {lesson.videoUrl && !lesson.content?.videoUrl && (
              <div className="lesson-video">
                <iframe
                  width="100%"
                  height="500"
                  src={lesson.videoUrl}
                  title={lesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {lesson.resources && lesson.resources.length > 0 && (
              <div className="lesson-resources">
                <h3>Resources</h3>
                <div className="resources-list">
                  {lesson.resources.map((resource, index) => (
                    <a 
                      key={index} 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="resource-item"
                    >
                      <span>📄 {resource.name}</span>
                      <span>Download</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Quiz Section */}
            {quizzes.length > 0 && (
              <div className="lesson-quizzes">
                <h3>📝 Lesson Quizzes</h3>
                <p>Test your knowledge of this lesson:</p>
                <div className="quizzes-list">
                  {quizzes.map((quiz) => (
                    <div key={quiz._id} className="quiz-card">
                      <div className="quiz-info">
                        <h4>{quiz.title}</h4>
                        <p>{quiz.questions?.length || 0} questions • {quiz.timeLimit || 'No'} time limit</p>
                        <p>Passing score: {quiz.passingScore}%</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/quizzes/${quiz._id}`)}
                        className="btn btn-secondary"
                      >
                        Take Quiz
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="lesson-actions">
              <button 
                onClick={goToPreviousLesson}
                disabled={lesson.order === 1}
                className="btn btn-outline"
              >
                ← Previous Lesson
              </button>
              
              <button 
                onClick={handleComplete}
                disabled={completing}
                className="btn btn-secondary"
              >
                {completing ? 'Completing...' : '✓ Mark as Complete'}
              </button>

              <button 
                onClick={goToNextLesson}
                disabled={!allLessons.find(l => l.order === lesson.order + 1)}
                className="btn btn-primary"
              >
                Next Lesson →
              </button>
            </div>
          </div>

          <div className="lesson-sidebar">
            <h3>Course Lessons</h3>
            <div className="lessons-nav">
              {allLessons.map((l) => (
                <button
                  key={l._id}
                  onClick={() => navigate(`/lessons/${l._id}`)}
                  className={`lesson-nav-item ${l._id === lesson._id ? 'active' : ''}`}
                >
                  <span className="lesson-nav-number">{l.order}</span>
                  <span className="lesson-nav-title">{l.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonView;
