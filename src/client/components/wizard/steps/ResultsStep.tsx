import React from 'react';
import { useWizard } from '../WizardProvider';
import { WizardStep } from '../WizardStep';
import Results from '../../results/Results';

export const ResultsStep: React.FC = () => {
  const { result, startOver, goToStep, formState, resetForm } = useWizard();

  const handleStartNew = () => {
    startOver();
  };

  const handleModifyCalculation = () => {
    goToStep('parameters');
  };

  if (!result) {
    return (
      <WizardStep
        title="Results"
        description="Your calculation results will appear here."
      >
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500">No calculation results available.</p>
          <p className="text-sm text-gray-400 mt-2">Please go back and complete the calculation.</p>
        </div>
      </WizardStep>
    );
  }

  return (
    <WizardStep
      title="Calculation Results"
      description="Here are your agentic cost calculation results."
    >
      <div className="space-y-6">
        {/* Results Display */}
        <div className="bg-white">
          <Results
            result={result}
            loading={false}
            projectType={formState.projectType}
            formState={formState}
            resetForm={resetForm}
          />
        </div>

        {/* Action Buttons */}
        <div className="border-t pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleModifyCalculation}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Modify Parameters
            </button>
            <button
              onClick={handleStartNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Start New Calculation
            </button>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
          <div className="text-blue-800 text-sm space-y-2">
            <p>• Use the export functionality above to save your results as PDF or JSON</p>
            <p>• Modify parameters to explore different scenarios</p>
            <p>• Start a new calculation to compare different project types</p>
            <p>• Share these results with stakeholders to demonstrate the value of agentic development</p>
          </div>
        </div>
      </div>
    </WizardStep>
  );
};
