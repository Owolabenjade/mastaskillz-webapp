import React, { useState, useContext, useEffect } from 'react';
import { CourseContext } from '../../../context/CourseContext';
import { aiService } from '../api/aiService';

const LANGUAGES = [
  { id: 'en', name: 'English' },
  { id: 'ha', name: 'Hausa' },
  { id: 'yo', name: 'Yoruba' },
  { id: 'ig', name: 'Igbo' },
  { id: 'pcm', name: 'Nigerian Pidgin' },
  { id: 'fr', name: 'French' },
];

const Localization = ({ nextStep, prevStep }) => {
  const { courseData, updateCourseData } = useContext(CourseContext);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [errors, setErrors] = useState({});

  // Initial target languages state (languages other than those already in courseData.languages)
  const [targetLanguages, setTargetLanguages] = useState([]);

  useEffect(() => {
    // Filter out languages already selected as course languages
    const availableLanguages = LANGUAGES.filter(
      lang => !courseData.languages.includes(lang.name)
    );
    setTargetLanguages(availableLanguages);
    
    // Set default selected language if available
    if (availableLanguages.length > 0) {
      setSelectedLanguage(availableLanguages[0].id);
    }
  }, [courseData.languages]);

  // Handle accessibility options change
  const handleAccessibilityChange = (e) => {
    const { name, checked } = e.target;
    updateCourseData({ 
      accessibility: {
        ...courseData.accessibility,
        [name]: checked
      }
    });
  };

  // Handle target language selection change
  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  // Start translation process
  const handleStartTranslation = async () => {
    if (!selectedLanguage) {
      setErrors({ translation: 'Please select a target language' });
      return;
    }

    setIsTranslating(true);
    setErrors({});
    
    const selectedLang = LANGUAGES.find(lang => lang.id === selectedLanguage);
    if (!selectedLang) {
      setIsTranslating(false);
      setErrors({ translation: 'Invalid language selection' });
      return;
    }

    try {
      // Mock progress updates
      const progressInterval = setInterval(() => {
        setTranslationProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 500);

      // Call translation service
      const translatedContent = await aiService.translateCourse({
        courseData,
        targetLanguage: selectedLang.id
      });

      clearInterval(progressInterval);
      setTranslationProgress(100);

      // Add the translated language to the course languages
      const updatedLanguages = [...courseData.languages, selectedLang.name];
      
      // Update course data with translations
      updateCourseData({
        languages: updatedLanguages,
        translations: {
          ...courseData.translations,
          [selectedLang.id]: translatedContent
        }
      });

      // Reset progress after a short delay
      setTimeout(() => {
        setIsTranslating(false);
        setTranslationProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Translation error:', error);
      setIsTranslating(false);
      setTranslationProgress(0);
      setErrors({ translation: 'Failed to translate content. Please try again.' });
    }
  };

  // Remove a language from translations
  const handleRemoveLanguage = (languageName) => {
    // Don't allow removing the primary language
    if (languageName === courseData.languages[0]) {
      setErrors({ removal: 'Cannot remove primary course language' });
      return;
    }

    // Find language ID
    const language = LANGUAGES.find(lang => lang.name === languageName);
    if (!language) return;

    // Create copy of translations without the removed language
    const updatedTranslations = { ...courseData.translations };
    delete updatedTranslations[language.id];

    // Update courseData
    updateCourseData({
      languages: courseData.languages.filter(lang => lang !== languageName),
      translations: updatedTranslations
    });
  };

  return (
    <div className="localization-container">
      <h2>Localization & Accessibility</h2>
      <p className="section-description">
        Translate your course into different languages and set accessibility options to reach a wider audience.
      </p>

      <div className="form-section">
        <div className="subsection">
          <h3>Course Languages</h3>
          <div className="languages-list">
            {courseData.languages.map(language => (
              <div key={language} className="language-item">
                <span className="language-name">{language}</span>
                {language !== courseData.languages[0] && (
                  <button 
                    className="remove-language-button"
                    onClick={() => handleRemoveLanguage(language)}
                  >
                    Remove
                  </button>
                )}
                {language === courseData.languages[0] && (
                  <span className="primary-language-badge">Primary</span>
                )}
              </div>
            ))}
          </div>

          {errors.removal && (
            <div className="error-message">{errors.removal}</div>
          )}
        </div>

        <div className="subsection">
          <h3>Add Translation</h3>
          <p>Translate your course content to make it accessible to more learners.</p>

          <div className="translation-controls">
            <div className="form-group">
              <label htmlFor="targetLanguage">Select Target Language:</label>
              <select
                id="targetLanguage"
                value={selectedLanguage}
                onChange={handleLanguageChange}
                disabled={isTranslating || targetLanguages.length === 0}
              >
                {targetLanguages.length === 0 ? (
                  <option value="">No additional languages available</option>
                ) : (
                  targetLanguages.map(language => (
                    <option key={language.id} value={language.id}>
                      {language.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <button
              className="translate-button"
              onClick={handleStartTranslation}
              disabled={isTranslating || targetLanguages.length === 0}
            >
              {isTranslating ? 'Translating...' : 'Start Translation'}
            </button>
          </div>

          {errors.translation && (
            <div className="error-message">{errors.translation}</div>
          )}

          {isTranslating && (
            <div className="translation-progress">
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${translationProgress}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {translationProgress < 100 
                  ? `Translating content... ${translationProgress}%` 
                  : 'Translation completed!'}
              </div>
            </div>
          )}

          <div className="translation-info">
            <h4>What Gets Translated</h4>
            <ul>
              <li>Course title and summary</li>
              <li>Module and lesson titles and descriptions</li>
              <li>Quiz questions and answers</li>
            </ul>
            <p className="note">
              Note: Video content will not be translated, but captions can be generated in different languages.
            </p>
          </div>
        </div>

        <div className="subsection">
          <h3>Accessibility Options</h3>
          <p>Make your course accessible to all learners.</p>

          <div className="accessibility-options">
            <div className="accessibility-option">
              <input
                type="checkbox"
                id="captions"
                name="captions"
                checked={courseData.accessibility?.captions || false}
                onChange={handleAccessibilityChange}
              />
              <label htmlFor="captions">Enable Captions/Subtitles</label>
              <p className="option-description">
                Automatically generate captions for all video content in selected languages.
              </p>
            </div>

            <div className="accessibility-option">
              <input
                type="checkbox"
                id="mobileFriendly"
                name="mobileFriendly"
                checked={courseData.accessibility?.mobileFriendly !== false}
                onChange={handleAccessibilityChange}
              />
              <label htmlFor="mobileFriendly">Mobile-First Layout</label>
              <p className="option-description">
                Optimize course layout for mobile devices to improve accessibility on smartphones and tablets.
              </p>
            </div>
          </div>
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
          onClick={nextStep}
        >
          Continue to Pricing & Publishing
        </button>
      </div>
    </div>
  );
};

export default Localization;