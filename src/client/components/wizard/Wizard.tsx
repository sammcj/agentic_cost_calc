import React from 'react';
import { WizardProvider, useWizard } from './WizardProvider';
import { StepNavigation } from './StepNavigation';
import { WelcomeStep } from './steps/WelcomeStep';
import { UseCaseStep } from './steps/UseCaseStep';
import { TemplateStep } from './steps/TemplateStep';
import { ModelStep } from './steps/ModelStep';
// Import other steps as they're created
// import { ParametersStep } from './steps/ParametersStep';
// import { ReviewStep } from './steps/ReviewStep';
// import { ResultsStep } from './steps/ResultsStep';

const WizardContent: React.FC = () => {
  const { wizardState } = useWizard();

  const renderCurrentStep = () => {
    switch (wizardState.currentStep) {
      case 'welcome':
        return <WelcomeStep />;
      case 'usecase':
        return <UseCaseStep />;
      case 'template':
        return <TemplateStep />;
      case 'model':
        return <ModelStep />;
      case 'parameters':
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Parameters step coming soon...</p>
          </div>
        );
      case 'review':
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Review step coming soon...</p>
          </div>
        );
      case 'results':
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Results step coming soon...</p>
          </div>
        );
      default:
        return <WelcomeStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <StepNavigation />
        </div>
      </div>
    </div>
  );
};

export const Wizard: React.FC = () => {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
};
