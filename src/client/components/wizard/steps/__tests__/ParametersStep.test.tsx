import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ParametersStep } from '../ParametersStep';
import { WizardProvider } from '../../WizardProvider';

// Mock useCalculatorForm to provide controlled state
const mockUseCalculatorForm = jest.fn();

jest.mock('../../../hooks/useCalculatorForm', () => ({
  useCalculatorForm: () => mockUseCalculatorForm()
}));

// Mock the form components with simple implementations
jest.mock('../../inputs/ProjectParametersForm', () => ({
  ProjectParametersForm: ({ value, onChange }: any) => (
    <div data-testid="project-params-form">
      Project Parameters Form
      <input
        data-testid="manual-dev-hours"
        value={value?.manualDevHours || ''}
        onChange={(e) => onChange({ manualDevHours: Number(e.target.value) })}
      />
    </div>
  ),
}));

jest.mock('../../inputs/TeamParametersForm', () => ({
  TeamParametersForm: () => (
    <div data-testid="team-params-form">Team Parameters Form</div>
  ),
}));

jest.mock('../../inputs/ProductParametersForm', () => ({
  ProductParametersForm: () => (
    <div data-testid="product-params-form">Product Parameters Form</div>
  ),
}));

jest.mock('../../inputs/GlobalParametersForm', () => ({
  GlobalParametersForm: () => (
    <div data-testid="global-params-form">Global Parameters Form</div>
  ),
}));

jest.mock('../../inputs/ProjectDetailsForm', () => ({
  ProjectDetailsForm: ({ value, onChange }: any) => (
    <div data-testid="project-details-form">
      Project Details Form
      <input
        data-testid="project-name"
        value={value?.projectName || ''}
        onChange={(e) => onChange({ projectName: e.target.value })}
      />
      <input
        data-testid="customer-name"
        value={value?.customerName || ''}
        onChange={(e) => onChange({ customerName: e.target.value })}
      />
    </div>
  ),
}));

// Helper component to wrap ParametersStep with WizardProvider
const ParametersStepWrapper = () => (
  <WizardProvider>
    <ParametersStep />
  </WizardProvider>
);

describe('ParametersStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation
    mockUseCalculatorForm.mockReturnValue({
      formState: {
        projectType: 'oneoff',
        projectParams: { manualDevHours: 100 },
        globalParams: { currencyRate: 0.64 },
      },
      setFormState: jest.fn(),
      errors: {},
      isCalculating: false,
      isValid: true,
      result: null,
      handleCalculate: jest.fn(),
      resetForm: jest.fn(),
    });
  });

  describe('Parameter Section Rendering', () => {
    it('should render project parameters for oneoff project type', () => {
      mockUseCalculatorForm.mockReturnValue({
        formState: {
          projectType: 'oneoff',
          projectParams: { manualDevHours: 100 },
          globalParams: {},
        },
        setFormState: jest.fn(),
        errors: {},
        isCalculating: false,
        isValid: true,
        result: null,
        handleCalculate: jest.fn(),
        resetForm: jest.fn(),
      });

      render(<ParametersStepWrapper />);

      expect(screen.getByTestId('project-details-form')).toBeInTheDocument();
      expect(screen.getByTestId('project-params-form')).toBeInTheDocument();
      expect(screen.getByTestId('global-params-form')).toBeInTheDocument();
      expect(screen.queryByTestId('team-params-form')).not.toBeInTheDocument();
      expect(screen.queryByTestId('product-params-form')).not.toBeInTheDocument();
    });

    it('should render team and product parameters for ongoing project type', () => {
      mockUseCalculatorForm.mockReturnValue({
        formState: {
          projectType: 'ongoing',
          teamParams: { numberOfDevs: 2 },
          productParams: { tokensPerDayOngoing: 1000000 },
          globalParams: {},
        },
        setFormState: jest.fn(),
        errors: {},
        isCalculating: false,
        isValid: true,
        result: null,
        handleCalculate: jest.fn(),
        resetForm: jest.fn(),
      });

      render(<ParametersStepWrapper />);

      expect(screen.getByTestId('project-details-form')).toBeInTheDocument();
      expect(screen.getByTestId('team-params-form')).toBeInTheDocument();
      expect(screen.getByTestId('product-params-form')).toBeInTheDocument();
      expect(screen.getByTestId('global-params-form')).toBeInTheDocument();
      expect(screen.queryByTestId('project-params-form')).not.toBeInTheDocument();
    });

    it('should render all parameter forms for both project type', () => {
      mockUseCalculatorForm.mockReturnValue({
        formState: {
          projectType: 'both',
          projectParams: { manualDevHours: 100 },
          teamParams: { numberOfDevs: 2 },
          productParams: { tokensPerDayOngoing: 1000000 },
          globalParams: {},
        },
        setFormState: jest.fn(),
        errors: {},
        isCalculating: false,
        isValid: true,
        result: null,
        handleCalculate: jest.fn(),
        resetForm: jest.fn(),
      });

      render(<ParametersStepWrapper />);

      expect(screen.getByTestId('project-details-form')).toBeInTheDocument();
      expect(screen.getByTestId('project-params-form')).toBeInTheDocument();
      expect(screen.getByTestId('team-params-form')).toBeInTheDocument();
      expect(screen.getByTestId('product-params-form')).toBeInTheDocument();
      expect(screen.getByTestId('global-params-form')).toBeInTheDocument();
    });
  });

  describe('Smart Defaults UI', () => {
    it('should display smart defaults information panel', () => {
      render(<ParametersStepWrapper />);

      expect(screen.getByText('Smart Defaults Applied')).toBeInTheDocument();
      expect(screen.getByText('Parameters have been pre-configured based on your selected template. You can modify any values as needed.')).toBeInTheDocument();
    });

    it('should toggle advanced mode details', () => {
      render(<ParametersStepWrapper />);

      const toggleButton = screen.getByText('Show Details');
      expect(screen.queryByText('Template Source')).not.toBeInTheDocument();

      fireEvent.click(toggleButton);

      expect(screen.getByText('Template Source')).toBeInTheDocument();
      expect(screen.getByText('Customisation')).toBeInTheDocument();
      expect(screen.getByText('Hide Details')).toBeInTheDocument();
    });
  });

  describe('Step Description', () => {
    it('should show appropriate description for oneoff project', () => {
      mockUseCalculatorForm.mockReturnValue({
        formState: { projectType: 'oneoff' },
        setFormState: jest.fn(),
        errors: {},
        isCalculating: false,
        isValid: true,
        result: null,
        handleCalculate: jest.fn(),
        resetForm: jest.fn(),
      });

      render(<ParametersStepWrapper />);

      expect(screen.getByText('Configure the parameters for your one-off project calculation.')).toBeInTheDocument();
    });

    it('should show appropriate description for ongoing project', () => {
      mockUseCalculatorForm.mockReturnValue({
        formState: { projectType: 'ongoing' },
        setFormState: jest.fn(),
        errors: {},
        isCalculating: false,
        isValid: true,
        result: null,
        handleCalculate: jest.fn(),
        resetForm: jest.fn(),
      });

      render(<ParametersStepWrapper />);

      expect(screen.getByText('Set up your team and product parameters for ongoing usage calculations.')).toBeInTheDocument();
    });

    it('should show appropriate description for both project type', () => {
      mockUseCalculatorForm.mockReturnValue({
        formState: { projectType: 'both' },
        setFormState: jest.fn(),
        errors: {},
        isCalculating: false,
        isValid: true,
        result: null,
        handleCalculate: jest.fn(),
        resetForm: jest.fn(),
      });

      render(<ParametersStepWrapper />);

      expect(screen.getByText('Configure parameters for both your one-off project and ongoing usage.')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should render the main wizard step structure', () => {
      render(<ParametersStepWrapper />);

      expect(screen.getByText('Configure Parameters')).toBeInTheDocument();
      expect(screen.getByText('Smart Defaults Applied')).toBeInTheDocument();
    });

    it('should show project details form for all project types', () => {
      const projectTypes = ['oneoff', 'ongoing', 'both'];

      projectTypes.forEach(projectType => {
        mockUseCalculatorForm.mockReturnValue({
          formState: { projectType },
          setFormState: jest.fn(),
          errors: {},
          isCalculating: false,
          isValid: true,
          result: null,
          handleCalculate: jest.fn(),
          resetForm: jest.fn(),
        });

        const { unmount } = render(<ParametersStepWrapper />);
        expect(screen.getByTestId('project-details-form')).toBeInTheDocument();
        unmount();
      });
    });
  });
});
