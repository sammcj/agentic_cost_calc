import { CalculationRequestSchema } from '../../../server/validation/schemas';
import { modelConfig } from '../modelConfig';
import { templates } from '../projectTemplates';

describe('API Debug', () => {
  it('should debug the API request from a template', () => {
    // Get a template
    const template = templates[0]; // Use the first template (micro-project)

    // Convert template to form state
    const formState = template.defaultValues;

    // Convert form state to API request format (similar to useCalculatorForm.ts)
    const apiRequest = {
      ...formState,
      modelConfig: {
        // Find the model ID by comparing properties
        primaryModelId: Object.entries(modelConfig).find(
          ([_, profile]) =>
            profile.inputTokenCost1M === formState.modelConfig?.primaryModel?.inputTokenCost1M &&
            profile.outputTokenCost1M === formState.modelConfig?.primaryModel?.outputTokenCost1M
        )?.[0] || 'claude_3_7_sonnet', // Default if not found

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

    console.log('API Request:', JSON.stringify(apiRequest, null, 2));

    // Try to validate the request
    const result = CalculationRequestSchema.safeParse(apiRequest);

    if (!result.success) {
      console.error('Validation errors:', JSON.stringify(result.error.errors, null, 2));

      // Log each error in detail
      result.error.errors.forEach((err, index) => {
        console.error(`Error ${index + 1}:`, {
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        });

        // If it's a path error, log the value at that path
        if (err.path.length > 0) {
          let value = apiRequest;
          for (const key of err.path) {
            value = (value as any)?.[key];
          }
          console.error(`Value at path:`, value);
        }
      });
    }

    expect(result.success).toBe(true);
  });
});
