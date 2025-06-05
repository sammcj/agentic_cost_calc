import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WizardProvider, useWizard } from '../WizardProvider';

// Mock the useCalculatorForm hook
jest.mock('../../../hooks/useCalculatorForm', () => ({
  useCalculatorForm: () => ({
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
    setFormState: jest.fn(),
    errors: {},
    isCalculating: false,
    isValid: false,
    result: null,
    handleCalculate: jest.fn(),
    resetForm: jest.fn()
  })
}));

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
  const renderWithProvider = () => {
    return render(
      <WizardProvider>
        <TestComponent />
      </WizardProvider>
    );
  };

  it('should start with welcome step', () => {
    renderWithProvider();
    expect(screen.getByTestId('current-step')).toHaveTextContent('welcome');
  });

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

  it('should mark steps as complete', () => {
    renderWithProvider();

    fireEvent.click(screen.getByTestId('mark-complete'));
    expect(screen.getByTestId('completed-steps')).toHaveTextContent('welcome');
  });

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

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useWizard must be used within a WizardProvider');

    consoleSpy.mockRestore();
  });
});
