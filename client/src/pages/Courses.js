import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { courseService } from '../services';
import CourseCard from '../components/CourseCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './Courses.css';

const Courses = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    search: ''
  });

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllCourses(filters);
      setCourses(response.data.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="courses-page">
      <div className="container">
        <div className="courses-header">
          <h1>{t('courses.title')}</h1>
          <p>Discover courses to enhance your digital skills</p>
        </div>

        <div className="courses-filters">
          <input
            type="text"
            name="search"
            placeholder={t('common.search')}
            value={filters.search}
            onChange={handleFilterChange}
            className="search-input"
          />

          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="computer-basics">Computer Basics</option>
            <option value="coding">Coding</option>
            <option value="web-development">Web Development</option>
            <option value="digital-literacy">Digital Literacy</option>
            <option value="mathematics">Mathematics</option>
            <option value="science">Science</option>
          </select>

          <select
            name="level"
            value={filters.level}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Levels</option>
            <option value="beginner">{t('courses.beginner')}</option>
            <option value="intermediate">{t('courses.intermediate')}</option>
            <option value="advanced">{t('courses.advanced')}</option>
          </select>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : courses.length > 0 ? (
          <div className="courses-grid">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>{t('common.noResults')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
