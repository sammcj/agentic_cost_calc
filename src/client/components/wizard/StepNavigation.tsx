import React from 'react';
import { useWizard, WizardStep } from './WizardProvider';

const stepLabels: Record<WizardStep, string> = {
  welcome: 'Welcome',
  usecase: 'Use Case',
  template: 'Template',
  model: 'Model',
  parameters: 'Parameters',
  review: 'Review',
  results: 'Results'
};

const stepOrder: WizardStep[] = [
  'welcome',
  'usecase',
  'template',
  'model',
  'parameters',
  'review',
  'results'
];

interface StepNavigationProps {
  useWizard: boolean;
  setUseWizard: (value: boolean) => void;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({ useWizard: useWizardMode, setUseWizard }) => {
  const {
    wizardState,
    goToNextStep,
    goToPreviousStep,
    isStepValid,
    canNavigateToStep,
    startOver
  } = useWizard();

  const currentStepIndex = stepOrder.indexOf(wizardState.currentStep);
  const canGoNext = currentStepIndex < stepOrder.length - 1 && isStepValid(wizardState.currentStep);
  const canGoBack = wizardState.navigationHistory.length > 1;

  return (
    <nav className="wizard-navigation" aria-label="Wizard Progress" role="navigation">
      {/* Header with Title and Controls */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Agentic Cost Calculator
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          {/* Start Over Button */}
          <button
            onClick={startOver}
            className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
            aria-label="Start over with a new calculation"
          >
            <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Start Over
          </button>

          {/* Mode Toggle */}
          <button
            onClick={() => setUseWizard(!useWizardMode)}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {useWizardMode ? 'Advanced Mode' : 'Guided Mode'}
          </button>

          {/* GitHub Link */}
          <a
            href="https://github.com/sammcj/agentic_cost_calc"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        {/* Mobile-friendly progress bar */}
        <div className="sm:hidden mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Step {currentStepIndex + 1} of {stepOrder.length}</span>
            <span className="text-gray-600">{stepLabels[wizardState.currentStep]}</span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / stepOrder.length) * 100}%` }}
              aria-valuenow={currentStepIndex + 1}
              aria-valuemin={1}
              aria-valuemax={stepOrder.length}
              role="progressbar"
              aria-label={`Progress: step ${currentStepIndex + 1} of ${stepOrder.length}`}
            />
          </div>
        </div>

        {/* Desktop step indicator */}
        <div className="hidden sm:flex items-center justify-between">
          {stepOrder.map((step, index) => {
            const isActive = step === wizardState.currentStep;
            const isCompleted = wizardState.completedSteps.has(step);
            const isAccessible = canNavigateToStep(step);

            return (
              <div key={step} className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${isActive
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                        ? 'bg-green-600 text-white'
                        : isAccessible
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer'
                          : 'bg-gray-100 text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Step Label */}
                <div className="ml-2 mr-4">
                  <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {stepLabels[step]}
                  </div>
                </div>

                {/* Connector Line */}
                {index < stepOrder.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    wizardState.completedSteps.has(step) ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={goToPreviousStep}
          disabled={!canGoBack}
          aria-label={`Go to previous step${canGoBack ? `: ${stepLabels[wizardState.navigationHistory[wizardState.navigationHistory.length - 2]] || 'previous'}` : ''}`}
          aria-describedby="prev-step-hint"
          className={`
            px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${canGoBack
              ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
            }
          `}
        >
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </span>
        </button>

        <div className="text-sm text-gray-500 px-4 text-center">
          <div className="font-medium">{stepLabels[wizardState.currentStep]}</div>
          <div className="text-xs">Step {currentStepIndex + 1} of {stepOrder.length}</div>
        </div>

        <button
          onClick={goToNextStep}
          disabled={!canGoNext}
          aria-label={`${wizardState.currentStep === 'results' ? 'Finish wizard' : `Continue to next step: ${stepLabels[stepOrder[currentStepIndex + 1]] || 'next'}`}`}
          aria-describedby="next-step-hint"
          className={`
            px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${canGoNext
              ? 'text-white bg-blue-600 border border-transparent hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
            }
          `}
        >
          <span className="flex items-center">
            {wizardState.currentStep === 'results' ? 'Finish' : 'Next'}
            {wizardState.currentStep !== 'results' && (
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </span>
        </button>
      </div>

      {/* Screen reader hints */}
      <div className="sr-only">
        <div id="prev-step-hint">Use Alt+Left Arrow for keyboard navigation</div>
        <div id="next-step-hint">Use Alt+Right Arrow for keyboard navigation</div>
      </div>
    </nav>
  );
};
