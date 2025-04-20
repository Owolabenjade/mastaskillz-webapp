// AI service that integrates with OpenAI API for MastaSkillz course creation features
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../services/firebase';

class AIService {
  // Suggest titles based on course summary and objectives
  async suggestTitles({ summary, objectives }) {
    try {
      // Firebase Cloud Function to handle OpenAI API calls
      const generateTitles = httpsCallable(functions, 'generateCourseTitles');
      
      const result = await generateTitles({
        summary,
        objectives
      });
      
      return result.data.titles;
    } catch (error) {
      console.error('Error generating title suggestions:', error);
      
      // Fallback to local suggestions if cloud function fails
      return this._generateLocalTitleSuggestions(summary, objectives);
    }
  }

  // Suggest summary based on course title and objectives
  async suggestSummary({ title, objectives }) {
    try {
      // Firebase Cloud Function to handle OpenAI API calls
      const generateSummary = httpsCallable(functions, 'generateCourseSummary');
      
      const result = await generateSummary({
        title,
        objectives
      });
      
      return result.data.summary;
    } catch (error) {
      console.error('Error generating summary suggestion:', error);
      
      // Fallback to local summary if cloud function fails
      return this._generateLocalSummary(title, objectives);
    }
  }

  // Generate quiz questions based on module content
  async generateQuizQuestions({ courseTitle, moduleTitle, moduleDescription, lessons, numberOfQuestions }) {
    try {
      // Firebase Cloud Function to handle OpenAI API calls
      const generateQuestions = httpsCallable(functions, 'generateQuizQuestions');
      
      const result = await generateQuestions({
        courseTitle,
        moduleTitle,
        moduleDescription,
        lessons,
        numberOfQuestions
      });
      
      return result.data.questions;
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      
      // Fallback to local questions if cloud function fails
      return this._generateLocalQuizQuestions(moduleTitle, lessons, numberOfQuestions);
    }
  }

  // Translate course content to a target language
  async translateCourse({ courseData, targetLanguage }) {
    try {
      // Firebase Cloud Function to handle translation API calls
      const translateCourseContent = httpsCallable(functions, 'translateCourseContent');
      
      const result = await translateCourseContent({
        courseData,
        targetLanguage
      });
      
      return result.data.translatedContent;
    } catch (error) {
      console.error('Error translating course content:', error);
      
      // Fallback to local mock translation if cloud function fails
      return this._generateLocalTranslation(courseData, targetLanguage);
    }
  }

  // --- Fallback local implementations for when Firebase functions fail ---

  // Local implementation to generate title suggestions
  _generateLocalTitleSuggestions(summary, objectives) {
    const keywords = this._extractKeywords(summary, objectives);
    
    return [
      `Mastering ${keywords[0]}${keywords[1] ? ` and ${keywords[1]}` : ''}: A Comprehensive Guide`,
      `The Complete ${keywords[0]} Course: From Beginner to Expert`,
      `${keywords[0]} Essentials: Practical Skills for Success`,
      `${keywords[0]} Fundamentals${keywords[1] ? `: Integrating ${keywords[1]}` : ''}`,
      `Professional ${keywords[0]}: Skills and Techniques for the Real World`,
    ];
  }

  // Local implementation to generate a summary
  _generateLocalSummary(title, objectives) {
    const titleWords = title.split(' ').filter(word => word.length > 3);
    const keyTerms = titleWords.concat(
      objectives.flatMap(obj => obj.split(' ').filter(word => word.length > 3))
    );
    
    const uniqueTerms = [...new Set(keyTerms)].slice(0, 3);
    
    return `This comprehensive course covers everything you need to know about ${uniqueTerms.join(', ')} and more. Designed for both beginners and experienced learners, you'll gain practical skills that can be immediately applied in real-world scenarios. Through a combination of theoretical concepts and hands-on exercises, this course will empower you to master ${titleWords[0] || 'these skills'} with confidence. By the end, you'll have developed a strong foundation and the ability to tackle complex challenges in this field.`;
  }

  // Local implementation to generate quiz questions
  _generateLocalQuizQuestions(moduleTitle, lessons, numberOfQuestions) {
    const questionTypes = ['mcq', 'truefalse', 'shortanswer'];
    const questions = [];
    
    for (let i = 0; i < numberOfQuestions; i++) {
      const lessonToUse = lessons[i % lessons.length];
      const questionType = questionTypes[i % questionTypes.length];
      const questionId = `question_${Date.now()}_${i}`;
      
      switch (questionType) {
        case 'mcq':
          questions.push({
            id: questionId,
            type: 'mcq',
            text: `Based on ${lessonToUse?.title || moduleTitle}, which of the following is correct?`,
            options: [
              { id: `option_${questionId}_1`, text: 'This is the correct answer', isCorrect: true },
              { id: `option_${questionId}_2`, text: 'This is an incorrect answer', isCorrect: false },
              { id: `option_${questionId}_3`, text: 'This is another incorrect answer', isCorrect: false },
              { id: `option_${questionId}_4`, text: 'This is yet another incorrect answer', isCorrect: false }
            ]
          });
          break;
          
        case 'truefalse':
          questions.push({
            id: questionId,
            type: 'truefalse',
            text: `According to ${lessonToUse?.title || moduleTitle}, the following statement is true: "${lessonToUse?.title || moduleTitle} is an important concept in this field."`,
            correctAnswer: true
          });
          break;
          
        case 'shortanswer':
          questions.push({
            id: questionId,
            type: 'shortanswer',
            text: `In your own words, explain the main concept of ${lessonToUse?.title || moduleTitle}.`,
            acceptedAnswers: ['concept', 'understanding', 'explanation']
          });
          break;
      }
    }
    
    return questions;
  }

  // Local implementation for mock translation
  _generateLocalTranslation(courseData, targetLanguage) {
    return {
      title: `${courseData.title} (Translated to ${targetLanguage})`,
      summary: `${courseData.summary} (Translated to ${targetLanguage})`,
      objectives: courseData.objectives.map(obj => `${obj} (Translated to ${targetLanguage})`),
      modules: courseData.modules.map(module => ({
        title: `${module.title} (Translated to ${targetLanguage})`,
        description: `${module.description} (Translated to ${targetLanguage})`,
        lessons: module.lessons.map(lesson => ({
          title: `${lesson.title} (Translated to ${targetLanguage})`,
          description: `${lesson.description} (Translated to ${targetLanguage})`
        })),
        quizzes: module.quizzes.map(quiz => ({
          title: `${quiz.title} (Translated to ${targetLanguage})`,
          description: `${quiz.description} (Translated to ${targetLanguage})`,
          questions: quiz.questions.map(question => ({
            text: `${question.text} (Translated to ${targetLanguage})`,
            options: question.options ? question.options.map(opt => ({
              text: `${opt.text} (Translated to ${targetLanguage})`,
              isCorrect: opt.isCorrect
            })) : undefined,
            acceptedAnswers: question.acceptedAnswers 
              ? question.acceptedAnswers.map(ans => `${ans} (Translated to ${targetLanguage})`) 
              : undefined
          }))
        }))
      }))
    };
  }

  // Helper method to extract keywords from text
  _extractKeywords(summary = '', objectives = []) {
    const allText = summary + ' ' + objectives.join(' ');
    const words = allText.split(/\s+/)
      .filter(word => word.length > 3)
      .map(word => word.replace(/[^\w]/g, '').toLowerCase());
    
    // Count word frequency
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Get top keywords
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => this._capitalizeFirstLetter(entry[0]));
  }

  // Helper to capitalize first letter
  _capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

export const aiService = new AIService();