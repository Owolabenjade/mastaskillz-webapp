// Firebase implementation of file upload utility
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../services/firebase';

class FileUploader {
  /**
   * Upload a video file
   * 
   * @param {File} file - The video file to upload
   * @param {Function} progressCallback - Callback function that receives upload progress (0-100)
   * @returns {Promise<Object>} Upload result with URL and metadata
   */
  async uploadVideo(file, progressCallback = () => {}) {
    try {
      // Generate a unique identifier for the file
      const fileId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const fileName = file.name.replace(/\s+/g, '_').toLowerCase();
      
      // Create a storage reference
      const storageRef = ref(storage, `videos/${fileId}/${fileName}`);
      
      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Set up progress monitoring
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Get upload progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressCallback(progress);
          },
          (error) => {
            // Handle unsuccessful uploads
            console.error('Upload error:', error);
            reject(error);
          },
          async () => {
            // Handle successful upload
            try {
              // Get download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              // Get metadata
              const metadata = uploadTask.snapshot.metadata;
              
              // Create thumbnail URL (in a real app, you might generate this with a Cloud Function)
              const thumbnailURL = `https://storage.googleapis.com/${metadata.bucket}/thumbnails/${fileId}/thumbnail.jpg`;
              
              // Calculate duration based on file size (approximation)
              const duration = this._calculateMockDuration(file.size);
              
              resolve({
                id: fileId,
                url: downloadURL,
                thumbnail: thumbnailURL,
                fileName: fileName,
                fileSize: file.size,
                fileType: file.type,
                uploadDate: new Date().toISOString(),
                duration: duration,
                width: 1920,
                height: 1080
              });
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error in uploadVideo:', error);
      throw error;
    }
  }

  /**
   * Upload a document file (PDF, DOCX, etc.)
   * 
   * @param {File} file - The document file to upload
   * @param {Function} progressCallback - Callback function that receives upload progress (0-100)
   * @returns {Promise<Object>} Upload result with URL and metadata
   */
  async uploadDocument(file, progressCallback = () => {}) {
    try {
      // Generate a unique identifier for the file
      const fileId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const fileName = file.name.replace(/\s+/g, '_').toLowerCase();
      
      // Create a storage reference
      const storageRef = ref(storage, `documents/${fileId}/${fileName}`);
      
      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Set up progress monitoring
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Get upload progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressCallback(progress);
          },
          (error) => {
            // Handle unsuccessful uploads
            console.error('Upload error:', error);
            reject(error);
          },
          async () => {
            // Handle successful upload
            try {
              // Get download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              // Get metadata
              const metadata = uploadTask.snapshot.metadata;
              
              resolve({
                id: fileId,
                url: downloadURL,
                fileName: fileName,
                fileSize: file.size,
                fileType: file.type,
                uploadDate: new Date().toISOString()
              });
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error in uploadDocument:', error);
      throw error;
    }
  }

  /**
   * Upload an image file
   * 
   * @param {File} file - The image file to upload
   * @param {Function} progressCallback - Callback function that receives upload progress (0-100)
   * @returns {Promise<Object>} Upload result with URL and metadata
   */
  async uploadImage(file, progressCallback = () => {}) {
    try {
      // Generate a unique identifier for the file
      const fileId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const fileName = file.name.replace(/\s+/g, '_').toLowerCase();
      
      // Create a storage reference
      const storageRef = ref(storage, `images/${fileId}/${fileName}`);
      
      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Set up progress monitoring
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Get upload progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressCallback(progress);
          },
          (error) => {
            // Handle unsuccessful uploads
            console.error('Upload error:', error);
            reject(error);
          },
          async () => {
            // Handle successful upload
            try {
              // Get download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              // Create an image object to get dimensions
              const img = new Image();
              img.src = URL.createObjectURL(file);
              
              await new Promise(resolve => {
                img.onload = resolve;
              });
              
              resolve({
                id: fileId,
                url: downloadURL,
                fileName: fileName,
                fileSize: file.size,
                fileType: file.type,
                uploadDate: new Date().toISOString(),
                width: img.width,
                height: img.height
              });
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error in uploadImage:', error);
      throw error;
    }
  }

  /**
   * Calculate a realistic video duration based on file size
   * 
   * @param {number} fileSize - The size of the file in bytes
   * @returns {number} Estimated duration in seconds
   */
  _calculateMockDuration(fileSize) {
    // Assume an average bitrate of 5 Mbps for HD video
    // 5 Mbps = 625,000 bytes per second
    const estimatedBitrate = 625000;
    
    // Calculate duration based on file size and bitrate
    // Add some randomness to make it realistic
    const baseSeconds = fileSize / estimatedBitrate;
    const randomFactor = 0.8 + (Math.random() * 0.4); // Between 0.8 and 1.2
    
    // For the course creation feature, we want videos to be 2-3 minutes
    // So we'll cap duration between 120 and 180 seconds
    const seconds = Math.min(180, Math.max(120, baseSeconds * randomFactor));
    
    return Math.round(seconds);
  }
}

export const fileUploader = new FileUploader();