import React from 'react';

interface ParameterSectionProps {
  id: string;
  title: string;
  description: string;
  badge?: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

export const ParameterSection: React.FC<ParameterSectionProps> = React.memo(({
  id,
  title,
  description,
  badge,
  children,
  isExpanded,
  onToggle
}) => {
  console.log(`📦 ParameterSection RENDER - id: ${id}, title: ${title}`);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 text-left transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {badge && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {badge}
              </span>
            )}
          </div>
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </button>

      {isExpanded && (
        <div className="px-6 py-6 bg-white border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
});

ParameterSection.displayName = 'ParameterSection';
