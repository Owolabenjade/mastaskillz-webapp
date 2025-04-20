import React, { useState, useContext } from 'react';
import { CourseContext } from '../../../context/CourseContext';
import ModuleCreator from './ModuleCreator';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const CurriculumBuilder = ({ nextStep, prevStep }) => {
  const { courseData, updateCourseData, addModule } = useContext(CourseContext);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [errors, setErrors] = useState({});

  const handleAddModule = () => {
    const newModuleId = addModule({
      title: `Module ${courseData.modules.length + 1}`,
      description: '',
      lessons: [],
      quizzes: []
    });
    setActiveModuleId(newModuleId);
  };

  const handleModuleSelect = (moduleId) => {
    setActiveModuleId(moduleId === activeModuleId ? null : moduleId);
  };

  const validateCurriculum = () => {
    const newErrors = {};
    
    if (courseData.modules.length === 0) {
      newErrors.modules = 'You need to create at least one module';
      return newErrors;
    }
    
    // Check if modules have content
    const emptyModules = courseData.modules.filter(
      module => module.lessons.length === 0 && module.quizzes.length === 0
    );
    
    if (emptyModules.length > 0) {
      newErrors.content = 'All modules must have at least one lesson or quiz';
    }
    
    return newErrors;
  };

  const handleNext = () => {
    const errors = validateCurriculum();
    
    if (Object.keys(errors).length === 0) {
      nextStep();
    } else {
      setErrors(errors);
      
      // Scroll to error message
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Handle drag and drop reordering
  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const { source, destination, type } = result;
    
    // If dropped outside the list or in the same position
    if (!destination || 
        (source.droppableId === destination.droppableId && 
         source.index === destination.index)) {
      return;
    }
    
    if (type === 'module') {
      // Handle module reordering
      const reorderedModules = [...courseData.modules];
      const [removed] = reorderedModules.splice(source.index, 1);
      reorderedModules.splice(destination.index, 0, removed);
      
      updateCourseData({ modules: reorderedModules });
    }
  };

  return (
    <div className="curriculum-builder-container">
      <h2>Curriculum Builder</h2>
      <p className="section-description">
        Structure your course by creating modules, lessons, and quizzes.
      </p>

      {Object.keys(errors).length > 0 && (
        <div className="error-section">
          {errors.modules && <div className="error-message">{errors.modules}</div>}
          {errors.content && <div className="error-message">{errors.content}</div>}
        </div>
      )}

      <div className="curriculum-workspace">
        <div className="modules-sidebar">
          <h3>Modules</h3>
          <button 
            className="add-module-button" 
            onClick={handleAddModule}
          >
            + Add Module
          </button>

          {courseData.modules.length === 0 ? (
            <div className="empty-state">
              <p>No modules yet. Click "Add Module" to start building your curriculum.</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="modules" type="module">
                {(provided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="modules-list"
                  >
                    {courseData.modules.map((module, index) => (
                      <Draggable 
                        key={module.id} 
                        draggableId={module.id} 
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`module-item ${activeModuleId === module.id ? 'active' : ''}`}
                            onClick={() => handleModuleSelect(module.id)}
                          >
                            <div className="module-info">
                              <span className="module-number">{index + 1}</span>
                              <span className="module-title">{module.title || `Module ${index + 1}`}</span>
                            </div>
                            <div className="module-stats">
                              <span className="lesson-count">{module.lessons.length} {module.lessons.length === 1 ? 'Lesson' : 'Lessons'}</span>
                              <span className="quiz-count">{module.quizzes.length} {module.quizzes.length === 1 ? 'Quiz' : 'Quizzes'}</span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>

        <div className="module-content">
          {activeModuleId ? (
            <ModuleCreator 
              moduleId={activeModuleId} 
            />
          ) : (
            <div className="module-placeholder">
              <div className="placeholder-content">
                <h3>Select or Create a Module</h3>
                <p>Click on a module from the sidebar or create a new one to start adding content.</p>
                {courseData.modules.length === 0 && (
                  <button 
                    className="add-module-button secondary" 
                    onClick={handleAddModule}
                  >
                    + Add Your First Module
                  </button>
                )}
              </div>
            </div>
          )}
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
          onClick={handleNext}
        >
          Continue to Localization
        </button>
      </div>
    </div>
  );
};

export default CurriculumBuilder;