import React from 'react';
import { ProductParameters, CalculationFormState } from '@/shared/types/models';
import { FormSection } from './FormSection';
import { NumericInput, formatNumber } from './NumericInput';

interface ProductParametersFormProps {
  value: Partial<ProductParameters>;
  onChange: (params: Partial<ProductParameters>) => void;
  errors?: Partial<Record<keyof ProductParameters, string>>;
  formState: CalculationFormState;
}

export const ProductParametersForm: React.FC<ProductParametersFormProps> = ({
  value,
  onChange,
  errors,
  formState
}) => {
  const handleChange = <K extends keyof ProductParameters>(
    key: K,
    val: ProductParameters[K] | undefined
  ) => {
    onChange({
      ...value,
      [key]: val
    });
  };

  return (
    <FormSection
      title={`Product Parameters ${formState?.projectType === 'both' ? '(Ongoing Run Cost Phase)' : ''}`}
      description={
        formState?.projectType === 'both'
          ? "Configure your product's ongoing token usage and scale for maintenance and ongoing run cost"
          : "Configure your product's token usage and scale"
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NumericInput
          label="Daily Ongoing Token Usage (millions)"
          value={value.tokensPerDayOngoing !== undefined ? value.tokensPerDayOngoing / 1000000 : undefined}
          onChange={(v) => handleChange('tokensPerDayOngoing', v ? v * 1000000 : undefined)}
          min={0}
          step={0.1}
          hint={
            <>
              Estimated daily token usage for maintenance and operations
              {value.tokensPerDayOngoing && (
                <div className="mt-1 text-xs text-gray-500">
                  ≈ {formatNumber(value.tokensPerDayOngoing / 1000000, 1)}M tokens/day
                </div>
              )}
            </>
          }
          error={errors?.tokensPerDayOngoing}
          required={false}
          allowDecimals
        />

        <NumericInput
          label="Number of Applications"
          value={value.numberOfApps}
          onChange={(v) => handleChange('numberOfApps', v)}
          min={1}
          step={1}
          hint={
            <>
              Number of applications or systems using AI assistance
              {value.numberOfApps && value.tokensPerDayOngoing && (
                <div className="mt-1 text-xs text-gray-500">
                  Total usage: {formatNumber((value.tokensPerDayOngoing * value.numberOfApps) / 1000000, 1)}M tokens/day
                </div>
              )}
            </>
          }
          error={errors?.numberOfApps}
          required={false}
        />

        <NumericInput
          label="Output Token Percentage"
          value={value.outputTokenPercentage ?? 80}
          onChange={(v) => handleChange('outputTokenPercentage', v)}
          min={0}
          max={100}
          step={1}
          hint="Percentage of output tokens relative to input tokens. Higher means more generation vs processing."
          error={errors?.outputTokenPercentage}
        />

        <NumericInput
          label="Cache Hit Rate Percentage"
          value={value.cachedTokenPercentage ?? 75}
          onChange={(v) => handleChange('cachedTokenPercentage', v)}
          min={0}
          max={100}
          step={1}
          hint="Percentage of tokens that will be cache hits. Lower means more unique/dynamic content."
          error={errors?.cachedTokenPercentage}
        />
      </div>
    </FormSection>
  );
};
