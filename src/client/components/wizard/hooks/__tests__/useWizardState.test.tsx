import React from 'react';
import { render, screen } from '@testing-library/react';
import { useWizardState } from '../useWizardState';
import { WizardProvider } from '../../WizardProvider';

// Mock the useWizard hook that's used inside useWizardState
jest.mock('../../WizardProvider', () => {
  const originalModule = jest.requireActual('../../WizardProvider');

  return {
    ...originalModule,
    useWizard: jest.fn()
  };
});

// Import the mocked useWizard
const { useWizard } = require('../../WizardProvider');

// Test component that uses the useWizardState hook
const TestComponent: React.FC = () => {
  const {
    currentStep,
    completedSteps,
    navigationHistory,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    markStepComplete,
    canNavigateToStep,
    isStepValid,
    getStepErrors
  } = useWizardState();

  return (
    <div>
      <div data-testid="current-step">{currentStep}</div>
      <div data-testid="completed-steps">{Array.from(completedSteps).join(',')}</div>
      <div data-testid="navigation-history">{navigationHistory.join(',')}</div>
      <button onClick={() => goToStep('usecase')} data-testid="go-to-usecase">Go to Use Case</button>
      <button onClick={goToNextStep} data-testid="go-next">Next Step</button>
      <button onClick={goToPreviousStep} data-testid="go-previous">Previous Step</button>
      <button onClick={() => markStepComplete('welcome')} data-testid="mark-complete">Mark Welcome Complete</button>
      <div data-testid="can-navigate-usecase">{canNavigateToStep('usecase').toString()}</div>
      <div data-testid="welcome-valid">{isStepValid('welcome').toString()}</div>
      <div data-testid="usecase-errors">{getStepErrors('usecase').join(',')}</div>
    </div>
  );
};

describe('useWizardState', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation for useWizard
    useWizard.mockReturnValue({
      wizardState: {
        currentStep: 'welcome',
        completedSteps: new Set(['welcome']),
        navigationHistory: ['welcome']
      },
      goToStep: jest.fn(),
      goToNextStep: jest.fn(),
      goToPreviousStep: jest.fn(),
      markStepComplete: jest.fn(),
      canNavigateToStep: jest.fn().mockReturnValue(true),
      isStepValid: jest.fn().mockReturnValue(true),
      getStepErrors: jest.fn().mockReturnValue([])
    });
  });

  it('should return the current step from wizardState', () => {
    render(
      <WizardProvider>
        <TestComponent />
      </WizardProvider>
    );

    expect(screen.getByTestId('current-step')).toHaveTextContent('welcome');
  });

  it('should return completed steps from wizardState', () => {
    useWizard.mockReturnValue({
      wizardState: {
        currentStep: 'welcome',
        completedSteps: new Set(['welcome']),
        navigationHistory: ['welcome']
      },
      goToStep: jest.fn(),
      goToNextStep: jest.fn(),
      goToPreviousStep: jest.fn(),
      markStepComplete: jest.fn(),
      canNavigateToStep: jest.fn().mockReturnValue(true),
      isStepValid: jest.fn().mockReturnValue(true),
      getStepErrors: jest.fn().mockReturnValue([])
    });

    render(
      <WizardProvider>
        <TestComponent />
      </WizardProvider>
    );

    expect(screen.getByTestId('completed-steps')).toHaveTextContent('welcome');
  });

  it('should return navigation history from wizardState', () => {
    useWizard.mockReturnValue({
      wizardState: {
        currentStep: 'usecase',
        completedSteps: new Set(['welcome']),
        navigationHistory: ['welcome', 'usecase']
      },
      goToStep: jest.fn(),
      goToNextStep: jest.fn(),
      goToPreviousStep: jest.fn(),
      markStepComplete: jest.fn(),
      canNavigateToStep: jest.fn().mockReturnValue(true),
      isStepValid: jest.fn().mockReturnValue(true),
      getStepErrors: jest.fn().mockReturnValue([])
    });

    render(
      <WizardProvider>
        <TestComponent />
      </WizardProvider>
    );

    expect(screen.getByTestId('navigation-history')).toHaveTextContent('welcome,usecase');
  });

  it('should pass through the goToStep function', () => {
    const mockGoToStep = jest.fn();
    useWizard.mockReturnValue({
      wizardState: {
        currentStep: 'welcome',
        completedSteps: new Set(),
        navigationHistory: ['welcome']
      },
      goToStep: mockGoToStep,
      goToNextStep: jest.fn(),
      goToPreviousStep: jest.fn(),
      markStepComplete: jest.fn(),
      canNavigateToStep: jest.fn().mockReturnValue(true),
      isStepValid: jest.fn().mockReturnValue(true),
      getStepErrors: jest.fn().mockReturnValue([])
    });

    render(
      <WizardProvider>
        <TestComponent />
      </WizardProvider>
    );

    screen.getByTestId('go-to-usecase').click();
    expect(mockGoToStep).toHaveBeenCalledWith('usecase');
  });

  it('should pass through the goToNextStep function', () => {
    const mockGoToNextStep = jest.fn();
    useWizard.mockReturnValue({
      wizardState: {
        currentStep: 'welcome',
        completedSteps: new Set(),
        navigationHistory: ['welcome']
      },
      goToStep: jest.fn(),
      goToNextStep: mockGoToNextStep,
      goToPreviousStep: jest.fn(),
      markStepComplete: jest.fn(),
      canNavigateToStep: jest.fn().mockReturnValue(true),
      isStepValid: jest.fn().mockReturnValue(true),
      getStepErrors: jest.fn().mockReturnValue([])
    });

    render(
      <WizardProvider>
        <TestComponent />
      </WizardProvider>
    );

    screen.getByTestId('go-next').click();
    expect(mockGoToNextStep).toHaveBeenCalled();
  });

  it('should pass through the goToPreviousStep function', () => {
    const mockGoToPreviousStep = jest.fn();
    useWizard.mockReturnValue({
      wizardState: {
        currentStep: 'usecase',
        completedSteps: new Set(['welcome']),
        navigationHistory: ['welcome', 'usecase']
      },
      goToStep: jest.fn(),
      goToNextStep: jest.fn(),
      goToPreviousStep: mockGoToPreviousStep,
      markStepComplete: jest.fn(),
      canNavigateToStep: jest.fn().mockReturnValue(true),
      isStepValid: jest.fn().mockReturnValue(true),
      getStepErrors: jest.fn().mockReturnValue([])
    });

    render(
      <WizardProvider>
        <TestComponent />
      </WizardProvider>
    );

    screen.getByTestId('go-previous').click();
    expect(mockGoToPreviousStep).toHaveBeenCalled();
  });

  it('should pass through the markStepComplete function', () => {
    const mockMarkStepComplete = jest.fn();
    useWizard.mockReturnValue({
      wizardState: {
        currentStep: 'welcome',
        completedSteps: new Set(),
        navigationHistory: ['welcome']
      },
      goToStep: jest.fn(),
      goToNextStep: jest.fn(),
      goToPreviousStep: jest.fn(),
      markStepComplete: mockMarkStepComplete,
      canNavigateToStep: jest.fn().mockReturnValue(true),
      isStepValid: jest.fn().mockReturnValue(true),
      getStepErrors: jest.fn().mockReturnValue([])
    });

    render(
      <WizardProvider>
        <TestComponent />
      </WizardProvider>
    );

    screen.getByTestId('mark-complete').click();
    expect(mockMarkStepComplete).toHaveBeenCalledWith('welcome');
  });

  it('should pass through the canNavigateToStep function', () => {
    const mockCanNavigateToStep = jest.fn().mockReturnValue(true);
    useWizard.mockReturnValue({
      wizardState: {
        currentStep: 'welcome',
        completedSteps: new Set(),
        navigationHistory: ['welcome']
      },
      goToStep: jest.fn(),
      goToNextStep: jest.fn(),
      goToPreviousStep: jest.fn(),
      markStepComplete: jest.fn(),
      canNavigateToStep: mockCanNavigateToStep,
      isStepValid: jest.fn().mockReturnValue(true), // Ensure default mock
      getStepErrors: jest.fn().mockReturnValue([])   // Ensure default mock
    });

    render(
      <WizardProvider>
        <TestComponent />
      </WizardProvider>
    );

    expect(screen.getByTestId('can-navigate-usecase')).toHaveTextContent('true');
    expect(mockCanNavigateToStep).toHaveBeenCalledWith('usecase');
  });

  it('should pass through the isStepValid function', () => {
    const mockIsStepValid = jest.fn().mockReturnValue(true);
    useWizard.mockReturnValue({
      wizardState: {
        currentStep: 'welcome',
        completedSteps: new Set(),
        navigationHistory: ['welcome']
      },
      goToStep: jest.fn(),
      goToNextStep: jest.fn(),
      goToPreviousStep: jest.fn(),
      markStepComplete: jest.fn(),
      canNavigateToStep: jest.fn().mockReturnValue(true), // Ensure default mock
      isStepValid: mockIsStepValid,
      getStepErrors: jest.fn().mockReturnValue([])   // Ensure default mock
    });

    render(
      <WizardProvider>
        <TestComponent />
      </WizardProvider>
    );

    expect(screen.getByTestId('welcome-valid')).toHaveTextContent('true');
    expect(mockIsStepValid).toHaveBeenCalledWith('welcome');
  });

  it('should pass through the getStepErrors function', () => {
    const mockGetStepErrors = jest.fn().mockReturnValue(['Error 1', 'Error 2']);
    useWizard.mockReturnValue({
      wizardState: {
        currentStep: 'welcome',
        completedSteps: new Set(),
        navigationHistory: ['welcome']
      },
      goToStep: jest.fn(),
      goToNextStep: jest.fn(),
      goToPreviousStep: jest.fn(),
      markStepComplete: jest.fn(),
      canNavigateToStep: jest.fn().mockReturnValue(true), // Ensure default mock
      isStepValid: jest.fn().mockReturnValue(true),   // Ensure default mock
      getStepErrors: mockGetStepErrors
    });

    render(
      <WizardProvider>
        <TestComponent />
      </WizardProvider>
    );

    expect(screen.getByTestId('usecase-errors')).toHaveTextContent('Error 1,Error 2');
    expect(mockGetStepErrors).toHaveBeenCalledWith('usecase');
  });
});
