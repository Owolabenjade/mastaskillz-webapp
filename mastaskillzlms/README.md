# MastaSkillz Course Creation Feature

This repository contains the course creation feature for the MastaSkillz web application. This feature allows content creators to build comprehensive courses with modules, lessons, quizzes, and supports multiple languages and accessibility options.

## Important Note

**This version uses localStorage instead of Firebase for data storage to enable demonstration without backend setup.**

The Firebase integration is prepared but commented out to allow for a quick presentation. It will be fully integrated in the next phase of development.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install all required dependencies including React, React Router DOM, and others specified in package.json.

### 2. Start the Development Server

```bash
npm start
```

The application will start at http://localhost:3000 by default.

## Using the Course Creation Feature

1. Navigate to the Dashboard
2. Click the "+ Create Course" button to begin creating a new course
3. Follow the 5-step workflow:
   - Course Overview: Add basic course details
   - Curriculum Builder: Create modules, lessons, and quizzes
   - Localization & Accessibility: Add translation and accessibility options
   - Pricing & Publishing: Set pricing options
   - Review & Publish: Final review and publication

## Key Features

- **Multi-step Workflow**: Intuitive step-by-step process for course creation
- **Module Management**: Create and organize modules within courses
- **Content Types**:
  - Video lessons (with custom video player)
  - Interactive lessons with configurable options
  - Quizzes with multiple question types
- **AI Assistance**:
  - Title suggestions
  - Summary generation
  - Automatic quiz question creation
- **Localization**: Support for translating content to multiple languages
- **Accessibility Options**: Captions and mobile-friendly layout options
- **Pricing Options**: Free, freemium, or paid course configuration
- **Course Preview**: Preview how the course will appear to learners

## Current Limitations (Demo Version)

- Data is stored in browser localStorage and will be lost if cleared
- File uploads create browser object URLs that only work during the current session
- AI features return simulated responses
- No user authentication

## Next Steps for Development

- Implement Firebase backend integration (prepared in code)
- Add user authentication
- Connect to OpenAI API for real AI assistance
- Implement real-time collaboration features
- Add analytics dashboard

## Project Structure

- `src/features/course-creation/`: Contains all course creation components
- `src/context/CourseContext.js`: Manages state for course creation
- `src/services/`: Contains API and service integrations (mocked for now)
- `src/components/common/`: Shared UI components
- `src/components/dashboard/`: Dashboard components

## Mock Services

This demo implementation includes the following mock services:

- `courseService`: Handles course data using localStorage
- `aiService`: Provides simulated AI responses
- `fileUploader`: Creates temporary object URLs for uploaded files

These will be replaced with real Firebase implementations in the next phase.

## Presentation Tips

When presenting this feature to the team:

1. Focus on the user flow and UI/UX
2. Demonstrate how a course is created step by step
3. Show how modules, lessons, and quizzes can be added and configured
4. Highlight the AI assistance features (simulated but showing the concept)
5. Demonstrate the preview functionality

The core functionality is fully implemented for demonstration purposes, and the UI is complete. Firebase integration will come next.