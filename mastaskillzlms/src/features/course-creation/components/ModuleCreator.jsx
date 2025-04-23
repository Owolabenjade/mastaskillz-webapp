import React, { useState, useContext, useEffect, useCallback } from 'react';
import { CourseContext } from '../../../context/CourseContext';
import LessonCreator from './LessonCreator';
import QuizBuilder from './QuizBuilder';

const ModuleCreator = ({ moduleId }) => {
  const { courseData, updateModule, deleteModule, addLesson, addQuiz } = useContext(CourseContext);
  const [activeItemId, setActiveItemId] = useState(null);
  const [activeItemType, setActiveItemType] = useState(null); // 'lesson' or 'quiz'
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');

  // Find the current module
  const module = courseData.modules.find(mod => mod.id === moduleId);

  // Initialize form state
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  // Update form when module changes
  useEffect(() => {
    if (module) {
      setFormData({
        title: module.title || '',
        description: module.description || ''
      });
    }
  }, [module]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save module data with useCallback to prevent dependency issues
  const handleSave = useCallback(() => {
    if (module) {
      updateModule(moduleId, formData);
    }
  }, [moduleId, formData, module, updateModule]);

  // Auto-save when form data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (module && (formData.title !== module.title || formData.description !== module.description)) {
        handleSave();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData.title, formData.description, module, handleSave]);

  // Handle add lesson
  const handleAddLesson = () => {
    const newLessonId = addLesson(moduleId, {
      title: `Lesson ${module.lessons.length + 1}`,
      contentType: 'video',
      content: null
    });
    
    setActiveItemId(newLessonId);
    setActiveItemType('lesson');
  };

  // Handle add quiz
  const handleAddQuiz = () => {
    const newQuizId = addQuiz(moduleId, {
      title: `Quiz ${module.quizzes.length + 1}`,
      questions: []
    });
    
    setActiveItemId(newQuizId);
    setActiveItemType('quiz');
  };

  // Handle delete module
  const handleDeleteModule = () => {
    setIsConfirmDelete(true);
    setConfirmMessage(`Are you sure you want to delete "${module.title}"? This action cannot be undone.`);
  };

  const confirmDeleteModule = () => {
    deleteModule(moduleId);
    setIsConfirmDelete(false);
  };

  const cancelDelete = () => {
    setIsConfirmDelete(false);
  };

  // Handle item selection
  const handleItemSelect = (itemId, itemType) => {
    setActiveItemId(itemId === activeItemId ? null : itemId);
    setActiveItemType(itemId === activeItemId ? null : itemType);
  };

  // Create combined list of lessons and quizzes for display
  const createContentList = () => {
    let contentList = [];
    
    // Add lessons with type
    if (module?.lessons) {
      contentList = contentList.concat(
        module.lessons.map(lesson => ({
          ...lesson,
          contentType: 'lesson'
        }))
      );
    }
    
    // Add quizzes with type
    if (module?.quizzes) {
      contentList = contentList.concat(
        module.quizzes.map(quiz => ({
          ...quiz,
          contentType: 'quiz'
        }))
      );
    }
    
    return contentList;
  };

  const contentList = createContentList();

  if (!module) {
    return <div className="module-not-found">Module not found</div>;
  }

  return (
    <div className="module-creator">
      <div className="module-header">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Module Title"
          className="module-title-input"
        />
        <div className="module-actions">
          <button 
            className="delete-button" 
            onClick={handleDeleteModule}
          >
            Delete Module
          </button>
        </div>
      </div>

      <div className="module-description">
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Module Description (optional)"
          rows={2}
        />
      </div>

      <div className="module-content-section">
        <div className="content-header">
          <h3>Content</h3>
          <div className="content-actions">
            <button 
              className="add-lesson-button" 
              onClick={handleAddLesson}
            >
              + Add Lesson
            </button>
            <button 
              className="add-quiz-button" 
              onClick={handleAddQuiz}
            >
              + Add Quiz
            </button>
          </div>
        </div>

        {contentList.length === 0 ? (
          <div className="empty-content">
            <p>This module has no content yet. Add lessons or quizzes to build your curriculum.</p>
          </div>
        ) : (
          <div className="content-list">
            {contentList.map((item, index) => (
              <div
                key={item.id}
                className={`content-item ${activeItemId === item.id ? 'active' : ''} ${item.contentType}-item`}
                onClick={() => handleItemSelect(item.id, item.contentType)}
              >
                <div className="content-item-icon">
                  {item.contentType === 'lesson' ? '📚' : '📝'}
                </div>
                <div className="content-item-details">
                  <div className="content-item-title">{item.title}</div>
                  <div className="content-item-type">
                    {item.contentType === 'lesson' ? 
                      `Lesson • ${item.contentType === 'video' ? 'Video' : 'Interactive'}` : 
                      `Quiz • ${item.questions?.length || 0} questions`}
                  </div>
                </div>
                <div className="content-item-handle">⋮</div>
              </div>
            ))}
          </div>
        )}

        <div className="content-editor">
          {activeItemId && activeItemType === 'lesson' && (
            <LessonCreator 
              moduleId={moduleId} 
              lessonId={activeItemId} 
            />
          )}

          {activeItemId && activeItemType === 'quiz' && (
            <QuizBuilder 
              moduleId={moduleId} 
              quizId={activeItemId} 
            />
          )}
        </div>
      </div>

      {isConfirmDelete && (
        <div className="modal-overlay">
          <div className="confirm-dialog">
            <h4>Confirm Deletion</h4>
            <p>{confirmMessage}</p>
            <div className="dialog-actions">
              <button 
                className="secondary-button" 
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button 
                className="danger-button" 
                onClick={confirmDeleteModule}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleCreator;