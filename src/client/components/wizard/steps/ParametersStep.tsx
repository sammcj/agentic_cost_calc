import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useWizard } from '../WizardProvider';
import { WizardStep } from '../WizardStep';
import { ParameterSection } from './ParameterSection';
import { ProjectParametersForm } from '../../inputs/ProjectParametersForm';
import { TeamParametersForm } from '../../inputs/TeamParametersForm';
import { ProductParametersForm } from '../../inputs/ProductParametersForm';
import { GlobalParametersForm } from '../../inputs/GlobalParametersForm';
import { NumericInput } from '../../inputs/NumericInput';
import { TextInput } from '../../inputs/TextInput';
import { CalculationFormState } from '@/shared/types/models';

export const ParametersStep: React.FC = () => {
  const { formState, setFormState } = useWizard();
  const [showAdvancedMode, setShowAdvancedMode] = useState(false);
  const [hasUserModifiedDefaults] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));

  // Debug: Track component lifecycle and renders
  console.log(`⚙️ ParametersStep RENDER - formState keys: ${Object.keys(formState || {}).join(', ')}`);

  React.useEffect(() => {
    console.log(`⚙️ ParametersStep MOUNTED`);
    return () => {
      console.log(`⚙️ ParametersStep UNMOUNTED`);
    };
  }, []);


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

  const handleProjectDetailsChange = useCallback((updates: any) => {
    setFormState((prevState: CalculationFormState): CalculationFormState => ({
      ...prevState,
      globalParams: {
        ...prevState.globalParams,
        ...updates,
      },
    }));
  }, [setFormState]);

  const handleProjectParamsChange = useCallback((updates: any) => {
    setFormState((prevState: CalculationFormState): CalculationFormState => ({
      ...prevState,
      projectParams: {
        ...prevState.projectParams,
        ...updates,
      },
    }));
  }, [setFormState]);

  const handleTeamParamsChange = useCallback((updates: any) => {
    setFormState((prevState: CalculationFormState): CalculationFormState => ({
      ...prevState,
      teamParams: {
        ...prevState.teamParams,
        ...updates,
      },
    }));
  }, [setFormState]);

  const handleProductParamsChange = useCallback((updates: any) => {
    setFormState((prevState: CalculationFormState): CalculationFormState => ({
      ...prevState,
      productParams: {
        ...prevState.productParams,
        ...updates,
      },
    }));
  }, [setFormState]);

  const handleGlobalParamsChange = useCallback((updates: any) => {
    setFormState((prevState: CalculationFormState): CalculationFormState => ({
      ...prevState,
      globalParams: {
        ...prevState.globalParams,
        ...updates,
      },
    }));
  }, [setFormState]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };


  // Move QuickConfigSection outside and memoize it properly
  const quickConfigContent = React.useMemo(() => (
    <div className="space-y-6">
      {/* Project Information */}
      <div data-testid="project-details-form">
        <h4 className="text-base font-medium text-gray-900 mb-3">Project Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <TextInput
              key="project-name"
              label="Project Name"
              value={formState.globalParams?.projectName}
              onChange={(v) => handleProjectDetailsChange({ projectName: v })}
              placeholder="Enter project name"
            />
          </div>
          <div>
            <TextInput
              key="customer-name"
              label="Customer/Team Name"
              value={formState.globalParams?.customerName}
              onChange={(v) => handleProjectDetailsChange({ customerName: v })}
              placeholder="Enter customer or team name"
            />
          </div>
        </div>
        <div>
          <TextInput
            key="project-description"
            label="Project Description"
            value={formState.globalParams?.projectDescription}
            onChange={(v) => handleProjectDetailsChange({ projectDescription: v })}
            placeholder="Brief description of your project (optional)"
            rows={2}
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional: Describe what you're building or the purpose of this calculation
          </p>
        </div>
      </div>

      {/* Key Project Parameters */}
      {(formState.projectType === 'oneoff' || formState.projectType === 'both') && (
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-3">Development Scope</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumericInput
              label="Estimated Manual Development Hours"
              value={formState.projectParams?.manualDevHours}
              onChange={(v) => handleProjectParamsChange({ manualDevHours: v })}
              min={1}
              step={1}
              hint="How many hours would this take with traditional development?"
              required
            />
            <NumericInput
              label="Estimated Developer Hourly Rate"
              value={formState.projectParams?.averageHourlyRate}
              onChange={(v) => handleProjectParamsChange({ averageHourlyRate: v })}
              min={1}
              step={1}
              prefix="$"
              suffix="/hr"
              hint="Average hourly rate for your development team"
              required
            />
          </div>
        </div>
      )}

      {/* Team Parameters for ongoing */}
      {(formState.projectType === 'ongoing' || formState.projectType === 'both') && (
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-3">Team Setup</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumericInput
              label="Number of Developers"
              value={formState.teamParams?.numberOfDevs}
              onChange={(v) => handleTeamParamsChange({ numberOfDevs: v })}
              min={1}
              step={1}
              hint="How many developers will use AI assistance?"
              required
            />
            <NumericInput
              label="Estimated Daily AI Tokens Per Developer (Million)"
              value={formState.teamParams?.tokensPerDevPerDay ? formState.teamParams.tokensPerDevPerDay / 1000000 : undefined}
              onChange={(v) => handleTeamParamsChange({ tokensPerDevPerDay: v ? v * 1000000 : undefined })}
              min={0.1}
              step={0.5}
              suffix="M"
              hint="Average daily token usage per developer"
              allowDecimals
            />
          </div>
        </div>
      )}

      {/* AI Acceleration Factor */}
      <div>
        <h4 className="text-base font-medium text-gray-900 mb-3">AI Impact</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumericInput
            label="AI Speed Multiplier"
            value={formState.projectParams?.agenticMultiplier}
            onChange={(v) => handleProjectParamsChange({ agenticMultiplier: v })}
            min={1}
            max={10}
            step={0.1}
            hint="How much faster is development with AI? (e.g., 3.0 = 3x faster)"
            allowDecimals
            required
          />
          <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md">
            <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-800">Template Default Applied</p>
              <p className="text-xs text-green-600">Based on industry benchmarks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ), [
    formState.globalParams?.projectName,
    formState.globalParams?.customerName,
    formState.globalParams?.projectDescription,
    formState.projectType,
    formState.projectParams?.manualDevHours,
    formState.projectParams?.averageHourlyRate,
    formState.projectParams?.agenticMultiplier,
    formState.teamParams?.numberOfDevs,
    formState.teamParams?.tokensPerDevPerDay,
    handleProjectDetailsChange,
    handleProjectParamsChange,
    handleTeamParamsChange
  ]);

  const advancedProjectSection = useMemo(() => (
    <ParameterSection
      id="advanced-project"
      title="Advanced Project Settings"
      description="Fine-tune token usage, caching, and timing parameters for precise calculations"
      isExpanded={expandedSections.has('advanced-project')}
      onToggle={() => toggleSection('advanced-project')}
    >
      <ProjectParametersForm
        value={formState.projectParams || {}}
        onChange={handleProjectParamsChange}
        formState={formState}
      />
    </ParameterSection>
  ), [expandedSections, formState.projectParams, handleProjectParamsChange, formState]);

  const teamParametersSection = useMemo(() => (
    <ParameterSection
      id="team-advanced"
      title="Advanced Team Settings"
      description="Detailed team productivity and workflow parameters"
      isExpanded={expandedSections.has('team-advanced')}
      onToggle={() => toggleSection('team-advanced')}
    >
      <TeamParametersForm
        value={formState.teamParams || {}}
        onChange={handleTeamParamsChange}
        formState={formState}
      />
    </ParameterSection>
  ), [expandedSections, formState.teamParams, handleTeamParamsChange, formState]);

  const productParametersSection = useMemo(() => (
    <ParameterSection
      id="product-advanced"
      title="Product Integration Settings"
      description="Configure AI usage within your product or application"
      isExpanded={expandedSections.has('product-advanced')}
      onToggle={() => toggleSection('product-advanced')}
    >
      <ProductParametersForm
        value={formState.productParams || {}}
        onChange={handleProductParamsChange}
        formState={formState}
      />
    </ParameterSection>
  ), [expandedSections, formState.productParams, handleProductParamsChange, formState]);

  const globalParametersSection = useMemo(() => (
    <ParameterSection
      id="global-advanced"
      title="Global Calculation Settings"
      description="Currency conversion, disclaimers, and calculation modifiers"
      isExpanded={expandedSections.has('global-advanced')}
      onToggle={() => toggleSection('global-advanced')}
    >
      <GlobalParametersForm
        value={formState.globalParams || {}}
        onChange={handleGlobalParamsChange}
      />
    </ParameterSection>
  ), [expandedSections, formState.globalParams, handleGlobalParamsChange]);

  const renderParameterSections = () => {
    const sections = [];

    // Always show quick config first
    sections.push(
      <ParameterSection
        key="quick-config"
        id="basic"
        title="Essential Parameters"
        description="The most important settings for your calculation. These are pre-filled based on your template but can be adjusted."
        badge="Most Important"
        isExpanded={expandedSections.has('basic')}
        onToggle={() => toggleSection('basic')}
      >
        {quickConfigContent}
      </ParameterSection>
    );

    // Advanced project parameters for one-off projects and both
    if (formState.projectType === 'oneoff' || formState.projectType === 'both') {
      sections.push(<React.Fragment key="advanced-project">{advancedProjectSection}</React.Fragment>);
    }

    // Advanced team parameters for ongoing and both projects
    if (formState.projectType === 'ongoing' || formState.projectType === 'both') {
      sections.push(<React.Fragment key="team-advanced">{teamParametersSection}</React.Fragment>);
    }

    // Product parameters for ongoing and both projects
    if (formState.projectType === 'ongoing' || formState.projectType === 'both') {
      sections.push(<React.Fragment key="product-advanced">{productParametersSection}</React.Fragment>);
    }

    // Global parameters last
    sections.push(<React.Fragment key="global-advanced">{globalParametersSection}</React.Fragment>);

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
        {/* Smart Defaults Info and Guidance */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  ✨ Smart Configuration Applied
                </p>
                <p className="text-xs text-blue-700 mb-2">
                  We've pre-configured your parameters based on your selected template. The <strong>Essential Parameters</strong> section below contains the most important settings.
                </p>
                <p className="text-xs text-blue-600">
                  💡 <strong>Tip:</strong> Most users only need to adjust the Essential Parameters. Advanced settings are available if you need fine-tuned control.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAdvancedMode(!showAdvancedMode)}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-white px-2 py-1 rounded border border-blue-200 hover:border-blue-300 transition-colors whitespace-nowrap ml-4"
            >
              {showAdvancedMode ? '↑ Hide Details' : '↓ Show Details'}
            </button>
          </div>

          {showAdvancedMode && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-white bg-opacity-60 p-3 rounded-md">
                  <h4 className="font-semibold text-blue-900 mb-1">📊 Template Source</h4>
                  <p className="text-blue-700">
                    Values are based on industry benchmarks for {formState.projectType} projects
                  </p>
                </div>
                <div className="bg-white bg-opacity-60 p-3 rounded-md">
                  <h4 className="font-semibold text-blue-900 mb-1">🎯 Easy Customization</h4>
                  <p className="text-blue-700">
                    All parameters can be adjusted to match your specific requirements
                  </p>
                </div>
                <div className="bg-white bg-opacity-60 p-3 rounded-md">
                  <h4 className="font-semibold text-blue-900 mb-1">🔧 Progressive Disclosure</h4>
                  <p className="text-blue-700">
                    Essential settings are shown first, advanced options are collapsible
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Usage Guidelines */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-amber-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800 mb-1">
                Quick Start Guide
              </p>
              <p className="text-xs text-amber-700">
                <span className="font-medium">Most users need:</span> Essential Parameters only.
                <span className="font-medium ml-2">Power users:</span> Expand Advanced sections for precise control.
                <span className="font-medium ml-2">All changes:</span> Are saved automatically as you type.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {renderParameterSections()}
        </div>
      </div>
    </WizardStep>
  );
};
