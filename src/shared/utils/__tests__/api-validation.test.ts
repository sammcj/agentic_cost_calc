import { CalculationRequestSchema } from '../../../server/validation/schemas';
import { modelConfig } from '../modelConfig';
import { CalculationFormState } from '../../types/models';

describe('API Validation', () => {
  it('should validate a complete request with all required fields', () => {
    const validRequest = {
      projectType: 'oneoff',
      globalParams: {
        currencyRate: 0.64,
        aiCapabilityFactor: 1.0,
        totalCostMultiplier: 1.0
      },
      modelConfig: {
        primaryModelId: 'claude_4_0_sonnet'
      },
      projectParams: {
        manualDevHours: 160,
        agenticMultiplier: 3.0,
        humanGuidanceTime: 8,
        aiProcessingTime: 1,
        projectAiSetupTime: 0,
        outputTokenPercentage: 80,
        cachedTokenPercentage: 80,
        totalProjectTokens: 80000000,
        averageHourlyRate: 200
      }
    };

    const result = CalculationRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should fail validation when averageHourlyRate is missing', () => {
    const invalidRequest = {
      projectType: 'oneoff',
      globalParams: {
        currencyRate: 0.64,
        aiCapabilityFactor: 1.0,
        totalCostMultiplier: 1.0
      },
      modelConfig: {
        primaryModelId: 'claude_4_0_sonnet'
      },
      projectParams: {
        manualDevHours: 160,
        agenticMultiplier: 3.0,
        humanGuidanceTime: 8,
        aiProcessingTime: 1,
        projectAiSetupTime: 0,
        outputTokenPercentage: 80,
        cachedTokenPercentage: 80,
        totalProjectTokens: 80000000
        // averageHourlyRate is missing
      }
    };

    const result = CalculationRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.errors;
      expect(errors.some(err => err.path.join('.').includes('averageHourlyRate'))).toBe(true);
    }
  });

  it('should validate a request from the form state conversion', () => {
    // Simulate the form state
    const formState = {
      projectType: 'oneoff',
      globalParams: {
        currencyRate: 0.64,
        aiCapabilityFactor: 1.0,
        totalCostMultiplier: 1.0
      },
      modelConfig: {
        primaryModel: modelConfig.claude_4_0_sonnet,
        secondaryModel: modelConfig.claude_3_5_haiku // Use an actual model from modelConfig
      },
      projectParams: {
        manualDevHours: 160,
        agenticMultiplier: 3.0,
        humanGuidanceTime: 8,
        aiProcessingTime: 1,
        projectAiSetupTime: 0,
        outputTokenPercentage: 80,
        cachedTokenPercentage: 80,
        totalProjectTokens: 80000000,
        averageHourlyRate: 200
      }
    };

    // Convert form state to API request format (similar to useCalculatorForm.ts)
    const apiRequest = {
      ...formState,
      modelConfig: {
        primaryModelId: Object.entries(modelConfig).find(
          ([_, profile]) =>
            profile.inputTokenCost1M === formState.modelConfig?.primaryModel?.inputTokenCost1M &&
            profile.outputTokenCost1M === formState.modelConfig?.primaryModel?.outputTokenCost1M
        )?.[0] || 'claude_4_0_sonnet',

        ...(formState.modelConfig?.secondaryModel && {
          secondaryModelId: Object.entries(modelConfig).find(
            ([_, profile]) =>
              profile.inputTokenCost1M === formState.modelConfig?.secondaryModel?.inputTokenCost1M &&
              profile.outputTokenCost1M === formState.modelConfig?.secondaryModel?.outputTokenCost1M
          )?.[0]
        })
      }
    };

    const result = CalculationRequestSchema.safeParse(apiRequest);
    expect(result.success).toBe(true);
    if (!result.success) {
      console.error('Validation errors:', result.error.errors);
    }
  });

  it('should validate a request from a template', () => {
    // Get a template
    const template = {
      id: 'micro-project',
      name: 'Micro Project',
      description: 'Very small project or task (~3 hours manual development)',
      defaultValues: {
        projectType: 'oneoff',
        globalParams: {
          currencyRate: 0.64,
          aiCapabilityFactor: 1.0,
          totalCostMultiplier: 1.0
        },
        modelConfig: {
          primaryModel: modelConfig.claude_4_0_sonnet,
          secondaryModel: modelConfig.claude_3_5_haiku // Use an actual model from modelConfig
        },
        projectParams: {
          manualDevHours: 3,
          agenticMultiplier: 2.3,
          humanGuidanceTime: 0.65,
          aiProcessingTime: 0.5,
          projectAiSetupTime: 0.15,
          outputTokenPercentage: 80,
          cachedTokenPercentage: 80,
          totalProjectTokens: 5000000,
          averageHourlyRate: 200
        }
      }
    };

    // Convert template to form state
    const formState = template.defaultValues;

    // Convert form state to API request format (similar to useCalculatorForm.ts)
    const apiRequest = {
      ...formState,
      modelConfig: {
        primaryModelId: Object.entries(modelConfig).find(
          ([_, profile]) =>
            profile.inputTokenCost1M === formState.modelConfig?.primaryModel?.inputTokenCost1M &&
            profile.outputTokenCost1M === formState.modelConfig?.primaryModel?.outputTokenCost1M
        )?.[0] || 'claude_4_0_sonnet'
      }
    };

    console.log('API Request:', JSON.stringify(apiRequest, null, 2));

    const result = CalculationRequestSchema.safeParse(apiRequest);
    if (!result.success) {
      console.error('Validation errors:', result.error.errors);
    }
    expect(result.success).toBe(true);
  });

  it('should simulate the exact API request from useCalculatorForm', () => {
    // This test simulates the exact code from useCalculatorForm.ts
    const formState: CalculationFormState = {
      projectType: 'oneoff',
      globalParams: {
        currencyRate: 0.64,
        aiCapabilityFactor: 1.0,
        totalCostMultiplier: 1.0
      },
      modelConfig: {
        primaryModel: modelConfig.claude_4_0_sonnet,
        secondaryModel: undefined,
        modelRatio: undefined
      },
      projectParams: {
        manualDevHours: 3,
        agenticMultiplier: 2.3,
        humanGuidanceTime: 0.65,
        aiProcessingTime: 0.5,
        projectAiSetupTime: 0.15,
        outputTokenPercentage: 80,
        cachedTokenPercentage: 80,
        totalProjectTokens: 5000000,
        averageHourlyRate: 200
      }
    };

    // This is the exact code from useCalculatorForm.ts
    const apiRequest = {
      ...formState,
      modelConfig: {
        // Find the model ID by comparing properties
        primaryModelId: Object.entries(modelConfig).find(
          ([_, profile]) =>
            profile.inputTokenCost1M === formState.modelConfig?.primaryModel?.inputTokenCost1M &&
            profile.outputTokenCost1M === formState.modelConfig?.primaryModel?.outputTokenCost1M
        )?.[0] || 'claude_4_0_sonnet', // Default if not found

        // Only include secondaryModelId if secondaryModel exists
        ...(formState.modelConfig?.secondaryModel && {
          secondaryModelId: Object.entries(modelConfig).find(
            ([_, profile]) =>
              profile.inputTokenCost1M === formState.modelConfig?.secondaryModel?.inputTokenCost1M &&
              profile.outputTokenCost1M === formState.modelConfig?.secondaryModel?.outputTokenCost1M
          )?.[0]
        }),

        // Include modelRatio if it exists
        ...(formState.modelConfig?.modelRatio && {
          modelRatio: formState.modelConfig.modelRatio
        })
      }
    };

    console.log('Exact API Request:', JSON.stringify(apiRequest, null, 2));

    const result = CalculationRequestSchema.safeParse(apiRequest);
    if (!result.success) {
      console.error('Validation errors:', result.error.errors);
    }
    expect(result.success).toBe(true);
  });
});
