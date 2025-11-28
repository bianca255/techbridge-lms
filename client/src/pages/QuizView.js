import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import './QuizView.css';

const QuizView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [quizStarted, timeLeft]);

  const fetchQuiz = async () => {
    try {
      const response = await quizService.getQuiz(id);
      setQuiz(response.data.data.quiz);
      if (response.data.data.quiz.timeLimit) {
        setTimeLeft(response.data.data.quiz.timeLimit * 60);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setStartTime(new Date().toISOString());
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers({ ...answers, [questionIndex]: answer });
  };

  const handleSubmit = async () => {
    if (window.confirm('Are you sure you want to submit this quiz?')) {
      try {
        setSubmitting(true);
        const answersArray = quiz.questions.map((_, index) => answers[index] || '');
        
        const response = await quizService.submitQuiz(id, {
          answers: answersArray,
          startedAt: startTime,
          timeSpent: quiz.timeLimit ? (quiz.timeLimit * 60 - timeLeft) : undefined
        });
        
        setResult(response.data.data.attempt);
        alert(`Quiz submitted! Score: ${response.data.data.attempt.score}%`);
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to submit quiz');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingSpinner />;
  if (!quiz) return <div>Quiz not found</div>;

  if (result) {
    return (
      <div className="quiz-view-page">
        <div className="container">
          <div className="quiz-result">
            <div className="result-header">
              <h1>Quiz Results</h1>
              <div className={`result-score ${result.passed ? 'passed' : 'failed'}`}>
                <h2>{result.score}%</h2>
                <p>{result.passed ? '✓ Passed' : '✗ Failed'}</p>
              </div>
            </div>

            <div className="result-stats">
              <div className="stat">
                <strong>Points Earned:</strong> {result.pointsEarned} / {result.totalPoints}
              </div>
              <div className="stat">
                <strong>Passing Score:</strong> {quiz.passingScore}%
              </div>
              <div className="stat">
                <strong>Attempt:</strong> {result.attemptNumber} / {quiz.maxAttempts}
              </div>
              <div className="stat">
                <strong>Time Spent:</strong> {Math.floor(result.timeSpent / 60)} minutes
              </div>
            </div>

            {quiz.showCorrectAnswers && (
              <div className="answers-review">
                <h3>Review Answers</h3>
                {result.answers.map((answer, index) => {
                  const question = quiz.questions[index];
                  return (
                    <div key={index} className={`review-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                      <h4>Question {index + 1}</h4>
                      <p className="question-text">{question.questionText}</p>
                      <div className="answer-info">
                        <p><strong>Your Answer:</strong> {answer.answer}</p>
                        {!answer.isCorrect && question.correctAnswer && (
                          <p><strong>Correct Answer:</strong> {question.correctAnswer}</p>
                        )}
                        <p><strong>Points:</strong> {answer.pointsEarned} / {question.points}</p>
                      </div>
                      {question.explanation && (
                        <p className="explanation"><strong>Explanation:</strong> {question.explanation}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="result-actions">
              <button onClick={() => navigate(`/courses/${quiz.course._id}`)} className="btn btn-primary">
                Back to Course
              </button>
              {result.attemptNumber < quiz.maxAttempts && !result.passed && (
                <button onClick={() => window.location.reload()} className="btn btn-outline">
                  Retry Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="quiz-view-page">
        <div className="container">
          <div className="quiz-intro">
            <h1>{quiz.title}</h1>
            <p className="quiz-description">{quiz.description}</p>
            
            <div className="quiz-info">
              <div className="info-item">
                <strong>Questions:</strong> {quiz.questions.length}
              </div>
              <div className="info-item">
                <strong>Passing Score:</strong> {quiz.passingScore}%
              </div>
              <div className="info-item">
                <strong>Max Attempts:</strong> {quiz.maxAttempts}
              </div>
              {quiz.timeLimit > 0 && (
                <div className="info-item">
                  <strong>Time Limit:</strong> {quiz.timeLimit} minutes
                </div>
              )}
            </div>

            <button onClick={startQuiz} className="btn btn-primary btn-large">
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-view-page">
      <div className="quiz-header">
        <div className="container">
          <h1>{quiz.title}</h1>
          {quiz.timeLimit > 0 && (
            <div className={`timer ${timeLeft < 60 ? 'warning' : ''}`}>
              ⏱ {formatTime(timeLeft)}
            </div>
          )}
        </div>
      </div>

      <div className="container">
        <div className="quiz-content">
          {quiz.questions.map((question, index) => (
            <div key={index} className="question-card">
              <h3>Question {index + 1} of {quiz.questions.length}</h3>
              <p className="question-text">{question.questionText}</p>
              
              {question.questionType === 'multiple-choice' && (
                <div className="options-list">
                  {question.options.map((option, optIndex) => (
                    <label key={optIndex} className="option-item">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option.text}
                        checked={answers[index] === option.text}
                        onChange={() => handleAnswerChange(index, option.text)}
                      />
                      <span>{option.text}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.questionType === 'true-false' && (
                <div className="options-list">
                  <label className="option-item">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value="true"
                      checked={answers[index] === 'true'}
                      onChange={() => handleAnswerChange(index, 'true')}
                    />
                    <span>True</span>
                  </label>
                  <label className="option-item">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value="false"
                      checked={answers[index] === 'false'}
                      onChange={() => handleAnswerChange(index, 'false')}
                    />
                    <span>False</span>
                  </label>
                </div>
              )}

              {(question.questionType === 'short-answer' || question.questionType === 'fill-blank') && (
                <input
                  type="text"
                  className="text-answer"
                  value={answers[index] || ''}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder="Type your answer here..."
                />
              )}

              <div className="question-points">Points: {question.points}</div>
            </div>
          ))}

          <button 
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length < quiz.questions.length}
            className="btn btn-primary btn-large"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizView;
