import React from 'react';
import { GlobalParameters } from '@/shared/types/models';
import { FormSection } from './FormSection';
import { NumericInput } from './NumericInput';
import { FormGroup } from './FormGroup';

interface GlobalParametersFormProps {
  value: Partial<GlobalParameters>;
  onChange: (params: Partial<GlobalParameters>) => void;
  errors?: Partial<Record<keyof GlobalParameters, string>>;
}

export const GlobalParametersForm: React.FC<GlobalParametersFormProps> = ({
  value,
  onChange,
  errors
}) => {
  const handleChange = <K extends keyof GlobalParameters>(
    key: K,
    val: GlobalParameters[K] | undefined
  ) => {
    onChange({
      ...value,
      [key]: val
    });
  };

  return (
    <FormSection
      title="Global Parameters"
      description="Configure global settings and adjustments"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NumericInput
          label="Currency Rate (USD to AUD)"
          value={value.currencyRate}
          onChange={(v) => handleChange('currencyRate', v)}
          min={0.01}
          step={0.01}
          hint="Current USD to AUD exchange rate"
          error={errors?.currencyRate}
          required
          allowDecimals
        />

        <NumericInput
          label="AI Capability Factor"
          value={value.aiCapabilityFactor}
          onChange={(v) => handleChange('aiCapabilityFactor', v)}
          min={0.1}
          max={3}
          step={0.1}
          hint="Adjustment for AI capability impact (0.1-3.0)"
          error={errors?.aiCapabilityFactor}
          required
          allowDecimals
        />

        <NumericInput
          label="Total Cost Multiplier"
          value={value.totalCostMultiplier}
          onChange={(v) => handleChange('totalCostMultiplier', v)}
          min={0.1}
          max={5}
          step={0.1}
          hint="Overall cost adjustment factor (0.1-5.0)"
          error={errors?.totalCostMultiplier}
          required
          allowDecimals
        />
      </div>

      <FormGroup
        label="Disclaimer Text"
        hint="Legal disclaimer text for calculations"
        error={errors?.disclaimerText}
      >
        <textarea
          value={value.disclaimerText}
          onChange={(e) => handleChange('disclaimerText', e.target.value)}
          className="form-input mt-1 block w-full h-24"
          placeholder="Enter disclaimer text..."
        />
      </FormGroup>
    </FormSection>
  );
};
