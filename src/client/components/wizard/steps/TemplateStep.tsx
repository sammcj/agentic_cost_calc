import React, { useState } from 'react';
import { WizardStep } from '../WizardStep';
import { useWizard } from '../WizardProvider';
import { templates, Template } from '@/shared/utils/projectTemplates';
import { calculateCosts } from '@/shared/utils/calculations';
import { formatTokens } from '@/shared/utils/formatting';

export const TemplateStep: React.FC = () => {
  const { formState, setFormState, markStepComplete, goToNextStep } = useWizard();
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  // Filter templates based on selected project type
  const filteredTemplates = templates.filter(template => {
    if (!formState.projectType) return true;

    if (formState.projectType === 'oneoff') {
      return template.defaultValues.projectType === 'oneoff';
    }
    if (formState.projectType === 'ongoing') {
      return template.defaultValues.projectType === 'ongoing';
    }
    if (formState.projectType === 'both') {
      // For combined projects, show only templates that make sense as starting points
      // Prioritize project templates since they often include initial development + ongoing usage
      return template.defaultValues.projectType === 'oneoff';
    }
    return true;
  });

  // Group templates for combined projects
  const groupedTemplates = formState.projectType === 'both'
    ? {
        project: filteredTemplates,
        ongoing: templates.filter(t => t.defaultValues.projectType === 'ongoing')
      }
    : { all: filteredTemplates };

  // Get the templates to display based on project type
  const templatesToDisplay = formState.projectType === 'both'
    ? groupedTemplates.project || []
    : groupedTemplates.all || [];

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

  const getTemplatePreview = (template: Template) => {
    // Simplified preview based on template parameters without complex calculations
    if (template.defaultValues.projectType === 'oneoff' && template.defaultValues.projectParams) {
      const params = template.defaultValues.projectParams;
      const traditionalCost = (params.manualDevHours || 0) * (params.averageHourlyRate || 200);
      const agenticCost = traditionalCost / (params.agenticMultiplier || 3);
      const savings = traditionalCost - agenticCost;
      const savingsPercentage = Math.round((savings / traditionalCost) * 100);

      return {
        type: 'project',
        traditionalCost,
        agenticCost,
        savings,
        savingsPercentage,
        timeTraditional: params.manualDevHours || 0,
        timeAgentic: Math.round((params.manualDevHours || 0) / (params.agenticMultiplier || 3))
      };
    } else if (template.defaultValues.projectType === 'ongoing') {
      // Simplified ongoing cost estimation
      let dailyCost = 0;
      if (template.defaultValues.teamParams) {
        const teamParams = template.defaultValues.teamParams;
        dailyCost += ((teamParams.tokensPerDevPerDay || 0) * (teamParams.numberOfDevs || 0)) * 0.000003; // Rough token cost estimate
      }
      if (template.defaultValues.productParams) {
        const productParams = template.defaultValues.productParams;
        dailyCost += (productParams.tokensPerDayOngoing || 0) * 0.000003; // Rough token cost estimate
      }

      return {
        type: 'ongoing',
        dailyCost: dailyCost * 1.56, // Convert to AUD roughly
        monthlyCost: dailyCost * 30 * 1.56,
        dailyTokens: 0 // Simplified
      };
    }
    return null;
  };

  const formatCurrency = (amount: number, currency: string = 'AUD'): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const toggleTemplateExpansion = (templateId: string) => {
    setExpandedTemplate(expandedTemplate === templateId ? null : templateId);
  };

  const getBenefits = (template: Template) => {
    const benefits = [];

    if (template.defaultValues.projectType === 'oneoff') {
      benefits.push('Faster project delivery');
      benefits.push('Reduced development costs');
      benefits.push('Consistent code quality');
    } else if (template.defaultValues.projectType === 'ongoing') {
      if (template.defaultValues.teamParams) {
        benefits.push('Enhanced developer productivity');
        benefits.push('Accelerated feature development');
        benefits.push('Improved code consistency');
      }
      if (template.defaultValues.productParams) {
        benefits.push('Scalable AI integration');
        benefits.push('Cost-effective operations');
        benefits.push('Predictable usage patterns');
      }
    }

    return benefits;
  };

  return (
    <WizardStep
      title="Choose a template"
      description="Start with a pre-configured template that matches your project type"
    >
      <div className="max-w-6xl mx-auto">
        {formState.projectType === 'both' ? (
          /* Combined Project Layout */
          <div className="space-y-8">
            {/* Explanation for Combined Projects */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-blue-900">Combined Project Setup</h3>
                  <p className="mt-2 text-sm text-blue-700">
                    For combined projects, start with a <strong>project template</strong> that matches your initial development scope.
                    You'll be able to add ongoing usage parameters in the next step to calculate both upfront development costs and ongoing operational costs.
                  </p>
                </div>
              </div>
            </div>

            {/* Project Templates Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Choose Your Initial Development Scope
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Select the template that best matches your upfront development requirements:
              </p>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {templatesToDisplay.map((template) => {
                  const isExpanded = expandedTemplate === template.id;
                  const preview = getTemplatePreview(template);
                  const benefits = getBenefits(template);

                  return (
                    <div
                      key={template.id}
                      className={`relative cursor-pointer rounded-lg border-2 bg-white transition-all hover:shadow-lg ${
                        isExpanded
                          ? 'border-blue-500 shadow-lg transform scale-105'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => toggleTemplateExpansion(template.id)}
                    >
                      <div className="p-6">
                        {/* Combined Project Badge */}
                        <div className="absolute top-2 right-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            For Combined Project
                          </span>
                        </div>

                        {/* Icon and Title */}
                        <div className="flex items-center mb-4">
                          <div className="text-blue-600 mr-3">
                            {getTemplateIcon(template.id)}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {template.name}
                          </h3>
                          <div className="ml-auto">
                            <svg
                              className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        {/* Rest of template card content */}
                        <p className="text-gray-600 text-sm mb-4">
                          {template.description}
                        </p>

                        <div className="mb-4">
                          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            Examples
                          </h4>
                          <p className="text-xs text-gray-500 italic">
                            {template.examples}
                          </p>
                        </div>

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

                        {preview && (
                          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                            <h4 className="text-xs font-medium text-green-700 uppercase tracking-wide mb-2">
                              Initial Development Cost
                            </h4>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Traditional:</span>
                                <span className="font-medium text-gray-900">{formatCurrency(preview.traditionalCost || 0, 'AUD')}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">With AI:</span>
                                <span className="font-medium text-green-700">{formatCurrency(preview.agenticCost || 0, 'AUD')}</span>
                              </div>
                              <div className="flex justify-between text-xs font-semibold border-t border-green-200 pt-1">
                                <span className="text-green-700">Savings:</span>
                                <span className="text-green-700">{formatCurrency(preview.savings || 0, 'AUD')} ({preview.savingsPercentage || 0}%)</span>
                              </div>
                            </div>
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                              💡 Ongoing costs will be configured in the next step
                            </div>
                          </div>
                        )}

                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
                            <div className="mb-4">
                              <h4 className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">
                                Key Benefits
                              </h4>
                              <div className="space-y-1">
                                {benefits.map((benefit, index) => (
                                  <div key={index} className="flex items-center text-xs text-gray-700">
                                    <svg className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    {benefit}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        <button
                          className="w-full mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTemplateSelect(template);
                          }}
                          aria-label={`Select ${template.name} template for combined project`}
                        >
                          Use This Template
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No templates available for the selected project type.</p>
          </div>
        ) : (
          /* Standard Template Layout */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => {
              const isExpanded = expandedTemplate === template.id;
              const preview = getTemplatePreview(template);
              const benefits = getBenefits(template);

              return (
                <div
                  key={template.id}
                  className={`relative cursor-pointer rounded-lg border-2 bg-white transition-all hover:shadow-lg ${
                    isExpanded
                      ? 'border-blue-500 shadow-lg transform scale-105'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => toggleTemplateExpansion(template.id)}
                >
                  <div className="p-6">
                    {/* Icon and Title */}
                    <div className="flex items-center mb-4">
                      <div className="text-blue-600 mr-3">
                        {getTemplateIcon(template.id)}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {template.name}
                      </h3>
                      <div className="ml-auto">
                        <svg
                          className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
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

                    {/* Typical Values */}
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

                    {/* Cost Preview */}
                    {preview && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                        <h4 className="text-xs font-medium text-green-700 uppercase tracking-wide mb-2">
                          Estimated Savings
                        </h4>
                        {preview.type === 'project' ? (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Traditional:</span>
                              <span className="font-medium text-gray-900">{formatCurrency(preview.traditionalCost || 0, 'AUD')}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">With AI:</span>
                              <span className="font-medium text-green-700">{formatCurrency(preview.agenticCost || 0, 'AUD')}</span>
                            </div>
                            <div className="flex justify-between text-xs font-semibold border-t border-green-200 pt-1">
                              <span className="text-green-700">Savings:</span>
                              <span className="text-green-700">{formatCurrency(preview.savings || 0, 'AUD')} ({preview.savingsPercentage || 0}%)</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Time:</span>
                              <span className="font-medium text-gray-900">{preview.timeTraditional || 0}h → {preview.timeAgentic || 0}h</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Daily cost:</span>
                              <span className="font-medium text-gray-900">{formatCurrency(preview.dailyCost || 0, 'AUD')}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Monthly cost:</span>
                              <span className="font-medium text-gray-900">{formatCurrency(preview.monthlyCost || 0, 'AUD')}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Daily tokens:</span>
                              <span className="font-medium text-gray-900">{((preview.dailyTokens || 0) / 1000000).toFixed(1)}M</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
                        {/* Benefits */}
                        <div className="mb-4">
                          <h4 className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">
                            Key Benefits
                          </h4>
                          <div className="space-y-1">
                            {benefits.map((benefit, index) => (
                              <div key={index} className="flex items-center text-xs text-gray-700">
                                <svg className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {benefit}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Use Case Details */}
                        <div className="mb-4">
                          <h4 className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">
                            Best For
                          </h4>
                          <p className="text-xs text-gray-600">
                            {template.defaultValues.projectType === 'oneoff'
                              ? 'Teams looking to accelerate specific project delivery with AI assistance'
                              : 'Organizations implementing ongoing AI-powered development workflows'
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Select Button */}
                    <button
                      className="w-full mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTemplateSelect(template);
                      }}
                      aria-label={`Select ${template.name} template`}
                    >
                      Use This Template
                    </button>
                  </div>
                </div>
              );
            })}
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
              aria-label="Start with basic template for customisation"
            >
              Start with Basic Template
            </button>
          </div>
        </div>
      </div>
    </WizardStep>
  );
};
