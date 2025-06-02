import React from 'react';
import { FormGroup } from './FormGroup';

interface NumericInputProps {
  id?: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  label?: string;
  placeholder?: string;
  hint?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  error?: string;
  prefix?: string;
  suffix?: string;
  allowDecimals?: boolean;
  className?: string;
}

export const formatNumber = (value: number, decimals = 0) => {
  return new Intl.NumberFormat('en-AU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true
  }).format(value);
};

export const formatCurrency = (value: number, currency: 'USD' | 'AUD') => {
  return new Intl.NumberFormat('en-' + (currency === 'USD' ? 'US' : 'AU'), {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const NumericInput: React.FC<NumericInputProps> = ({
  id,
  value,
  onChange,
  label,
  placeholder = '0',
  hint,
  min,
  max,
  step = 1,
  required = false,
  error,
  prefix,
  suffix,
  allowDecimals = false,
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    if (val === '') {
      onChange(undefined);
      return;
    }

    const num = allowDecimals ? parseFloat(val) : parseInt(val, 10);

    if (isNaN(num)) {
      return;
    }

    if (min !== undefined && num < min) {
      onChange(min);
      return;
    }

    if (max !== undefined && num > max) {
      onChange(max);
      return;
    }

    onChange(num);
  };

  return (
    <FormGroup
      id={id}
      label={label}
      required={required}
      hint={hint}
      error={error}
    >
      <div className="relative rounded-md shadow-sm">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{prefix}</span>
          </div>
        )}
        <input
          type="number"
          id={id}
          className={`
            form-input block w-full sm:text-sm rounded-md
            ${prefix ? 'pl-7' : ''}
            ${suffix ? 'pr-12' : ''}
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
            ${className}
          `}
          placeholder={placeholder}
          value={value === undefined ? '' : value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          required={required}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{suffix}</span>
          </div>
        )}
      </div>
    </FormGroup>
  );
};

export default NumericInput;
