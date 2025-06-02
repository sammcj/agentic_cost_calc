import React from 'react';

interface FormSectionProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  className = '',
  children
}) => {
  return (
    <div className={`border-b border-gray-200 pb-8 mb-8 last:border-b-0 last:mb-0 last:pb-0 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

// Re-export from FormGroup
export { FormGroup } from './FormGroup';
