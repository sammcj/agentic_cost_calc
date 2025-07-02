import { render, screen, fireEvent, act } from '@testing-library/react';
import { UseCaseStep } from '../UseCaseStep';
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

// Mock setTimeout
jest.useFakeTimers();

// Helper component to wrap UseCaseStep with WizardProvider
const UseCaseStepWrapper = () => (
  <WizardProvider>
    <UseCaseStep />
  </WizardProvider>
);

describe('UseCaseStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation for useWizard
    useWizard.mockReturnValue({
      formState: {
        projectType: undefined
      },
      setFormState: jest.fn(),
      markStepComplete: jest.fn(),
      goToNextStep: jest.fn()
    });
  });

  describe('Component Rendering', () => {
    it('should render the use case step with correct title and description', () => {
      render(<UseCaseStepWrapper />);

      expect(screen.getByText('What would you like to analyse?')).toBeInTheDocument();
      expect(screen.getByText('Choose the type of cost analysis that best fits your needs')).toBeInTheDocument();
    });

    it('should render all three use case options', () => {
      render(<UseCaseStepWrapper />);

      expect(screen.getByText('One-off Project')).toBeInTheDocument();
      expect(screen.getByText('Ongoing Usage')).toBeInTheDocument();
      expect(screen.getByText('Combined Analysis')).toBeInTheDocument();
    });

    it('should render option descriptions correctly', () => {
      render(<UseCaseStepWrapper />);

      expect(screen.getByText('Calculate costs for a specific development project with a defined scope and timeline.')).toBeInTheDocument();
      expect(screen.getByText('Analyse costs for continuous AI usage in development teams or product operations.')).toBeInTheDocument();
      expect(screen.getByText('Comprehensive analysis covering both project-specific and ongoing operational costs.')).toBeInTheDocument();
    });

    it('should render examples for each option', () => {
      render(<UseCaseStepWrapper />);

      expect(screen.getByText('Building a new application, migrating a system, implementing a feature set')).toBeInTheDocument();
      expect(screen.getByText('Daily coding assistance, continuous product AI features, team productivity tools')).toBeInTheDocument();
      expect(screen.getByText('Complete digital transformation, new product development with ongoing AI features')).toBeInTheDocument();
    });

    it('should render benefits for each option', () => {
      render(<UseCaseStepWrapper />);

      // One-off project benefits
      expect(screen.getByText('Compare project-specific costs')).toBeInTheDocument();
      expect(screen.getByText('Estimate time savings')).toBeInTheDocument();
      expect(screen.getByText('Calculate ROI for the project')).toBeInTheDocument();

      // Ongoing usage benefits
      expect(screen.getByText('Monthly and yearly cost projections')).toBeInTheDocument();
      expect(screen.getByText('Team productivity analysis')).toBeInTheDocument();
      expect(screen.getByText('Product feature cost tracking')).toBeInTheDocument();

      // Combined analysis benefits
      expect(screen.getByText('Complete cost picture')).toBeInTheDocument();
      expect(screen.getByText('Project + operational analysis')).toBeInTheDocument();
      expect(screen.getByText('Long-term strategic planning')).toBeInTheDocument();
    });

    it('should render help text at the bottom', () => {
      render(<UseCaseStepWrapper />);

      expect(screen.getByText(/Not sure which option to choose/)).toBeInTheDocument();
      expect(screen.getByText(/Start with "One-off Project" for specific development work/)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle option selection', () => {
      const mockSetFormState = jest.fn();
      const mockMarkStepComplete = jest.fn();
      const mockGoToNextStep = jest.fn();

      useWizard.mockReturnValue({
        formState: {
          projectType: undefined
        },
        setFormState: mockSetFormState,
        markStepComplete: mockMarkStepComplete,
        goToNextStep: mockGoToNextStep
      });

      render(<UseCaseStepWrapper />);

      // Find and click the One-off Project option
      const oneOffOption = screen.getByText('One-off Project').closest('div');
      if (oneOffOption) {
        fireEvent.click(oneOffOption);
      }

      // Should update form state with functional update
      expect(mockSetFormState).toHaveBeenCalledWith(expect.any(Function));

      // Should mark step as complete
      expect(mockMarkStepComplete).toHaveBeenCalledWith('usecase');

      // Should navigate to next step after timeout
      expect(mockGoToNextStep).not.toHaveBeenCalled();

      // Advance timers
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(mockGoToNextStep).toHaveBeenCalled();
    });

    it('should handle ongoing option selection', () => {
      const mockSetFormState = jest.fn();

      useWizard.mockReturnValue({
        formState: {
          projectType: undefined
        },
        setFormState: mockSetFormState,
        markStepComplete: jest.fn(),
        goToNextStep: jest.fn()
      });

      render(<UseCaseStepWrapper />);

      // Find and click the Ongoing Usage option
      const ongoingOption = screen.getByText('Ongoing Usage').closest('div');
      if (ongoingOption) {
        fireEvent.click(ongoingOption);
      }

      // Should update form state with functional update
      expect(mockSetFormState).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should handle combined option selection', () => {
      const mockSetFormState = jest.fn();

      useWizard.mockReturnValue({
        formState: {
          projectType: undefined
        },
        setFormState: mockSetFormState,
        markStepComplete: jest.fn(),
        goToNextStep: jest.fn()
      });

      render(<UseCaseStepWrapper />);

      // Find and click the Combined Analysis option
      const combinedOption = screen.getByText('Combined Analysis').closest('div');
      if (combinedOption) {
        fireEvent.click(combinedOption);
      }

      // Should update form state with functional update
      expect(mockSetFormState).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('Visual States', () => {
    it('should show no selection initially', () => {
      useWizard.mockReturnValue({
        formState: {
          projectType: undefined
        },
        setFormState: jest.fn(),
        markStepComplete: jest.fn(),
        goToNextStep: jest.fn()
      });

      render(<UseCaseStepWrapper />);

      // Get all option cards
      const options = [
        screen.getByText('One-off Project'),
        screen.getByText('Ongoing Usage'),
        screen.getByText('Combined Analysis')
      ];

      // None should have the selected styling
      options.forEach(option => {
        const card = option.closest('div');
        if (card) {
          expect(card).not.toHaveClass('border-blue-500', 'bg-blue-50');
        }
      });
    });

    it('should highlight selected option', () => {
      useWizard.mockReturnValue({
        formState: {
          projectType: 'oneoff'
        },
        setFormState: jest.fn(),
        markStepComplete: jest.fn(),
        goToNextStep: jest.fn()
      });

      render(<UseCaseStepWrapper />);

      const oneOffCard = screen.getByText('One-off Project').closest('div');
      if (oneOffCard) {
        expect(oneOffCard).toHaveClass('border-blue-500', 'bg-blue-50');
      }
    });

    it('should show selection indicator for selected option', () => {
      useWizard.mockReturnValue({
        formState: {
          projectType: 'ongoing'
        },
        setFormState: jest.fn(),
        markStepComplete: jest.fn(),
        goToNextStep: jest.fn()
      });

      render(<UseCaseStepWrapper />);

      // Should show checkmark icon for selected option
      // The checkmark SVG path starts with "M16.707"
      const { container } = render(<UseCaseStepWrapper />);
      const checkmarkPaths = container.querySelectorAll('svg path[d^="M16.707 5.293"]');
      expect(checkmarkPaths.length).toBeGreaterThan(0);
    });

    it('should apply hover styles to options', () => {
      render(<UseCaseStepWrapper />);

      const oneOffCard = screen.getByText('One-off Project').closest('div');
      if (oneOffCard) {
        expect(oneOffCard).toHaveClass('hover:shadow-lg', 'hover:border-gray-300');
      }
    });
  });

  describe('Responsive Layout', () => {
    it('should have responsive grid layout', () => {
      render(<UseCaseStepWrapper />);

      const gridContainer = screen.getByText('One-off Project').closest('.grid');
      if (gridContainer) {
        expect(gridContainer).toHaveClass('grid', 'gap-6', 'md:grid-cols-1', 'lg:grid-cols-3');
      }
    });

    it('should have proper card structure', () => {
      render(<UseCaseStepWrapper />);

      const cards = [
        screen.getByText('One-off Project').closest('div'),
        screen.getByText('Ongoing Usage').closest('div'),
        screen.getByText('Combined Analysis').closest('div')
      ];

      cards.forEach(card => {
        if (card) {
          expect(card).toHaveClass('relative', 'cursor-pointer', 'rounded-lg', 'border-2', 'p-6');
        }
      });
    });
  });

  describe('Content Structure', () => {
    it('should have proper icon placement', () => {
      render(<UseCaseStepWrapper />);

      // Each option should have an icon
      const { container } = render(<UseCaseStepWrapper />);
      const svgIcons = container.querySelectorAll('svg');
      // Expecting at least one main icon per option card (3) + checkmark icons in lists (9) + selected indicator (1)
      // This is a bit loose, but ensures SVGs are present. A more specific test might look for specific icon classes or titles if available.
      expect(svgIcons.length).toBeGreaterThanOrEqual(3 + 9);
    });

    it('should have consistent section headings', () => {
      render(<UseCaseStepWrapper />);

      // Each option should have Examples and What you'll get sections
      const exampleHeadings = screen.getAllByText('Examples');
      expect(exampleHeadings.length).toBe(3);

      const benefitsHeadings = screen.getAllByText('What you\'ll get');
      expect(benefitsHeadings.length).toBe(3);
    });

    it('should have consistent benefit list structure', () => {
      render(<UseCaseStepWrapper />);

      // Each option should have 3 benefits with checkmarks
      const benefitLists = screen.getAllByRole('list');
      expect(benefitLists.length).toBe(3);

      // Each list should have 3 items
      const listItems = screen.getAllByRole('listitem');
      expect(listItems.length).toBe(9); // 3 options × 3 benefits
    });
  });

  describe('Accessibility', () => {
    it('should have clickable cards with proper cursor', () => {
      render(<UseCaseStepWrapper />);

      const cards = [
        screen.getByText('One-off Project').closest('div'),
        screen.getByText('Ongoing Usage').closest('div'),
        screen.getByText('Combined Analysis').closest('div')
      ];

      cards.forEach(card => {
        if (card) {
          expect(card).toHaveClass('cursor-pointer');
        }
      });
    });

    it('should have proper heading hierarchy', () => {
      render(<UseCaseStepWrapper />);

      // Main title should be h2 (from WizardStep)
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('What would you like to analyse?');

      // Option titles should be h3
      const h3Headings = screen.getAllByRole('heading', { level: 3 });
      expect(h3Headings.length).toBe(3);
      expect(h3Headings[0]).toHaveTextContent('One-off Project');
      expect(h3Headings[1]).toHaveTextContent('Ongoing Usage');
      expect(h3Headings[2]).toHaveTextContent('Combined Analysis');

      // Section headings should be h4
      const h4Headings = screen.getAllByRole('heading', { level: 4 });
      expect(h4Headings.length).toBe(6); // 3 options × 2 sections (Examples, What you'll get)
    });
  });
});
