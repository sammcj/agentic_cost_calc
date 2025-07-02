import React, { useRef, useEffect, useCallback } from 'react';

interface UncontrolledTextInputProps {
  id?: string;
  label: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  className?: string;
  description?: string;
  error?: string;
}

export const UncontrolledTextInput: React.FC<UncontrolledTextInputProps> = ({
  id,
  label,
  value = '',
  placeholder,
  required = false,
  disabled = false,
  multiline = false,
  rows = 3,
  onChange,
  onBlur,
  className = '',
  description,
  error
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const lastValueRef = useRef<string>(value);

  console.log(`🔥 UncontrolledTextInput RENDER - id: ${id}, label: ${label}, value: ${value}`);

  // Update input value when prop changes (but don't trigger onChange)
  useEffect(() => {
    console.log(`🔥 UncontrolledTextInput EFFECT - id: ${id}, updating value from ${inputRef.current?.value} to ${value}`);
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
      lastValueRef.current = value;
    }
  }, [value, id]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    console.log(`🔥 UncontrolledTextInput CHANGE - id: ${id}, newValue: ${newValue}`);
    lastValueRef.current = newValue;

    // Only call onChange if provided
    if (onChange) {
      console.log(`🔥 UncontrolledTextInput calling onChange - id: ${id}`);
      onChange(newValue);
    }
  }, [onChange, id]);

  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    console.log(`🔥 UncontrolledTextInput BLUR - id: ${id}, newValue: ${newValue}`);

    // Only call onBlur if provided and value changed
    if (onBlur && newValue !== lastValueRef.current) {
      console.log(`🔥 UncontrolledTextInput calling onBlur - id: ${id}`);
      onBlur(newValue);
    }
  }, [onBlur, id]);

  useEffect(() => {
    console.log(`🔥 UncontrolledTextInput MOUNTED - id: ${id}, label: ${label}`);
    return () => {
      console.log(`🔥 UncontrolledTextInput UNMOUNTED - id: ${id}, label: ${label}`);
    };
  }, [id, label]);

  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const inputProps = {
    ref: inputRef as any,
    id: inputId,
    name: inputId,
    defaultValue: value,
    placeholder,
    required,
    disabled,
    onChange: handleChange,
    onBlur: handleBlur,
    className: `
      block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300
      placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6
      ${disabled ? 'bg-gray-50 text-gray-500' : 'bg-white'}
      ${error ? 'ring-red-300 focus:ring-red-600' : ''}
      ${className}
    `.trim()
  };

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium leading-6 text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}

      {multiline ? (
        <textarea
          {...inputProps}
          rows={rows}
        />
      ) : (
        <input
          {...inputProps}
          type="text"
        />
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
