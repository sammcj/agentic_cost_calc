import React from 'react';
import { WizardStep } from '../WizardStep';
import { useWizard } from '../WizardProvider';
import { templates, Template } from '@/shared/utils/projectTemplates';

export const TemplateStep: React.FC = () => {
  const { formState, setFormState, markStepComplete, goToNextStep } = useWizard();

  // Filter templates based on selected project type
  const filteredTemplates = templates.filter(template => {
    if (!formState.projectType) return true;

    if (formState.projectType === 'oneoff') {
      return template.defaultValues.projectType === 'oneoff';
    }
    if (formState.projectType === 'ongoing') {
      return template.defaultValues.projectType === 'ongoing';
    }
    // For 'both', show all templates
    return true;
  });

  const handleTemplateSelect = (template: Template) => {
    // Apply template defaults to form state
    setFormState({
      ...formState,
      ...template.defaultValues,
      // Preserve the user's project type selection
      projectType: formState.projectType
    });

    markStepComplete('template');
    goToNextStep();
  };

  const getTemplateIcon = (templateId: string) => {
    switch (templateId) {
      case 'micro-project':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'small-project':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'medium-project':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'large-project':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
        );
      case 'enterprise-project':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'agentic-coding':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const getEstimatedValues = (template: Template) => {
    const values = [];

    if (template.defaultValues.projectParams) {
      const projectParams = template.defaultValues.projectParams;
      if (projectParams.manualDevHours) {
        values.push(`${projectParams.manualDevHours} hours manual dev`);
      }
      if (projectParams.totalProjectTokens) {
        values.push(`${(projectParams.totalProjectTokens / 1000000).toFixed(0)}M tokens`);
      }
    }

    if (template.defaultValues.teamParams) {
      const teamParams = template.defaultValues.teamParams;
      if (teamParams.numberOfDevs) {
        values.push(`${teamParams.numberOfDevs} developers`);
      }
      if (teamParams.tokensPerDevPerDay) {
        values.push(`${(teamParams.tokensPerDevPerDay / 1000000).toFixed(0)}M tokens/dev/day`);
      }
    }

    if (template.defaultValues.productParams) {
      const productParams = template.defaultValues.productParams;
      if (productParams.numberOfApps) {
        values.push(`${productParams.numberOfApps} app(s)`);
      }
      if (productParams.tokensPerDayOngoing) {
        values.push(`${(productParams.tokensPerDayOngoing / 1000000).toFixed(0)}M tokens/day`);
      }
    }

    return values;
  };

  return (
    <WizardStep
      title="Choose a template"
      description="Start with a pre-configured template that matches your project type"
    >
      <div className="max-w-6xl mx-auto">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No templates available for the selected project type.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="relative cursor-pointer rounded-lg border-2 border-gray-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-lg"
                onClick={() => handleTemplateSelect(template)}
              >
                {/* Icon and Title */}
                <div className="flex items-center mb-4">
                  <div className="text-blue-600 mr-3">
                    {getTemplateIcon(template.id)}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {template.name}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4">
                  {template.description}
                </p>

                {/* Examples */}
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Examples
                  </h4>
                  <p className="text-xs text-gray-500 italic">
                    {template.examples}
                  </p>
                </div>

                {/* Estimated Values */}
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Typical Values
                  </h4>
                  <div className="space-y-1">
                    {getEstimatedValues(template).map((value, index) => (
                      <div key={index} className="flex items-center text-xs text-gray-600">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 flex-shrink-0"></div>
                        {value}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Select Button */}
                <button
                  className="w-full mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTemplateSelect(template);
                  }}
                >
                  Use This Template
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Custom Option */}
        <div className="mt-8 text-center">
          <div className="border-t border-gray-200 pt-8">
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Need something different?
            </h4>
            <p className="text-gray-600 text-sm mb-4">
              You can customise all parameters in the next steps, regardless of which template you choose.
            </p>
            <button
              onClick={() => {
                // Use medium-project as default and let user customise
                const defaultTemplate = templates.find(t => t.id === 'medium-project');
                if (defaultTemplate) {
                  handleTemplateSelect(defaultTemplate);
                }
              }}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Start with Basic Template
            </button>
          </div>
        </div>
      </div>
    </WizardStep>
  );
};
