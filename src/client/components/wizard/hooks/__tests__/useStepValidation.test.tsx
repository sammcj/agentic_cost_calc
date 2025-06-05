import React from 'react';
import { render, screen } from '@testing-library/react';
import { useStepValidation } from '../useStepValidation';
import { WizardProvider } from '../../WizardProvider';

// Mock the useWizard hook that's used inside useStepValidation
jest.mock('../../WizardProvider', () => {
  const originalModule = jest.requireActual('../../WizardProvider');

  return {
    ...originalModule,
    useWizard: jest.fn()
  };
});

// Import the mocked useWizard
const { useWizard } = require('../../WizardProvider');

// Test component that uses the useStepValidation hook
const TestComponent: React.FC = () => {
  const {
    validateStep,
    getValidationErrors,
    validateCurrentStep,
    validateField,
    hasValidationErrors,
    formState
  } = useStepValidation();

  return (
    <div>
      <div data-testid="validate-welcome">{validateStep('welcome').toString()}</div>
      <div data-testid="validation-errors">{getValidationErrors('usecase').join(',')}</div>
      <div data-testid="validate-current">{validateCurrentStep().toString()}</div>
      <div data-testid="validate-field">{validateField('projectParams.manualDevHours', 100) || 'valid'}</div>
      <div data-testid="has-errors">{hasValidationErrors('usecase').toString()}</div>
      <div data-testid="form-state">{JSON.stringify(formState)}</div>
    </div>
  );
};

describe('useStepValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation for useWizard
    useWizard.mockReturnValue({
      formState: {
        projectType: 'oneoff',
        projectParams: { manualDevHours: 100 },
        globalParams: { currencyRate: 0.64 }
      },
      isStepValid: jest.fn().mockReturnValue(true),
      getStepErrors: jest.fn().mockReturnValue([])
    });
  });

  it('should validate steps using isStepValid from useWizard', () => {
    const mockIsStepValid = jest.fn().mockReturnValue(true);
    useWizard.mockReturnValue({
      formState: {},
      isStepValid: mockIsStepValid,
      getStepErrors: jest.fn().mockReturnValue([]) // Added default mock
    });

    render(
      <WizardProvider>
        <TestComponent />
      </WizardProvider>
    );

    expect(screen.getByTestId('validate-welcome')).toHaveTextContent('true');
    expect(mockIsStepValid).toHaveBeenCalledWith('welcome');
  });

  it('should get validation errors using getStepErrors from useWizard', () => {
    const mockGetStepErrors = jest.fn().mockReturnValue(['Error 1', 'Error 2']);
    useWizard.mockReturnValue({
      formState: {},
      isStepValid: jest.fn().mockReturnValue(true), // Added default mock
      getStepErrors: mockGetStepErrors
    });

    render(
      <WizardProvider>
        <TestComponent />
      </WizardProvider>
    );

    expect(screen.getByTestId('validation-errors')).toHaveTextContent('Error 1,Error 2');
    expect(mockGetStepErrors).toHaveBeenCalledWith('usecase');
  });

  it('should validate current step', () => {
    render(
      <WizardProvider>
        <TestComponent />
      </WizardProvider>
    );

    expect(screen.getByTestId('validate-current')).toHaveTextContent('true');
  });

  describe('validateField', () => {
    it('should validate manualDevHours field', () => {
      render(
        <WizardProvider>
          <TestComponent />
        </WizardProvider>
      );

      expect(screen.getByTestId('validate-field')).toHaveTextContent('valid');
    });

    it('should return error for invalid manualDevHours', () => {
      const TestInvalidComponent = () => {
        const { validateField } = useStepValidation();
        return (
          <div data-testid="error">{validateField('projectParams.manualDevHours', -1) || 'valid'}</div>
        );
      };

      render(
        <WizardProvider>
          <TestInvalidComponent />
        </WizardProvider>
      );

      expect(screen.getByTestId('error')).toHaveTextContent('Manual development hours must be between 0.8 and 8000 hours');
    });

    it('should return error for missing manualDevHours', () => {
      const TestMissingComponent = () => {
        const { validateField } = useStepValidation();
        return (
          <div data-testid="error">{validateField('projectParams.manualDevHours', undefined) || 'valid'}</div>
        );
      };

      render(
        <WizardProvider>
          <TestMissingComponent />
        </WizardProvider>
      );

      expect(screen.getByTestId('error')).toHaveTextContent('Manual development hours is required');
    });

    it('should validate totalProjectTokens field', () => {
      const TestTokensComponent = () => {
        const { validateField } = useStepValidation();
        return (
          <div data-testid="valid">{validateField('projectParams.totalProjectTokens', 1000000) || 'valid'}</div>
        );
      };

      render(
        <WizardProvider>
          <TestTokensComponent />
        </WizardProvider>
      );

      expect(screen.getByTestId('valid')).toHaveTextContent('valid');
    });

    it('should return error for invalid totalProjectTokens', () => {
      const TestInvalidTokensComponent = () => {
        const { validateField } = useStepValidation();
        return (
          <div data-testid="error">{validateField('projectParams.totalProjectTokens', -1) || 'valid'}</div>
        );
      };

      render(
        <WizardProvider>
          <TestInvalidTokensComponent />
        </WizardProvider>
      );

      expect(screen.getByTestId('error')).toHaveTextContent('Total project tokens must be zero or greater');
    });

    it('should validate outputTokenPercentage field', () => {
      const TestOutputComponent = () => {
        const { validateField } = useStepValidation();
        return (
          <div data-testid="valid">{validateField('projectParams.outputTokenPercentage', 80) || 'valid'}</div>
        );
      };

      render(
        <WizardProvider>
          <TestOutputComponent />
        </WizardProvider>
      );

      expect(screen.getByTestId('valid')).toHaveTextContent('valid');
    });

    it('should return error for invalid outputTokenPercentage', () => {
      const TestInvalidOutputComponent = () => {
        const { validateField } = useStepValidation();
        return (
          <div data-testid="error">{validateField('projectParams.outputTokenPercentage', 101) || 'valid'}</div>
        );
      };

      render(
        <WizardProvider>
          <TestInvalidOutputComponent />
        </WizardProvider>
      );

      expect(screen.getByTestId('error')).toHaveTextContent('Output token percentage must be between 0 and 100');
    });

    it('should validate cachedTokenPercentage field', () => {
      const TestCachedComponent = () => {
        const { validateField } = useStepValidation();
        return (
          <div data-testid="valid">{validateField('projectParams.cachedTokenPercentage', 50) || 'valid'}</div>
        );
      };

      render(
        <WizardProvider>
          <TestCachedComponent />
        </WizardProvider>
      );

      expect(screen.getByTestId('valid')).toHaveTextContent('valid');
    });

    it('should validate numberOfDevs field', () => {
      const TestDevsComponent = () => {
        const { validateField } = useStepValidation();
        return (
          <div data-testid="valid">{validateField('teamParams.numberOfDevs', 5) || 'valid'}</div>
        );
      };

      render(
        <WizardProvider>
          <TestDevsComponent />
        </WizardProvider>
      );

      expect(screen.getByTestId('valid')).toHaveTextContent('valid');
    });

    it('should validate tokensPerDevPerDay field', () => {
      const TestTokensPerDevComponent = () => {
        const { validateField } = useStepValidation();
        return (
          <div data-testid="valid">{validateField('teamParams.tokensPerDevPerDay', 50000) || 'valid'}</div>
        );
      };

      render(
        <WizardProvider>
          <TestTokensPerDevComponent />
        </WizardProvider>
      );

      expect(screen.getByTestId('valid')).toHaveTextContent('valid');
    });

    it('should validate tokensPerDayOngoing field', () => {
      const TestTokensPerDayComponent = () => {
        const { validateField } = useStepValidation();
        return (
          <div data-testid="valid">{validateField('productParams.tokensPerDayOngoing', 100000) || 'valid'}</div>
        );
      };

      render(
        <WizardProvider>
          <TestTokensPerDayComponent />
        </WizardProvider>
      );

      expect(screen.getByTestId('valid')).toHaveTextContent('valid');
    });

    it('should validate currencyRate field', () => {
      const TestCurrencyComponent = () => {
        const { validateField } = useStepValidation();
        return (
          <div data-testid="valid">{validateField('globalParams.currencyRate', 0.64) || 'valid'}</div>
        );
      };

      render(
        <WizardProvider>
          <TestCurrencyComponent />
        </WizardProvider>
      );

      expect(screen.getByTestId('valid')).toHaveTextContent('valid');
    });

    it('should return null for unknown fields', () => {
      const TestUnknownComponent = () => {
        const { validateField } = useStepValidation();
        return (
          <div data-testid="valid">{validateField('unknown.field', 'value') || 'valid'}</div>
        );
      };

      render(
        <WizardProvider>
          <TestUnknownComponent />
        </WizardProvider>
      );

      expect(screen.getByTestId('valid')).toHaveTextContent('valid');
    });
  });

  it('should check if step has validation errors', () => {
    const mockGetStepErrors = jest.fn().mockReturnValue(['Error']);
    useWizard.mockReturnValue({
      formState: {},
      isStepValid: jest.fn().mockReturnValue(true), // Added default mock
      getStepErrors: mockGetStepErrors
    });

    render(
      <WizardProvider>
        <TestComponent />
      </WizardProvider>
    );

    expect(screen.getByTestId('has-errors')).toHaveTextContent('true');
    expect(mockGetStepErrors).toHaveBeenCalledWith('usecase');
  });

  it('should return formState from useWizard', () => {
    const testFormState = {
      projectType: 'oneoff',
      projectParams: { manualDevHours: 100 },
      globalParams: { currencyRate: 0.64 }
    };

    useWizard.mockReturnValue({
      formState: testFormState,
      isStepValid: jest.fn().mockReturnValue(true), // Added default mock
      getStepErrors: jest.fn().mockReturnValue([]) // Added default mock
    });

    render(
      <WizardProvider>
        <TestComponent />
      </WizardProvider>
    );

    expect(screen.getByTestId('form-state')).toHaveTextContent(JSON.stringify(testFormState));
  });
});
