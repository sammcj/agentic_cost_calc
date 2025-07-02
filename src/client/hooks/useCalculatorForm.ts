import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalculationFormState, CalculationResult } from '@/shared/types/models';
import { modelConfig } from '@/shared/utils/modelConfig';
import { getTemplateById } from '@/shared/utils/projectTemplates';
import { calculateCosts } from '@/shared/utils/calculations';

interface UseCalculatorForm {
  formState: CalculationFormState;
  setFormState: (state: CalculationFormState | ((prev: CalculationFormState) => CalculationFormState)) => void;
  errors: Record<string, string>;
  isCalculating: boolean;
  isValid: boolean;
  result: CalculationResult | null;
  handleCalculate: () => Promise<void>;
  resetForm: () => void;
}

const initialState: CalculationFormState = {
  ...getTemplateById('medium-project').defaultValues
};




export const useCalculatorForm = (): UseCalculatorForm => {
  const [formState, setFormState] = useState<CalculationFormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [result, setResult] = useState<CalculationResult | null>(null);


  // Prevent calculation on initial mount
  const isInitialMount = useRef(true);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Project type validation
    if (!formState.projectType) {
      newErrors.projectType = 'Please select a project type';
      return false;
    }

    // Model validation
    if (!formState.modelConfig?.primaryModel) {
      newErrors.modelConfig = 'Please select a primary model';
      return false;
    }

    // Global parameters validation
    if (!formState.globalParams?.currencyRate) {
      newErrors['globalParams.currencyRate'] = 'Currency rate is required';
      return false;
    }

    // Required parameters based on project type
    if (formState.projectType === 'oneoff' || formState.projectType === 'both') {
      if (!formState.projectParams) {
        newErrors.projectParams = 'Project parameters are required for one-off projects';
        return false;
      }

      const manualDevHours = formState.projectParams?.manualDevHours;
      if (manualDevHours === undefined || manualDevHours < 0.8 || manualDevHours > 8000) {
        newErrors['projectParams.manualDevHours'] = 'Manual development hours must be between 0.1 and 1000 days (0.8 to 8000 hours)';
      }
      if (formState.projectParams?.totalProjectTokens === undefined || formState.projectParams.totalProjectTokens < 0) {
        newErrors['projectParams.totalProjectTokens'] = 'Total project tokens must be zero or greater';
      }
      if (formState.projectParams?.outputTokenPercentage === undefined ||
          formState.projectParams.outputTokenPercentage < 0 ||
          formState.projectParams.outputTokenPercentage > 100) {
        newErrors['projectParams.outputTokenPercentage'] = 'Input/Output token ratio must be between 0 and 100';
      }
      if (formState.projectParams?.cachedTokenPercentage === undefined ||
          formState.projectParams.cachedTokenPercentage < 0 ||
          formState.projectParams.cachedTokenPercentage > 100) {
        newErrors['projectParams.cachedTokenPercentage'] = 'Cache token ratio must be between 0 and 100';
      }
      if (formState.projectParams?.humanGuidanceTime === undefined ||
          formState.projectParams.humanGuidanceTime < 0) {
        newErrors['projectParams.humanGuidanceTime'] = 'Human guidance time must be zero or greater';
      }
    }

    // Team/Product parameters validation for ongoing or both
    if (formState.projectType === 'ongoing' || formState.projectType === 'both') {
      if (!formState.teamParams && !formState.productParams) {
        newErrors.teamParams = 'Either team or product parameters are required for ongoing usage';
        return false;
      }

      // Only validate team parameters if they exist and have developers
      if (formState.teamParams) {
        if (formState.teamParams?.numberOfDevs === undefined || formState.teamParams.numberOfDevs < 0) {
          newErrors['teamParams.numberOfDevs'] = 'Number of developers must be zero or greater';
        }
        if (formState.teamParams?.tokensPerDevPerDay === undefined || formState.teamParams.tokensPerDevPerDay < 0) {
          newErrors['teamParams.tokensPerDevPerDay'] = 'Tokens per developer per day must be zero or greater';
        }
      }

      // Only validate product parameters if they exist and have apps
      if (formState.productParams && formState.productParams.numberOfApps && formState.productParams.numberOfApps > 0) {
        if (formState.productParams?.tokensPerDayOngoing === undefined || formState.productParams.tokensPerDayOngoing < 0) {
          newErrors['productParams.tokensPerDayOngoing'] = 'Daily token usage must be zero or greater';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formState]);

  const handleCalculate = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsCalculating(true);
    setErrors({});

    try {
      // Convert form state to API request format with explicit structure
      const apiRequest = {
        projectType: formState.projectType,
        globalParams: formState.globalParams,
        modelConfig: {
          // Find the model ID by comparing properties
          primaryModelId: Object.entries(modelConfig).find(
            ([, profile]) =>
              profile.inputTokenCost1M === formState.modelConfig?.primaryModel?.inputTokenCost1M &&
              profile.outputTokenCost1M === formState.modelConfig?.primaryModel?.outputTokenCost1M
          )?.[0] || 'claude_4_0_sonnet', // Default if not found

          // Only include secondaryModelId if secondaryModel exists
          ...(formState.modelConfig?.secondaryModel && {
            secondaryModelId: Object.entries(modelConfig).find(
              ([, profile]) =>
                profile.inputTokenCost1M === formState.modelConfig?.secondaryModel?.inputTokenCost1M &&
                profile.outputTokenCost1M === formState.modelConfig?.secondaryModel?.outputTokenCost1M
            )?.[0]
          }),

          // Include modelRatio if it exists
          ...(formState.modelConfig?.modelRatio && {
            modelRatio: formState.modelConfig.modelRatio
          })
        },
        // Only include parameters based on project type
        ...(formState.projectType === 'oneoff' || formState.projectType === 'both' ? {
          projectParams: formState.projectParams
        } : {}),
        ...(formState.projectType === 'ongoing' || formState.projectType === 'both' ? {
          teamParams: formState.teamParams,
          productParams: formState.productParams
        } : {})
      };

      // Ensure projectType is defined before calling calculateCosts
      if (!apiRequest.projectType) {
        throw new Error('Project type is required');
      }

      // Use client-side calculation instead of API call
      const calculationResult = calculateCosts(apiRequest as any);
      setResult(calculationResult);

    } catch (error) {
      console.error('Calculation error:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsCalculating(false);
    }
  }, [formState, validateForm]);

  const resetForm = useCallback(() => {
    setFormState(initialState);
    setErrors({});
    setResult(null);
  }, []);

  // Create a memoized dependency object containing only calculation-relevant fields
  const calculationDependencies = useMemo(() => {
    const { globalParams, ...restOfState } = formState;
    // Omit informational fields from globalParams
    const {
      customerName: _customerName,
      projectName: _projectName,
      projectDescription: _projectDescription,
      disclaimerText: _disclaimerText,
      ...relevantGlobalParams
    } = globalParams || {};

    return {
      ...restOfState,
      globalParams: relevantGlobalParams,
    };
  }, [
    formState.projectType,
    formState.modelConfig,
    formState.projectParams,
    formState.teamParams,
    formState.productParams,
    formState.globalParams?.currencyRate,
    formState.globalParams?.aiCapabilityFactor,
    formState.globalParams?.totalCostMultiplier
  ]);


  // Auto-calculate when calculation-relevant form state changes (after debounce)
  // DISABLED: This was causing input focus loss due to frequent re-renders
  // Users can manually calculate by clicking the calculate button or navigating to results
  // useEffect(() => {
  //   // Skip calculation on initial mount
  //   if (isInitialMount.current) {
  //     isInitialMount.current = false;
  //     return;
  //   }

  //   // Only calculate if we have a project type
  //   if (calculationDependencies.projectType) {
  //     handleCalculate();
  //   }
  //   // Depend on the memoized object containing only relevant fields
  // }, [calculationDependencies, handleCalculate]);

  return {
    formState,
    setFormState,
    errors,
    isCalculating,
    isValid: Object.keys(errors).length === 0,
    result,
    handleCalculate,
    resetForm
  };
};
