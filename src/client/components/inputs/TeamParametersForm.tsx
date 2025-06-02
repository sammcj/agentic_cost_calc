import React from 'react';
import { TeamParameters, CalculationFormState } from '@/shared/types/models';
import { FormSection } from './FormSection';
import { NumericInput, formatNumber } from './NumericInput';

interface TeamParametersFormProps {
  value: Partial<TeamParameters>;
  onChange: (params: Partial<TeamParameters>) => void;
  errors?: Partial<Record<keyof TeamParameters, string>>;
  formState: CalculationFormState;
}

export const TeamParametersForm: React.FC<TeamParametersFormProps> = ({
  value,
  onChange,
  errors,
  formState
}) => {
  const handleChange = <K extends keyof TeamParameters>(
    key: K,
    val: TeamParameters[K] | undefined
  ) => {
    onChange({
      ...value,
      [key]: val
    });
  };

  return (
    <FormSection
      title={`Team Parameters ${formState?.projectType === 'both' ? '(Ongoing Run Cost Phase)' : ''}`}
      description={
        formState?.projectType === 'both'
          ? "Configure your development team parameters for the ongoing maintenance and run cost phase"
          : "Configure your team size and token usage"
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NumericInput
          label="Number of Developers"
          value={value.numberOfDevs}
          onChange={(v) => handleChange('numberOfDevs', v)}
          min={1}
          step={1}
          hint="Active developers using AI assistance"
          error={errors?.numberOfDevs}
          required
        />

        <NumericInput
          label="Tokens per Dev per Day (millions)"
          value={value.tokensPerDevPerDay !== undefined ? value.tokensPerDevPerDay / 1000000 : undefined}
          onChange={(v) => handleChange('tokensPerDevPerDay', v ? v * 1000000 : undefined)}
          min={0.001}
          step={0.1}
          hint={
            <>
              Average daily token usage per developer
              {value.tokensPerDevPerDay && (
                <div className="mt-1 text-xs text-gray-500">
                  ≈ {formatNumber(value.tokensPerDevPerDay / 1000000, 1)}M tokens/day
                </div>
              )}
            </>
          }
          error={errors?.tokensPerDevPerDay}
          required
          allowDecimals
        />
      </div>
    </FormSection>
  );
};
