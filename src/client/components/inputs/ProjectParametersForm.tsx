import React from 'react';
import { ProjectParameters, CalculationFormState } from '@/shared/types/models';
import { FormSection } from './FormSection';
import { NumericInput, formatNumber } from './NumericInput';

interface ProjectParametersFormProps {
  value: Partial<ProjectParameters>;
  onChange: (params: Partial<ProjectParameters>) => void;
  errors?: Partial<Record<keyof ProjectParameters, string>>;
  formState: CalculationFormState;
}

export const ProjectParametersForm: React.FC<ProjectParametersFormProps> = ({
  value,
  onChange,
  errors,
  formState
}) => {
  const handleChange = <K extends keyof ProjectParameters>(
    key: K,
    val: ProjectParameters[K] | undefined
  ) => {
    onChange({
      ...value,
      [key]: val
    });
  };

  const hoursPerMonth = 176; // 22 days * 8 hours
  const monthlyDevCost = value.manualDevHours && value.averageHourlyRate
    ? value.manualDevHours * value.averageHourlyRate
    : undefined;

  const fteCount = value.manualDevHours
    ? Math.round((value.manualDevHours / hoursPerMonth) * 10) / 10
    : undefined;

  return (
    <FormSection
      title={`Project Parameters ${formState?.projectType === 'both' ? '(Initial Implementation Phase)' : ''}`}
      description={
        formState?.projectType === 'both'
          ? "Configure parameters for the initial project implementation phase - one-time setup and development"
          : "Configure your project's development and token usage parameters"
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NumericInput
          label="Manual Development Hours"
          value={value.manualDevHours}
          onChange={(v) => handleChange('manualDevHours', v)}
          min={1}
          step={1}
          hint={
            <>
              Estimated hours for traditional development
              {fteCount && (
                <div className="mt-1 text-xs text-gray-500">
                  ≈ {fteCount} FTE months
                </div>
              )}
            </>
          }
          error={errors?.manualDevHours}
          required
        />

        <NumericInput
          label="Average Hourly Rate"
          value={value.averageHourlyRate}
          onChange={(v) => handleChange('averageHourlyRate', v)}
          min={1}
          step={1}
          prefix="$"
          suffix="/hr"
          hint={
            <>
              Average developer hourly rate
              {monthlyDevCost && (
                <div className="mt-1 text-xs text-gray-500">
                  Total cost: ${formatNumber(monthlyDevCost, 0)}
                </div>
              )}
            </>
          }
          error={errors?.averageHourlyRate}
          required
        />

        <NumericInput
          label="Agentic Acceleration Multiplier"
          value={value.agenticMultiplier}
          onChange={(v) => handleChange('agenticMultiplier', v)}
          min={1}
          max={10}
          step={0.1}
          hint={
            <>
              How many times faster development is with agentic coding (e.g., 3.0 means 3x faster)
              {value.agenticMultiplier && value.manualDevHours && (
                <div className="mt-1 text-xs text-gray-500">
                  ≈ {Math.round(value.manualDevHours / value.agenticMultiplier)} hours saved
                </div>
              )}
            </>
          }
          error={errors?.agenticMultiplier}
          required
          allowDecimals
        />

        <NumericInput
          label="Human Guidance Time"
          value={value.humanGuidanceTime}
          onChange={(v) => handleChange('humanGuidanceTime', v)}
          min={0}
          step={1}
          hint={
            <>
              Hours required for human guidance when using agentic coding approach
              {value.humanGuidanceTime && value.averageHourlyRate && (
                <div className="mt-1 text-xs text-gray-500">
                  Cost: ${formatNumber(value.humanGuidanceTime * value.averageHourlyRate, 0)}
                </div>
              )}
            </>
          }
          error={errors?.humanGuidanceTime}
          required
        />

        <NumericInput
          label="AI Processing Time"
          value={value.aiProcessingTime}
          onChange={(v) => handleChange('aiProcessingTime', v)}
          min={0}
          step={0.5}
          hint={
            <>
              Time in hours that AI inference might take (no cost impact, affects timeline only)
              {value.aiProcessingTime !== undefined && (
                <div className="mt-1 text-xs text-gray-500">
                  No cost impact
                </div>
              )}
            </>
          }
          error={errors?.aiProcessingTime}
        />

        <NumericInput
          label="Project AI Setup Time"
          value={value.projectAiSetupTime}
          onChange={(v) => handleChange('projectAiSetupTime', v)}
          min={0}
          step={1}
          hint={
            <>
              Hours required for initial AI tooling and configuration setup
              {value.projectAiSetupTime !== undefined && value.averageHourlyRate && (
                <div className="mt-1 text-xs text-gray-500">
                  Cost: ${formatNumber(value.projectAiSetupTime * value.averageHourlyRate, 0)}
                </div>
              )}
            </>
          }
          error={errors?.projectAiSetupTime}
        />

        <NumericInput
          label="Output Token Percentage"
          value={value.outputTokenPercentage}
          onChange={(v) => handleChange('outputTokenPercentage', v)}
          min={1}
          max={100}
          step={1}
          suffix="%"
          hint={
            <>
              Percentage of output tokens relative to input tokens
              {value.outputTokenPercentage && value.totalProjectTokens && (
                <div className="mt-1 text-xs text-gray-500">
                  Output: {formatNumber(value.totalProjectTokens * (value.outputTokenPercentage / 100) / 1000000, 1)}M tokens
                </div>
              )}
            </>
          }
          error={errors?.outputTokenPercentage}
          required
        />

        <NumericInput
          label="Cache Hit Rate"
          value={value.cachedTokenPercentage}
          onChange={(v) => handleChange('cachedTokenPercentage', v)}
          min={0}
          max={100}
          step={1}
          suffix="%"
          hint={
            <>
              Percentage of tokens that will be cache hits
              {value.cachedTokenPercentage && value.totalProjectTokens && (
                <div className="mt-1 text-xs text-gray-500">
                  Cache: {formatNumber(value.totalProjectTokens * (value.cachedTokenPercentage / 100) / 1000000, 1)}M tokens
                </div>
              )}
            </>
          }
          error={errors?.cachedTokenPercentage}
          required
          allowDecimals
        />

        <NumericInput
          label="Total Project Tokens (millions)"
          value={value.totalProjectTokens !== undefined ? value.totalProjectTokens / 1000000 : undefined}
          onChange={(v) => handleChange('totalProjectTokens', v ? v * 1000000 : undefined)}
          min={0.001}
          step={0.1}
          hint={
            <>
              Estimated total input tokens for the project (in millions)
              {value.totalProjectTokens && (
                <div className="mt-1 text-xs text-gray-500">
                  ≈ {formatNumber(value.totalProjectTokens / 1000000, 1)}M tokens
                </div>
              )}
            </>
          }
          error={errors?.totalProjectTokens}
          required
        />
      </div>
    </FormSection>
  );
};
