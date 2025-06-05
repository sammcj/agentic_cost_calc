import { ModelConfig, ModelProfile } from '../types/models'

/**
 * Preconfigured pricing and performance profiles for various LLMs.
 * Costs are in USD per 1 million tokens.
 */

// Parameter descriptions:
// inputTokenCost1M: Cost for 1 million input tokens (uncached)
// outputTokenCost1M: Cost for 1 million output tokens (uncached)
// cacheWriteTokenCost1M: Cost for writing tokens to the cache (typically higher than input)
// cacheReadTokenCost1M: Cost for reading tokens from the cache (typically lower than input)
// modelSpeedMultiplier: Multiplier affecting the time taken for agentic processing and rework
// modelCapabilityMultiplier: Multiplier adjusting the model's capability (used for pretty basic overhead calculation at present)

export const modelConfig: ModelConfig = {
  claude_4_0_sonnet: {
    inputTokenCost1M         : 3.00,    // $3.00 / 1M Tokens
    outputTokenCost1M        : 15.00,   // $15.00 / 1M Tokens
    cacheWriteTokenCost1M    : 3.75,    // $3.75 / 1M Tokens (25% higher than input)
    cacheReadTokenCost1M     : 0.30,    // $0.30 / 1M Tokens (10% of input rate)
    modelSpeedMultiplier     : 1.0,     // 1.0x speed
    modelCapabilityMultiplier: 1.0,     // 1.0x capability
    agenticCodingCapable     : true     // Capable of agentic coding
  },
  claude_3_5_haiku: {
    inputTokenCost1M         : 0.80,   // $0.80 / 1M Tokens
    outputTokenCost1M        : 4.00,   // $4.00 / 1M Tokens
    cacheWriteTokenCost1M    : 1.00,   // $1.00 / 1M Tokens (25% higher than input)
    cacheReadTokenCost1M     : 0.08,   // $0.08 / 1M Tokens (10% of input rate)
    modelSpeedMultiplier     : 0.85,
    modelCapabilityMultiplier: 0.7,
    agenticCodingCapable     : false
  },
  openai_o3: {
    inputTokenCost1M         : 10.00,   // $10.00 / 1M Tokens
    outputTokenCost1M        : 40.00,   // $40.00 / 1M Tokens
    cacheWriteTokenCost1M    : 18.75,   // $18.75 / 1M Tokens (25% higher than input) - NOTE: Revisit if this should be 12.50
    cacheReadTokenCost1M     : 2.50,    // $2.50 / 1M Tokens (25% of input rate)
    modelSpeedMultiplier     : 1.4,
    modelCapabilityMultiplier: 1.0,
    agenticCodingCapable     : true
  },
  openai_o3_mini: {
    inputTokenCost1M         : 1.10,    // $1.10 / 1M Tokens
    outputTokenCost1M        : 4.40,    // $4.40 / 1M Tokens
    cacheWriteTokenCost1M    : 1.375,   // $1.375 / 1M Tokens (25% higher than input)
    cacheReadTokenCost1M     : 0.55,    // $0.55 / 1M Tokens (50% of input rate)
    modelSpeedMultiplier     : 1.3,
    modelCapabilityMultiplier: 0.85,
    agenticCodingCapable     : true
  },
  deepseek_chat: {
    inputTokenCost1M         : 0.27,     // $0.27 / 1M Tokens
    outputTokenCost1M        : 1.10,     // $1.10 / 1M Tokens
    cacheWriteTokenCost1M    : 0.3375,   // $0.3375 / 1M Tokens (25% higher than input)
    cacheReadTokenCost1M     : 0.07,     // $0.07 / 1M Tokens (~26% of input rate)
    modelSpeedMultiplier     : 1.0,
    modelCapabilityMultiplier: 0.92,
    agenticCodingCapable     : true
  },
  deepseek_r1: {
    inputTokenCost1M         : 0.55,     // $0.55 / 1M Tokens
    outputTokenCost1M        : 2.19,     // $2.19 / 1M Tokens
    cacheWriteTokenCost1M    : 0.6875,   // $0.6875 / 1M Tokens (25% higher than input)
    cacheReadTokenCost1M     : 0.14,     // $0.14 / 1M Tokens (~25% of input rate)
    modelSpeedMultiplier     : 1.5,
    modelCapabilityMultiplier: 0.95,
    agenticCodingCapable     : true
  },
  deepseek_r1_bedrock: {
    inputTokenCost1M         : 1.35,     // $1.35 / 1M Tokens
    outputTokenCost1M        : 5.40,     // $5.40 / 1M Tokens
    cacheWriteTokenCost1M    : 1.6875,   // $1.6875 / 1M Tokens (25% higher than input)
    cacheReadTokenCost1M     : 0.135,    // $0.135 / 1M Tokens (10% of input rate)
    modelSpeedMultiplier     : 1.0,
    modelCapabilityMultiplier: 0.95,
    agenticCodingCapable     : true
  },
  gemini_2_5_pro: {
    inputTokenCost1M         : 2.50,    // $2.50 / 1M Tokens
    outputTokenCost1M        : 15.00,   // $15.00 / 1M Tokens
    cacheWriteTokenCost1M    : 2.50,    // $2.50 / 1M Tokens (caching not supported)
    cacheReadTokenCost1M     : 15.00,   // $15.00 / 1M Tokens (caching not supported)
    modelSpeedMultiplier     : 1.1,
    modelCapabilityMultiplier: 1.0,
    agenticCodingCapable     : true
  },
  amazon_nova_pro: {
    inputTokenCost1M         : 0.084,   // $0.084 / 1M Tokens
    outputTokenCost1M        : 3.36,    // $3.36 / 1M Tokens
    cacheWriteTokenCost1M    : 0.105,   // $0.105 / 1M Tokens (25% higher than input)
    cacheReadTokenCost1M     : 0.21,    // $0.21 / 1M Tokens (as specified)
    modelSpeedMultiplier     : 0.08,    // 0.08x speed (slower due rework required because of vastly lower capability)
    modelCapabilityMultiplier: 0.1,     // 0.1x capability (vastly worse than Sonnet 4.0)
    agenticCodingCapable     : false    // Not capable of agentic coding
  },
  amazon_nova_lite: {
    inputTokenCost1M         : 0.063,     // $0.063 / 1M Tokens
    outputTokenCost1M        : 0.252,     // $0.252 / 1M Tokens
    cacheWriteTokenCost1M    : 0.07875,   // $0.07875 / 1M Tokens (25% higher than input)
    cacheReadTokenCost1M     : 0.01575,   // $0.01575 / 1M Tokens (as specified)
    modelSpeedMultiplier     : 0.05,      // 0.1x speed (slower due rework required because of vastly lower capability)
    modelCapabilityMultiplier: 0.05,      // 0.05x capability (20x worse than Sonnet 4.0)
    agenticCodingCapable     : false      // Not capable of agentic coding
  },
}

/**
 * Returns an array of available model IDs.
 * @returns {string[]} List of model identifiers.
 */
export const getAvailableModelIds = (): string[] => {
  return Object.keys(modelConfig)
}

/**
 * Retrieves the profile for a specific model ID.
 * @param {string} modelId - The identifier of the model.
 * @returns {ModelProfile | undefined} The model profile or undefined if not found.
 */
export const getModelProfile = (modelId: string): ModelProfile | undefined => {
  return modelConfig[modelId]
}

/**
 * Retrieves a model profile by ID, with fallback to a default model.
 * @param {string} modelId - The identifier of the model.
 * @returns {ModelProfile} The model profile or a default model if not found.
 */
export const getModelById = (modelId: string): ModelProfile => {
  const model = modelConfig[modelId]
  if (!model) {
    // Return a default model if the requested one is not found
    return modelConfig.claude_4_0_sonnet
  }
  return model
}

/**
 * Returns an array of model options for use in selection components.
 * @returns {Array<{value: string, label: string, profile: ModelProfile}>} List of model options.
 */
/**
 * Checks if a model is capable of agentic coding.
 * @param {string} modelId - The identifier of the model.
 * @returns {boolean} True if the model is capable of agentic coding, false otherwise.
 */
export const isModelAgenticCapable = (modelId: string): boolean => {
  const model = modelConfig[modelId];
  return model?.agenticCodingCapable ?? false;
};

/**
 * Returns a warning message if a model is not capable of agentic coding.
 * @param {string} modelId - The identifier of the model.
 * @returns {string | undefined} Warning message if the model is not capable of agentic coding.
 */
export const getModelAgenticWarning = (modelId: string): string | undefined => {
  if (!isModelAgenticCapable(modelId)) {
    return `>> Warning! ${modelId.split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')} is not capable of performing agentic coding tasks. Please select a different model for agentic development!`;
  }
  return undefined;
};

export const getModelOptions = (): Array<{ value: string, label: string, profile: ModelProfile }> => {
  return Object.entries(modelConfig).map(([id, profile]) => {
    // Format the model name for display (e.g., "claude_4_0_sonnet" -> "Claude 3.7 Sonnet")
    const formattedName = id
      .split('_')
      .map(part => {
        // Handle version numbers (e.g., "3_7" -> "3.7")
        if (/^\d+$/.test(part) && /^\d+$/.test(part[0])) {
          return part
        }
        return part.charAt(0).toUpperCase() + part.slice(1)
      })
      .join(' ')
      .replace(/ (\d+) (\d+)/, ' $1.$2') // Replace "3 7" with "3.7"

    return {
      value: id,
      label: formattedName,
      profile
    }
  })
}
