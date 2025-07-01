import React, { useEffect } from 'react';
import { WizardProvider, useWizard } from './WizardProvider';
import { StepNavigation } from './StepNavigation';
import { WelcomeStep } from './steps/WelcomeStep';
import { UseCaseStep } from './steps/UseCaseStep';
import { TemplateStep } from './steps/TemplateStep';
import { ModelStep } from './steps/ModelStep';
import { ParametersStep } from './steps/ParametersStep';
import { ReviewStep } from './steps/ReviewStep';
import { ResultsStep } from './steps/ResultsStep';

interface WizardProps {
  useWizard: boolean;
  setUseWizard: (value: boolean) => void;
}

const WizardContent: React.FC<WizardProps> = ({ useWizard: useWizardMode, setUseWizard }) => {
  const { wizardState, goToStep, goToPreviousStep, canNavigateToStep } = useWizard();

  // Memoize step components to prevent recreation on every render
  const stepComponents = React.useMemo(() => ({
    welcome: <WelcomeStep />,
    usecase: <UseCaseStep />,
    template: <TemplateStep />,
    model: <ModelStep />,
    parameters: <ParametersStep />,
    review: <ReviewStep />,
    results: <ResultsStep />
  }), []);

  // Browser navigation support
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.wizardStep) {
        const targetStep = event.state.wizardStep;
        if (canNavigateToStep(targetStep)) {
          goToStep(targetStep);
        } else {
          // If user tries to navigate to an invalid step, go back to previous valid step
          goToPreviousStep();
        }
      }
    };

    // Update browser history when step changes
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('step', wizardState.currentStep);
    window.history.replaceState(
      { wizardStep: wizardState.currentStep },
      '',
      currentUrl.toString()
    );

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [wizardState.currentStep, goToStep, goToPreviousStep, canNavigateToStep]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard navigation if no input is focused
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'SELECT') {
        return;
      }

      if (event.altKey) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          goToPreviousStep();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          // This will be handled by the next button logic in StepNavigation
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goToPreviousStep]);

  const renderCurrentStep = () => {
    return stepComponents[wizardState.currentStep] || stepComponents.welcome;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <StepNavigation useWizard={useWizardMode} setUseWizard={setUseWizard} />
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

const WizardWrapper: React.FC<WizardProps> = React.memo(({ useWizard, setUseWizard }) => {
  return <WizardContent useWizard={useWizard} setUseWizard={setUseWizard} />;
});

export const Wizard: React.FC<WizardProps> = ({ useWizard, setUseWizard }) => {
  return (
    <WizardProvider>
      <WizardWrapper useWizard={useWizard} setUseWizard={setUseWizard} />
    </WizardProvider>
  );
};
