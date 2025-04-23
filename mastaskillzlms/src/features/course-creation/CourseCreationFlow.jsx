import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CourseOverview from './components/CourseOverview';
import CurriculumBuilder from './components/CurriculumBuilder';
import Localization from './components/Localization';
import PricingOptions from './components/PricingOptions';
import ReviewPublish from './components/ReviewPublish';
import { CourseContext } from '../../context/CourseContext';

const steps = [
  { id: 'overview', title: 'Course Overview', description: 'Basic course information' },
  { id: 'curriculum', title: 'Curriculum Builder', description: 'Create modules and lessons' },
  { id: 'localization', title: 'Localization & Accessibility', description: 'Translation and accessibility options' },
  { id: 'pricing', title: 'Pricing & Publishing', description: 'Set pricing and publication options' },
  { id: 'review', title: 'Review & Publish', description: 'Final review before publishing' }
];

const CourseCreationFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { courseData, updateCourseData, saveCourse, saveDraft } = useContext(CourseContext);
  const navigate = useNavigate();
  const { courseId } = useParams();

  // Use updateCourseData to initialize new courses with default values
  useEffect(() => {
    // If this is a new course (no courseId) and title is empty, set a default title
    if (!courseId && !courseData.title) {
      updateCourseData({ 
        title: 'New Course',
        status: 'draft'
      });
    }
  }, [courseId, courseData.title, updateCourseData]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
      window.scrollTo(0, 0);
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      await saveDraft(courseData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      await saveCourse(courseData, true);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error publishing course:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <CourseOverview nextStep={nextStep} />;
      case 1:
        return <CurriculumBuilder nextStep={nextStep} prevStep={prevStep} />;
      case 2:
        return <Localization nextStep={nextStep} prevStep={prevStep} />;
      case 3:
        return <PricingOptions nextStep={nextStep} prevStep={prevStep} />;
      case 4:
        return <ReviewPublish prevStep={prevStep} onPublish={handlePublish} onSaveDraft={handleSaveDraft} isSubmitting={isSubmitting} />;
      default:
        return <CourseOverview nextStep={nextStep} />;
    }
  };

  return (
    <div className="course-creation-container">
      <div className="course-creation-header">
        <h1>Create New Course</h1>
        <div className="actions">
          <button 
            className="secondary-button" 
            onClick={handleSaveDraft} 
            disabled={isSubmitting}
          >
            Save as Draft
          </button>
        </div>
      </div>

      <div className="stepper">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            onClick={() => index < currentStep ? goToStep(index) : null}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-content">
              <div className="step-title">{step.title}</div>
              <div className="step-description">{step.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="step-content-container">
        {renderStep()}
      </div>
    </div>
  );
};

export default CourseCreationFlow;