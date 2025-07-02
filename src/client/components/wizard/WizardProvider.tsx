import React, { createContext, useContext, useCallback, useState, ReactNode, useEffect, useRef, useMemo } from 'react';
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
  setFormState: (state: CalculationFormState | ((prev: CalculationFormState) => CalculationFormState)) => void;
  errors: Record<string, string>;
  isCalculating: boolean;
  isValid: boolean;
  result: any;
  handleCalculate: () => Promise<void>;
  resetForm: () => void;
  startOver: () => void;

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

const WIZARD_STORAGE_KEY = 'agentic-cost-calculator-wizard-state';
const FORM_STORAGE_KEY = 'agentic-cost-calculator-form-state';

interface WizardProviderProps {
  children: ReactNode;
}

// Helper functions for localStorage persistence
const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

const loadFromLocalStorage = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return null;
  }
};

const clearLocalStorage = () => {
  try {
    localStorage.removeItem(WIZARD_STORAGE_KEY);
    localStorage.removeItem(FORM_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
};

export const WizardProvider: React.FC<WizardProviderProps> = ({ children }) => {
  console.log(`🧙 WizardProvider RENDER`);
  const calculatorForm = useCalculatorForm();


  // Initialize wizard state with persistence
  const [wizardState, setWizardState] = useState<WizardState>(() => {
    const savedState = loadFromLocalStorage(WIZARD_STORAGE_KEY);
    if (savedState) {
      return {
        ...savedState,
        completedSteps: new Set(savedState.completedSteps || [])
      };
    }
    return {
      currentStep: 'welcome',
      completedSteps: new Set(),
      navigationHistory: ['welcome']
    };
  });

  // Save wizard state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      ...wizardState,
      completedSteps: Array.from(wizardState.completedSteps)
    };
    saveToLocalStorage(WIZARD_STORAGE_KEY, stateToSave);
  }, [wizardState]);

  // Function to save form state immediately (called on navigation events)
  const saveFormStateImmediately = useCallback(() => {
    saveToLocalStorage(FORM_STORAGE_KEY, calculatorForm.formState);
  }, [calculatorForm.formState]);

  // Load form state from localStorage on mount
  useEffect(() => {
    const savedFormState = loadFromLocalStorage(FORM_STORAGE_KEY);
    if (savedFormState) {
      calculatorForm.setFormState(savedFormState);
    }
  }, [calculatorForm.setFormState]);

  // Add browser refresh/close protection to save state
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveFormStateImmediately();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveFormStateImmediately]);

  const goToStep = useCallback(async (step: WizardStep) => {
    // Save form state immediately when navigating
    saveFormStateImmediately();

    // If navigating to results step, trigger calculation first
    if (step === 'results' && !calculatorForm.result) {
      try {
        await calculatorForm.handleCalculate();
      } catch (error) {
        console.error('Calculation failed when navigating to results:', error);
      }
    }

    setWizardState(prev => ({
      ...prev,
      currentStep: step,
      navigationHistory: [...prev.navigationHistory, step]
    }));
  }, [saveFormStateImmediately, calculatorForm]);

  const goToNextStep = useCallback(async () => {
    // Save form state immediately when going to next step
    saveFormStateImmediately();

    const currentIndex = stepOrder.indexOf(wizardState.currentStep);
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];

      // If navigating to results step, trigger calculation first
      if (nextStep === 'results' && !calculatorForm.result) {
        try {
          await calculatorForm.handleCalculate();
        } catch (error) {
          console.error('Calculation failed when navigating to results:', error);
        }
      }

      setWizardState(prev => ({
        ...prev,
        currentStep: nextStep,
        navigationHistory: [...prev.navigationHistory, nextStep]
      }));
    }
  }, [wizardState.currentStep, saveFormStateImmediately, calculatorForm]);

  const goToPreviousStep = useCallback(() => {
    // Save form state immediately when going to previous step
    saveFormStateImmediately();

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
  }, [wizardState.navigationHistory, saveFormStateImmediately]);

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

  // Enhanced handleCalculate that navigates to results on success
  const handleCalculateWithNavigation = useCallback(async () => {
    try {
      await calculatorForm.handleCalculate();
      // If calculation was successful and we have a result, go to results step
      if (calculatorForm.result) {
        markStepComplete('review');
        goToStep('results');
      }
    } catch (error) {
      // Handle error - stay on current step
      console.error('Calculation failed:', error);
    }
  }, [calculatorForm.handleCalculate, calculatorForm.result, markStepComplete, goToStep]);

  // Start over function that resets everything
  const startOver = useCallback(() => {
    // Clear localStorage
    clearLocalStorage();

    // Reset form state
    calculatorForm.resetForm();

    // Reset wizard state
    setWizardState({
      currentStep: 'welcome',
      completedSteps: new Set(),
      navigationHistory: ['welcome']
    });
  }, [calculatorForm.resetForm]);

  const contextValue: WizardContextValue = useMemo(() => ({
    wizardState,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    markStepComplete,
    canNavigateToStep,
    isStepValid,
    getStepErrors,
    startOver,
    formState: calculatorForm.formState,
    setFormState: calculatorForm.setFormState,
    errors: calculatorForm.errors,
    isCalculating: calculatorForm.isCalculating,
    isValid: calculatorForm.isValid,
    result: calculatorForm.result,
    resetForm: calculatorForm.resetForm,
    handleCalculate: handleCalculateWithNavigation
  }), [
    wizardState,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    markStepComplete,
    canNavigateToStep,
    isStepValid,
    getStepErrors,
    startOver,
    calculatorForm.formState,
    calculatorForm.setFormState,
    calculatorForm.errors,
    calculatorForm.isCalculating,
    calculatorForm.isValid,
    calculatorForm.result,
    calculatorForm.resetForm,
    handleCalculateWithNavigation
  ]);

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
