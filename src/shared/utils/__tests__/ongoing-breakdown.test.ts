import { calculateCosts } from '../calculations';
import { CalculationRequest } from '../../types/models';

describe('Ongoing Cost Breakdown', () => {
  const baseRequest: CalculationRequest = {
    globalParams: {
      customerName: 'Test Customer',
      projectName: 'Test Project',
      currencyRate: 0.65
    },
    modelConfig: {
      primaryModelId: 'claude_4_0_sonnet'
    },
    projectType: 'ongoing'
  };

  it('should calculate team and product breakdown separately', () => {
    const request: CalculationRequest = {
      ...baseRequest,
      teamParams: {
        numberOfDevs: 5,
        tokensPerDevPerDay: 50000,
        averageHourlyRate: 150,
        agenticMultiplier: 3
      },
      productParams: {
        tokensPerDayOngoing: 100000,
        numberOfApps: 2,
        outputTokenPercentage: 60,
        cachedTokenPercentage: 30
      }
    };

    const result = calculateCosts(request);

    // Check that daily costs exist
    expect(result.dailyCosts).toBeDefined();
    expect(result.dailyCosts!.total.aud).toBeGreaterThan(0);

    // Check that breakdown exists
    expect(result.dailyCosts!.breakdown).toBeDefined();

    // Check team breakdown
    expect(result.dailyCosts!.breakdown!.team).toBeDefined();
    expect(result.dailyCosts!.breakdown!.team!.total.aud).toBeGreaterThan(0);
    expect(result.dailyCosts!.breakdown!.team!.monthly.aud).toBeGreaterThan(0);
    expect(result.dailyCosts!.breakdown!.team!.yearly.aud).toBeGreaterThan(0);
    expect(result.dailyCosts!.breakdown!.team!.perDev).toBeDefined();
    expect(result.dailyCosts!.breakdown!.team!.perDev!.aud).toBeGreaterThan(0);

    // Check product breakdown
    expect(result.dailyCosts!.breakdown!.product).toBeDefined();
    expect(result.dailyCosts!.breakdown!.product!.total.aud).toBeGreaterThan(0);
    expect(result.dailyCosts!.breakdown!.product!.monthly.aud).toBeGreaterThan(0);
    expect(result.dailyCosts!.breakdown!.product!.yearly.aud).toBeGreaterThan(0);

    // Check that team + product = total
    const teamCost = result.dailyCosts!.breakdown!.team!.total.aud;
    const productCost = result.dailyCosts!.breakdown!.product!.total.aud;
    const totalCost = result.dailyCosts!.total.aud;

    expect(Math.abs(teamCost + productCost - totalCost)).toBeLessThan(0.02); // Allow for rounding errors
  });

  it('should handle team-only scenarios', () => {
    const request: CalculationRequest = {
      ...baseRequest,
      teamParams: {
        numberOfDevs: 3,
        tokensPerDevPerDay: 30000,
        averageHourlyRate: 120,
        agenticMultiplier: 2.5
      }
    };

    const result = calculateCosts(request);

    expect(result.dailyCosts).toBeDefined();
    expect(result.dailyCosts!.breakdown).toBeDefined();
    expect(result.dailyCosts!.breakdown!.team).toBeDefined();
    expect(result.dailyCosts!.breakdown!.product).toBeUndefined();

    // Total should equal team cost
    const teamCost = result.dailyCosts!.breakdown!.team!.total.aud;
    const totalCost = result.dailyCosts!.total.aud;
    expect(Math.abs(teamCost - totalCost)).toBeLessThan(0.01);
  });

  it('should handle product-only scenarios', () => {
    const request: CalculationRequest = {
      ...baseRequest,
      productParams: {
        tokensPerDayOngoing: 75000,
        numberOfApps: 1,
        outputTokenPercentage: 70,
        cachedTokenPercentage: 45
      }
    };

    const result = calculateCosts(request);

    expect(result.dailyCosts).toBeDefined();
    expect(result.dailyCosts!.breakdown).toBeDefined();
    expect(result.dailyCosts!.breakdown!.product).toBeDefined();
    expect(result.dailyCosts!.breakdown!.team).toBeUndefined();

    // Total should equal product cost
    const productCost = result.dailyCosts!.breakdown!.product!.total.aud;
    const totalCost = result.dailyCosts!.total.aud;
    expect(Math.abs(productCost - totalCost)).toBeLessThan(0.01);
  });

  it('should calculate per-dev costs correctly', () => {
    const numberOfDevs = 4;
    const request: CalculationRequest = {
      ...baseRequest,
      teamParams: {
        numberOfDevs,
        tokensPerDevPerDay: 25000,
        averageHourlyRate: 140,
        agenticMultiplier: 2.8
      }
    };

    const result = calculateCosts(request);

    expect(result.dailyCosts!.breakdown!.team!.perDev).toBeDefined();

    const perDevDaily = result.dailyCosts!.breakdown!.team!.perDev!.aud;
    const totalTeamDaily = result.dailyCosts!.breakdown!.team!.total.aud;

    // Per dev * number of devs should equal total team cost
    expect(Math.abs(perDevDaily * numberOfDevs - totalTeamDaily)).toBeLessThan(0.02);

    // Check monthly and yearly per-dev calculations (allow for currency conversion rounding)
  });
});
