import React, { useState, useContext, useEffect } from 'react';
import { CourseContext } from '../../../context/CourseContext';

const PricingOptions = ({ nextStep, prevStep }) => {
  const { courseData, updateCourseData } = useContext(CourseContext);
  const [freemiumEnabled, setFreemiumEnabled] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Initialize state based on courseData
    setFreemiumEnabled(courseData.pricing?.courseType === 'freemium');
  }, [courseData.pricing]);

  // Handle course type change
  const handleCourseTypeChange = (e) => {
    const courseType = e.target.value;
    
    // Update local state for freemium toggle
    setFreemiumEnabled(courseType === 'freemium');
    
    // Update course data with new pricing info
    updateCourseData({
      pricing: {
        ...courseData.pricing,
        courseType,
        // Reset price if changing from paid to another type
        price: courseType === 'paid' ? (courseData.pricing?.price || 0) : 0,
        // Reset freemium content if not freemium
        freemiumContent: courseType === 'freemium' ? (courseData.pricing?.freemiumContent || []) : []
      }
    });
  };

  // Handle price change
  const handlePriceChange = (e) => {
    const value = e.target.value;
    
    // Validate price input (allow numbers and decimal point)
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      updateCourseData({
        pricing: {
          ...courseData.pricing,
          price: value === '' ? 0 : parseFloat(value)
        }
      });
    }
  };

  // Toggle freemium content selection
  const toggleFreemiumContent = (contentId, contentType) => {
    const freemiumContent = courseData.pricing?.freemiumContent || [];
    const contentKey = `${contentType}_${contentId}`;
    
    // Check if this content is already marked as freemium
    const isFreemium = freemiumContent.includes(contentKey);
    
    // Update freemium content list
    const updatedFreemiumContent = isFreemium
      ? freemiumContent.filter(item => item !== contentKey)
      : [...freemiumContent, contentKey];
    
    updateCourseData({
      pricing: {
        ...courseData.pricing,
        freemiumContent: updatedFreemiumContent
      }
    });
  };

  // Check if a module or lesson is marked as freemium
  const isFreemiumContent = (contentId, contentType) => {
    const freemiumContent = courseData.pricing?.freemiumContent || [];
    return freemiumContent.includes(`${contentType}_${contentId}`);
  };

  // Validate form before proceeding
  const handleContinue = () => {
    const newErrors = {};
    
    // Validate paid course price
    if (courseData.pricing?.courseType === 'paid' && 
        (!courseData.pricing.price || courseData.pricing.price <= 0)) {
      newErrors.price = 'Please enter a valid price for your course';
    }
    
    // Validate freemium selection
    if (courseData.pricing?.courseType === 'freemium' && 
        (!courseData.pricing.freemiumContent || courseData.pricing.freemiumContent.length === 0)) {
      newErrors.freemium = 'Please select at least one module or lesson to offer as free preview';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      nextStep();
    }
  };

  return (
    <div className="pricing-options-container">
      <h2>Pricing & Publishing Options</h2>
      <p className="section-description">
        Set how you want to monetize your course and which content to make freely available.
      </p>

      <div className="form-section">
        <div className="subsection">
          <h3>Course Type</h3>
          <div className="course-type-options">
            <div className="course-type-option">
              <input
                type="radio"
                id="free"
                name="courseType"
                value="free"
                checked={courseData.pricing?.courseType === 'free'}
                onChange={handleCourseTypeChange}
              />
              <label htmlFor="free">Free Course</label>
              <p className="option-description">
                Your entire course will be available for free to all learners.
              </p>
            </div>

            <div className="course-type-option">
              <input
                type="radio"
                id="freemium"
                name="courseType"
                value="freemium"
                checked={courseData.pricing?.courseType === 'freemium'}
                onChange={handleCourseTypeChange}
              />
              <label htmlFor="freemium">Freemium Course</label>
              <p className="option-description">
                Offer select modules/lessons for free, and charge for full access.
              </p>
            </div>

            <div className="course-type-option">
              <input
                type="radio"
                id="paid"
                name="courseType"
                value="paid"
                checked={courseData.pricing?.courseType === 'paid'}
                onChange={handleCourseTypeChange}
              />
              <label htmlFor="paid">Paid Course</label>
              <p className="option-description">
                Learners must pay to access your course content.
              </p>
            </div>
          </div>
        </div>

        {courseData.pricing?.courseType === 'paid' && (
          <div className="subsection">
            <h3>Course Price</h3>
            <div className="price-input">
              <label htmlFor="price">Set Price:</label>
              <div className="currency-input">
                <span className="currency-symbol">₦</span>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={courseData.pricing?.price || ''}
                  onChange={handlePriceChange}
                  placeholder="0.00"
                  className={errors.price ? 'error' : ''}
                />
              </div>
              {errors.price && <div className="error-message">{errors.price}</div>}
            </div>
          </div>
        )}

        {freemiumEnabled && (
          <div className="subsection">
            <h3>Freemium Content Selection</h3>
            <p className="selection-instructions">
              Select modules or lessons to offer as free preview. This content will be accessible to all learners without payment.
            </p>
            
            {errors.freemium && <div className="error-message">{errors.freemium}</div>}
            
            <div className="module-selection">
              {courseData.modules.map((module, moduleIndex) => (
                <div key={module.id} className="module-freemium-item">
                  <div className="module-checkbox">
                    <input
                      type="checkbox"
                      id={`module_${module.id}`}
                      checked={isFreemiumContent(module.id, 'module')}
                      onChange={() => toggleFreemiumContent(module.id, 'module')}
                    />
                    <label htmlFor={`module_${module.id}`}>
                      <strong>Module {moduleIndex + 1}:</strong> {module.title}
                    </label>
                  </div>
                  
                  <div className="lesson-selection">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div key={lesson.id} className="lesson-checkbox">
                        <input
                          type="checkbox"
                          id={`lesson_${lesson.id}`}
                          checked={isFreemiumContent(lesson.id, 'lesson')}
                          onChange={() => toggleFreemiumContent(lesson.id, 'lesson')}
                        />
                        <label htmlFor={`lesson_${lesson.id}`}>
                          Lesson {lessonIndex + 1}: {lesson.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="subsection">
          <h3>Revenue Sharing</h3>
          <div className="revenue-info">
            <p>For paid and freemium courses, MastaSkillz will share revenue with you according to the following structure:</p>
            <ul>
              <li><strong>Creator Share:</strong> 70% of course revenue</li>
              <li><strong>Platform Fee:</strong> 30% of course revenue</li>
            </ul>
            <p>Payments are processed monthly for all courses that reach minimum payout threshold of ₦5,000.</p>
          </div>
        </div>
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
          className="primary-button"
          onClick={handleContinue}
        >
          Continue to Review
        </button>
      </div>
    </div>
  );
};

export default PricingOptions;