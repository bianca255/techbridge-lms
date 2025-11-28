import React from 'react';
import { Link } from 'react-router-dom';
import './CourseCard.css';

const CourseCard = ({ course }) => {
  return (
    <div className="course-card">
      <div className="course-thumbnail">
        <img 
          src={course.thumbnail || '/placeholder-course.png'} 
          alt={course.title}
        />
        {course.isPaid && (
          <span className="course-price">${course.price}</span>
        )}
      </div>
      
      <div className="course-content">
        <div className="course-header">
          <span className="badge badge-primary">{course.level}</span>
          <span className="badge badge-success">{course.category}</span>
        </div>
        
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">
          {course.description.substring(0, 100)}...
        </p>
        
        <div className="course-meta">
          <span>👤 {course.enrollmentCount || 0} students</span>
          <span>⏱ {course.duration}h</span>
          <span>⭐ {course.rating?.average?.toFixed(1) || 'N/A'}</span>
        </div>
        
        <div className="course-footer">
          <Link to={`/courses/${course._id}`} className="btn btn-primary">
            View Course
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
