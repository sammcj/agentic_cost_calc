import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CalculationResult, CalculationFormState } from '@/shared/types/models';
import { ChartDisplayRef } from './ChartDisplay';
import { ExportButton } from './ExportButton';
import { CostChartRef } from './CostOverTimeChart';
import { ProjectResults } from './ProjectResults';
import { OngoingResults } from './OngoingResults';

interface ResultsProps {
  result: CalculationResult | null;
  loading: boolean;
  projectType?: 'oneoff' | 'ongoing' | 'both';
  formState: CalculationFormState;
  resetForm: () => void;
}

const Results: React.FC<ResultsProps> = ({
  result,
  loading,
  projectType,
  formState,
  resetForm
}) => {
  const costComparisonChartRef = useRef<ChartDisplayRef>(null);
  const timeAnalysisChartRef = useRef<ChartDisplayRef>(null);
  const costOverTimeChartRef = useRef<CostChartRef>(null);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-600 font-medium">
            Calculating costs...
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Cost Analysis Results
          </h2>
          <p className="text-gray-500 mb-6">
            Fill in the required fields and click &ldquo;Calculate Costs&rdquo; to see the analysis
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Tip:</span> Start by selecting a project type and template to pre-populate the form with common values.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const showProjectInfo = !!(result.customerName || result.projectName || result.projectDescription);

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Header with project info and export buttons */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Cost Analysis Results
            {projectType && (
              <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {projectType === 'oneoff' ? 'One-off Project' :
                  projectType === 'ongoing' ? 'Ongoing Usage' :
                    'Combined Project'}
              </span>
            )}
          </h2>
          {showProjectInfo && (
            <div className="mt-2 text-sm text-gray-600">
              {result.customerName && <div>Customer: {result.customerName}</div>}
              {result.projectName && <div>Project: {result.projectName}</div>}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <ExportButton
            result={result}
            formState={formState}
            type="pdf"
            costComparisonChart={costComparisonChartRef}
            timeAnalysisChart={timeAnalysisChartRef}
            costOverTimeChart={costOverTimeChartRef}
          />
          <ExportButton
            result={result}
            formState={formState}
            type="json"
            costComparisonChart={costComparisonChartRef}
            timeAnalysisChart={timeAnalysisChartRef}
            costOverTimeChart={costOverTimeChartRef}
          />
          <button
            onClick={resetForm}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Reset Form
          </button>
        </div>
      </div>

      {/* Project Description */}
      {result.projectDescription && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-md font-medium text-gray-700 mb-2">Project Description</h3>
          <div className="text-sm text-gray-600 prose max-w-none whitespace-pre-wrap">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
              p: ({children}) => <p className="whitespace-pre-line">{children}</p>
            }}>
              {result.projectDescription}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Project Results */}
      {(projectType === 'oneoff' || projectType === 'both') && (
        <ProjectResults
          result={result}
          costComparisonChartRef={costComparisonChartRef}
          timeAnalysisChartRef={timeAnalysisChartRef}
          costOverTimeChartRef={costOverTimeChartRef}
        />
      )}

      {/* Ongoing Results */}
      {(projectType === 'ongoing' || projectType === 'both') && (
        <OngoingResults
          result={result}
          costComparisonChartRef={costComparisonChartRef}
          costOverTimeChartRef={costOverTimeChartRef}
        />
      )}

      {/* Calculation Steps */}
      {result.calculations && result.calculations.length > 0 && (
        <div className="mb-8 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">Calculation Steps</h3>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              {projectType === 'both' ? (
                <>
                  {/* Project Implementation Calculations */}
                  <li className="text-purple-700 font-medium mt-4">Project Implementation:</li>
                  {result.calculations
                    .filter(calc => !calc.includes('Daily') && !calc.includes('Monthly'))
                    .map((calc, index) => (
                      <li key={`project-${index}`} className="ml-4 text-gray-600">{calc}</li>
                    ))}

                  {/* Ongoing Run Cost Operations Calculations */}
                  <li className="text-blue-700 font-medium mt-4">Ongoing Run Cost Operations:</li>
                  {result.calculations
                    .filter(calc => calc.includes('Daily') || calc.includes('Monthly'))
                    .map((calc, index) => (
                      <li key={`ongoing-${index}`} className="ml-4 text-gray-600">{calc}</li>
                    ))}
                </>
              ) : (
                result.calculations.map((calc, index) => (
                  <li key={index}>{calc}</li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Results);
