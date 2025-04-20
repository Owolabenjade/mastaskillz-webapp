// Firebase implementation of course service
import { 
    collection, 
    doc, 
    addDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy 
  } from 'firebase/firestore';
  import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { db, storage } from '../../../services/firebase';
  
  class CourseService {
    constructor() {
      this.coursesCollection = collection(db, 'courses');
    }
  
    // Get all courses
    async getCourses() {
      try {
        const querySnapshot = await getDocs(this.coursesCollection);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error getting courses:', error);
        throw error;
      }
    }
  
    // Get a course by ID
    async getCourseById(id) {
      try {
        const docRef = doc(db, 'courses', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          return {
            id: docSnap.id,
            ...docSnap.data()
          };
        } else {
          throw new Error(`Course with id ${id} not found`);
        }
      } catch (error) {
        console.error('Error getting course:', error);
        throw error;
      }
    }
  
    // Create a new course
    async createCourse(courseData) {
      try {
        // Add timestamps
        const newCourse = {
          ...courseData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const docRef = await addDoc(this.coursesCollection, newCourse);
        
        return {
          id: docRef.id,
          ...newCourse
        };
      } catch (error) {
        console.error('Error creating course:', error);
        throw error;
      }
    }
  
    // Update an existing course
    async updateCourse(id, courseData) {
      try {
        const courseRef = doc(db, 'courses', id);
        
        // Add updated timestamp
        const updatedCourse = {
          ...courseData,
          updatedAt: new Date().toISOString()
        };
        
        await updateDoc(courseRef, updatedCourse);
        
        return {
          id,
          ...updatedCourse
        };
      } catch (error) {
        console.error('Error updating course:', error);
        throw error;
      }
    }
  
    // Delete a course
    async deleteCourse(id) {
      try {
        const courseRef = doc(db, 'courses', id);
        await deleteDoc(courseRef);
        
        return { success: true };
      } catch (error) {
        console.error('Error deleting course:', error);
        throw error;
      }
    }
  
    // Get courses by creator
    async getCoursesByCreator(creatorId) {
      try {
        const q = query(
          this.coursesCollection, 
          where('creatorId', '==', creatorId),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error getting courses by creator:', error);
        throw error;
      }
    }
  
    // Get published courses
    async getPublishedCourses() {
      try {
        const q = query(
          this.coursesCollection, 
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error getting published courses:', error);
        throw error;
      }
    }
  
    // Get course analytics
    async getCourseAnalytics(courseId) {
      try {
        // In a real implementation, this would fetch analytics data from Firebase
        // For now, we'll use the Firebase analytics collection
        const analyticsRef = collection(db, 'courseAnalytics');
        const q = query(analyticsRef, where('courseId', '==', courseId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          return querySnapshot.docs[0].data();
        } else {
          // Return default analytics if none exist yet
          return {
            courseId,
            views: 0,
            enrollments: 0,
            completionRate: 0,
            averageRating: 0,
            reviews: 0,
          };
        }
      } catch (error) {
        console.error('Error getting course analytics:', error);
        throw error;
      }
    }
  
    // Upload course image
    async uploadCourseImage(file, courseId) {
      try {
        const storageRef = ref(storage, `courses/${courseId}/images/${file.name}`);
        await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(storageRef);
        
        return { url: imageUrl };
      } catch (error) {
        console.error('Error uploading course image:', error);
        throw error;
      }
    }
  
    // Upload course video
    async uploadCourseVideo(file, courseId, moduleId, lessonId) {
      try {
        const storageRef = ref(
          storage, 
          `courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/videos/${file.name}`
        );
        
        await uploadBytes(storageRef, file);
        const videoUrl = await getDownloadURL(storageRef);
        
        return { 
          url: videoUrl,
          fileName: file.name
        };
      } catch (error) {
        console.error('Error uploading course video:', error);
        throw error;
      }
    }
  
    // Add a new enrollment to a course
    async enrollInCourse(courseId, userId) {
      try {
        const enrollmentData = {
          courseId,
          userId,
          enrolledAt: new Date().toISOString(),
          status: 'active',
          progress: 0,
          completedLessons: []
        };
        
        const enrollmentsCollection = collection(db, 'enrollments');
        await addDoc(enrollmentsCollection, enrollmentData);
        
        // Update course enrollment count
        const courseRef = doc(db, 'courses', courseId);
        const courseDoc = await getDoc(courseRef);
        const courseData = courseDoc.data();
        
        await updateDoc(courseRef, {
          enrollmentCount: (courseData.enrollmentCount || 0) + 1
        });
        
        return { success: true };
      } catch (error) {
        console.error('Error enrolling in course:', error);
        throw error;
      }
    }
  
    // Get user's enrolled courses
    async getUserEnrolledCourses(userId) {
      try {
        const enrollmentsCollection = collection(db, 'enrollments');
        const q = query(
          enrollmentsCollection, 
          where('userId', '==', userId),
          orderBy('enrolledAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const enrollments = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Get the course details for each enrollment
        const coursePromises = enrollments.map(enrollment => 
          this.getCourseById(enrollment.courseId)
        );
        
        const courses = await Promise.all(coursePromises);
        
        // Combine enrollment and course data
        return enrollments.map((enrollment, index) => ({
          ...enrollment,
          course: courses[index]
        }));
      } catch (error) {
        console.error('Error getting user enrolled courses:', error);
        throw error;
      }
    }
  
    // Update lesson progress for a user
    async updateLessonProgress(enrollmentId, lessonId, complete = true) {
      try {
        const enrollmentRef = doc(db, 'enrollments', enrollmentId);
        const enrollmentSnap = await getDoc(enrollmentRef);
        
        if (enrollmentSnap.exists()) {
          const enrollmentData = enrollmentSnap.data();
          let completedLessons = enrollmentData.completedLessons || [];
          
          if (complete && !completedLessons.includes(lessonId)) {
            completedLessons.push(lessonId);
          } else if (!complete && completedLessons.includes(lessonId)) {
            completedLessons = completedLessons.filter(id => id !== lessonId);
          }
          
          // Update enrollment with new completed lessons
          await updateDoc(enrollmentRef, {
            completedLessons,
            updatedAt: new Date().toISOString()
          });
          
          return { success: true };
        } else {
          throw new Error(`Enrollment with id ${enrollmentId} not found`);
        }
      } catch (error) {
        console.error('Error updating lesson progress:', error);
        throw error;
      }
    }
  }
  
  export const courseService = new CourseService();