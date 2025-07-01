import React from 'react';
import { render, act } from '@testing-library/react';
import { WizardProvider, useWizard } from '../WizardProvider';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock useCalculatorForm with dynamic state
const mockSetFormState = jest.fn();
let mockFormState = {
  projectType: 'oneoff' as const,
  globalParams: { currencyRate: 1.0 },
  projectParams: { manualDevHours: 10, totalProjectTokens: 1000 },
};

jest.mock('../../../hooks/useCalculatorForm', () => ({
  useCalculatorForm: () => ({
    formState: mockFormState,
    setFormState: mockSetFormState,
    errors: {},
    isCalculating: false,
    isValid: true,
    result: null,
    handleCalculate: jest.fn(),
    resetForm: jest.fn(),
  }),
}));

// Test component that uses the wizard context
const TestComponent: React.FC = () => {
  const { formState, setFormState, goToNextStep } = useWizard();

  return (
    <div>
      <button
        onClick={() => setFormState(prevState => ({ ...prevState, projectType: 'ongoing' }))}
        data-testid="change-form"
      >
        Change Form
      </button>
      <button
        onClick={goToNextStep}
        data-testid="next-step"
      >
        Next Step
      </button>
    </div>
  );
};

describe('WizardProvider Navigation-Based Saving', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not save form state automatically during typing', async () => {
    const { getByTestId } = render(
      <WizardProvider>
        <TestComponent />
      </WizardProvider>
    );

    // Clear any initial wizard state saves
    mockLocalStorage.setItem.mockClear();

    // Change form state (simulating typing)
    act(() => {
      getByTestId('change-form').click();
    });

    // Should not save form state automatically
    expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith(
      'agentic-cost-calculator-form-state',
      expect.any(String)
    );
  });

  it('should save immediately when navigating to next step', async () => {
    const { getByTestId } = render(
      <WizardProvider>
        <TestComponent />
      </WizardProvider>
    );

    // Clear any initial calls
    mockLocalStorage.setItem.mockClear();

    // Change form state
    act(() => {
      getByTestId('change-form').click();
    });

    // Navigate to next step - should save immediately
    act(() => {
      getByTestId('next-step').click();
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'agentic-cost-calculator-form-state',
      expect.any(String)
    );
  });

  it('should handle multiple form state changes without automatic saving', async () => {
    const { getByTestId } = render(
      <WizardProvider>
        <TestComponent />
      </WizardProvider>
    );

    // Clear any initial calls
    mockLocalStorage.setItem.mockClear();

    // Change form state multiple times quickly (simulating rapid typing)
    act(() => {
      getByTestId('change-form').click();
      getByTestId('change-form').click();
      getByTestId('change-form').click();
    });

    // Should not save automatically after multiple rapid changes
    expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith(
      'agentic-cost-calculator-form-state',
      expect.any(String)
    );

    // Only save when user navigates
    act(() => {
      getByTestId('next-step').click();
    });

    // Should have saved once on navigation
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'agentic-cost-calculator-form-state',
      expect.any(String)
    );
  });
});
