import React, { useEffect, useState } from 'react';
import { useWizard } from '../WizardProvider';
import { WizardStep } from '../WizardStep';
import { ProjectParametersForm } from '../../inputs/ProjectParametersForm';
import { TeamParametersForm } from '../../inputs/TeamParametersForm';
import { ProductParametersForm } from '../../inputs/ProductParametersForm';
import { GlobalParametersForm } from '../../inputs/GlobalParametersForm';
import { ProjectDetailsForm } from '../../inputs/ProjectDetailsForm';

export const ParametersStep: React.FC = () => {
  const { formState, setFormState } = useWizard();
  const [showAdvancedMode, setShowAdvancedMode] = useState(false);
  const [hasUserModifiedDefaults, setHasUserModifiedDefaults] = useState(false);

  // Effect to detect if user has modified defaults and provide smart pre-population
  useEffect(() => {
    // Check if this is the first time user is seeing this step with template defaults
    const hasTemplateDefaults = formState.projectParams || formState.teamParams || formState.productParams;
    if (hasTemplateDefaults && !hasUserModifiedDefaults) {
      // Auto-populate project details if not already set
      if (!formState.globalParams?.customerName && !formState.globalParams?.projectName) {
        const smartDefaults = getSmartDefaults();
        if (smartDefaults) {
          setFormState({
            ...formState,
            globalParams: {
              ...formState.globalParams,
              ...smartDefaults,
            },
          });
        }
      }
    }
  }, [formState.projectType]);

  const getSmartDefaults = () => {
    // Generate smart defaults based on selected template and project type
    const defaults: any = {};

    // Smart project naming based on template
    if (formState.projectParams?.manualDevHours) {
      const hours = formState.projectParams.manualDevHours;
      if (hours <= 10) {
        defaults.projectName = "Quick Development Task";
        defaults.projectDescription = "Small development task leveraging AI assistance for rapid delivery";
      } else if (hours <= 80) {
        defaults.projectName = "Development Sprint";
        defaults.projectDescription = "Medium-scale development project with AI-powered acceleration";
      } else if (hours <= 200) {
        defaults.projectName = "Feature Development Project";
        defaults.projectDescription = "Comprehensive feature development using agentic development practices";
      } else {
        defaults.projectName = "Enterprise Development Initiative";
        defaults.projectDescription = "Large-scale development project with AI-assisted delivery";
      }
    } else if (formState.teamParams?.numberOfDevs) {
      defaults.projectName = "Ongoing AI Development";
      defaults.projectDescription = "Continuous development workflow with AI assistance";
    }

    // Smart customer name suggestion
    if (!defaults.customerName) {
      defaults.customerName = "Development Team";
    }

    return Object.keys(defaults).length > 0 ? defaults : null;
  };

  const handleProjectDetailsChange = (updates: any) => {
    setFormState({
      ...formState,
      globalParams: {
        ...formState.globalParams,
        ...updates,
      },
    });
  };

  const handleProjectParamsChange = (updates: any) => {
    setFormState({
      ...formState,
      projectParams: {
        ...formState.projectParams,
        ...updates,
      },
    });
  };

  const handleTeamParamsChange = (updates: any) => {
    setFormState({
      ...formState,
      teamParams: {
        ...formState.teamParams,
        ...updates,
      },
    });
  };

  const handleProductParamsChange = (updates: any) => {
    setFormState({
      ...formState,
      productParams: {
        ...formState.productParams,
        ...updates,
      },
    });
  };

  const handleGlobalParamsChange = (updates: any) => {
    setFormState({
      ...formState,
      globalParams: {
        ...formState.globalParams,
        ...updates,
      },
    });
  };

  const renderParameterSections = () => {
    const sections = [];

    // Always show project details
    sections.push(
      <div key="project-details" className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
        <ProjectDetailsForm
          value={formState.globalParams || {}}
          onChange={handleProjectDetailsChange}
        />
      </div>
    );

    // Show project parameters for one-off projects and both
    if (formState.projectType === 'oneoff' || formState.projectType === 'both') {
      sections.push(
        <div key="project-params" className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Parameters</h3>
          <ProjectParametersForm
            value={formState.projectParams || {}}
            onChange={handleProjectParamsChange}
            formState={formState}
          />
        </div>
      );
    }

    // Show team parameters for ongoing and both projects
    if (formState.projectType === 'ongoing' || formState.projectType === 'both') {
      sections.push(
        <div key="team-params" className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Parameters</h3>
          <TeamParametersForm
            value={formState.teamParams || {}}
            onChange={handleTeamParamsChange}
            formState={formState}
          />
        </div>
      );
    }

    // Show product parameters for ongoing and both projects
    if (formState.projectType === 'ongoing' || formState.projectType === 'both') {
      sections.push(
        <div key="product-params" className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Parameters</h3>
          <ProductParametersForm
            value={formState.productParams || {}}
            onChange={handleProductParamsChange}
            formState={formState}
          />
        </div>
      );
    }

    // Always show global parameters last
    sections.push(
      <div key="global-params" className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Global Parameters</h3>
        <GlobalParametersForm
          value={formState.globalParams || {}}
          onChange={handleGlobalParamsChange}
        />
      </div>
    );

    return sections;
  };

  const getStepDescription = () => {
    switch (formState.projectType) {
      case 'oneoff':
        return 'Configure the parameters for your one-off project calculation.';
      case 'ongoing':
        return 'Set up your team and product parameters for ongoing usage calculations.';
      case 'both':
        return 'Configure parameters for both your one-off project and ongoing usage.';
      default:
        return 'Configure the parameters for your calculation.';
    }
  };

  return (
    <WizardStep
      title="Configure Parameters"
      description={getStepDescription()}
    >
      <div className="space-y-6">
        {/* Smart Defaults Info and Advanced Mode Toggle */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Smart Defaults Applied
                </p>
                <p className="text-xs text-blue-600">
                  Parameters have been pre-configured based on your selected template. You can modify any values as needed.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAdvancedMode(!showAdvancedMode)}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 whitespace-nowrap ml-4"
            >
              {showAdvancedMode ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          {showAdvancedMode && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Template Source</h4>
                  <p className="text-blue-600">
                    Values are based on industry standards for {formState.projectType} projects
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Customisation</h4>
                  <p className="text-blue-600">
                    All parameters can be adjusted to match your specific requirements
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {renderParameterSections()}
      </div>
    </WizardStep>
  );
};
