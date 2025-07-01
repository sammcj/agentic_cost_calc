import React from 'react';
import { WizardStep } from '../WizardStep';
import { useWizard } from '../WizardProvider';

export const UseCaseStep: React.FC = () => {
  const { formState, setFormState, markStepComplete, goToNextStep } = useWizard();

  const handleProjectTypeSelect = (projectType: 'oneoff' | 'ongoing' | 'both') => {
    setFormState(prevState => ({
      ...prevState,
      projectType
    }));
    markStepComplete('usecase');
    // Auto-advance after selection
    setTimeout(() => {
      goToNextStep();
    }, 500);
  };

  const useCaseOptions = [
    {
      id: 'oneoff',
      title: 'One-off Project',
      description: 'Calculate costs for a specific development project with a defined scope and timeline.',
      examples: 'Building a new application, migrating a system, implementing a feature set',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      benefits: [
        'Compare project-specific costs',
        'Estimate time savings',
        'Calculate ROI for the project'
      ]
    },
    {
      id: 'ongoing',
      title: 'Ongoing Usage',
      description: 'Analyse costs for continuous AI usage in development teams or product operations.',
      examples: 'Daily coding assistance, continuous product AI features, team productivity tools',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      benefits: [
        'Monthly and yearly cost projections',
        'Team productivity analysis',
        'Product feature cost tracking'
      ]
    },
    {
      id: 'both',
      title: 'Combined Analysis',
      description: 'Comprehensive analysis covering both project-specific and ongoing operational costs.',
      examples: 'Complete digital transformation, new product development with ongoing AI features',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      benefits: [
        'Complete cost picture',
        'Project + operational analysis',
        'Long-term strategic planning'
      ]
    }
  ];

  return (
    <WizardStep
      title="What would you like to analyse?"
      description="Choose the type of cost analysis that best fits your needs"
    >
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {useCaseOptions.map((option) => (
            <div
              key={option.id}
              className={`
                relative cursor-pointer rounded-lg border-2 p-6 transition-all hover:shadow-lg
                ${formState.projectType === option.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
              onClick={() => handleProjectTypeSelect(option.id as 'oneoff' | 'ongoing' | 'both')}
            >
              {/* Selection Indicator */}
              {formState.projectType === option.id && (
                <div className="absolute top-4 right-4">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className={`mb-4 ${formState.projectType === option.id ? 'text-blue-600' : 'text-gray-400'}`}>
                {option.icon}
              </div>

              {/* Title and Description */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {option.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {option.description}
              </p>

              {/* Examples */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Examples
                </h4>
                <p className="text-xs text-gray-500 italic">
                  {option.examples}
                </p>
              </div>

              {/* Benefits */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  What you'll get
                </h4>
                <ul className="space-y-1">
                  {option.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center text-xs text-gray-600">
                      <svg className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Not sure which option to choose? Start with "One-off Project" for specific development work,
            or "Ongoing Usage" for continuous AI assistance costs.
          </p>
        </div>
      </div>
    </WizardStep>
  );
};
