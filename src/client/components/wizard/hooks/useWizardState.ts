import { useWizard } from '../WizardProvider';

/**
 * Convenience hook that provides easy access to wizard state and navigation functions.
 * This is a thin wrapper around useWizard for components that only need basic wizard functionality.
 */
export const useWizardState = () => {
  const {
    wizardState,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    markStepComplete,
    canNavigateToStep,
    isStepValid,
    getStepErrors
  } = useWizard();

  return {
    currentStep: wizardState.currentStep,
    completedSteps: wizardState.completedSteps,
    navigationHistory: wizardState.navigationHistory,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    markStepComplete,
    canNavigateToStep,
    isStepValid,
    getStepErrors
  };
};
