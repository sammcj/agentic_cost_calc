import React from 'react';
import { useWizard } from '../WizardProvider';
import { WizardStep } from '../WizardStep';

export const ReviewStep: React.FC = () => {
  const { formState, handleCalculate, isCalculating } = useWizard();

  const renderProjectTypeSection = () => {
    const typeLabels = {
      oneoff: 'One-off Project',
      ongoing: 'Ongoing Usage',
      both: 'Combined Project & Ongoing Usage'
    };

    return (
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Project Type</h3>
        <p className="text-blue-800">{typeLabels[formState.projectType || 'oneoff']}</p>
      </div>
    );
  };

  const renderModelSection = () => {
    if (!formState.modelConfig?.primaryModel) return null;

    return (
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-2">AI Model Configuration</h3>
        <div className="text-green-800">
          <p><strong>Primary Model:</strong> {formState.modelConfig.primaryModel.inputTokenCost1M ? 'Selected' : 'Not configured'}</p>
          {formState.modelConfig.secondaryModel && (
            <p><strong>Secondary Model:</strong> Configured</p>
          )}
          {formState.modelConfig.modelRatio && (
            <p><strong>Model Ratio:</strong> {(formState.modelConfig.modelRatio * 100).toFixed(0)}% primary</p>
          )}
        </div>
      </div>
    );
  };

  const renderProjectDetailsSection = () => {
    const details = formState.globalParams;
    if (!details || (!details.customerName && !details.projectName && !details.projectDescription)) {
      return null;
    }

    return (
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="font-semibold text-purple-900 mb-2">Project Details</h3>
        <div className="text-purple-800 space-y-1">
          {details.customerName && <p><strong>Client:</strong> {details.customerName}</p>}
          {details.projectName && <p><strong>Project:</strong> {details.projectName}</p>}
          {details.projectDescription && (
            <div>
              <strong>Description:</strong>
              <p className="mt-1 text-sm">{details.projectDescription}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProjectParamsSection = () => {
    const params = formState.projectParams;
    if (!params || (formState.projectType !== 'oneoff' && formState.projectType !== 'both')) {
      return null;
    }

    return (
      <div className="bg-orange-50 p-4 rounded-lg">
        <h3 className="font-semibold text-orange-900 mb-2">Project Parameters</h3>
        <div className="text-orange-800 space-y-1">
          {params.manualDevHours && <p><strong>Manual Dev Hours:</strong> {params.manualDevHours}</p>}
          {params.averageHourlyRate && <p><strong>Hourly Rate:</strong> ${params.averageHourlyRate}/hr</p>}
          {params.agenticMultiplier && <p><strong>Agentic Multiplier:</strong> {params.agenticMultiplier}x</p>}
          {params.totalProjectTokens && <p><strong>Total Tokens:</strong> {(params.totalProjectTokens / 1000000).toFixed(1)}M</p>}
          {params.humanGuidanceTime !== undefined && <p><strong>Human Guidance:</strong> {params.humanGuidanceTime} hours</p>}
        </div>
      </div>
    );
  };

  const renderTeamParamsSection = () => {
    const params = formState.teamParams;
    if (!params || (formState.projectType !== 'ongoing' && formState.projectType !== 'both')) {
      return null;
    }

    return (
      <div className="bg-indigo-50 p-4 rounded-lg">
        <h3 className="font-semibold text-indigo-900 mb-2">Team Parameters</h3>
        <div className="text-indigo-800 space-y-1">
          {params.numberOfDevs && <p><strong>Number of Developers:</strong> {params.numberOfDevs}</p>}
          {params.tokensPerDevPerDay && <p><strong>Tokens per Dev/Day:</strong> {(params.tokensPerDevPerDay / 1000000).toFixed(1)}M</p>}
        </div>
      </div>
    );
  };

  const renderProductParamsSection = () => {
    const params = formState.productParams;
    if (!params || (formState.projectType !== 'ongoing' && formState.projectType !== 'both')) {
      return null;
    }

    return (
      <div className="bg-pink-50 p-4 rounded-lg">
        <h3 className="font-semibold text-pink-900 mb-2">Product Parameters</h3>
        <div className="text-pink-800 space-y-1">
          {params.tokensPerDayOngoing && <p><strong>Daily Token Usage:</strong> {(params.tokensPerDayOngoing / 1000000).toFixed(1)}M</p>}
          {params.numberOfApps && <p><strong>Number of Apps:</strong> {params.numberOfApps}</p>}
          {params.outputTokenPercentage && <p><strong>Output Token %:</strong> {params.outputTokenPercentage}%</p>}
          {params.cachedTokenPercentage && <p><strong>Cache Hit Rate:</strong> {params.cachedTokenPercentage}%</p>}
        </div>
      </div>
    );
  };

  const renderGlobalParamsSection = () => {
    const params = formState.globalParams;
    if (!params) return null;

    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Global Parameters</h3>
        <div className="text-gray-800 space-y-1">
          {params.currencyRate && <p><strong>Currency Rate (USD to AUD):</strong> {params.currencyRate}</p>}
          {params.aiCapabilityFactor && <p><strong>AI Capability Factor:</strong> {params.aiCapabilityFactor}</p>}
          {params.totalCostMultiplier && <p><strong>Cost Multiplier:</strong> {params.totalCostMultiplier}</p>}
        </div>
      </div>
    );
  };

  return (
    <WizardStep
      title="Review Your Configuration"
      description="Please review your settings before calculating the results."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderProjectTypeSection()}
          {renderModelSection()}
          {renderProjectDetailsSection()}
          {renderProjectParamsSection()}
          {renderTeamParamsSection()}
          {renderProductParamsSection()}
          {renderGlobalParamsSection()}
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-center">
            <button
              onClick={handleCalculate}
              disabled={isCalculating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              {isCalculating ? 'Calculating...' : 'Calculate Results'}
            </button>
          </div>
        </div>
      </div>
    </WizardStep>
  );
};
