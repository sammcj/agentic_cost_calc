import React from 'react';

interface TextInputProps {
  id?: string;
  value: string | undefined;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  rows?: number;
}

export const TextInput: React.FC<TextInputProps> = ({
  id,
  value,
  onChange,
  label,
  placeholder,
  required = false,
  error,
  className = '',
  rows
}) => {
  // Debug: Track component lifecycle
  console.log(`🔍 TextInput RENDER - id: ${id}, value: "${value}", label: "${label}"`);

  React.useEffect(() => {
    console.log(`🔍 TextInput MOUNTED - id: ${id}, label: "${label}"`);
    return () => {
      console.log(`🔍 TextInput UNMOUNTED - id: ${id}, label: "${label}"`);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    console.log(`📝 TextInput onChange - id: ${id}, newValue: "${e.target.value}", activeElement: ${document.activeElement?.tagName}`);
    onChange(e.target.value);
  };

  const handleFocus = (e: React.FocusEvent) => {
    console.log(`🎯 TextInput FOCUS - id: ${id}, label: "${label}"`);
  };

  const handleBlur = (e: React.FocusEvent) => {
    console.log(`💨 TextInput BLUR - id: ${id}, label: "${label}", relatedTarget: ${e.relatedTarget?.tagName}`);
  };

  const commonProps = {
    id,
    className: `
      form-input block w-full sm:text-sm rounded-md
      ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
      ${className}
    `,
    placeholder,
    value: value || '',
    onChange: handleChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    required
  };

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      {rows ? (
        <textarea {...commonProps} rows={rows} />
      ) : (
        <input type="text" {...commonProps} />
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default TextInput;
