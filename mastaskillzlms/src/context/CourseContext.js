import React, { createContext, useState, useEffect } from 'react';
import { courseService } from '../services/api';

// Initial state for a new course
const initialCourseState = {
  id: null,
  title: '',
  category: '',
  subcategory: '',
  languages: ['English'],
  summary: '',
  objectives: [],
  modules: [],
  translations: {},
  accessibility: {
    captions: false,
    mobileFriendly: true
  },
  pricing: {
    courseType: 'free', // 'free', 'freemium', 'paid'
    price: 0,
    freemiumContent: [] // IDs of free modules/lessons for freemium courses
  },
  status: 'draft', // 'draft', 'published'
  createdAt: null,
  updatedAt: null
};

export const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [courseData, setCourseData] = useState(initialCourseState);
  const [courseId, setCourseId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load course if editing an existing one
  useEffect(() => {
    const loadCourse = async (id) => {
      setLoading(true);
      setError(null);
      try {
        const data = await courseService.getCourseById(id);
        setCourseData(data);
      } catch (err) {
        setError('Failed to load course data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      loadCourse(courseId);
    }
  }, [courseId]);

  // Reset course data to initial state
  const resetCourse = () => {
    setCourseData(initialCourseState);
    setCourseId(null);
  };

  // Set course for editing
  const setEditCourse = (id) => {
    setCourseId(id);
  };

  // Update course data
  const updateCourseData = (updates) => {
    setCourseData(prevData => ({
      ...prevData,
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  };

  // Update a specific module
  const updateModule = (moduleId, moduleData) => {
    setCourseData(prevData => ({
      ...prevData,
      modules: prevData.modules.map(module => 
        module.id === moduleId ? { ...module, ...moduleData } : module
      ),
      updatedAt: new Date().toISOString()
    }));
  };

  // Add a new module
  const addModule = (moduleData) => {
    const newModule = {
      id: `module_${Date.now()}`,
      title: '',
      description: '',
      lessons: [],
      quizzes: [],
      ...moduleData,
    };

    setCourseData(prevData => ({
      ...prevData,
      modules: [...prevData.modules, newModule],
      updatedAt: new Date().toISOString()
    }));

    return newModule.id;
  };

  // Delete a module
  const deleteModule = (moduleId) => {
    setCourseData(prevData => ({
      ...prevData,
      modules: prevData.modules.filter(module => module.id !== moduleId),
      updatedAt: new Date().toISOString()
    }));
  };

  // Add a lesson to a module
  const addLesson = (moduleId, lessonData) => {
    const newLesson = {
      id: `lesson_${Date.now()}`,
      title: '',
      contentType: 'video',
      content: null,
      ...lessonData,
    };

    setCourseData(prevData => ({
      ...prevData,
      modules: prevData.modules.map(module => {
        if (module.id === moduleId) {
          return {
            ...module,
            lessons: [...module.lessons, newLesson]
          };
        }
        return module;
      }),
      updatedAt: new Date().toISOString()
    }));

    return newLesson.id;
  };

  // Update a specific lesson
  const updateLesson = (moduleId, lessonId, lessonData) => {
    setCourseData(prevData => ({
      ...prevData,
      modules: prevData.modules.map(module => {
        if (module.id === moduleId) {
          return {
            ...module,
            lessons: module.lessons.map(lesson => 
              lesson.id === lessonId ? { ...lesson, ...lessonData } : lesson
            )
          };
        }
        return module;
      }),
      updatedAt: new Date().toISOString()
    }));
  };

  // Delete a lesson
  const deleteLesson = (moduleId, lessonId) => {
    setCourseData(prevData => ({
      ...prevData,
      modules: prevData.modules.map(module => {
        if (module.id === moduleId) {
          return {
            ...module,
            lessons: module.lessons.filter(lesson => lesson.id !== lessonId)
          };
        }
        return module;
      }),
      updatedAt: new Date().toISOString()
    }));
  };

  // Add a quiz to a module
  const addQuiz = (moduleId, quizData) => {
    const newQuiz = {
      id: `quiz_${Date.now()}`,
      title: '',
      questions: [],
      ...quizData,
    };

    setCourseData(prevData => ({
      ...prevData,
      modules: prevData.modules.map(module => {
        if (module.id === moduleId) {
          return {
            ...module,
            quizzes: [...module.quizzes, newQuiz]
          };
        }
        return module;
      }),
      updatedAt: new Date().toISOString()
    }));

    return newQuiz.id;
  };

  // Update a specific quiz
  const updateQuiz = (moduleId, quizId, quizData) => {
    setCourseData(prevData => ({
      ...prevData,
      modules: prevData.modules.map(module => {
        if (module.id === moduleId) {
          return {
            ...module,
            quizzes: module.quizzes.map(quiz => 
              quiz.id === quizId ? { ...quiz, ...quizData } : quiz
            )
          };
        }
        return module;
      }),
      updatedAt: new Date().toISOString()
    }));
  };

  // Delete a quiz
  const deleteQuiz = (moduleId, quizId) => {
    setCourseData(prevData => ({
      ...prevData,
      modules: prevData.modules.map(module => {
        if (module.id === moduleId) {
          return {
            ...module,
            quizzes: module.quizzes.filter(quiz => quiz.id !== quizId)
          };
        }
        return module;
      }),
      updatedAt: new Date().toISOString()
    }));
  };

  // Save course (draft or publish)
  const saveCourse = async (courseData, publish = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const dataToSave = {
        ...courseData,
        status: publish ? 'published' : 'draft',
        updatedAt: new Date().toISOString()
      };
      
      if (!dataToSave.createdAt) {
        dataToSave.createdAt = new Date().toISOString();
      }

      let savedCourse;
      if (dataToSave.id) {
        savedCourse = await courseService.updateCourse(dataToSave.id, dataToSave);
      } else {
        savedCourse = await courseService.createCourse(dataToSave);
      }

      setCourseData(savedCourse);
      return savedCourse;
    } catch (err) {
      setError('Failed to save course.');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Save as draft
  const saveDraft = async (courseData) => {
    return saveCourse(courseData, false);
  };

  // Publish course
  const publishCourse = async (courseData) => {
    return saveCourse(courseData, true);
  };

  const value = {
    courseData,
    loading,
    error,
    resetCourse,
    setEditCourse,
    updateCourseData,
    addModule,
    updateModule,
    deleteModule,
    addLesson,
    updateLesson,
    deleteLesson,
    addQuiz,
    updateQuiz,
    deleteQuiz,
    saveCourse,
    saveDraft,
    publishCourse
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};