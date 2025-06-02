import { CalculationFormState } from '../types/models'
import { modelConfig } from './modelConfig'

const defaultDisclaimerText =
  'Estimates are based on industry standards for the gains seen from Agentic software development ' +
  'and token usage to support the calculations. Actual results will vary for each specific use case ' +
  'and implementation.'

// Standard template defaults
const standardDefaults: CalculationFormState = {
  globalParams: {
    currencyRate: 0.64,
    aiCapabilityFactor: 1.0,
    totalCostMultiplier: 1.0,
    disclaimerText: defaultDisclaimerText
  },
  modelConfig: {
    primaryModel: modelConfig.claude_3_7_sonnet
  }
}

export const templates = [
  {
    id: 'micro-project',
    name: 'Micro Project',
    description: 'Very small project or task (~3 hours manual development)',
    examples: 'Simple CLI tool, Basic API endpoint, Small UI component',
    defaultValues: {
      ...standardDefaults,
      projectType: 'oneoff',
      projectParams: {
        manualDevHours: 8,
        agenticMultiplier: 2.3,
        humanGuidanceTime: 0.65,
        aiProcessingTime: 1,
        projectAiSetupTime: 0.15,
        outputTokenPercentage: 80,
        cachedTokenPercentage: 80,
        totalProjectTokens: 5000000,
        averageHourlyRate: 200
      }
    }
  },
  {
    id: 'small-project',
    name: 'Small Project',
    description: 'Small project or feature (~9 days manual development)',
    examples: 'Basic Golang API, Simple React component library, Data processing script',
    defaultValues: {
      ...standardDefaults,
      projectType: 'oneoff',
      projectParams: {
        manualDevHours: 70,
        agenticMultiplier: 3,
        humanGuidanceTime: 3,
        aiProcessingTime: 3,
        projectAiSetupTime: 0.5,
        outputTokenPercentage: 80,
        cachedTokenPercentage: 80,
        totalProjectTokens: 40000000,
        averageHourlyRate: 200
      },
    }
  },
  {
    id: 'medium-project',
    name: 'Medium Project',
    description: 'Medium-sized project (~4 weeks manual development)',
    examples: 'TypeScript frontend, Multi-endpoint API service, Complex React component suite',
    defaultValues: {
      ...standardDefaults,
      projectType: 'oneoff',
      projectParams: {
        manualDevHours: 150,
        agenticMultiplier: 3,
        humanGuidanceTime: 8,
        aiProcessingTime: 8,
        projectAiSetupTime: 1,
        outputTokenPercentage: 80,
        cachedTokenPercentage: 80,
        totalProjectTokens: 65000000,
        averageHourlyRate: 200
      },
    }
  },
  {
    id: 'large-project',
    name: 'Large Project',
    description: 'Large project or system (~6 weeks manual development)',
    examples: 'Complex full stack web application, Multi-microservice system',
    defaultValues: {
      ...standardDefaults,
      projectType: 'oneoff',
      projectParams: {
        manualDevHours: 250,
        agenticMultiplier: 3,
        humanGuidanceTime: 12,
        aiProcessingTime: 15,
        projectAiSetupTime: 2,
        outputTokenPercentage: 80,
        cachedTokenPercentage: 80,
        totalProjectTokens: 120000000,
        averageHourlyRate: 200
      },
    }
  },
  {
    id: 'enterprise-project',
    name: 'Enterprise Project',
    description: 'Enterprise-scale project or system (~23 weeks manual development)',
    examples: 'Monolith decomposition',
    defaultValues: {
      ...standardDefaults,
      projectType: 'oneoff',
      projectParams: {
        manualDevHours: 900,
        agenticMultiplier: 3,
        humanGuidanceTime: 75,
        aiProcessingTime: 45,
        projectAiSetupTime: 35,
        outputTokenPercentage: 80,
        cachedTokenPercentage: 80,
        totalProjectTokens: 500000000,
        averageHourlyRate: 200
      },
    }
  },
  {
    id: 'agentic-coding',
    name: 'Agentic Coding',
    description: 'Continuous daily AI usage',
    examples: 'LLM usage for agentic coding',
    defaultValues: {
      ...standardDefaults,
      projectType: 'ongoing',
      teamParams: {
        numberOfDevs: 2,
        tokensPerDevPerDay: 30000000,
        agenticMultiplier: 3.0, // Developers are 3x more productive
        averageHourlyRate: 200  // Base hourly rate for ROI calculation
      },
    }
  },
  {
    id: 'product-ai-usage-small',
    name: 'Small Product AI Usage',
    description: 'Light LLM used as part of a products functionality',
    examples: 'Chatbot',
    defaultValues: {
      ...standardDefaults,
      projectType: 'ongoing',
      productParams: {
        tokensPerDayOngoing: 2000000,
        numberOfApps: 1,
        cachedTokenPercentage: 75 // Updated from 15 to 75
      },
      teamParams: {
        numberOfDevs: 0,
        tokensPerDevPerDay: 0
      },
    },
  },
  {
    id: 'product-ai-usage-medium',
    name: 'Medium Product AI Usage',
    description: 'Frequent LLM used as part of a products functionality',
    examples: 'Moderate information processing',
    defaultValues: {
      ...standardDefaults,
      projectType: 'ongoing',
      productParams: {
        tokensPerDayOngoing: 4000000,
        numberOfApps: 1,
        cachedTokenPercentage: 20
      },
      teamParams: {
        numberOfDevs: 0,
        tokensPerDevPerDay: 0
      },
    }
  },
  {
    id: 'product-ai-usage-heavy-agentic-system',
    name: 'Heavy Product AI Usage',
    description: 'Heavy LLM used as part of a products functionality',
    examples: 'Multi-agent system, Translation service',
    defaultValues: {
      ...standardDefaults,
      projectType: 'ongoing',
      productParams: {
        tokensPerDayOngoing: 15000000,
        numberOfApps: 2,
        cachedTokenPercentage: 25
      },
      teamParams: {
        numberOfDevs: 0,
        tokensPerDevPerDay: 0
      },
    }
  }
] as const

export const getTemplateById = (id: string) => {
  const template = templates.find(t => t.id === id)
  if (!template) {
    throw new Error(`Template with ID "${id}" not found`)
  }
  return template
}

export type Template = typeof templates[number]
