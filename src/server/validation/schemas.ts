import { z } from 'zod';

export const GlobalParametersSchema = z.object({
  currencyRate: z.number().positive(),
  aiCapabilityFactor: z.number().optional(),
  totalCostMultiplier: z.number().optional(),
  customerName: z.string().optional(),
  projectName: z.string().optional(),
  projectDescription: z.string().optional(),
  disclaimerText: z.string().optional()
});

export const LLMConfigSchema = z.object({
  primaryModelId: z.string(),
  secondaryModelId: z.string().optional(),
  modelRatio: z.number().min(0).max(1).optional()
});

export const ProjectParametersSchema = z.object({
  manualDevHours: z.number().positive(),
  agenticMultiplier: z.number().positive(),
  humanGuidanceTime: z.number().nonnegative(),
  aiProcessingTime: z.number().nonnegative().optional(),
  projectAiSetupTime: z.number().nonnegative().optional(),
  outputTokenPercentage: z.number().min(0).max(100),
  cachedTokenPercentage: z.number().min(0).max(100),
  totalProjectTokens: z.number().nonnegative(),
  averageHourlyRate: z.number().positive()
});

export const TeamParametersSchema = z.object({
  numberOfDevs: z.number().nonnegative(),
  tokensPerDevPerDay: z.number().nonnegative()
});

export const ProductParametersSchema = z.object({
  tokensPerDayOngoing: z.number().nonnegative(),
  numberOfApps: z.number().positive(),
  outputTokenPercentage: z.number().min(0).max(100).optional(),
  cachedTokenPercentage: z.number().min(0).max(100).optional()
});

export const CalculationRequestSchema = z.object({
  projectType: z.enum(['oneoff', 'ongoing', 'both']),
  globalParams: GlobalParametersSchema,
  modelConfig: LLMConfigSchema,
  projectParams: ProjectParametersSchema.optional(),
  teamParams: TeamParametersSchema.optional(),
  productParams: ProductParametersSchema.optional()
}).refine(
  data => {
    // Ensure required parameters are present based on project type
    if (data.projectType === 'oneoff' || data.projectType === 'both') {
      return !!data.projectParams;
    }
    if (data.projectType === 'ongoing' || data.projectType === 'both') {
      return !!(data.teamParams || data.productParams);
    }
    return true;
  },
  {
    message: 'Missing required parameters for the specified project type. Project type "oneoff" requires projectParams, "ongoing" requires teamParams or productParams.'
  }
);

export type ValidatedCalculationRequest = z.infer<typeof CalculationRequestSchema>;
