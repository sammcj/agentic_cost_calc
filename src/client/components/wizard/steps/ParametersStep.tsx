import React from 'react';
import { useWizard } from '../WizardProvider';
import { WizardStep } from '../WizardStep';
import { ProjectParametersForm } from '../../inputs/ProjectParametersForm';
import { TeamParametersForm } from '../../inputs/TeamParametersForm';
import { ProductParametersForm } from '../../inputs/ProductParametersForm';
import { GlobalParametersForm } from '../../inputs/GlobalParametersForm';
import { ProjectDetailsForm } from '../../inputs/ProjectDetailsForm';

export const ParametersStep: React.FC = () => {
  const { formState, setFormState } = useWizard();

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
        {renderParameterSections()}
      </div>
    </WizardStep>
  );
};
