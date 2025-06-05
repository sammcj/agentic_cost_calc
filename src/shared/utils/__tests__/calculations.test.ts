import { calculateCosts } from '../calculations'
import { CalculationRequest } from '../../types/models'

describe('calculateCosts', () => {
  describe('One-off Project Calculations', () => {
    it('should calculate costs for a basic one-off project', () => {
      const request: CalculationRequest = {
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
      }

      const result = calculateCosts(request)

      // Basic assertions
      expect(result.traditionalCost).toBeDefined()
      expect(result.agenticCost).toBeDefined()
      expect(result.savingsAnalysis).toBeDefined()

      if (result.traditionalCost && result.agenticCost && result.savingsAnalysis) {
        // Traditional cost should be hours * rate
        expect(result.traditionalCost.aud).toBe(32000) // 160 hours * $200/hour

        // Verify savings calculations
        expect(result.savingsAnalysis.percentage).toBeGreaterThan(0)
        expect(result.savingsAnalysis.roi).toBeGreaterThan(0)
      }
    })
  })

  describe('Currency and Cost Multiplier Calculations', () => {
    it('should correctly apply currency conversion rates', () => {
      const request: CalculationRequest = {
        projectType: 'oneoff',
        globalParams: {
          currencyRate: 0.75, // 1 AUD = 0.75 USD
          aiCapabilityFactor: 1.0,
          totalCostMultiplier: 1.0
        },
        modelConfig: {
          primaryModelId: 'claude_4_0_sonnet'
        },
        projectParams: {
          manualDevHours: 100,
          agenticMultiplier: 3.0,
          humanGuidanceTime: 4,
          outputTokenPercentage: 80,
          cachedTokenPercentage: 80,
          totalProjectTokens: 50000000,
          averageHourlyRate: 200 // AUD
        }
      }

      const result = calculateCosts(request)
      expect(result.traditionalCost).toBeDefined()

      if (result.traditionalCost) {
        // Traditional cost in AUD should be hours * rate
        expect(result.traditionalCost.aud).toBe(20000) // 100 hours * 200 AUD
        // USD should be AUD * exchange rate
        expect(result.traditionalCost.usd).toBe(15000) // 20000 AUD * 0.75
      }
    })

    it('should apply total cost multiplier correctly', () => {
      const request: CalculationRequest = {
        projectType: 'oneoff',
        globalParams: {
          currencyRate: 0.64,
          aiCapabilityFactor: 1.0,
          totalCostMultiplier: 1.5 // 50% increase
        },
        modelConfig: {
          primaryModelId: 'claude_4_0_sonnet'
        },
        projectParams: {
          manualDevHours: 100,
          agenticMultiplier: 3.0,
          humanGuidanceTime: 4,
          outputTokenPercentage: 80,
          cachedTokenPercentage: 80,
          totalProjectTokens: 50000000,
          averageHourlyRate: 200
        }
      }

      const result = calculateCosts(request)
      const baseRequest = { ...request }
      baseRequest.globalParams.totalCostMultiplier = 1.0
      const baseResult = calculateCosts(baseRequest)

      expect(result.agenticCost).toBeDefined()
      expect(baseResult.agenticCost).toBeDefined()

      if (result.agenticCost && baseResult.agenticCost) {
        // Agentic costs should be 1.5x the base costs
        expect(result.agenticCost.total.usd).toBe(baseResult.agenticCost.total.usd * 1.5)
        // Use toBeCloseTo for floating point comparisons
        // Round to nearest integer for AUD amount comparison
        // Allow for small rounding differences
        const resultValue = result.agenticCost.total.aud;
        const expectedValue = baseResult.agenticCost.total.aud * 1.5;
        expect(Math.abs(resultValue - expectedValue)).toBeLessThan(1);
        expect(result.agenticCost.inference.usd).toBe(baseResult.agenticCost.inference.usd * 1.5)
        expect(result.agenticCost.human.usd).toBe(baseResult.agenticCost.human.usd * 1.5)
      }
    })

    it('should handle invalid currency rates gracefully', () => {
      const request: CalculationRequest = {
        projectType: 'oneoff',
        globalParams: {
          currencyRate: 0, // Invalid rate
          aiCapabilityFactor: 1.0,
          totalCostMultiplier: 1.0
        },
        modelConfig: {
          primaryModelId: 'claude_4_0_sonnet'
        },
        projectParams: {
          manualDevHours: 100,
          agenticMultiplier: 3.0,
          humanGuidanceTime: 4,
          outputTokenPercentage: 80,
          cachedTokenPercentage: 80,
          totalProjectTokens: 50000000,
          averageHourlyRate: 200
        }
      }

      // Should throw an error for invalid currency rate
      expect(() => calculateCosts(request)).toThrow('Invalid currency exchange rate provided.')
    })
  })

  describe('Ongoing Usage Calculations', () => {
    describe('ROI Calculation for Agentic Coding Template', () => {
      it('should calculate ROI for ongoing agentic coding usage', () => {
        const request: CalculationRequest = {
          projectType: 'ongoing',
          globalParams: {
            currencyRate: 0.64,
            aiCapabilityFactor: 1.0,
            totalCostMultiplier: 1.0
          },
          modelConfig: {
            primaryModelId: 'claude_4_0_sonnet'
          },
          teamParams: {
            numberOfDevs: 2,
            tokensPerDevPerDay: 30000000,
            agenticMultiplier: 3.0,
            averageHourlyRate: 200
          }
        }

        const result = calculateCosts(request)

        // Check that dailyCosts and roiAnalysis exist
        expect(result.dailyCosts).toBeDefined()
        expect(result.dailyCosts?.roiAnalysis).toBeDefined()

        // Verify ROI analysis values
        if (result.dailyCosts?.roiAnalysis) {
          expect(result.dailyCosts.roiAnalysis.productivityGain).toBe(3.0)
          expect(result.dailyCosts.roiAnalysis.traditionalCost).toBeDefined()
          expect(result.dailyCosts.roiAnalysis.agenticCost).toBeDefined()
          expect(result.dailyCosts.roiAnalysis.roi).toBeGreaterThan(0)

          // Traditional daily cost should be: devs * hours * rate
          expect(result.dailyCosts.roiAnalysis.traditionalCost.aud).toBe(3200) // 2 devs * 8 hours * $200/hour

          // Agentic cost should be lower due to productivity gain
          expect(result.dailyCosts.roiAnalysis.agenticCost.aud).toBeLessThan(result.dailyCosts.roiAnalysis.traditionalCost.aud)
        }
      })
    })

    it('should calculate costs for product AI usage', () => {
      const request: CalculationRequest = {
        projectType: 'ongoing',
        globalParams: {
          currencyRate: 0.64,
          aiCapabilityFactor: 1.0,
          totalCostMultiplier: 1.0
        },
        modelConfig: {
          primaryModelId: 'claude_4_0_sonnet'
        },
        productParams: {
          tokensPerDayOngoing: 2000000,
          numberOfApps: 1,
          cachedTokenPercentage: 15
        }
      }

      const result = calculateCosts(request)

      expect(result.dailyCosts).toBeDefined()
      expect(result.tokenUsage).toBeDefined()

      if (result.dailyCosts && result.tokenUsage) {
        // Verify token usage calculations
        expect(result.tokenUsage.input).toBeGreaterThan(0)
        expect(result.tokenUsage.output).toBeGreaterThan(0)
        expect(result.tokenUsage.cacheWrite).toBeGreaterThan(0)
        expect(result.tokenUsage.cacheRead).toBeGreaterThan(0)
      }
    })
  })

  describe('Combined Project and Ongoing Calculations', () => {
    it('should calculate both one-off and ongoing costs', () => {
      const request: CalculationRequest = {
        projectType: 'both',
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
          projectAiSetupTime: 4,
          outputTokenPercentage: 80,
          cachedTokenPercentage: 80,
          totalProjectTokens: 80000000,
          averageHourlyRate: 200
        },
        teamParams: {
          numberOfDevs: 2,
          tokensPerDevPerDay: 30000000,
          agenticMultiplier: 3.0,
          averageHourlyRate: 200
        }
      }

      const result = calculateCosts(request)

      // Verify both one-off and ongoing calculations are present
      expect(result.traditionalCost).toBeDefined()
      expect(result.agenticCost).toBeDefined()
      expect(result.dailyCosts).toBeDefined()
      expect(result.fteEquivalentCost).toBeDefined()

      // Verify setup and guidance costs
      expect(result.humanGuidanceCost).toBeDefined()
      expect(result.projectAiSetupCost).toBeDefined()
      expect(result.projectAiSetupTime).toBe(4)

      // Verify time calculations
      expect(result.totalProjectTime).toBeDefined()
      if (result.totalProjectTime) {
        // Total time should include agentic, guidance, processing, and setup
        expect(result.totalProjectTime).toBe(
          (result.agenticTime || 0) +
          (result.humanGuidanceTime || 0) +
          (result.aiProcessingTime || 0) +
          (result.projectAiSetupTime || 0)
        )
      }
    })

    it('should handle secondary model calculations', () => {
      const request: CalculationRequest = {
        projectType: 'oneoff',
        globalParams: {
          currencyRate: 0.64,
          aiCapabilityFactor: 1.0,
          totalCostMultiplier: 1.0
        },
        modelConfig: {
          primaryModelId: 'claude_4_0_sonnet',
          secondaryModelId: 'claude_4_0_sonnet', // Use a model we know exists
          modelRatio: 0.7 // 70% primary, 30% secondary
        },
        projectParams: {
          manualDevHours: 100,
          agenticMultiplier: 3.0,
          totalProjectTokens: 50000000,
          averageHourlyRate: 200,
          humanGuidanceTime: 4,
          outputTokenPercentage: 80,
          cachedTokenPercentage: 80
        }
      }

      const result = calculateCosts(request)
      expect(result.agenticCost).toBeDefined()
      expect(result.tokenUsage).toBeDefined()

      if (result.tokenUsage) {
        // Verify token distribution between models
        expect(result.tokenUsage.input).toBeGreaterThan(0)
        expect(result.tokenUsage.output).toBeGreaterThan(0)
      }
    })

    it('should handle edge cases with zero or undefined values', () => {
      const request: CalculationRequest = {
        projectType: 'both',
        globalParams: {
          currencyRate: 0.64
        },
        modelConfig: {
          primaryModelId: 'claude_4_0_sonnet'
        },
        projectParams: {
          manualDevHours: 0,
          averageHourlyRate: 200,
          agenticMultiplier: 1.0,
          humanGuidanceTime: 0,
          outputTokenPercentage: 80,
          cachedTokenPercentage: 80,
          totalProjectTokens: 0
        },
        teamParams: {
          numberOfDevs: 0,
          tokensPerDevPerDay: 0
        }
      }

      const result = calculateCosts(request)

      // Should handle zero values gracefully
      expect(result.traditionalCost?.aud).toBe(0)
      expect(result.dailyCosts?.total.aud).toBe(0)
      expect(result.tokenUsage?.input).toBe(0)
      expect(result.tokenUsage?.output).toBe(0)
    })
  })
})
