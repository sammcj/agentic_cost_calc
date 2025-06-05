import React, { ReactNode } from 'react';

interface WizardStepProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const WizardStep: React.FC<WizardStepProps> = ({
  title,
  description,
  children,
  className = ''
}) => {
  return (
    <div className={`wizard-step ${className}`}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h2>
        {description && (
          <p className="text-gray-600 text-lg">
            {description}
          </p>
        )}
      </div>

      <div className="wizard-step-content">
        {children}
      </div>
    </div>
  );
};
