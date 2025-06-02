import React from 'react';
import { InputPanel } from './inputs/InputPanel';
import { useCalculatorForm } from '../hooks/useCalculatorForm';
import Results from './results/Results';

export const Calculator: React.FC = () => {
  const {
    formState,
    setFormState,
    errors,
    isCalculating,
    isValid,
    result,
    resetForm
  } = useCalculatorForm();

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="w-full">
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-0">
          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-8">
              <InputPanel
                value={formState}
                onChange={setFormState}
                errors={errors}
              />
            </div>

            {/* Status Messages */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              {!isValid && (
                <p className="text-sm text-orange-600">
                  Please fill in all required fields to see cost calculations
                </p>
              )}
              {errors.general && (
                <p className="text-sm text-red-600">
                  {errors.general}
                </p>
              )}
              {isCalculating && (
                <p className="text-sm text-blue-600">
                  Updating calculations...
                </p>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-white rounded-lg shadow-sm">
            <Results
              result={result}
              loading={isCalculating}
              projectType={formState.projectType}
              formState={formState}
              resetForm={resetForm}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
