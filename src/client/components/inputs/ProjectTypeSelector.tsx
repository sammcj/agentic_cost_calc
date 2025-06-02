import React from 'react';
import { FormSection } from './FormSection';

type ProjectType = 'oneoff' | 'ongoing' | 'both';

interface ProjectTypeSelectorProps {
  value: ProjectType | undefined;
  onChange: (type: ProjectType) => void;
  error?: string;
}

const projectTypes: Array<{
  value: ProjectType;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    value: 'oneoff',
    label: 'One-off Project',
    description: 'A single development project with a defined scope and timeline',
    icon: '🎯'
  },
  {
    value: 'ongoing',
    label: 'Ongoing Usage',
    description: 'Continuous AI assistance for team and product development',
    icon: '🔄'
  },
  {
    value: 'both',
    label: 'Combined Project',
    description: 'Initial development project followed by ongoing maintenance and support',
    icon: '🔄 + 🎯'
  }
];

export const ProjectTypeSelector: React.FC<ProjectTypeSelectorProps> = ({
  value,
  onChange,
  error
}) => {
  return (
    <FormSection
      title="Project Type"
      description="Select the type of project or usage pattern"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {projectTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange(type.value)}
              className={`
                relative rounded-lg p-4 border-2 text-left cursor-pointer
                focus:outline-none transition-colors duration-200
                ${
                  value === type.value
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xl mr-2" aria-hidden="true">
                    {type.icon}
                  </span>
                  <span className="font-medium text-gray-900">
                    {type.label}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {type.description}
              </p>
            </button>
          ))}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </FormSection>
  );
};
