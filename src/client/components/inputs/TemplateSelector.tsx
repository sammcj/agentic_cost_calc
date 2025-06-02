import React from 'react';
import { FormSection } from './FormSection';
import { templates } from '@/shared/utils/projectTemplates';

interface TemplateSelectorProps {
  onSelect: (templateId: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect }) => {
  return (
    <FormSection
      title="Project Templates"
      description="Start with a pre-configured template"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={`
              relative rounded-lg p-3 border-2 border-gray-300 text-left
              hover:border-blue-400 cursor-pointer
              focus:outline-none transition-colors duration-200
            `}
          >
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {template.name}
              </h3>
              <p className="mt-0.5 text-sm text-gray-500">
                {template.description}
              </p>
              {template.examples && (
                <p className="mt-1 text-sm text-indigo-600">
                  Examples: {template.examples}
                </p>
              )}
            </div>

            <div className="mt-4 space-y-1 text-xs text-gray-500">
              {template.defaultValues.projectType === 'oneoff' && (
                <div>Manual Dev Hours: {template.defaultValues.projectParams?.manualDevHours || 0}</div>
              )}
              {template.defaultValues.teamParams && (
                <div>Team Size: {template.defaultValues.teamParams.numberOfDevs || 0} developers</div>
              )}
              {template.defaultValues.projectParams?.totalProjectTokens && (
                <div>
                  Agentic Tokens: {(template.defaultValues.projectParams.totalProjectTokens / 1000000).toFixed(0)}M
                </div>
              )}
            </div>

            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {template.defaultValues.projectType}
              </span>
            </div>
          </button>
        ))}
      </div>
    </FormSection>
  );
};
