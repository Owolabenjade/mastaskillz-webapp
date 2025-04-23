import React, { useState, useRef, useEffect } from 'react';

const VideoPlayer = ({ src, thumbnail, duration, interactive = false, options = {} }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  
  // Control visibility timer - moved inside useEffect
  const [controlsTimeoutId, setControlsTimeoutId] = useState(null);

  useEffect(() => {
    const video = videoRef.current;
    
    // Add event listeners
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('loadedmetadata', handleMetadataLoaded);
      video.addEventListener('ended', handleVideoEnded);
      
      // Clean up event listeners
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('loadedmetadata', handleMetadataLoaded);
        video.removeEventListener('ended', handleVideoEnded);
        
        if (controlsTimeoutId) {
          clearTimeout(controlsTimeoutId);
        }
      };
    }
  }, [controlsTimeoutId]); // Added controlsTimeoutId as dependency

  // Handle time updates
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
    }
  };

  // Handle metadata loaded
  const handleMetadataLoaded = () => {
    const video = videoRef.current;
    if (video) {
      setVideoDuration(video.duration);
    }
  };

  // Handle video ended
  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  // Toggle play/pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Seek to position
  const handleSeek = (e) => {
    const video = videoRef.current;
    if (video) {
      const seekPosition = (e.nativeEvent.offsetX / e.target.clientWidth) * videoDuration;
      video.currentTime = seekPosition;
      setCurrentTime(seekPosition);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    const video = videoRef.current;
    if (video) {
      video.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    const videoContainer = videoRef.current?.parentElement;
    if (!videoContainer) return;
    
    if (!document.fullscreenElement) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if (videoContainer.webkitRequestFullscreen) {
        videoContainer.webkitRequestFullscreen();
      } else if (videoContainer.msRequestFullscreen) {
        videoContainer.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Show/hide controls on mouse movement
  const handleMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeoutId) {
      clearTimeout(controlsTimeoutId);
    }
    
    const newTimeoutId = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
    
    setControlsTimeoutId(newTimeoutId);
  };

  // Handle rewind (go back 10 seconds)
  const handleRewind = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.max(0, video.currentTime - 10);
    }
  };

  // Handle fast forward (go forward 10 seconds)
  const handleFastForward = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.min(videoDuration, video.currentTime + 10);
    }
  };

  // Handle like button
  const handleLike = () => {
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
    } else {
      setLikes(likes - 1);
      setHasLiked(false);
    }
  };

  // Toggle captions
  const toggleCaptions = () => {
    setShowCaptions(!showCaptions);
  };

  return (
    <div 
      className={`video-player-container ${interactive ? 'interactive' : ''}`}
      onMouseMove={handleMouseMove}
    >
      <div className="video-wrapper">
        <video
          ref={videoRef}
          src={src}
          poster={thumbnail}
          onClick={togglePlay}
          preload="metadata"
        ></video>
        
        {showCaptions && (
          <div className="captions">
            Sample captions will appear here when available
          </div>
        )}
        
        <div className={`video-controls ${showControls ? 'visible' : ''}`}>
          <div className="progress-bar" onClick={handleSeek}>
            <div 
              className="progress-fill" 
              style={{ width: `${(currentTime / videoDuration) * 100}%` }}
            ></div>
          </div>
          
          <div className="controls-row">
            <div className="left-controls">
              <button className="play-pause-button" onClick={togglePlay}>
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              
              {(interactive || options?.rewindForward) && (
                <>
                  <button className="rewind-button" onClick={handleRewind}>
                    ⏪
                  </button>
                  <button className="forward-button" onClick={handleFastForward}>
                    ⏩
                  </button>
                </>
              )}
              
              <div className="time-display">
                {formatTime(currentTime)} / {formatTime(videoDuration)}
              </div>
            </div>
            
            <div className="right-controls">
              <div className="volume-control">
                <button className="mute-button" onClick={toggleMute}>
                  {isMuted ? '🔇' : '🔊'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                />
              </div>
              
              <button className="caption-button" onClick={toggleCaptions}>
                {showCaptions ? 'CC' : 'cc'}
              </button>
              
              <button className="fullscreen-button" onClick={toggleFullscreen}>
                {isFullscreen ? '⤓' : '⤢'}
              </button>
              
              {(interactive || options?.likes) && (
                <button 
                  className={`like-button ${hasLiked ? 'liked' : ''}`} 
                  onClick={handleLike}
                >
                  👍 {likes > 0 ? likes : ''}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;