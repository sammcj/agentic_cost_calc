import React, { useState } from 'react';
import { WizardStep } from '../WizardStep';
import { useWizard } from '../WizardProvider';
import { getModelOptions, getModelAgenticWarning, isModelAgenticCapable } from '@/shared/utils/modelConfig';
import { ModelProfile } from '@/shared/types/models';

export const ModelStep: React.FC = () => {
  const { formState, setFormState, markStepComplete, goToNextStep } = useWizard();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const modelOptions = getModelOptions();

  const handlePrimaryModelSelect = (modelProfile: ModelProfile) => {
    setFormState({
      ...formState,
      modelConfig: {
        ...formState.modelConfig,
        primaryModel: modelProfile,
        // Reset secondary model if it was set
        secondaryModel: undefined,
        modelRatio: undefined
      }
    });
  };

  const handleSecondaryModelSelect = (modelProfile: ModelProfile) => {
    setFormState({
      ...formState,
      modelConfig: {
        ...formState.modelConfig,
        secondaryModel: modelProfile,
        modelRatio: formState.modelConfig.modelRatio || 0.7 // Default to 70% primary
      }
    });
  };

  const handleRatioChange = (ratio: number) => {
    setFormState({
      ...formState,
      modelConfig: {
        ...formState.modelConfig,
        modelRatio: ratio
      }
    });
  };

  const handleContinue = () => {
    markStepComplete('model');
    goToNextStep();
  };

  const getModelIcon = (modelId: string) => {
    if (modelId.includes('claude')) {
      return '🤖';
    } else if (modelId.includes('openai') || modelId.includes('o3')) {
      return '🧠';
    } else if (modelId.includes('deepseek')) {
      return '🔍';
    } else if (modelId.includes('gemini')) {
      return '💎';
    } else if (modelId.includes('amazon') || modelId.includes('nova')) {
      return '☁️';
    }
    return '🤖';
  };

  const getModelDescription = (modelId: string) => {
    const descriptions: Record<string, string> = {
      claude_3_7_sonnet: 'Excellent for complex reasoning and coding tasks. Best overall choice for agentic development.',
      claude_3_5_haiku: 'Fast and cost-effective, but limited agentic coding capabilities.',
      openai_o3: 'Advanced reasoning model with strong problem-solving capabilities.',
      openai_o3_mini: 'Balanced performance and cost with good reasoning abilities.',
      deepseek_chat: 'Cost-effective option with solid coding capabilities.',
      deepseek_r1: 'Enhanced reasoning model with improved performance.',
      deepseek_r1_bedrock: 'Enterprise-grade version with enhanced reliability.',
      gemini_2_5_pro: 'Google\'s advanced model with strong multimodal capabilities.',
      amazon_nova_pro: 'AWS native model, but limited agentic coding capabilities.',
      amazon_nova_lite: 'Ultra-low cost option with basic capabilities.'
    };
    return descriptions[modelId] || 'AI language model for various tasks.';
  };

  const selectedPrimaryModel = modelOptions.find(
    option => option.profile === formState.modelConfig?.primaryModel
  );

  const selectedSecondaryModel = modelOptions.find(
    option => option.profile === formState.modelConfig?.secondaryModel
  );

  const canContinue = !!formState.modelConfig?.primaryModel;

  return (
    <WizardStep
      title="Choose your AI model"
      description="Select the AI model(s) that will power your development workflow"
    >
      <div className="max-w-4xl mx-auto">
        {/* Primary Model Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Model</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modelOptions.map((option) => {
              const isSelected = selectedPrimaryModel?.value === option.value;
              const warning = getModelAgenticWarning(option.value);
              const isAgenticCapable = isModelAgenticCapable(option.value);

              return (
                <div
                  key={option.value}
                  className={`
                    relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md
                    ${isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                    ${!isAgenticCapable && formState.projectType !== 'ongoing' ? 'opacity-75' : ''}
                  `}
                  onClick={() => handlePrimaryModelSelect(option.profile)}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Model Info */}
                  <div className="flex items-start mb-3">
                    <span className="text-2xl mr-3">{getModelIcon(option.value)}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {option.label}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {getModelDescription(option.value)}
                      </p>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="text-xs text-gray-500 mb-2">
                    <div>Input: ${option.profile.inputTokenCost1M}/1M tokens</div>
                    <div>Output: ${option.profile.outputTokenCost1M}/1M tokens</div>
                  </div>

                  {/* Capabilities */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      {isAgenticCapable ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Agentic
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ✗ Limited
                        </span>
                      )}
                    </div>
                    <div className="text-gray-500">
                      {option.profile.modelSpeedMultiplier}x speed
                    </div>
                  </div>

                  {/* Warning */}
                  {warning && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                      {warning}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800"
          >
            <svg
              className={`h-4 w-4 mr-2 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Advanced: Use multiple models
          </button>
        </div>

        {/* Secondary Model Selection */}
        {showAdvanced && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Secondary Model (Optional)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Use a secondary model for specific tasks or cost optimization. The ratio determines how much each model is used.
            </p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
              {modelOptions.map((option) => {
                const isSelected = selectedSecondaryModel?.value === option.value;
                const isPrimary = selectedPrimaryModel?.value === option.value;

                return (
                  <div
                    key={option.value}
                    className={`
                      relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md
                      ${isSelected
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : isPrimary
                          ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }
                    `}
                    onClick={() => !isPrimary && handleSecondaryModelSelect(option.profile)}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600">
                          <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start mb-2">
                      <span className="text-xl mr-2">{getModelIcon(option.value)}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {option.label}
                        </h4>
                        <div className="text-xs text-gray-500 mt-1">
                          ${option.profile.inputTokenCost1M}/${option.profile.outputTokenCost1M} per 1M
                        </div>
                      </div>
                    </div>

                    {isPrimary && (
                      <div className="text-xs text-gray-500 italic">
                        Already selected as primary
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Model Ratio Slider */}
            {formState.modelConfig?.secondaryModel && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model Usage Ratio
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.1"
                  value={formState.modelConfig.modelRatio || 0.7}
                  onChange={(e) => handleRatioChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>
                    Primary: {Math.round((formState.modelConfig.modelRatio || 0.7) * 100)}%
                  </span>
                  <span>
                    Secondary: {Math.round((1 - (formState.modelConfig.modelRatio || 0.7)) * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`
              px-8 py-3 rounded-lg font-medium transition-colors
              ${canContinue
                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Continue to Parameters
          </button>
        </div>
      </div>
    </WizardStep>
  );
};
