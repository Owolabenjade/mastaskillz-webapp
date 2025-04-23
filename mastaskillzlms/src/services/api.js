// src/services/api.js
export const courseService = {
    // Mock storage for courses
    courses: localStorage.getItem('mastaskillz_courses') 
      ? JSON.parse(localStorage.getItem('mastaskillz_courses')) 
      : [],
  
    // Save courses to localStorage
    _saveCourses() {
      localStorage.setItem('mastaskillz_courses', JSON.stringify(this.courses));
    },
  
    // Get all courses
    async getCourses() {
      return [...this.courses];
    },
  
    // Get a course by ID
    async getCourseById(id) {
      const course = this.courses.find(course => course.id === id);
      
      if (!course) {
        throw new Error(`Course with id ${id} not found`);
      }
      
      return { ...course };
    },
  
    // Create a new course
    async createCourse(courseData) {
      const newCourse = {
        ...courseData,
        id: `course_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.courses.push(newCourse);
      this._saveCourses();
      
      return { ...newCourse };
    },
  
    // Update an existing course
    async updateCourse(id, courseData) {
      const courseIndex = this.courses.findIndex(course => course.id === id);
      
      if (courseIndex === -1) {
        throw new Error(`Course with id ${id} not found`);
      }
      
      const updatedCourse = {
        ...this.courses[courseIndex],
        ...courseData,
        updatedAt: new Date().toISOString()
      };
      
      this.courses[courseIndex] = updatedCourse;
      this._saveCourses();
      
      return { ...updatedCourse };
    },
  
    // Delete a course
    async deleteCourse(id) {
      const courseIndex = this.courses.findIndex(course => course.id === id);
      
      if (courseIndex === -1) {
        throw new Error(`Course with id ${id} not found`);
      }
      
      this.courses.splice(courseIndex, 1);
      this._saveCourses();
      
      return { success: true };
    },
  };