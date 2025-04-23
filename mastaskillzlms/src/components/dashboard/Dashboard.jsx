import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { CourseContext } from '../../context/CourseContext';
import { courseService } from '../../features/course-creation/api/courseService';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setEditCourse } = useContext(CourseContext);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.getCourses();
        setCourses(data);
      } catch (err) {
        setError('Failed to load courses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEditCourse = (courseId) => {
    setEditCourse(courseId);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Creator Dashboard</h1>
        <Link to="/create-course" className="create-course-button">
          + Create New Course
        </Link>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{courses.length}</div>
          <div className="stat-label">Total Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{courses.filter(c => c.status === 'published').length}</div>
          <div className="stat-label">Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{courses.filter(c => c.status === 'draft').length}</div>
          <div className="stat-label">Drafts</div>
        </div>
      </div>

      <div className="courses-section">
        <h2>Your Courses</h2>

        {courses.length === 0 ? (
          <div className="empty-courses">
            <p>You haven't created any courses yet.</p>
            <Link to="/create-course" className="create-first-course">
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map(course => (
              <div key={course.id} className={`course-card ${course.status}`}>
                <div className="course-status">
                  {course.status === 'published' ? 'Published' : 'Draft'}
                </div>
                <h3 className="course-title">{course.title}</h3>
                <div className="course-meta">
                  <span>{course.category}</span>
                  <span>{course.modules.length} modules</span>
                </div>
                <p className="course-summary">{course.summary}</p>
                <div className="course-languages">
                  {course.languages.map(lang => (
                    <span key={lang} className="language-tag">{lang}</span>
                  ))}
                </div>
                <div className="course-actions">
                  <Link 
                    to={`/edit-course/${course.id}`} 
                    className="edit-course"
                    onClick={() => handleEditCourse(course.id)}
                  >
                    Edit Course
                  </Link>
                  <Link to={`/course/${course.id}`} className="view-course">
                    {course.status === 'published' ? 'View Course' : 'Preview'}
                  </Link>
                </div>
              </div>
            ))}
            
            <div className="add-course-card">
              <Link to="/create-course" className="add-course-content">
                <div className="add-icon">+</div>
                <p>Create New Course</p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;