import React, { useState, useContext } from 'react';
import { CourseContext } from '../../../context/CourseContext';

const ReviewPublish = ({ prevStep, onPublish, onSaveDraft, isSubmitting }) => {
  const { courseData } = useContext(CourseContext);
  const [checklist, setChecklist] = useState({
    contentComplete: false,
    languagesApplied: false,
    accessibilityReviewed: false,
    termsAccepted: false
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState({});

  // Calculate completion metrics
  const totalModules = courseData.modules.length;
  const totalLessons = courseData.modules.reduce(
    (total, module) => total + module.lessons.length, 0
  );
  const totalQuizzes = courseData.modules.reduce(
    (total, module) => total + module.quizzes.length, 0
  );
  
  // Check if course has required content
  const hasRequiredContent = totalModules > 0 && totalLessons > 0;
  
  // Format pricing information for display
  const formatPricing = () => {
    const { courseType, price } = courseData.pricing || { courseType: 'free', price: 0 };
    
    switch (courseType) {
      case 'free':
        return 'Free Course';
      case 'freemium':
        return `Freemium Course (Full access: ₦${price.toFixed(2)})`;
      case 'paid':
        return `Paid Course (₦${price.toFixed(2)})`;
      default:
        return 'Free Course';
    }
  };

  // Check if a module or lesson is marked as freemium
  const isFreemiumContent = (contentId, contentType) => {
    const freemiumContent = courseData.pricing?.freemiumContent || [];
    return freemiumContent.includes(`${contentType}_${contentId}`);
  };

  // Toggle checklist item
  const handleChecklistToggle = (key) => {
    setChecklist({
      ...checklist,
      [key]: !checklist[key]
    });
  };

  // Toggle preview mode
  const handlePreviewToggle = () => {
    setPreviewMode(!previewMode);
  };

  // Validate before publishing
  const validatePublish = () => {
    const newErrors = {};
    
    // Check if all checklist items are checked
    if (!Object.values(checklist).every(item => item)) {
      newErrors.checklist = 'Please complete all items in the checklist before publishing';
    }
    
    // Check for required content
    if (!hasRequiredContent) {
      newErrors.content = 'Your course must have at least one module with content';
    }
    
    // Check for course title and summary
    if (!courseData.title.trim()) {
      newErrors.title = 'Your course needs a title';
    }
    
    if (!courseData.summary.trim()) {
      newErrors.summary = 'Your course needs a summary';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle publish button click
  const handlePublish = () => {
    if (validatePublish()) {
      onPublish();
    } else {
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="review-publish-container">
      <h2>Review & Publish</h2>
      <p className="section-description">
        Review your course details and publish when ready.
      </p>

      {Object.keys(errors).length > 0 && (
        <div className="errors-section">
          <h3>Please Fix the Following Issues:</h3>
          <ul className="error-list">
            {Object.entries(errors).map(([key, value]) => (
              <li key={key} className="error-item">{value}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="review-sections">
        <div className="course-overview-review">
          <h3>Course Overview</h3>
          <div className="review-item">
            <div className="review-label">Title</div>
            <div className="review-value">{courseData.title || 'No title provided'}</div>
          </div>
          <div className="review-item">
            <div className="review-label">Category</div>
            <div className="review-value">
              {courseData.category ? `${courseData.category}${courseData.subcategory ? ` / ${courseData.subcategory}` : ''}` : 'No category selected'}
            </div>
          </div>
          <div className="review-item">
            <div className="review-label">Languages</div>
            <div className="review-value">
              {courseData.languages.join(', ')}
            </div>
          </div>
          <div className="review-item">
            <div className="review-label">Summary</div>
            <div className="review-value">{courseData.summary || 'No summary provided'}</div>
          </div>
          <div className="review-item">
            <div className="review-label">Pricing</div>
            <div className="review-value">{formatPricing()}</div>
          </div>
        </div>

        <div className="course-content-review">
          <h3>Course Content</h3>
          <div className="content-summary">
            <div className="content-stat">
              <div className="stat-number">{totalModules}</div>
              <div className="stat-label">Modules</div>
            </div>
            <div className="content-stat">
              <div className="stat-number">{totalLessons}</div>
              <div className="stat-label">Lessons</div>
            </div>
            <div className="content-stat">
              <div className="stat-number">{totalQuizzes}</div>
              <div className="stat-label">Quizzes</div>
            </div>
          </div>

          <div className="modules-summary">
            {courseData.modules.map((module, moduleIndex) => (
              <div key={module.id} className="module-summary">
                <div className="module-summary-header">
                  <h4>
                    Module {moduleIndex + 1}: {module.title}
                    {isFreemiumContent(module.id, 'module') && (
                      <span className="freemium-badge">Free Preview</span>
                    )}
                  </h4>
                </div>
                <div className="module-content-summary">
                  <div className="lessons-summary">
                    <h5>Lessons ({module.lessons.length})</h5>
                    {module.lessons.length > 0 ? (
                      <ul className="lessons-list">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <li key={lesson.id}>
                            Lesson {lessonIndex + 1}: {lesson.title}
                            {isFreemiumContent(lesson.id, 'lesson') && (
                              <span className="freemium-badge">Free Preview</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-content">No lessons in this module</p>
                    )}
                  </div>
                  <div className="quizzes-summary">
                    <h5>Quizzes ({module.quizzes.length})</h5>
                    {module.quizzes.length > 0 ? (
                      <ul className="quizzes-list">
                        {module.quizzes.map((quiz, quizIndex) => (
                          <li key={quiz.id}>
                            Quiz {quizIndex + 1}: {quiz.title} ({quiz.questions?.length || 0} questions)
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-content">No quizzes in this module</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="publish-checklist">
          <h3>Publishing Checklist</h3>
          <p>Complete this checklist before publishing your course:</p>
          
          <div className="checklist-items">
            <div className="checklist-item">
              <input
                type="checkbox"
                id="contentComplete"
                checked={checklist.contentComplete}
                onChange={() => handleChecklistToggle('contentComplete')}
              />
              <label htmlFor="contentComplete">Course content is complete and accurate</label>
            </div>
            
            <div className="checklist-item">
              <input
                type="checkbox"
                id="languagesApplied"
                checked={checklist.languagesApplied}
                onChange={() => handleChecklistToggle('languagesApplied')}
              />
              <label htmlFor="languagesApplied">Language translations have been applied and reviewed (if applicable)</label>
            </div>
            
            <div className="checklist-item">
              <input
                type="checkbox"
                id="accessibilityReviewed"
                checked={checklist.accessibilityReviewed}
                onChange={() => handleChecklistToggle('accessibilityReviewed')}
              />
              <label htmlFor="accessibilityReviewed">Accessibility features have been reviewed</label>
            </div>
            
            <div className="checklist-item">
              <input
                type="checkbox"
                id="termsAccepted"
                checked={checklist.termsAccepted}
                onChange={() => handleChecklistToggle('termsAccepted')}
              />
              <label htmlFor="termsAccepted">I accept the MastaSkillz Terms and Conditions for course creation</label>
            </div>
          </div>
        </div>
      </div>

      <div className="preview-section">
        <button 
          className={`preview-button ${previewMode ? 'active' : ''}`}
          onClick={handlePreviewToggle}
        >
          {previewMode ? 'Exit Preview' : 'Preview Course'}
        </button>
        
        {previewMode && (
          <div className="course-preview">
            <h3>Course Preview</h3>
            <p>This is how your course will appear to learners.</p>
            
            {/* Simplified preview UI */}
            <div className="preview-container">
              <div className="preview-header">
                <h2>{courseData.title}</h2>
                <div className="preview-meta">
                  <span className="preview-category">{courseData.category} {courseData.subcategory ? `/ ${courseData.subcategory}` : ''}</span>
                  <span className="preview-price">{formatPricing()}</span>
                </div>
              </div>
              
              <div className="preview-summary">
                <h4>About this course</h4>
                <p>{courseData.summary}</p>
              </div>
              
              <div className="preview-objectives">
                <h4>What you'll learn</h4>
                <ul>
                  {courseData.objectives.map((objective, index) => (
                    objective.trim() ? <li key={index}>{objective}</li> : null
                  ))}
                </ul>
              </div>
              
              <div className="preview-curriculum">
                <h4>Curriculum</h4>
                <div className="preview-modules">
                  {courseData.modules.map((module, moduleIndex) => (
                    <div key={module.id} className="preview-module">
                      <div className="preview-module-header">
                        <h5>Module {moduleIndex + 1}: {module.title}</h5>
                        <span>{module.lessons.length} lessons • {module.quizzes.length} quizzes</span>
                      </div>
                      <div className="preview-module-content">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="preview-lesson">
                            <span className="preview-lesson-icon">📚</span>
                            <span className="preview-lesson-title">Lesson {lessonIndex + 1}: {lesson.title}</span>
                            {isFreemiumContent(lesson.id, 'lesson') && 
                              <span className="preview-freemium-badge">Free</span>
                            }
                          </div>
                        ))}
                        {module.quizzes.map((quiz, quizIndex) => (
                          <div key={quiz.id} className="preview-quiz">
                            <span className="preview-quiz-icon">📝</span>
                            <span className="preview-quiz-title">Quiz {quizIndex + 1}: {quiz.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="form-actions">
        <button 
          type="button" 
          className="secondary-button"
          onClick={prevStep}
        >
          Back
        </button>
        <button 
          type="button" 
          className="draft-button"
          onClick={onSaveDraft}
          disabled={isSubmitting}
        >
          Save as Draft
        </button>
        <button 
          type="button" 
          className="primary-button"
          onClick={handlePublish}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Publishing...' : 'Publish Course'}
        </button>
      </div>
    </div>
  );
};

export default ReviewPublish;