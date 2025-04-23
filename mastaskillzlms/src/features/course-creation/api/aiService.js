const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class AIService {
  // Suggest titles based on course summary and objectives
  async suggestTitles({ summary, objectives }) {
    // Simulate API delay
    await delay(1500);
    
    // Mock title suggestions based on content
    const keywords = this._extractKeywords(summary, objectives);
    
    const suggestions = [
      `Mastering ${keywords[0]}${keywords[1] ? ` and ${keywords[1]}` : ''}: A Comprehensive Guide`,
      `The Complete ${keywords[0]} Course: From Beginner to Expert`,
      `${keywords[0]} Essentials: Practical Skills for Success`,
      `${keywords[0]} Fundamentals${keywords[1] ? `: Integrating ${keywords[1]}` : ''}`,
      `Professional ${keywords[0]}: Skills and Techniques for the Real World`,
    ];
    
    return suggestions;
  }

  // Suggest summary based on course title and objectives
  async suggestSummary({ title, objectives }) {
    // Simulate API delay
    await delay(2000);
    
    // Extract key terms from title and objectives
    const titleWords = title.split(' ').filter(word => word.length > 3);
    const keyTerms = titleWords.concat(
      objectives.flatMap(obj => obj.split(' ').filter(word => word.length > 3))
    );
    
    // Generate a mock summary using the key terms
    const uniqueTerms = [...new Set(keyTerms)].slice(0, 3);
    
    return `This comprehensive course covers everything you need to know about ${uniqueTerms.join(', ')} and more. Designed for both beginners and experienced learners, you'll gain practical skills that can be immediately applied in real-world scenarios. Through a combination of theoretical concepts and hands-on exercises, this course will empower you to master ${titleWords[0] || 'these skills'} with confidence. By the end, you'll have developed a strong foundation and the ability to tackle complex challenges in this field.`;
  }

  // Generate quiz questions based on module content
  async generateQuizQuestions({ courseTitle, moduleTitle, moduleDescription, lessons, numberOfQuestions }) {
    // Simulate API delay
    await delay(3000);
    
    // Generate mock questions based on course and module content
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
          
        default:
          // Default case for ESLint
          questions.push({
            id: questionId,
            type: 'mcq',
            text: `Question about ${lessonToUse?.title || moduleTitle}:`,
            options: [
              { id: `option_${questionId}_1`, text: 'This is the correct answer', isCorrect: true },
              { id: `option_${questionId}_2`, text: 'This is an incorrect answer', isCorrect: false },
              { id: `option_${questionId}_3`, text: 'This is another incorrect answer', isCorrect: false },
              { id: `option_${questionId}_4`, text: 'This is yet another incorrect answer', isCorrect: false }
            ]
          });
          break;
      }
    }
    
    return questions;
  }

  // Translate course content to a target language
  async translateCourse({ courseData, targetLanguage }) {
    // Simulate API delay
    await delay(4000);
    
    // Return a mock translation structure
    const translatedContent = {
      title: `${courseData.title} (Translated to ${targetLanguage})`,
      summary: `${courseData.summary} (Translated to ${targetLanguage})`,
      objectives: courseData.objectives.map(obj => `${obj} (Translated)`),
      modules: courseData.modules.map(module => ({
        title: `${module.title} (Translated)`,
        description: `${module.description} (Translated)`,
        lessons: module.lessons.map(lesson => ({
          title: `${lesson.title} (Translated)`,
          description: `${lesson.description} (Translated)`
        })),
        quizzes: module.quizzes.map(quiz => ({
          title: `${quiz.title} (Translated)`,
          description: `${quiz.description} (Translated)`,
          questions: quiz.questions?.map(question => ({
            text: `${question.text} (Translated)`,
            options: question.options ? question.options.map(opt => ({
              text: `${opt.text} (Translated)`,
              isCorrect: opt.isCorrect
            })) : undefined,
            acceptedAnswers: question.acceptedAnswers 
              ? question.acceptedAnswers.map(ans => `${ans} (Translated)`) 
              : undefined
          })) || []
        }))
      }))
    };
    
    return translatedContent;
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
    
    // Get top keywords - default if no meaningful content
    if (Object.keys(wordCount).length === 0) {
      return ['Skills', 'Learning'];
    }
    
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