import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CourseProvider } from './context/CourseContext';
import CourseCreationFlow from './features/course-creation/CourseCreationFlow';
import Header from './components/common/Header';
import Dashboard from './components/dashboard/Dashboard';
import './styles/index.css';
import './features/course-creation/styles/CourseCreation.css';

function App() {
  return (
    <Router>
      <CourseProvider>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-course" element={<CourseCreationFlow />} />
              <Route path="/edit-course/:courseId" element={<CourseCreationFlow />} />
            </Routes>
          </main>
        </div>
      </CourseProvider>
    </Router>
  );
}

export default App;