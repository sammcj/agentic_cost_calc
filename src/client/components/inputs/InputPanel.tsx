import React, { useState } from 'react';
import {
  CalculationFormState,
  ProjectParameters,
  TeamParameters,
  ProductParameters,
  GlobalParameters
} from '@/shared/types/models';
import { ProjectTypeSelector } from './ProjectTypeSelector';
import ProjectDetailsForm from './ProjectDetailsForm';
import { TemplateSelector } from './TemplateSelector';
import { ProjectParametersForm } from './ProjectParametersForm';
import { TeamParametersForm } from './TeamParametersForm';
import { ProductParametersForm } from './ProductParametersForm';
import { GlobalParametersForm } from './GlobalParametersForm';
import { ModelSelector, DualModelSelector } from './ModelSelector';
import { getTemplateById } from '@/shared/utils/projectTemplates';
import { getModelById } from '@/shared/utils/modelConfig';

interface InputPanelProps {
  value: CalculationFormState;
  onChange: (state: CalculationFormState) => void;
  errors?: {
    projectType?: string;
    globalParams?: Partial<Record<keyof GlobalParameters, string>>;
    projectParams?: Partial<Record<keyof ProjectParameters, string>>;
    teamParams?: Partial<Record<keyof TeamParameters, string>>;
    productParams?: Partial<Record<keyof ProductParameters, string>>;
  };
}

// Helper to determine if a section should be shown based on project type
const shouldShowSection = (
  section: 'project' | 'team' | 'product',
  projectType?: 'oneoff' | 'ongoing' | 'both'
): boolean => {
  if (!projectType) return false;

  switch (section) {
    case 'project':
      return projectType === 'oneoff' || projectType === 'both';
    case 'team':
    case 'product':
      return projectType === 'ongoing' || projectType === 'both';
    default:
      return false;
  }
};

export const InputPanel: React.FC<InputPanelProps> = ({
  value,
  onChange,
  errors = {}
}) => {
  const [useSecondaryModel, setUseSecondaryModel] = useState<boolean>(
    !!value.modelConfig?.secondaryModel
  );

  const handleTemplateSelect = (templateId: string) => {
    const template = getTemplateById(templateId);

    // Ensure we maintain the proper structure when applying template values
    onChange({
      projectType: template.defaultValues.projectType,
      globalParams: {
        ...value.globalParams,
        ...template.defaultValues.globalParams
      },
      modelConfig: {
        primaryModel: template.defaultValues.modelConfig?.primaryModel || value.modelConfig?.primaryModel,
        secondaryModel: template.defaultValues.modelConfig?.secondaryModel,
        modelRatio: template.defaultValues.modelConfig?.modelRatio
      },
      projectParams: template.defaultValues.projectParams ? {
        ...template.defaultValues.projectParams,
        averageHourlyRate: template.defaultValues.projectParams.averageHourlyRate || 200
      } : undefined,
      teamParams: template.defaultValues.teamParams,
      productParams: template.defaultValues.productParams
    });

    // Update secondary model state based on template
    setUseSecondaryModel(!!template.defaultValues.modelConfig?.secondaryModel);
  };

  const handleToggleSecondaryModel = () => {
    setUseSecondaryModel(!useSecondaryModel);

    // If turning off secondary model, remove it from the form state
    if (useSecondaryModel && value.modelConfig) {
      onChange({
        ...value,
        modelConfig: {
          ...value.modelConfig,
          secondaryModel: undefined,
          modelRatio: undefined
        }
      });
    }
  };

  // Determine which sections to show based on project type
  const showProjectSection = shouldShowSection('project', value.projectType);
  const showTeamSection = shouldShowSection('team', value.projectType);
  const showProductSection = shouldShowSection('product', value.projectType);

  return (
    <div className="space-y-8">
      {/* Project Details */}
      <ProjectDetailsForm
        value={value.globalParams}
        onChange={(params) =>
          onChange({
            ...value,
            globalParams: params
          })
        }
      />

      {/* Template Selection */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="text-md font-medium text-blue-800 mb-2">
          Quick Start
        </h3>
        <p className="text-sm text-blue-600 mb-4">
          Select a template to pre-populate the form with common values, or configure manually below.
        </p>
        <TemplateSelector onSelect={handleTemplateSelect} />
      </div>

      {/* Project Type Selection */}
      <ProjectTypeSelector
        value={value.projectType}
        onChange={(type) => onChange({ ...value, projectType: type })}
        error={errors.projectType}
      />

      {/* Model Selection */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-md font-medium text-gray-800 mb-2">
          Model Configuration
        </h3>

        {!useSecondaryModel ? (
          <>
            <ModelSelector
              value={value.modelConfig?.primaryModel}
              onChange={(model) =>
                onChange({
                  ...value,
                  modelConfig: {
                    ...value.modelConfig,
                    primaryModel: model
                  }
                })
              }
              label="LLM Model"
              required
              projectType={value.projectType}
            />
            <div className="mt-4">
              <button
                type="button"
                onClick={handleToggleSecondaryModel}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Secondary Model
              </button>
            </div>
          </>
        ) : (
          <>
            <DualModelSelector
              primaryModel={value.modelConfig?.primaryModel || getModelById('claude_3_7_sonnet')} // Default to prevent undefined
              secondaryModel={value.modelConfig?.secondaryModel || getModelById('claude_3_5_haiku')} // Default to prevent undefined
              ratio={value.modelConfig?.modelRatio || 0.7}
              onChangePrimary={(model) =>
                onChange({
                  ...value,
                  modelConfig: {
                    ...value.modelConfig,
                    primaryModel: model
                  }
                })
              }
              onChangeSecondary={(model) =>
                onChange({
                  ...value,
                  modelConfig: {
                    ...value.modelConfig,
                    secondaryModel: model
                  }
                })
              }
              onChangeRatio={(ratio) =>
                onChange({
                  ...value,
                  modelConfig: {
                    ...value.modelConfig,
                    modelRatio: ratio
                  }
                })
              }
              projectType={value.projectType}
            />
            <div className="mt-4">
              <button
                type="button"
                onClick={handleToggleSecondaryModel}
                className="text-sm text-red-600 hover:text-red-800 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Remove Secondary Model
              </button>
            </div>
          </>
        )}
      </div>

      {/* Dynamic Form Sections */}
      {value.projectType && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-md font-medium text-gray-800 mb-2">
            Required Parameters for {value.projectType === 'oneoff' ? 'One-off Project' :
                                    value.projectType === 'ongoing' ? 'Ongoing Usage' :
                                    'Combined Project'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {value.projectType === 'oneoff' && 'Configure parameters for a one-time development project.'}
            {value.projectType === 'ongoing' && 'Configure parameters for ongoing AI usage by team and products.'}
            {value.projectType === 'both' && 'Configure parameters for both project development and ongoing usage.'}
          </p>

          {value.projectType === 'both' && (
            <div className="bg-purple-50/50 border border-purple-200 rounded-lg p-4 mb-6">
              <h4 className="text-lg font-semibold text-purple-700 mb-2 flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Initial Implementation Phase
              </h4>
              <p className="text-sm text-purple-600 mb-4 ml-4">
                Configure parameters for the one-time project setup and development phase.
              </p>
            </div>
          )}

          {/* Project Parameters */}
          {showProjectSection && (
            <div className={`mb-6 ${value.projectType === 'both' ? 'ml-4' : ''}`}>
              <ProjectParametersForm
                value={value.projectParams || {}}
                onChange={(params) =>
                  onChange({
                    ...value,
                    projectParams: params as ProjectParameters
                  })
                }
                errors={errors.projectParams}
                formState={value}
              />
            </div>
          )}

          {value.projectType === 'both' && showTeamSection && (
            <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4 mb-6 mt-8">
              <h4 className="text-lg font-semibold text-blue-700 mb-2 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Ongoing Run Cost Phase
              </h4>
              <p className="text-sm text-blue-600 mb-4 ml-4">
                Configure parameters for the ongoing maintenance and operations after project completion.
              </p>
            </div>
          )}

          {/* Team Parameters */}
          {showTeamSection && (
            <div className={`mb-6 ${value.projectType === 'both' ? 'ml-4' : ''}`}>
              <TeamParametersForm
                value={value.teamParams || {}}
                onChange={(params) =>
                  onChange({
                    ...value,
                    teamParams: params as TeamParameters
                  })
                }
                errors={errors.teamParams}
                formState={value}
              />
            </div>
          )}

          {/* Product Parameters */}
          {showProductSection && (
            <div className={`mb-6 ${value.projectType === 'both' ? 'ml-4' : ''}`}>
              <ProductParametersForm
                value={value.productParams || {}}
                onChange={(params) =>
                  onChange({
                    ...value,
                    productParams: params as ProductParameters
                  })
                }
                errors={errors.productParams}
                formState={value}
              />
            </div>
          )}
        </div>
      )}

      {/* Global Parameters */}
      <GlobalParametersForm
        value={value.globalParams || {}}
        onChange={(params) =>
          onChange({
            ...value,
            globalParams: params as GlobalParameters
          })
        }
        errors={errors.globalParams}
      />
    </div>
  );
};
