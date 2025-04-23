// src/features/course-creation/utils/fileUploader.js
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
      
      // Simulate file reading and thumbnail generation
      await delay(500);
      
      // Simulate upload progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 100) progress = 100;
        progressCallback(progress);
        
        if (progress >= 100) {
          clearInterval(progressInterval);
        }
      }, 300);
      
      // Simulate upload completion after a delay based on file size
      // Larger files take longer to upload
      const uploadTime = Math.min(3000, file.size / 10000);
      await delay(uploadTime);
      
      // Ensure the progress reaches 100%
      progressCallback(100);
      clearInterval(progressInterval);
      
      // Mock generating a thumbnail
      await delay(500);
      
      // Create a mock URL for the uploaded video
      const mockUrl = URL.createObjectURL(file);
      const mockThumbnail = "https://via.placeholder.com/640x360";
      
      // Return mock metadata about the uploaded video
      return {
        id: fileId,
        url: mockUrl,
        thumbnail: mockThumbnail,
        fileName: fileName,
        fileSize: file.size,
        fileType: file.type,
        uploadDate: new Date().toISOString(),
        duration: this._calculateMockDuration(file.size),
        width: 1920,
        height: 1080
      };
    } catch (error) {
      console.error('Error in uploadVideo:', error);
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