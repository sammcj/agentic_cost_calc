import { useCallback } from 'react';
import { useWizard, WizardStep } from '../WizardProvider';

/**
 * Hook for managing step-specific validation logic.
 * Provides validation functions and error handling for wizard steps.
 */
export const useStepValidation = () => {
  const { formState, getStepErrors, isStepValid } = useWizard();

  const validateStep = useCallback((step: WizardStep): boolean => {
    return isStepValid(step);
  }, [isStepValid]);

  const getValidationErrors = useCallback((step: WizardStep): string[] => {
    return getStepErrors(step);
  }, [getStepErrors]);

  const validateCurrentStep = useCallback((): boolean => {
    // This will be implemented as we add more specific validation logic
    return true;
  }, []);

  const validateField = useCallback((fieldPath: string, value: any): string | null => {
    // Field-specific validation logic
    switch (fieldPath) {
      case 'projectParams.manualDevHours':
        if (value === undefined || value === null || value === '') {
          return 'Manual development hours is required';
        }
        if (typeof value !== 'number' || value < 0.8 || value > 8000) {
          return 'Manual development hours must be between 0.8 and 8000 hours';
        }
        break;

      case 'projectParams.totalProjectTokens':
        if (value === undefined || value === null || value === '') {
          return 'Total project tokens is required';
        }
        if (typeof value !== 'number' || value < 0) {
          return 'Total project tokens must be zero or greater';
        }
        break;

      case 'projectParams.outputTokenPercentage':
        if (value === undefined || value === null || value === '') {
          return 'Output token percentage is required';
        }
        if (typeof value !== 'number' || value < 0 || value > 100) {
          return 'Output token percentage must be between 0 and 100';
        }
        break;

      case 'projectParams.cachedTokenPercentage':
        if (value === undefined || value === null || value === '') {
          return 'Cached token percentage is required';
        }
        if (typeof value !== 'number' || value < 0 || value > 100) {
          return 'Cached token percentage must be between 0 and 100';
        }
        break;

      case 'teamParams.numberOfDevs':
        if (value === undefined || value === null || value === '') {
          return 'Number of developers is required';
        }
        if (typeof value !== 'number' || value < 0) {
          return 'Number of developers must be zero or greater';
        }
        break;

      case 'teamParams.tokensPerDevPerDay':
        if (value === undefined || value === null || value === '') {
          return 'Tokens per developer per day is required';
        }
        if (typeof value !== 'number' || value < 0) {
          return 'Tokens per developer per day must be zero or greater';
        }
        break;

      case 'productParams.tokensPerDayOngoing':
        if (value === undefined || value === null || value === '') {
          return 'Daily token usage is required';
        }
        if (typeof value !== 'number' || value < 0) {
          return 'Daily token usage must be zero or greater';
        }
        break;

      case 'globalParams.currencyRate':
        if (value === undefined || value === null || value === '') {
          return 'Currency rate is required';
        }
        if (typeof value !== 'number' || value <= 0) {
          return 'Currency rate must be greater than zero';
        }
        break;

      default:
        return null;
    }

    return null;
  }, []);

  const hasValidationErrors = useCallback((step: WizardStep): boolean => {
    const errors = getValidationErrors(step);
    return errors.length > 0;
  }, [getValidationErrors]);

  return {
    validateStep,
    getValidationErrors,
    validateCurrentStep,
    validateField,
    hasValidationErrors,
    formState
  };
};
