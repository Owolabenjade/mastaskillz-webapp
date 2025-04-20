import React, { useState, useContext, useEffect } from 'react';
import { CourseContext } from '../../../context/CourseContext';
import { aiService } from '../api/aiService';

const CATEGORIES = [
  { id: 'agriculture', name: 'Agriculture', subcategories: ['Farming', 'Livestock', 'Crop Management', 'Sustainable Practices'] },
  { id: 'tech', name: 'Technology', subcategories: ['Web Development', 'Mobile Development', 'Data Science', 'Cybersecurity', 'Cloud Computing'] },
  { id: 'trade', name: 'Trade Skills', subcategories: ['Carpentry', 'Plumbing', 'Electrical', 'Welding', 'Masonry'] },
  { id: 'business', name: 'Business', subcategories: ['Entrepreneurship', 'Marketing', 'Finance', 'Management', 'Sales'] },
  { id: 'health', name: 'Health & Wellness', subcategories: ['Nutrition', 'Fitness', 'Mental Health', 'First Aid', 'Traditional Medicine'] },
  { id: 'education', name: 'Education', subcategories: ['Teaching', 'Curriculum Development', 'Educational Technology', 'Child Development'] },
  { id: 'arts', name: 'Arts & Crafts', subcategories: ['Painting', 'Sculpture', 'Textile Arts', 'Photography', 'Digital Art'] },
  { id: 'language', name: 'Languages', subcategories: ['English', 'French', 'Hausa', 'Yoruba', 'Igbo', 'Pidgin', 'Other'] },
];

const LANGUAGES = [
  { id: 'en', name: 'English' },
  { id: 'ha', name: 'Hausa' },
  { id: 'yo', name: 'Yoruba' },
  { id: 'ig', name: 'Igbo' },
  { id: 'pcm', name: 'Nigerian Pidgin' },
  { id: 'fr', name: 'French' },
];

const CourseOverview = ({ nextStep }) => {
  const { courseData, updateCourseData } = useContext(CourseContext);
  const [aiSuggestions, setAiSuggestions] = useState({
    titles: [],
    summary: '',
    loadingTitles: false,
    loadingSummary: false,
  });
  const [errors, setErrors] = useState({});

  // Get subcategories based on selected category
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    if (courseData.category) {
      const selectedCategory = CATEGORIES.find(cat => cat.id === courseData.category);
      if (selectedCategory) {
        setSubcategories(selectedCategory.subcategories);
      }
    }
  }, [courseData.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateCourseData({ [name]: value });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const selectedCategory = CATEGORIES.find(cat => cat.id === categoryId);
    
    updateCourseData({ 
      category: categoryId,
      subcategory: '' // Reset subcategory when category changes
    });

    if (selectedCategory) {
      setSubcategories(selectedCategory.subcategories);
    } else {
      setSubcategories([]);
    }
  };

  const handleLanguageChange = (e) => {
    const { value, checked } = e.target;
    
    let updatedLanguages;
    if (checked) {
      // Add language if checked
      updatedLanguages = [...courseData.languages, value];
    } else {
      // Remove language if unchecked
      updatedLanguages = courseData.languages.filter(lang => lang !== value);
    }
    
    // Ensure at least one language is selected
    if (updatedLanguages.length > 0) {
      updateCourseData({ languages: updatedLanguages });
    }
  };

  const handleObjectiveChange = (index, value) => {
    const updatedObjectives = [...courseData.objectives];
    updatedObjectives[index] = value;
    updateCourseData({ objectives: updatedObjectives });
  };

  const addObjective = () => {
    updateCourseData({ 
      objectives: [...courseData.objectives, ''] 
    });
  };

  const removeObjective = (index) => {
    const updatedObjectives = [...courseData.objectives];
    updatedObjectives.splice(index, 1);
    updateCourseData({ objectives: updatedObjectives });
  };

  const handleSuggestTitle = async () => {
    if (!courseData.summary && !courseData.objectives.length) {
      setErrors({ aiSuggestion: 'Please add a course summary or objectives to generate title suggestions.' });
      return;
    }

    setAiSuggestions(prev => ({ ...prev, loadingTitles: true }));
    try {
      const suggestions = await aiService.suggestTitles({
        summary: courseData.summary,
        objectives: courseData.objectives
      });
      setAiSuggestions(prev => ({ 
        ...prev, 
        titles: suggestions,
        loadingTitles: false
      }));
    } catch (error) {
      console.error('Error generating title suggestions:', error);
      setAiSuggestions(prev => ({ ...prev, loadingTitles: false }));
    }
  };

  const handleSuggestSummary = async () => {
    if (!courseData.title && !courseData.objectives.length) {
      setErrors({ aiSuggestion: 'Please add a course title or objectives to generate a summary.' });
      return;
    }

    setAiSuggestions(prev => ({ ...prev, loadingSummary: true }));
    try {
      const summary = await aiService.suggestSummary({
        title: courseData.title,
        objectives: courseData.objectives
      });
      setAiSuggestions(prev => ({ 
        ...prev, 
        summary: summary,
        loadingSummary: false
      }));
    } catch (error) {
      console.error('Error generating summary suggestion:', error);
      setAiSuggestions(prev => ({ ...prev, loadingSummary: false }));
    }
  };

  const applyTitleSuggestion = (title) => {
    updateCourseData({ title });
  };

  const applySummarySuggestion = () => {
    updateCourseData({ summary: aiSuggestions.summary });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!courseData.title.trim()) {
      newErrors.title = 'Course title is required';
    }
    
    if (!courseData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!courseData.summary.trim()) {
      newErrors.summary = 'Course summary is required';
    }
    
    if (courseData.objectives.length === 0 || !courseData.objectives.some(obj => obj.trim() !== '')) {
      newErrors.objectives = 'At least one course objective is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      nextStep();
    } else {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className="course-overview-container">
      <h2>Course Overview</h2>
      <p className="section-description">
        Define the basic information about your course to help learners understand what they'll gain.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="title">Course Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={courseData.title}
              onChange={handleChange}
              placeholder="Enter a clear, specific title"
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <div className="error-message">{errors.title}</div>}
            
            <button 
              type="button" 
              className="ai-suggest-button"
              onClick={handleSuggestTitle}
              disabled={aiSuggestions.loadingTitles}
            >
              {aiSuggestions.loadingTitles ? 'Generating...' : 'Get AI Title Suggestions'}
            </button>
          </div>

          {aiSuggestions.titles.length > 0 && (
            <div className="ai-suggestions">
              <h4>Title Suggestions</h4>
              <ul>
                {aiSuggestions.titles.map((title, index) => (
                  <li key={index}>
                    {title}
                    <button 
                      type="button" 
                      className="use-suggestion"
                      onClick={() => applyTitleSuggestion(title)}
                    >
                      Use
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={courseData.category}
                onChange={handleCategoryChange}
                className={errors.category ? 'error' : ''}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && <div className="error-message">{errors.category}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="subcategory">Subcategory</label>
              <select
                id="subcategory"
                name="subcategory"
                value={courseData.subcategory}
                onChange={handleChange}
                disabled={!courseData.category}
              >
                <option value="">Select a subcategory</option>
                {subcategories.map((subcategory, index) => (
                  <option key={index} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Course Language(s) *</label>
            <div className="language-options">
              {LANGUAGES.map(language => (
                <div key={language.id} className="language-option">
                  <input
                    type="checkbox"
                    id={`lang-${language.id}`}
                    value={language.name}
                    checked={courseData.languages.includes(language.name)}
                    onChange={handleLanguageChange}
                  />
                  <label htmlFor={`lang-${language.id}`}>{language.name}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="summary">Course Summary *</label>
            <textarea
              id="summary"
              name="summary"
              value={courseData.summary}
              onChange={handleChange}
              placeholder="Provide a brief description of what your course covers"
              rows={4}
              className={errors.summary ? 'error' : ''}
            />
            {errors.summary && <div className="error-message">{errors.summary}</div>}
            
            <button 
              type="button" 
              className="ai-suggest-button"
              onClick={handleSuggestSummary}
              disabled={aiSuggestions.loadingSummary}
            >
              {aiSuggestions.loadingSummary ? 'Generating...' : 'Generate AI Summary'}
            </button>

            {aiSuggestions.summary && (
              <div className="ai-suggestions">
                <h4>Summary Suggestion</h4>
                <div className="summary-suggestion">
                  <p>{aiSuggestions.summary}</p>
                  <button 
                    type="button" 
                    className="use-suggestion"
                    onClick={applySummarySuggestion}
                  >
                    Use This Summary
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Course Objectives / Outcomes *</label>
            {errors.objectives && <div className="error-message">{errors.objectives}</div>}
            
            {courseData.objectives.map((objective, index) => (
              <div key={index} className="objective-input">
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => handleObjectiveChange(index, e.target.value)}
                  placeholder={`Objective ${index + 1}`}
                />
                <button 
                  type="button" 
                  className="remove-button"
                  onClick={() => removeObjective(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            
            <button 
              type="button" 
              className="add-button"
              onClick={addObjective}
            >
              + Add Objective
            </button>
            <p className="help-text">
              Write clear statements about what learners will be able to do after completing the course.
            </p>
          </div>
        </div>

        {errors.aiSuggestion && (
          <div className="error-message ai-error">{errors.aiSuggestion}</div>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            className="primary-button"
          >
            Continue to Curriculum Builder
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseOverview;