import React, { useState, useContext, useEffect } from 'react';
import { CourseContext } from '../../../context/CourseContext';
import { aiService } from '../api/aiService';

const QUESTION_TYPES = [
  { id: 'mcq', name: 'Multiple Choice' },
  { id: 'truefalse', name: 'True/False' },
  { id: 'shortanswer', name: 'Short Answer' }
];

const QuizBuilder = ({ moduleId, quizId }) => {
  const { courseData, updateQuiz, deleteQuiz } = useContext(CourseContext);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [aiError, setAiError] = useState('');
  
  // Find current module and quiz
  const module = courseData.modules.find(mod => mod.id === moduleId);
  const quiz = module?.quizzes.find(q => q.id === quizId);

  // Initialize form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: []
  });

  // Update form when quiz changes
  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title || '',
        description: quiz.description || '',
        questions: quiz.questions || []
      });
    }
  }, [quiz]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save quiz data
  const handleSave = () => {
    if (quiz) {
      updateQuiz(moduleId, quizId, formData);
    }
  };

  // Auto-save when form data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (quiz && 
          (formData.title !== quiz.title || 
           formData.description !== quiz.description)) {
        handleSave();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData.title, formData.description]);

  // Save when questions change
  useEffect(() => {
    if (quiz && JSON.stringify(formData.questions) !== JSON.stringify(quiz.questions)) {
      handleSave();
    }
  }, [formData.questions]);

  // Handle delete quiz
  const handleDeleteQuiz = () => {
    setIsConfirmDelete(true);
  };

  const confirmDeleteQuiz = () => {
    deleteQuiz(moduleId, quizId);
    setIsConfirmDelete(false);
  };

  const cancelDelete = () => {
    setIsConfirmDelete(false);
  };

  // Add new question
  const addQuestion = (type = 'mcq') => {
    let newQuestion;
    
    switch (type) {
      case 'mcq':
        newQuestion = {
          id: `question_${Date.now()}`,
          type: 'mcq',
          text: '',
          options: [
            { id: `option_${Date.now()}_1`, text: '', isCorrect: false },
            { id: `option_${Date.now()}_2`, text: '', isCorrect: false },
            { id: `option_${Date.now()}_3`, text: '', isCorrect: false },
            { id: `option_${Date.now()}_4`, text: '', isCorrect: false }
          ]
        };
        break;
        
      case 'truefalse':
        newQuestion = {
          id: `question_${Date.now()}`,
          type: 'truefalse',
          text: '',
          correctAnswer: null // true or false
        };
        break;
        
      case 'shortanswer':
        newQuestion = {
          id: `question_${Date.now()}`,
          type: 'shortanswer',
          text: '',
          acceptedAnswers: [''] // Array of accepted answers
        };
        break;
        
      default:
        newQuestion = {
          id: `question_${Date.now()}`,
          type: 'mcq',
          text: '',
          options: [
            { id: `option_${Date.now()}_1`, text: '', isCorrect: false },
            { id: `option_${Date.now()}_2`, text: '', isCorrect: false },
            { id: `option_${Date.now()}_3`, text: '', isCorrect: false },
            { id: `option_${Date.now()}_4`, text: '', isCorrect: false }
          ]
        };
    }
    
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  // Update question text
  const handleQuestionTextChange = (questionId, text) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, text } : q
      )
    }));
  };

  // Update MCQ option
  const handleOptionChange = (questionId, optionId, text) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map(opt => 
              opt.id === optionId ? { ...opt, text } : opt
            )
          };
        }
        return q;
      })
    }));
  };

  // Set correct MCQ option
  const handleSetCorrectOption = (questionId, optionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map(opt => ({
              ...opt,
              isCorrect: opt.id === optionId
            }))
          };
        }
        return q;
      })
    }));
  };

  // Set True/False answer
  const handleTrueFalseChange = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, correctAnswer: value } : q
      )
    }));
  };

  // Update Short Answer accepted answers
  const handleAcceptedAnswerChange = (questionId, index, text) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          const newAcceptedAnswers = [...q.acceptedAnswers];
          newAcceptedAnswers[index] = text;
          return { ...q, acceptedAnswers: newAcceptedAnswers };
        }
        return q;
      })
    }));
  };

  // Add another accepted answer
  const addAcceptedAnswer = (questionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            acceptedAnswers: [...q.acceptedAnswers, '']
          };
        }
        return q;
      })
    }));
  };

  // Remove an accepted answer
  const removeAcceptedAnswer = (questionId, index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && q.acceptedAnswers.length > 1) {
          const newAcceptedAnswers = [...q.acceptedAnswers];
          newAcceptedAnswers.splice(index, 1);
          return { ...q, acceptedAnswers: newAcceptedAnswers };
        }
        return q;
      })
    }));
  };

  // Remove question
  const removeQuestion = (questionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  // Generate AI questions
  const generateAIQuestions = async () => {
    setIsGeneratingQuestions(true);
    setAiError('');
    
    try {
      // Get course and module data for context
      const courseTitle = courseData.title;
      const moduleLessons = module.lessons.map(lesson => ({
        title: lesson.title,
        description: lesson.description
      }));
      
      const generatedQuestions = await aiService.generateQuizQuestions({
        courseTitle,
        moduleTitle: module.title,
        moduleDescription: module.description,
        lessons: moduleLessons,
        numberOfQuestions: 5 // Generate 5 questions
      });
      
      // Add generated questions to existing questions
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, ...generatedQuestions]
      }));
    } catch (error) {
      console.error('Error generating questions:', error);
      setAiError('Failed to generate questions. Please try again.');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  if (!quiz) {
    return <div className="quiz-not-found">Quiz not found</div>;
  }

  return (
    <div className="quiz-builder">
      <div className="quiz-header">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Quiz Title"
          className="quiz-title-input"
        />
        <div className="quiz-actions">
          <button 
            className="delete-button" 
            onClick={handleDeleteQuiz}
          >
            Delete Quiz
          </button>
        </div>
      </div>

      <div className="quiz-description">
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Quiz Description (optional)"
          rows={2}
        />
      </div>

      <div className="ai-generator-section">
        <h4>AI Question Generator</h4>
        <p>Let AI generate quiz questions based on your module content.</p>
        <button 
          className="generate-questions-button"
          onClick={generateAIQuestions}
          disabled={isGeneratingQuestions}
        >
          {isGeneratingQuestions ? 'Generating...' : 'Generate Quiz Questions'}
        </button>
        {aiError && <div className="error-message">{aiError}</div>}
      </div>

      <div className="questions-section">
        <div className="questions-header">
          <h4>Questions ({formData.questions.length})</h4>
          <div className="question-type-selector">
            <label>Add Question:</label>
            <div className="question-type-buttons">
              {QUESTION_TYPES.map(type => (
                <button
                  key={type.id}
                  className="add-question-button"
                  onClick={() => addQuestion(type.id)}
                >
                  + {type.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {formData.questions.length === 0 ? (
          <div className="empty-questions">
            <p>No questions added yet. Add questions or use the AI generator to create quiz questions.</p>
          </div>
        ) : (
          <div className="questions-list">
            {formData.questions.map((question, qIndex) => (
              <div key={question.id} className="question-item">
                <div className="question-header">
                  <div className="question-number">Question {qIndex + 1}</div>
                  <div className="question-type-indicator">{
                    question.type === 'mcq' ? 'Multiple Choice' :
                    question.type === 'truefalse' ? 'True/False' : 'Short Answer'
                  }</div>
                  <button 
                    className="remove-question-button"
                    onClick={() => removeQuestion(question.id)}
                  >
                    Remove
                  </button>
                </div>
                
                <div className="question-content">
                  <textarea
                    value={question.text}
                    onChange={(e) => handleQuestionTextChange(question.id, e.target.value)}
                    placeholder="Enter question text"
                    rows={2}
                    className="question-text-input"
                  />
                  
                  {question.type === 'mcq' && (
                    <div className="options-list">
                      {question.options.map((option, index) => (
                        <div key={option.id} className="option-item">
                          <input
                            type="radio"
                            id={option.id}
                            name={`question_${question.id}_correct`}
                            checked={option.isCorrect}
                            onChange={() => handleSetCorrectOption(question.id, option.id)}
                          />
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => handleOptionChange(question.id, option.id, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className={`option-input ${option.isCorrect ? 'correct-option' : ''}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'truefalse' && (
                    <div className="true-false-options">
                      <div className="true-false-option">
                        <input
                          type="radio"
                          id={`${question.id}_true`}
                          name={`question_${question.id}_tf`}
                          checked={question.correctAnswer === true}
                          onChange={() => handleTrueFalseChange(question.id, true)}
                        />
                        <label htmlFor={`${question.id}_true`}>True</label>
                      </div>
                      <div className="true-false-option">
                        <input
                          type="radio"
                          id={`${question.id}_false`}
                          name={`question_${question.id}_tf`}
                          checked={question.correctAnswer === false}
                          onChange={() => handleTrueFalseChange(question.id, false)}
                        />
                        <label htmlFor={`${question.id}_false`}>False</label>
                      </div>
                    </div>
                  )}
                  
                  {question.type === 'shortanswer' && (
                    <div className="short-answer-section">
                      <label>Accepted Answers:</label>
                      {question.acceptedAnswers.map((answer, index) => (
                        <div key={index} className="accepted-answer-item">
                          <input
                            type="text"
                            value={answer}
                            onChange={(e) => handleAcceptedAnswerChange(question.id, index, e.target.value)}
                            placeholder={`Accepted Answer ${index + 1}`}
                            className="accepted-answer-input"
                          />
                          {question.acceptedAnswers.length > 1 && (
                            <button 
                              className="remove-answer-button"
                              onClick={() => removeAcceptedAnswer(question.id, index)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button 
                        className="add-answer-button"
                        onClick={() => addAcceptedAnswer(question.id)}
                      >
                        + Add Another Accepted Answer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isConfirmDelete && (
        <div className="modal-overlay">
          <div className="confirm-dialog">
            <h4>Confirm Deletion</h4>
            <p>Are you sure you want to delete this quiz? This action cannot be undone.</p>
            <div className="dialog-actions">
              <button 
                className="secondary-button" 
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button 
                className="danger-button" 
                onClick={confirmDeleteQuiz}
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

export default QuizBuilder;