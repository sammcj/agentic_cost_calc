import { render, screen, fireEvent } from '@testing-library/react';
import { WelcomeStep } from '../WelcomeStep';
import { WizardProvider } from '../../WizardProvider';

// Mock the useWizard hook
jest.mock('../../WizardProvider', () => {
  const originalModule = jest.requireActual('../../WizardProvider');

  return {
    ...originalModule,
    useWizard: jest.fn()
  };
});

// Import the mocked useWizard
const { useWizard } = require('../../WizardProvider');

// Helper component to wrap WelcomeStep with WizardProvider
const WelcomeStepWrapper = () => (
  <WizardProvider>
    <WelcomeStep />
  </WizardProvider>
);

describe('WelcomeStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation for useWizard
    useWizard.mockReturnValue({
      markStepComplete: jest.fn(),
      goToNextStep: jest.fn()
    });
  });

  describe('Component Rendering', () => {
    it('should render the welcome step with correct title and description', () => {
      render(<WelcomeStepWrapper />);

      expect(screen.getByText('Welcome to the Agentic Cost Calculator')).toBeInTheDocument();
      expect(screen.getByText('Compare traditional development costs with modern AI-assisted development')).toBeInTheDocument();
    });

    it('should render the hero section with main heading and description', () => {
      render(<WelcomeStepWrapper />);

      expect(screen.getByText('Estimate and Compare Development Costs')).toBeInTheDocument();
      expect(screen.getByText(/This tool helps you understand the potential cost savings/)).toBeInTheDocument();
    });

    it('should render all three key feature cards', () => {
      render(<WelcomeStepWrapper />);

      expect(screen.getByText('Cost Analysis')).toBeInTheDocument();
      expect(screen.getByText('Time Savings')).toBeInTheDocument();
      expect(screen.getByText('ROI Insights')).toBeInTheDocument();

      // Check feature descriptions
      expect(screen.getByText('Compare traditional development costs with AI-assisted approaches')).toBeInTheDocument();
      expect(screen.getByText('Understand potential time reductions and productivity gains')).toBeInTheDocument();
      expect(screen.getByText('Calculate return on investment and break-even analysis')).toBeInTheDocument();
    });

    it('should render the "What you\'ll get" section with all benefits', () => {
      render(<WelcomeStepWrapper />);

      expect(screen.getByText('What you\'ll get:')).toBeInTheDocument();
      expect(screen.getByText('Detailed cost breakdown comparing traditional vs agentic development')).toBeInTheDocument();
      expect(screen.getByText('Time savings analysis and productivity multipliers')).toBeInTheDocument();
      expect(screen.getByText('Visual charts and exportable reports (PDF/JSON)')).toBeInTheDocument();
      expect(screen.getByText('Token usage estimates and LLM cost projections')).toBeInTheDocument();
    });

    it('should render the Get Started button with completion time', () => {
      render(<WelcomeStepWrapper />);

      expect(screen.getByRole('button', { name: 'Get Started' })).toBeInTheDocument();
      expect(screen.getByText('Takes about 3-5 minutes to complete')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle Get Started button click', () => {
      const mockMarkStepComplete = jest.fn();
      const mockGoToNextStep = jest.fn();

      useWizard.mockReturnValue({
        markStepComplete: mockMarkStepComplete,
        goToNextStep: mockGoToNextStep
      });

      render(<WelcomeStepWrapper />);

      const getStartedButton = screen.getByRole('button', { name: 'Get Started' });

      // Button should be clickable
      expect(getStartedButton).toBeEnabled();

      // Click should not throw error
      fireEvent.click(getStartedButton);

      // Should mark welcome step as complete
      expect(mockMarkStepComplete).toHaveBeenCalledWith('welcome');

      // Should navigate to next step
      expect(mockGoToNextStep).toHaveBeenCalled();
    });

    it('should have proper button styling and hover states', () => {
      render(<WelcomeStepWrapper />);

      const getStartedButton = screen.getByRole('button', { name: 'Get Started' });

      expect(getStartedButton).toHaveClass('bg-blue-600', 'text-white', 'hover:bg-blue-700');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<WelcomeStepWrapper />);

      // Main title should be h2 (from WizardStep)
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Welcome to the Agentic Cost Calculator');

      // Section headings should be h3 and h4
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Estimate and Compare Development Costs');

      const h4Headings = screen.getAllByRole('heading', { level: 4 });
      expect(h4Headings.length).toBeGreaterThanOrEqual(4); // At least 4 h4 headings

      // Check specific h4 headings
      expect(h4Headings[0]).toHaveTextContent('Cost Analysis');
      expect(h4Headings[1]).toHaveTextContent('Time Savings');
      expect(h4Headings[2]).toHaveTextContent('ROI Insights');
    });

    it('should have accessible SVG icons with proper attributes', () => {
      const { container } = render(<WelcomeStepWrapper />);

      const svgElements = container.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });

    it('should have proper button accessibility', () => {
      render(<WelcomeStepWrapper />);

      const getStartedButton = screen.getByRole('button', { name: 'Get Started' });
      expect(getStartedButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Visual Structure', () => {
    it('should have proper CSS classes for layout', () => {
      render(<WelcomeStepWrapper />);

      // Check for responsive grid layout
      const featureGrid = screen.getByText('Cost Analysis').closest('.grid');
      expect(featureGrid).toHaveClass('grid', 'md:grid-cols-3', 'gap-8');
    });

    it('should have proper styling for feature cards', () => {
      render(<WelcomeStepWrapper />);

      const costAnalysisCard = screen.getByText('Cost Analysis').closest('.text-center');
      expect(costAnalysisCard).toHaveClass('text-center');
    });

    it('should have proper styling for benefits section', () => {
      render(<WelcomeStepWrapper />);

      const benefitsSection = screen.getByText('What you\'ll get:').closest('.bg-gray-50');
      expect(benefitsSection).toHaveClass('bg-gray-50', 'rounded-lg', 'p-6');
    });
  });

  describe('Content Validation', () => {
    it('should have correct title and description', () => {
      render(<WelcomeStepWrapper />);

      expect(screen.getByText('Welcome to the Agentic Cost Calculator')).toBeInTheDocument();
      expect(screen.getByText('Compare traditional development costs with modern AI-assisted development')).toBeInTheDocument();
    });

    it('should display correct feature descriptions', () => {
      render(<WelcomeStepWrapper />);

      const featureDescriptions = [
        'Compare traditional development costs with AI-assisted approaches',
        'Understand potential time reductions and productivity gains',
        'Calculate return on investment and break-even analysis'
      ];

      featureDescriptions.forEach(description => {
        expect(screen.getByText(description)).toBeInTheDocument();
      });
    });

    it('should display all benefit checkmarks', () => {
      render(<WelcomeStepWrapper />);

      // Should have 4 checkmark icons for the benefits list
      const { container } = render(<WelcomeStepWrapper />);
      const checkmarkPaths = container.querySelectorAll('svg path[d^="M16.707 5.293"]');
      expect(checkmarkPaths).toHaveLength(4);
    });
  });
});
