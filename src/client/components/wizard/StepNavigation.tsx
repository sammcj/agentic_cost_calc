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

export const StepNavigation: React.FC = () => {
  const {
    wizardState,
    goToNextStep,
    goToPreviousStep,
    isStepValid,
    canNavigateToStep
  } = useWizard();

  const currentStepIndex = stepOrder.indexOf(wizardState.currentStep);
  const canGoNext = currentStepIndex < stepOrder.length - 1 && isStepValid(wizardState.currentStep);
  const canGoBack = wizardState.navigationHistory.length > 1;

  return (
    <div className="wizard-navigation">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
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
          className={`
            px-4 py-2 text-sm font-medium rounded-md
            ${canGoBack
              ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
            }
          `}
        >
          Previous
        </button>

        <div className="text-sm text-gray-500">
          Step {currentStepIndex + 1} of {stepOrder.length}
        </div>

        <button
          onClick={goToNextStep}
          disabled={!canGoNext}
          className={`
            px-4 py-2 text-sm font-medium rounded-md
            ${canGoNext
              ? 'text-white bg-blue-600 border border-transparent hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
            }
          `}
        >
          {wizardState.currentStep === 'results' ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};
