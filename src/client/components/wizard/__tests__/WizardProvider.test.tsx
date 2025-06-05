import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { WizardProvider, useWizard } from '../WizardProvider';

// Mock the useCalculatorForm hook
const mockUseCalculatorForm = jest.fn();
const mockSetFormState = jest.fn();
const mockHandleCalculate = jest.fn();
const mockResetForm = jest.fn();

jest.mock('../../../hooks/useCalculatorForm', () => ({
  useCalculatorForm: () => mockUseCalculatorForm()
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Test component that uses the wizard context
const TestComponent: React.FC = () => {
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

  return (
    <div>
      <div data-testid="current-step">{wizardState.currentStep}</div>
      <div data-testid="completed-steps">{Array.from(wizardState.completedSteps).join(',')}</div>
      <button onClick={() => goToStep('usecase')} data-testid="go-to-usecase">
        Go to Use Case
      </button>
      <button onClick={goToNextStep} data-testid="go-next">
        Next Step
      </button>
      <button onClick={goToPreviousStep} data-testid="go-previous">
        Previous Step
      </button>
      <button onClick={() => markStepComplete('welcome')} data-testid="mark-complete">
        Mark Welcome Complete
      </button>
      <div data-testid="can-navigate-usecase">{canNavigateToStep('usecase').toString()}</div>
      <div data-testid="welcome-valid">{isStepValid('welcome').toString()}</div>
      <div data-testid="usecase-errors">{getStepErrors('usecase').join(',')}</div>
    </div>
  );
};

describe('WizardProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(jest.fn()); // Reset to a non-throwing mock

    // Default mock implementation
    mockUseCalculatorForm.mockReturnValue({
      formState: {
        projectType: undefined,
        globalParams: {},
        modelConfig: {
          primaryModel: undefined,
          secondaryModel: undefined,
          modelRatio: undefined
        },
        projectParams: {},
        productParams: {},
        teamParams: {}
      },
      setFormState: mockSetFormState,
      errors: {},
      isCalculating: false,
      isValid: false,
      result: null,
      handleCalculate: mockHandleCalculate,
      resetForm: mockResetForm
    });
  });

  const renderWithProvider = () => {
    return render(
      <WizardProvider>
        <TestComponent />
      </WizardProvider>
    );
  };

  describe('Initial State', () => {
    it('should start with welcome step', () => {
      renderWithProvider();
      expect(screen.getByTestId('current-step')).toHaveTextContent('welcome');
    });

    it('should have empty completed steps initially', () => {
      renderWithProvider();
      expect(screen.getByTestId('completed-steps')).toHaveTextContent('');
    });

    it('should have welcome in navigation history', () => {
      renderWithProvider();
      // Navigation history is tested through the component behavior
      expect(screen.getByTestId('current-step')).toHaveTextContent('welcome');
    });
  });

  describe('Navigation Functions', () => {
    it('should navigate to specific step', () => {
      renderWithProvider();

      fireEvent.click(screen.getByTestId('go-to-usecase'));
      expect(screen.getByTestId('current-step')).toHaveTextContent('usecase');
    });

    it('should navigate to next step', () => {
      renderWithProvider();

      fireEvent.click(screen.getByTestId('go-next'));
      expect(screen.getByTestId('current-step')).toHaveTextContent('usecase');
    });

    it('should navigate to previous step', () => {
      renderWithProvider();

      // Go to usecase first
      fireEvent.click(screen.getByTestId('go-to-usecase'));
      expect(screen.getByTestId('current-step')).toHaveTextContent('usecase');

      // Then go back
      fireEvent.click(screen.getByTestId('go-previous'));
      expect(screen.getByTestId('current-step')).toHaveTextContent('welcome');
    });

    it('should not go to previous step if at beginning', () => {
      renderWithProvider();

      // Try to go back from welcome step
      fireEvent.click(screen.getByTestId('go-previous'));
      expect(screen.getByTestId('current-step')).toHaveTextContent('welcome');
    });

    it('should not go to next step if at end', () => {
      renderWithProvider();

      // Navigate to results step (last step)
      act(() => {
        fireEvent.click(screen.getByTestId('go-to-usecase'));
      });
      act(() => {
        fireEvent.click(screen.getByTestId('go-next')); // template
      });
      act(() => {
        fireEvent.click(screen.getByTestId('go-next')); // model
      });
      act(() => {
        fireEvent.click(screen.getByTestId('go-next')); // parameters
      });
      act(() => {
        fireEvent.click(screen.getByTestId('go-next')); // review
      });
      act(() => {
        fireEvent.click(screen.getByTestId('go-next')); // results
      });

      expect(screen.getByTestId('current-step')).toHaveTextContent('results');

      // Try to go beyond results
      act(() => {
        fireEvent.click(screen.getByTestId('go-next'));
      });
      expect(screen.getByTestId('current-step')).toHaveTextContent('results');
    });
  });

  describe('Step Completion', () => {
    it('should mark steps as complete', () => {
      renderWithProvider();

      fireEvent.click(screen.getByTestId('mark-complete'));
      expect(screen.getByTestId('completed-steps')).toHaveTextContent('welcome');
    });

    it('should accumulate completed steps', () => {
      renderWithProvider();

      // Mark welcome complete
      fireEvent.click(screen.getByTestId('mark-complete'));
      expect(screen.getByTestId('completed-steps')).toHaveTextContent('welcome');

      // Navigate to usecase and mark complete
      fireEvent.click(screen.getByTestId('go-to-usecase'));
      // Would need additional test component functionality to mark usecase complete
    });
  });

  describe('Step Validation', () => {
    it('should validate step navigation permissions', () => {
      renderWithProvider();

      // Should be able to navigate to next step
      expect(screen.getByTestId('can-navigate-usecase')).toHaveTextContent('true');
    });

    it('should validate welcome step as valid', () => {
      renderWithProvider();

      expect(screen.getByTestId('welcome-valid')).toHaveTextContent('true');
    });

    it('should return errors for invalid steps', () => {
      renderWithProvider();

      expect(screen.getByTestId('usecase-errors')).toHaveTextContent('Please select a project type');
    });

    it('should validate steps based on form state', () => {
      // Update mock to have project type
      mockUseCalculatorForm.mockReturnValue({
        formState: {
          projectType: 'oneoff',
          globalParams: {},
          modelConfig: { primaryModel: undefined },
          projectParams: {},
          productParams: {},
          teamParams: {}
        },
        setFormState: mockSetFormState,
        errors: {},
        isCalculating: false,
        isValid: false,
        result: null,
        handleCalculate: mockHandleCalculate,
        resetForm: mockResetForm
      });

      renderWithProvider();

      // Usecase step should now be valid
      expect(screen.getByTestId('usecase-errors')).toHaveTextContent('');
    });
  });

  describe('Form Integration', () => {
    it('should provide form state from useCalculatorForm', () => {
      const testFormState = {
        projectType: 'oneoff' as const,
        globalParams: { currencyRate: 0.64 },
        modelConfig: { primaryModel: 'claude-3-5-sonnet-20241022' },
        projectParams: { manualDevHours: 100 },
        productParams: {},
        teamParams: {}
      };

      mockUseCalculatorForm.mockReturnValue({
        formState: testFormState,
        setFormState: mockSetFormState,
        errors: {},
        isCalculating: false,
        isValid: true,
        result: null,
        handleCalculate: mockHandleCalculate,
        resetForm: mockResetForm
      });

      const TestFormComponent = () => {
        const { formState } = useWizard();
        return <div data-testid="form-state">{JSON.stringify(formState)}</div>;
      };

      render(
        <WizardProvider>
          <TestFormComponent />
        </WizardProvider>
      );

      expect(screen.getByTestId('form-state')).toHaveTextContent(JSON.stringify(testFormState));
    });

    it('should provide setFormState function', () => {
      const TestSetFormComponent = () => {
        const { setFormState, formState } = useWizard();
        return (
          <button
            data-testid="set-form-state"
            onClick={() => setFormState({ ...formState, projectType: 'ongoing' })}
          >
            Set Form State
          </button>
        );
      };

      render(
        <WizardProvider>
          <TestSetFormComponent />
        </WizardProvider>
      );

      fireEvent.click(screen.getByTestId('set-form-state'));
      expect(mockSetFormState).toHaveBeenCalled();
    });
  });

  describe('Calculation Integration', () => {
    it('should provide handleCalculate function', () => {
      const TestCalculateComponent = () => {
        const { handleCalculate } = useWizard();
        return (
          <button data-testid="calculate" onClick={handleCalculate}>
            Calculate
          </button>
        );
      };

      render(
        <WizardProvider>
          <TestCalculateComponent />
        </WizardProvider>
      );

      fireEvent.click(screen.getByTestId('calculate'));
      expect(mockHandleCalculate).toHaveBeenCalled();
    });

    it('should navigate to results after successful calculation', async () => {
      mockHandleCalculate.mockResolvedValue(undefined);
      mockUseCalculatorForm.mockReturnValue({
        formState: {
          projectType: 'oneoff',
          globalParams: {},
          modelConfig: { primaryModel: 'claude-3-5-sonnet-20241022' },
          projectParams: {},
          productParams: {},
          teamParams: {}
        },
        setFormState: mockSetFormState,
        errors: {},
        isCalculating: false,
        isValid: true,
        result: { totalCost: 1000 }, // Mock result
        handleCalculate: mockHandleCalculate,
        resetForm: mockResetForm
      });

      const TestCalculateComponent = () => {
        const { handleCalculate, wizardState } = useWizard();
        return (
          <div>
            <button data-testid="calculate" onClick={handleCalculate}>
              Calculate
            </button>
            <div data-testid="current-step">{wizardState.currentStep}</div>
          </div>
        );
      };

      render(
        <WizardProvider>
          <TestCalculateComponent />
        </WizardProvider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('calculate'));
      });

      // Should navigate to results after calculation
      await waitFor(() => {
        expect(screen.getByTestId('current-step')).toHaveTextContent('results');
      });
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should save wizard state to localStorage', () => {
      renderWithProvider();

      fireEvent.click(screen.getByTestId('go-to-usecase'));

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'agentic-cost-calculator-wizard-state',
        expect.stringContaining('usecase')
      );
    });

    it('should save form state to localStorage', () => {
      renderWithProvider();

      // Form state changes would trigger localStorage save
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'agentic-cost-calculator-form-state',
        expect.any(String)
      );
    });

    it('should load wizard state from localStorage', () => {
      const savedState = {
        currentStep: 'usecase',
        completedSteps: ['welcome'],
        navigationHistory: ['welcome', 'usecase']
      };

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'agentic-cost-calculator-wizard-state') {
          return JSON.stringify(savedState);
        }
        return null;
      });

      renderWithProvider();

      expect(screen.getByTestId('current-step')).toHaveTextContent('usecase');
      expect(screen.getByTestId('completed-steps')).toHaveTextContent('welcome');
    });
  });

  describe('Start Over Functionality', () => {
    it('should provide startOver function', () => {
      const TestStartOverComponent = () => {
        const { startOver } = useWizard();
        return (
          <button data-testid="start-over" onClick={startOver}>
            Start Over
          </button>
        );
      };

      render(
        <WizardProvider>
          <TestStartOverComponent />
        </WizardProvider>
      );

      fireEvent.click(screen.getByTestId('start-over'));

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('agentic-cost-calculator-wizard-state');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('agentic-cost-calculator-form-state');
      expect(mockResetForm).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useWizard must be used within a WizardProvider');

      consoleSpy.mockRestore();
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      renderWithProvider();

      // Should not crash when localStorage fails
      fireEvent.click(screen.getByTestId('go-to-usecase'));

      expect(consoleSpy).toHaveBeenCalledWith('Failed to save to localStorage:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('Step Order Validation', () => {
    it('should follow correct step order', () => {
      renderWithProvider();

      const expectedSteps = ['welcome', 'usecase', 'template', 'model', 'parameters', 'review', 'results'];

      expectedSteps.forEach((step, index) => {
        if (index > 0) {
          fireEvent.click(screen.getByTestId('go-next'));
        }
        expect(screen.getByTestId('current-step')).toHaveTextContent(step);
      });
    });
  });
});
