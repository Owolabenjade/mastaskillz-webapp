import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { CourseContext } from '../../../context/CourseContext';
import VideoPlayer from './VideoPlayer';
import { fileUploader } from '../utils/fileUploader';

const LessonCreator = ({ moduleId, lessonId }) => {
  const { courseData, updateLesson, deleteLesson } = useContext(CourseContext);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  // Find current module and lesson
  const module = courseData.modules.find(mod => mod.id === moduleId);
  const lesson = module?.lessons.find(les => les.id === lessonId);

  // Initialize form state
  const [formData, setFormData] = useState({
    title: '',
    contentType: 'video',
    description: '',
    content: null
  });

  // Update form when lesson changes
  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title || '',
        contentType: lesson.contentType || 'video',
        description: lesson.description || '',
        content: lesson.content
      });
    }
  }, [lesson]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save lesson data with useCallback to prevent dependency issues
  const handleSave = useCallback(() => {
    if (lesson) {
      updateLesson(moduleId, lessonId, formData);
    }
  }, [moduleId, lessonId, updateLesson, formData, lesson]);

  // Auto-save when form data changes (except for content which is handled separately)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (lesson && 
          (formData.title !== lesson.title || 
           formData.contentType !== lesson.contentType ||
           formData.description !== lesson.description)) {
        handleSave();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData.title, formData.contentType, formData.description, lesson, handleSave]);

  // Handle file upload trigger
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Handle file selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const videoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!videoTypes.includes(file.type)) {
      setError('Please upload a valid video file (MP4, WebM, or OGG)');
      return;
    }

    // Validate file size (limit to 200MB for example)
    const maxSize = 200 * 1024 * 1024; // 200MB
    if (file.size > maxSize) {
      setError('Video size exceeds 200MB limit');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const uploadResult = await fileUploader.uploadVideo(file, (progress) => {
        setUploadProgress(progress);
      });

      const updatedContent = uploadResult;
      
      setFormData(prev => ({
        ...prev,
        content: updatedContent
      }));

      // Save the updated content
      updateLesson(moduleId, lessonId, {
        ...formData,
        content: updatedContent
      });
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle delete lesson
  const handleDeleteLesson = () => {
    setIsConfirmDelete(true);
  };

  const confirmDeleteLesson = () => {
    deleteLesson(moduleId, lessonId);
    setIsConfirmDelete(false);
  };

  const cancelDelete = () => {
    setIsConfirmDelete(false);
  };

  if (!lesson) {
    return <div className="lesson-not-found">Lesson not found</div>;
  }

  return (
    <div className="lesson-creator">
      <div className="lesson-header">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Lesson Title"
          className="lesson-title-input"
        />
        <div className="lesson-actions">
          <button 
            className="delete-button" 
            onClick={handleDeleteLesson}
          >
            Delete Lesson
          </button>
        </div>
      </div>

      <div className="lesson-type-selector">
        <label>Lesson Type:</label>
        <div className="radio-group">
          <label className={`radio-option ${formData.contentType === 'video' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="contentType"
              value="video"
              checked={formData.contentType === 'video'}
              onChange={handleChange}
            />
            <span className="radio-label">Video</span>
          </label>
          <label className={`radio-option ${formData.contentType === 'interactive' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="contentType"
              value="interactive"
              checked={formData.contentType === 'interactive'}
              onChange={handleChange}
            />
            <span className="radio-label">Interactive</span>
          </label>
        </div>
      </div>

      <div className="lesson-description">
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Lesson Description (optional)"
          rows={3}
        />
      </div>

      <div className="lesson-content-section">
        <h4>Lesson Content</h4>
        
        {error && <div className="error-message">{error}</div>}

        {formData.contentType === 'video' ? (
          <div className="video-upload-section">
            {!formData.content && !isUploading ? (
              <div className="upload-placeholder" onClick={handleUploadClick}>
                <div className="upload-icon">📤</div>
                <p>Upload Video (MP4, WebM, OGG)</p>
                <p className="upload-hint">Click to browse files or drag and drop</p>
                <p className="upload-hint">Maximum video length: 2-3 minutes</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="video/mp4,video/webm,video/ogg"
                  style={{ display: 'none' }}
                />
              </div>
            ) : isUploading ? (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p>Uploading... {uploadProgress.toFixed(0)}%</p>
              </div>
            ) : (
              <div className="video-preview">
                <VideoPlayer 
                  src={formData.content.url} 
                  thumbnail={formData.content.thumbnail}
                  duration={formData.content.duration}
                />
                <div className="video-actions">
                  <button 
                    className="replace-video" 
                    onClick={handleUploadClick}
                  >
                    Replace Video
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="video/mp4,video/webm,video/ogg"
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="interactive-content-editor">
            <p className="interactive-info">
              Interactive content lets learners engage with the material through interactive elements.
            </p>
            
            <div className="interactive-options">
              <div className="interactive-option">
                <input 
                  type="checkbox" 
                  id="pause-play" 
                  checked={formData.content?.options?.pausePlay || false}
                  onChange={() => {
                    setFormData(prev => ({
                      ...prev,
                      content: {
                        ...prev.content || {},
                        options: {
                          ...(prev.content?.options || {}),
                          pausePlay: !(prev.content?.options?.pausePlay || false)
                        }
                      }
                    }));
                  }}
                />
                <label htmlFor="pause-play">Pause/Play Controls</label>
              </div>
              
              <div className="interactive-option">
                <input 
                  type="checkbox" 
                  id="rewind-forward" 
                  checked={formData.content?.options?.rewindForward || false}
                  onChange={() => {
                    setFormData(prev => ({
                      ...prev,
                      content: {
                        ...prev.content || {},
                        options: {
                          ...(prev.content?.options || {}),
                          rewindForward: !(prev.content?.options?.rewindForward || false)
                        }
                      }
                    }));
                  }}
                />
                <label htmlFor="rewind-forward">Rewind/Fast Forward</label>
              </div>
              
              <div className="interactive-option">
                <input 
                  type="checkbox" 
                  id="likes" 
                  checked={formData.content?.options?.likes || false}
                  onChange={() => {
                    setFormData(prev => ({
                      ...prev,
                      content: {
                        ...prev.content || {},
                        options: {
                          ...(prev.content?.options || {}),
                          likes: !(prev.content?.options?.likes || false)
                        }
                      }
                    }));
                  }}
                />
                <label htmlFor="likes">Like Button</label>
              </div>
            </div>
            
            <div className="interactive-video-upload">
              <h5>Upload Interactive Video</h5>
              {!formData.content?.url && !isUploading ? (
                <div className="upload-placeholder" onClick={handleUploadClick}>
                  <div className="upload-icon">📤</div>
                  <p>Upload Video for Interactive Lesson</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="video/mp4,video/webm,video/ogg"
                    style={{ display: 'none' }}
                  />
                </div>
              ) : isUploading ? (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p>Uploading... {uploadProgress.toFixed(0)}%</p>
                </div>
              ) : (
                <div className="video-preview">
                  <VideoPlayer 
                    src={formData.content.url} 
                    thumbnail={formData.content.thumbnail}
                    duration={formData.content.duration}
                    interactive={true}
                    options={formData.content?.options}
                  />
                  <div className="video-actions">
                    <button 
                      className="replace-video" 
                      onClick={handleUploadClick}
                    >
                      Replace Video
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="video/mp4,video/webm,video/ogg"
                    style={{ display: 'none' }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {formData.contentType === 'video' && formData.content && (
        <div className="subtitle-generator">
          <h4>Automatic Subtitle Generation</h4>
          <div className="subtitle-options">
            <button className="generate-subtitles-button">
              Generate Subtitles
            </button>
            <p className="subtitle-info">
              Automatically generate captions for your video in all selected course languages.
            </p>
          </div>
        </div>
      )}

      {isConfirmDelete && (
        <div className="modal-overlay">
          <div className="confirm-dialog">
            <h4>Confirm Deletion</h4>
            <p>Are you sure you want to delete this lesson? This action cannot be undone.</p>
            <div className="dialog-actions">
              <button 
                className="secondary-button" 
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button 
                className="danger-button" 
                onClick={confirmDeleteLesson}
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

export default LessonCreator;