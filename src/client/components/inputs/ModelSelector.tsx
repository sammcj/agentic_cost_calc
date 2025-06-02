import React from 'react';
import { FormGroup } from './FormGroup';
import { getModelOptions, getModelById, getModelAgenticWarning } from '@/shared/utils/modelConfig';
import { ModelProfile } from '@/shared/types/models';

interface ModelSelectorProps {
  value?: ModelProfile;
  onChange: (value: ModelProfile) => void;
  label?: string;
  required?: boolean;
  projectType?: 'oneoff' | 'ongoing' | 'both';
}

interface DualModelSelectorProps {
  primaryModel: ModelProfile;
  secondaryModel: ModelProfile;
  ratio: number;
  onChangePrimary: (value: ModelProfile) => void;
  onChangeSecondary: (value: ModelProfile) => void;
  onChangeRatio: (value: number) => void;
  projectType?: 'oneoff' | 'ongoing' | 'both';
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  value,
  onChange,
  label = 'Select Model',
  required = false,
  projectType
}) => {
  const options = getModelOptions();
  // Find the selected model by comparing properties instead of object reference
  const selectedId = options.find(
    (option) => value &&
    option.profile.inputTokenCost1M === value.inputTokenCost1M &&
    option.profile.outputTokenCost1M === value.outputTokenCost1M
  )?.value;

  return (
    <FormGroup label={label} required={required}>
      <select
        className="form-select"
        value={selectedId}
        onChange={(e) => {
          const model = getModelById(e.target.value);
          onChange(model);
        }}
      >
        <option value="">Select a model...</option>
        {options.map(({ value: id, label }) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
      {value && projectType && (
        <div className="text-red-600 text-sm mt-1">
          {getModelAgenticWarning(
            options.find(
              (option) =>
                option.profile.inputTokenCost1M === value.inputTokenCost1M &&
                option.profile.outputTokenCost1M === value.outputTokenCost1M
            )?.value || ''
          )}
        </div>
      )}
    </FormGroup>
  );
};

export const DualModelSelector: React.FC<DualModelSelectorProps> = ({
  primaryModel,
  secondaryModel,
  ratio,
  onChangePrimary,
  onChangeSecondary,
  onChangeRatio,
  projectType
}) => {
  return (
    <div className="space-y-4">
      <ModelSelector
        value={primaryModel}
        onChange={onChangePrimary}
        label="Primary Model"
        required
        projectType={projectType}
      />
      <ModelSelector
        value={secondaryModel}
        onChange={onChangeSecondary}
        label="Secondary Model"
        required
        projectType={projectType}
      />
      <FormGroup label="Model Usage Ratio">
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={ratio}
          onChange={(e) => onChangeRatio(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="text-sm text-gray-600 mt-1">
          Primary Model: {Math.round(ratio * 100)}% / Secondary Model:{' '}
          {Math.round((1 - ratio) * 100)}%
        </div>
      </FormGroup>
    </div>
  );
};
