import React, { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import { useCalculatorForm } from '../../hooks/useCalculatorForm';
import { CalculationFormState } from '@/shared/types/models';

export type WizardStep =
  | 'welcome'
  | 'usecase'
  | 'template'
  | 'model'
  | 'parameters'
  | 'review'
  | 'results';

interface WizardState {
  currentStep: WizardStep;
  completedSteps: Set<WizardStep>;
  navigationHistory: WizardStep[];
}

interface WizardContextValue {
  // Wizard state
  wizardState: WizardState;

  // Navigation functions
  goToStep: (step: WizardStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  markStepComplete: (step: WizardStep) => void;
  canNavigateToStep: (step: WizardStep) => boolean;

  // Form state (from useCalculatorForm)
  formState: CalculationFormState;
  setFormState: (state: CalculationFormState) => void;
  errors: Record<string, string>;
  isCalculating: boolean;
  isValid: boolean;
  result: any;
  handleCalculate: () => Promise<void>;
  resetForm: () => void;

  // Step validation
  isStepValid: (step: WizardStep) => boolean;
  getStepErrors: (step: WizardStep) => string[];
}

const WizardContext = createContext<WizardContextValue | undefined>(undefined);

const stepOrder: WizardStep[] = [
  'welcome',
  'usecase',
  'template',
  'model',
  'parameters',
  'review',
  'results'
];

interface WizardProviderProps {
  children: ReactNode;
}

export const WizardProvider: React.FC<WizardProviderProps> = ({ children }) => {
  const calculatorForm = useCalculatorForm();

  const [wizardState, setWizardState] = useState<WizardState>({
    currentStep: 'welcome',
    completedSteps: new Set(),
    navigationHistory: ['welcome']
  });

  const goToStep = useCallback((step: WizardStep) => {
    setWizardState(prev => ({
      ...prev,
      currentStep: step,
      navigationHistory: [...prev.navigationHistory, step]
    }));
  }, []);

  const goToNextStep = useCallback(() => {
    const currentIndex = stepOrder.indexOf(wizardState.currentStep);
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      goToStep(nextStep);
    }
  }, [wizardState.currentStep, goToStep]);

  const goToPreviousStep = useCallback(() => {
    const history = wizardState.navigationHistory;
    if (history.length > 1) {
      // Remove current step and go to previous
      const newHistory = history.slice(0, -1);
      const previousStep = newHistory[newHistory.length - 1];

      setWizardState(prev => ({
        ...prev,
        currentStep: previousStep,
        navigationHistory: newHistory
      }));
    }
  }, [wizardState.navigationHistory]);

  const markStepComplete = useCallback((step: WizardStep) => {
    setWizardState(prev => ({
      ...prev,
      completedSteps: new Set([...prev.completedSteps, step])
    }));
  }, []);

  const canNavigateToStep = useCallback((step: WizardStep) => {
    const stepIndex = stepOrder.indexOf(step);
    const currentIndex = stepOrder.indexOf(wizardState.currentStep);

    // Can always go back to completed steps
    if (wizardState.completedSteps.has(step)) {
      return true;
    }

    // Can go forward only to the next step
    return stepIndex <= currentIndex + 1;
  }, [wizardState.currentStep, wizardState.completedSteps]);

  const isStepValid = useCallback((step: WizardStep): boolean => {
    const { formState } = calculatorForm;

    switch (step) {
      case 'welcome':
        return true;

      case 'usecase':
        return !!formState.projectType;

      case 'template':
        return !!formState.projectType;

      case 'model':
        return !!formState.modelConfig?.primaryModel;

      case 'parameters':
        // Basic validation - more detailed validation in the step component
        if (formState.projectType === 'oneoff' || formState.projectType === 'both') {
          return !!(formState.projectParams?.manualDevHours &&
                   formState.projectParams?.totalProjectTokens !== undefined);
        }
        if (formState.projectType === 'ongoing' || formState.projectType === 'both') {
          return !!(formState.teamParams || formState.productParams);
        }
        return false;

      case 'review':
        return isStepValid('parameters') && !!formState.globalParams?.currencyRate;

      case 'results':
        return !!calculatorForm.result;

      default:
        return false;
    }
  }, [calculatorForm]);

  const getStepErrors = useCallback((step: WizardStep): string[] => {
    const errors: string[] = [];
    const { formState } = calculatorForm;

    switch (step) {
      case 'usecase':
        if (!formState.projectType) {
          errors.push('Please select a project type');
        }
        break;

      case 'model':
        if (!formState.modelConfig?.primaryModel) {
          errors.push('Please select a primary model');
        }
        break;

      case 'parameters':
        if (formState.projectType === 'oneoff' || formState.projectType === 'both') {
          if (!formState.projectParams?.manualDevHours) {
            errors.push('Manual development hours is required');
          }
          if (formState.projectParams?.totalProjectTokens === undefined) {
            errors.push('Total project tokens is required');
          }
        }
        if (formState.projectType === 'ongoing' || formState.projectType === 'both') {
          if (!formState.teamParams && !formState.productParams) {
            errors.push('Either team or product parameters are required');
          }
        }
        break;

      case 'review':
        if (!formState.globalParams?.currencyRate) {
          errors.push('Currency rate is required');
        }
        break;
    }

    return errors;
  }, [calculatorForm]);

  const contextValue: WizardContextValue = {
    wizardState,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    markStepComplete,
    canNavigateToStep,
    isStepValid,
    getStepErrors,
    ...calculatorForm
  };

  return (
    <WizardContext.Provider value={contextValue}>
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = (): WizardContextValue => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};
