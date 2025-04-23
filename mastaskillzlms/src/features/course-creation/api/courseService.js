const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class CourseService {
  constructor() {
    // Mock storage for courses
    this.courses = localStorage.getItem('mastaskillz_courses') 
      ? JSON.parse(localStorage.getItem('mastaskillz_courses')) 
      : [];
  }

  // Save courses to localStorage
  _saveCourses() {
    localStorage.setItem('mastaskillz_courses', JSON.stringify(this.courses));
  }

  // Get all courses
  async getCourses() {
    // Simulate API delay
    await delay(500);
    return [...this.courses];
  }

  // Get a course by ID
  async getCourseById(id) {
    // Simulate API delay
    await delay(300);
    const course = this.courses.find(course => course.id === id);
    
    if (!course) {
      throw new Error(`Course with id ${id} not found`);
    }
    
    return { ...course };
  }

  // Create a new course
  async createCourse(courseData) {
    // Simulate API delay
    await delay(800);
    
    const newCourse = {
      ...courseData,
      id: `course_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.courses.push(newCourse);
    this._saveCourses();
    
    return { ...newCourse };
  }

  // Update an existing course
  async updateCourse(id, courseData) {
    // Simulate API delay
    await delay(600);
    
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
  }

  // Delete a course
  async deleteCourse(id) {
    // Simulate API delay
    await delay(500);
    
    const courseIndex = this.courses.findIndex(course => course.id === id);
    
    if (courseIndex === -1) {
      throw new Error(`Course with id ${id} not found`);
    }
    
    this.courses.splice(courseIndex, 1);
    this._saveCourses();
    
    return { success: true };
  }

  // Get courses by creator
  async getCoursesByCreator(creatorId) {
    // Simulate API delay
    await delay(400);
    
    return this.courses
      .filter(course => course.creatorId === creatorId)
      .map(course => ({ ...course }));
  }

  // Get published courses
  async getPublishedCourses() {
    // Simulate API delay
    await delay(400);
    
    return this.courses
      .filter(course => course.status === 'published')
      .map(course => ({ ...course }));
  }

  // Get course analytics
  async getCourseAnalytics(courseId) {
    // Simulate API delay
    await delay(700);
    
    // Generate mock analytics data
    return {
      courseId,
      views: Math.floor(Math.random() * 1000),
      enrollments: Math.floor(Math.random() * 500),
      completionRate: Math.random() * 100,
      averageRating: 3.5 + Math.random() * 1.5,
      reviews: Math.floor(Math.random() * 100),
    };
  }

  // Upload course image (mock implementation)
  async uploadCourseImage(file, courseId) {
    // Simulate API delay
    await delay(1000);
    
    // Create an object URL for the image
    const imageUrl = URL.createObjectURL(file);
    
    return { url: imageUrl };
  }

  // Upload course video (mock implementation)
  async uploadCourseVideo(file, courseId, moduleId, lessonId) {
    // Simulate API delay
    await delay(2000);
    
    // Create an object URL for the video
    const videoUrl = URL.createObjectURL(file);
    
    return { 
      url: videoUrl,
      fileName: file.name
    };
  }

  // Add a new enrollment to a course (mock implementation)
  async enrollInCourse(courseId, userId) {
    // Simulate API delay
    await delay(800);
    
    const enrollmentData = {
      id: `enrollment_${Date.now()}`,
      courseId,
      userId,
      enrolledAt: new Date().toISOString(),
      status: 'active',
      progress: 0,
      completedLessons: []
    };
    
    // Store enrollment in localStorage
    let enrollments = localStorage.getItem('mastaskillz_enrollments')
      ? JSON.parse(localStorage.getItem('mastaskillz_enrollments'))
      : [];
    
    enrollments.push(enrollmentData);
    localStorage.setItem('mastaskillz_enrollments', JSON.stringify(enrollments));
    
    // Update course enrollment count
    const courseIndex = this.courses.findIndex(course => course.id === courseId);
    if (courseIndex !== -1) {
      this.courses[courseIndex].enrollmentCount = (this.courses[courseIndex].enrollmentCount || 0) + 1;
      this._saveCourses();
    }
    
    return { success: true };
  }
}

export const courseService = new CourseService();