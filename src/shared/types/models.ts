/**
 * Represents the pricing and performance characteristics of an LLM.
 * All costs are in USD per 1 million tokens.
 */
export interface ModelProfile {
  /** Cost for input tokens (uncached). */
  inputTokenCost1M: number;
  /** Cost for output tokens (uncached). */
  outputTokenCost1M: number;
  /** Cost for writing tokens to the cache (typically higher than input). */
  cacheWriteTokenCost1M: number;
  /** Cost for reading tokens from the cache (typically lower than input). */
  cacheReadTokenCost1M: number;
  /**
   * Multiplier affecting the time taken for agentic processing.
   * 1.0 = baseline speed. < 1.0 = faster, > 1.0 = slower.
   * Does not directly affect cost, but influences project duration calculations.
   */
  modelSpeedMultiplier: number;
  /**
   * Multiplier adjusting the model's token usage based on its capability.
   * 1.0 = baseline capability. < 1.0 = more capable (uses fewer tokens for the same task),
   * > 1.0 = less capable (uses more tokens). Affects cost.
   */
  modelCapabilityMultiplier: number;
  /** Whether the model is capable of performing agentic coding tasks. */
  agenticCodingCapable?: boolean;
}

/**
 * A collection of available LLM profiles, keyed by a unique model identifier.
 */
export interface ModelConfig {
  [modelId: string]: ModelProfile;
}

/** Represents a monetary value in both USD and AUD. */
export interface CurrencyPair {
  usd: number;
  aud: number;
}

/** Configuration for the LLM(s) to be used. */
export interface LLMConfig {
  primaryModelId: string; // Identifier linking to ModelConfig
  secondaryModelId?: string;
  /** Ratio (0-1) of usage for the primary model vs secondary. Defaults to 1 if secondaryModelId is not provided. */
  modelRatio?: number;
}

/** Parameters specific to the project's scope and traditional comparison. */
export interface ProjectParameters {
  manualDevHours: number;
  /** Multiplier for time reduction when using agentic coding (e.g., 3 means 3x faster). */
  agenticMultiplier: number;
  /** Hours required for human guidance when using agentic coding approach. */
  humanGuidanceTime: number;
  /** Optional time in hours that AI inference might take for a project. Does not affect costs, only timelines. */
  aiProcessingTime?: number;
  /** Optional ramp-up time in hours at the start of the project for AI tooling and configuration. Affects both time and human cost. */
  projectAiSetupTime?: number;
  /** Average hourly rate (in AUD) for traditional development cost calculation. */
  averageHourlyRate: number;
  /** Percentage of output tokens relative to input tokens (e.g., 20 means output tokens are 20% of input tokens). */
  outputTokenPercentage: number;
  /** Percentage of tokens that will be cache hits (e.g., 80 means 80% of tokens will be read from cache). */
  cachedTokenPercentage: number;
  /** Total estimated tokens for the entire project (used for one-off cost calculation). */
  totalProjectTokens: number;
}

/** Parameters related to ongoing token usage by the product/application. */
export interface ProductParameters {
  /** Estimated tokens consumed by the application per day. */
  tokensPerDayOngoing: number;
  /** Number of application instances or projects this applies to (acts as a multiplier). */
  numberOfApps: number;
  /** Percentage of output tokens relative to input tokens (e.g., 80 means output tokens are 80% of input tokens). */
  outputTokenPercentage?: number;
  /** Percentage of tokens that will be cache hits (e.g., 20 means 20% of tokens will be read from cache). */
  cachedTokenPercentage?: number;
}

/** Parameters related to the development team using agentic coding. */
export interface TeamParameters {
  numberOfDevs: number;
  /** Estimated tokens used per developer per day. */
  tokensPerDevPerDay: number;
  /** Optional productivity multiplier for ROI calculation. */
  agenticMultiplier?: number;
  /** Optional base hourly rate for ROI calculation. */
  averageHourlyRate?: number;
}

/** Daily ROI analysis data. */
export interface DailyROIAnalysis {
  /** Traditional cost without agentic assistance. */
  traditionalCost: CurrencyPair;
  /** Cost with agentic assistance. */
  agenticCost: CurrencyPair;
  /** Percentage ROI. */
  roi: number;
  /** Productivity gain factor. */
  productivityGain: number;
}

/** Global parameters affecting the calculation. */
export interface GlobalParameters {
  /** Exchange rate: How many AUD equal 1 USD. */
  currencyRate: number;
  /** Optional multiplier for AI capability adjustment (affects token usage). */
  aiCapabilityFactor?: number;
  /** Optional final multiplier applied to all calculated costs. */
  totalCostMultiplier?: number;
  /** Optional customer name for reporting. */
  customerName?: string;
  /** Optional project name for reporting. */
  projectName?: string;
  /** Optional project description (can be Markdown). */
  projectDescription?: string;
  /** Optional disclaimer text for reports. */
  disclaimerText?: string;
}

/** Represents the overall request for a cost calculation. */
export interface CalculationRequest {
  /** Type of calculation focus ('oneoff', 'ongoing', 'both'). Determines which outputs are relevant. */
  projectType: 'oneoff' | 'ongoing' | 'both';
  globalParams: GlobalParameters;
  modelConfig: LLMConfig;
  projectParams?: ProjectParameters; // Optional for ongoing-only calculations
  productParams?: ProductParameters; // Optional for project-only calculations
  teamParams?: TeamParameters;       // Optional for product-only calculations
}

/** Breakdown of costs specifically for the agentic approach. */
export interface AgenticBreakdown {
  /** Cost attributed to LLM inference (tokens). */
  inference: CurrencyPair;
  /** Cost attributed to human oversight/effort during agentic work. */
  human: CurrencyPair;
  /** Total agentic cost (inference + human). */
  total: CurrencyPair;
}

/** Analysis of savings comparing traditional vs. agentic approaches. */
export interface SavingsData {
  /** Monetary savings. */
  cost: CurrencyPair;
  /** Percentage cost savings. */
  percentage: number;
  /** Time saved (in hours). */
  timeInHours: number;
  /** Return on Investment percentage. */
  roi: number;
}

/** Data structure for visualisations/charts. */
export interface ChartDataset {
  name: string; // Label for the data point (e.g., 'Traditional Cost')
  value: number; // The calculated value (typically in AUD for display)
  errorMargin?: number; // Optional error margin value
}

/** Estimated token usage breakdown. */
export interface TokenUsage {
    input: number;
    output: number;
    cacheWrite: number;
    cacheRead: number;
    /** Total tokens considering cache hits/misses and capability factor. */
    effectiveTotal?: number;
}

/** Breakdown of ongoing costs by source. */
export interface OngoingCostBreakdown {
    /** Costs from team/developer usage. */
    team?: {
        total: CurrencyPair;
        monthly: CurrencyPair;
        yearly: CurrencyPair;
        perDev?: CurrencyPair;
        perDevMonthly?: CurrencyPair;
        perDevYearly?: CurrencyPair;
    };
    /** Costs from product/application usage. */
    product?: {
        total: CurrencyPair;
        monthly: CurrencyPair;
        yearly: CurrencyPair;
    };
}

/** Daily cost and ROI breakdown. */
export interface DailyCosts {
    total: CurrencyPair;
    monthly: CurrencyPair;  // Based on 20 working days
    yearly: CurrencyPair;   // Based on 240 working days
    perDev?: CurrencyPair;
    perDevMonthly?: CurrencyPair;
    perDevYearly?: CurrencyPair;
    roiAnalysis?: DailyROIAnalysis;
    /** Breakdown of costs by source (team vs product). */
    breakdown?: OngoingCostBreakdown;
}

/** Represents the complete result of a cost calculation. */
export interface CalculationResult {
  traditionalCost?: CurrencyPair; // Only relevant if projectParams provided
  traditionalTime?: number;       // Only relevant if projectParams provided
  agenticTime?: number;           // Only relevant if projectParams provided
  agenticCost?: AgenticBreakdown; // Only relevant if projectParams or teamParams provided
  humanGuidanceCost?: CurrencyPair; // Cost for human guidance time in agentic approach
  humanGuidanceTime?: number;     // Time spent on human guidance in agentic approach
  aiProcessingTime?: number;      // Time spent on AI processing (inference time)
  projectAiSetupTime?: number;    // Time spent on AI setup and configuration
  projectAiSetupCost?: CurrencyPair; // Cost for AI setup time
  totalProjectTime?: number;      // Total project time including all components
  savingsAnalysis?: SavingsData;  // Only relevant if traditionalCost and agenticCost calculated
  dailyCosts?: DailyCosts;        // Only relevant if teamParams or productParams provided
  tokenUsage?: TokenUsage;
  fteEquivalentCost?: CurrencyPair; // Only relevant if projectParams provided
  visualisationData?: ChartDataset[];
  /** Array of strings describing the calculation steps. */
  calculations?: string[];
  // Include optional fields from GlobalParameters if they were provided
  customerName?: string;
  projectName?: string;
  projectDescription?: string;
  disclaimerText?: string;
}

/**
 * Represents the form state used in the UI for collecting calculation inputs.
 * This is similar to CalculationRequest but with some differences to accommodate
 * the form's structure and UI-specific needs.
 */
export interface CalculationFormState {
  /** Type of calculation focus ('oneoff', 'ongoing', 'both'). */
  projectType?: 'oneoff' | 'ongoing' | 'both';
  /** Global parameters affecting all calculations. */
  globalParams: Partial<GlobalParameters>;
  /** Model configuration for the calculation. */
  modelConfig: {
    /** The primary model to use. */
    primaryModel: ModelProfile;
    /** Optional secondary model. */
    secondaryModel?: ModelProfile;
    /** Ratio (0-1) of usage for the primary model vs secondary. */
    modelRatio?: number;
  };
  /** Parameters specific to one-off projects. */
  projectParams?: Partial<ProjectParameters>;
  /** Parameters related to ongoing product usage. */
  productParams?: Partial<ProductParameters>;
  /** Parameters related to the development team. */
  teamParams?: Partial<TeamParameters>;
}
