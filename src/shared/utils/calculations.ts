import {
  CalculationRequest,
  CalculationResult,
  CurrencyPair,
  AgenticBreakdown,
  ChartDataset,
  TokenUsage,
  ModelProfile,
  ProjectParameters,
  TeamParameters,
  ProductParameters,
  GlobalParameters,
  LLMConfig,
  DailyROIAnalysis,
  OngoingCostBreakdown
} from '../types/models';
import { getModelProfile } from './modelConfig';
import { convertUsdToAud, convertAudToUsd } from './currency';

// Helper to safely get parameters or defaults
// const safeGet = <T>(obj: T | undefined, defaultValue: T): T => obj ?? defaultValue;
const safeGetNumber = (num: number | undefined, defaultValue: number = 0): number => num ?? defaultValue;

// --- Calculation Helper Functions ---

/**
 * Calculates the cost of tokens based on model profile, usage, and ratios.
 * Handles primary and optional secondary model usage.
 * Incorporates capability multiplier.
 */
const calculateTokenCostUsd = (
    baseInputTokens: number,
    inputOutputRatio: number,
    cacheRatio: number, // Ratio of reads from cache
    llmConfig: LLMConfig,
    globalParams: GlobalParameters
): { usd: number; usage: TokenUsage } => {
    const primaryModel = getModelProfile(llmConfig.primaryModelId);
    const secondaryModel = llmConfig.secondaryModelId ? getModelProfile(llmConfig.secondaryModelId) : undefined;
    const modelRatio = safeGetNumber(llmConfig.modelRatio, 1.0); // Default to 100% primary if no ratio/secondary

    if (!primaryModel) {
        console.error(`Primary model profile not found: ${llmConfig.primaryModelId}`);
        return { usd: 0, usage: { input: 0, output: 0, cacheWrite: 0, cacheRead: 0 } };
    }
    if (llmConfig.secondaryModelId && !secondaryModel) {
        console.error(`Secondary model profile not found: ${llmConfig.secondaryModelId}`);
        // Decide whether to proceed with primary only or fail
        return { usd: 0, usage: { input: 0, output: 0, cacheWrite: 0, cacheRead: 0 } };
    }

    const capabilityFactor = safeGetNumber(globalParams.aiCapabilityFactor, 1.0);

    let totalCostUsd = 0;
    let totalInput = 0;
    let totalOutput = 0;
    let totalCacheWrite = 0;
    let totalCacheRead = 0;

    const calculateModelSpecificCost = (
        model: ModelProfile,
        tokenShare: number // Ratio of total tokens this model handles
    ): { cost: number; usage: Omit<TokenUsage, 'effectiveTotal'> } => {
        // Calculate total tokens after applying model capabilities
        // Calculate total tokens *before* splitting, considering model/global factors
        const totalEffectiveTokens = baseInputTokens * tokenShare * model.modelCapabilityMultiplier * capabilityFactor;

        // Split tokens based on inputOutputRatio (which is the percentage of *output* tokens)
        const outputRatio = inputOutputRatio / 100; // Convert percentage to ratio
    const effectiveOutputTokens = Math.round(totalEffectiveTokens * outputRatio);
    const effectiveInputTokens = totalEffectiveTokens - effectiveOutputTokens; // Remainder is input

    console.log('Token split:', {
        totalEffectiveTokens,
        outputRatio,
        effectiveInputTokens,
        effectiveOutputTokens
    });

    // Apply cache ratio to both input and output tokens
        const cachedInputTokens = Math.round(effectiveInputTokens * cacheRatio);
        const uncachedInputTokens = effectiveInputTokens - cachedInputTokens;
        const cachedOutputTokens = Math.round(effectiveOutputTokens * cacheRatio);
        const uncachedOutputTokens = effectiveOutputTokens - cachedOutputTokens;

        // Calculate costs for input tokens
        // Calculate costs with full precision
        const inputCost = (uncachedInputTokens * model.inputTokenCost1M) / 1_000_000;
        const inputCacheReadCost = (cachedInputTokens * model.cacheReadTokenCost1M) / 1_000_000;
        const cacheWriteCost = (uncachedInputTokens * model.cacheWriteTokenCost1M) / 1_000_000;
        const outputCost = (uncachedOutputTokens * model.outputTokenCost1M) / 1_000_000;
        const outputCacheReadCost = (cachedOutputTokens * model.cacheReadTokenCost1M) / 1_000_000;

        // Sum all costs
        const totalCost = inputCost + inputCacheReadCost + cacheWriteCost + outputCost + outputCacheReadCost;
        // Round to 6 decimal places to avoid floating point errors
        const modelCost = Math.round(totalCost * 1_000_000) / 1_000_000;

        return {
            cost: modelCost,
            usage: {
                input: effectiveInputTokens,
                output: effectiveOutputTokens,
                cacheWrite: uncachedInputTokens, // We write what we didn't read
                cacheRead: cachedInputTokens + cachedOutputTokens
            }
        };
    };

    // Calculate cost for primary model
    const primaryResult = calculateModelSpecificCost(primaryModel, secondaryModel ? modelRatio : 1.0);
    totalCostUsd += primaryResult.cost;
    totalInput += primaryResult.usage.input;
    totalOutput += primaryResult.usage.output;
    totalCacheWrite += primaryResult.usage.cacheWrite;
    totalCacheRead += primaryResult.usage.cacheRead;

    // Calculate cost for secondary model if applicable
    if (secondaryModel) {
        const secondaryResult = calculateModelSpecificCost(secondaryModel, 1.0 - modelRatio);
        totalCostUsd += secondaryResult.cost;
        totalInput += secondaryResult.usage.input;
        totalOutput += secondaryResult.usage.output;
        totalCacheWrite += secondaryResult.usage.cacheWrite;
        totalCacheRead += secondaryResult.usage.cacheRead;
    }

    const finalUsage: TokenUsage = {
        input: totalInput,
        output: totalOutput,
        cacheWrite: totalCacheWrite,
        cacheRead: totalCacheRead,
        effectiveTotal: totalInput + totalOutput // A simple sum for now
    };

    console.log('Final token usage:', {
        baseInputTokens,
        inputOutputRatio,
        finalUsage,
        totalCostUsd
    });

    return { usd: totalCostUsd, usage: finalUsage };
};

/** Calculates daily costs for ongoing usage (team + product). */
const calculateDailyROI = (
    teamParams: TeamParameters,
    dailyInferenceCostUsd: number,
    rate: number
): DailyROIAnalysis => {
    const hoursPerDay = 8; // Standard work day
    const baselineCostUsd = convertAudToUsd(teamParams.averageHourlyRate! * hoursPerDay * teamParams.numberOfDevs, rate);
    const effectiveCostUsd = dailyInferenceCostUsd + (baselineCostUsd / (teamParams.agenticMultiplier ?? 1));
    const roi = ((baselineCostUsd - effectiveCostUsd) / effectiveCostUsd) * 100;

    return {
        traditionalCost: { usd: baselineCostUsd, aud: convertUsdToAud(baselineCostUsd, rate) },
        agenticCost: { usd: effectiveCostUsd, aud: convertUsdToAud(effectiveCostUsd, rate) },
        roi: roi,
        productivityGain: teamParams.agenticMultiplier ?? 1
    };
};

interface DailyCostsResult {
    dailyTotalUsd: number;
    dailyPerDevUsd?: number;
    dailyTokenUsage: TokenUsage;
    roiAnalysis?: DailyROIAnalysis;
    breakdown?: OngoingCostBreakdown;
    monthlyAndYearly: {
        monthlyTotalUsd: number;
        yearlyTotalUsd: number;
        monthlyPerDevUsd?: number;
        yearlyPerDevUsd?: number;
    };
}

const calculateDailyCostsInternal = (
    teamParams: TeamParameters | undefined,
    productParams: ProductParameters | undefined,
    llmConfig: LLMConfig,
    globalParams: GlobalParameters
): DailyCostsResult => {
    console.log('Calculating daily costs with params:', {
        teamParams: JSON.stringify(teamParams),
        productParams: JSON.stringify(productParams)
    });

    // Different cache ratios for team vs product usage
    const dailyInputOutputRatio = 80; // 80% output tokens
    const teamCacheRatio = 75 / 100; // Developer usage has higher cache hit rate
    const productCacheRatio = safeGetNumber(productParams?.cachedTokenPercentage, 40) / 100; // Product usage typically lower cache hit rate

    console.log('Using ratios:', {
        dailyInputOutputRatio,
        teamCacheRatio,
        productCacheRatio
    });

    let teamTokens = 0;
    let productTokens = 0;

    if (teamParams) {
        teamTokens = safeGetNumber(teamParams.numberOfDevs) * safeGetNumber(teamParams.tokensPerDevPerDay);
        console.log('Team tokens:', { teamTokens, numberOfDevs: teamParams.numberOfDevs, tokensPerDevPerDay: teamParams.tokensPerDevPerDay });
    }

    if (productParams) {
        productTokens = safeGetNumber(productParams.tokensPerDayOngoing) * safeGetNumber(productParams.numberOfApps, 1);
        console.log('Product tokens:', { productTokens, tokensPerDay: productParams.tokensPerDayOngoing, numberOfApps: productParams.numberOfApps });
    }

    const dailyTokens = teamTokens + productTokens;
    console.log('Total daily tokens:', dailyTokens);

    // Return early with zeros if no tokens (either no team or product params, or all zeros)
    if (dailyTokens === 0) {
        return {
            dailyTotalUsd: 0,
            dailyTokenUsage: { input: 0, output: 0, cacheWrite: 0, cacheRead: 0 },
            monthlyAndYearly: {
                monthlyTotalUsd: 0,
                yearlyTotalUsd: 0,
                monthlyPerDevUsd: undefined,
                yearlyPerDevUsd: undefined
            }
        };
    }

    // Calculate team costs separately if team params exist
    let teamCostUsd = 0;
    let teamUsage: TokenUsage = { input: 0, output: 0, cacheWrite: 0, cacheRead: 0 };
    if (teamParams && teamTokens > 0) {
        const teamResult = calculateTokenCostUsd(
            teamTokens,
            dailyInputOutputRatio,
            teamCacheRatio,
            llmConfig,
            globalParams
        );
        teamCostUsd = teamResult.usd;
        teamUsage = teamResult.usage;
        console.log('Team cost calculation:', { teamTokens, teamCostUsd, teamUsage });
    }

    // Calculate product costs separately if product params exist
    let productCostUsd = 0;
    let productUsage: TokenUsage = { input: 0, output: 0, cacheWrite: 0, cacheRead: 0 };
    if (productParams && productTokens > 0) {
        const productOutputRatio = safeGetNumber(productParams.outputTokenPercentage, dailyInputOutputRatio);
        const productResult = calculateTokenCostUsd(
            productTokens,
            productOutputRatio,
            productCacheRatio,
            llmConfig,
            globalParams
        );
        productCostUsd = productResult.usd;
        productUsage = productResult.usage;
        console.log('Product cost calculation:', { productTokens, productCostUsd, productUsage });
    }

    // Calculate total costs and combined usage
    const dailyCostUsd = teamCostUsd + productCostUsd;
    const dailyUsage: TokenUsage = {
        input: teamUsage.input + productUsage.input,
        output: teamUsage.output + productUsage.output,
        cacheWrite: teamUsage.cacheWrite + productUsage.cacheWrite,
        cacheRead: teamUsage.cacheRead + productUsage.cacheRead,
        effectiveTotal: (teamUsage.effectiveTotal || 0) + (productUsage.effectiveTotal || 0)
    };

    console.log('Combined daily costs:', {
        teamCostUsd,
        productCostUsd,
        dailyCostUsd,
        dailyUsage
    });

    let dailyPerDevUsd: number | undefined = undefined;
    if (teamParams && teamParams.numberOfDevs > 0 && teamCostUsd > 0) {
        // Use team-specific cost for per-dev calculation
        dailyPerDevUsd = teamCostUsd / teamParams.numberOfDevs;
    }

    // Calculate ROI if team parameters include productivity metrics
    let roiAnalysis: DailyROIAnalysis | undefined;
    if (teamParams?.agenticMultiplier && teamParams?.averageHourlyRate) {
        // Use only team cost for ROI analysis (product cost doesn't affect developer productivity)
        roiAnalysis = calculateDailyROI(teamParams, teamCostUsd, globalParams.currencyRate);
    }

    // Create breakdown structure
    const breakdown: OngoingCostBreakdown = {};
    const rate = globalParams.currencyRate;

    // Add team breakdown if team params exist
    if (teamParams && teamCostUsd > 0) {
        const teamMonthlyUsd = teamCostUsd * 20;
        const teamYearlyUsd = teamCostUsd * 240;
        const perDevMonthlyUsd = dailyPerDevUsd ? dailyPerDevUsd * 20 : undefined;
        const perDevYearlyUsd = dailyPerDevUsd ? dailyPerDevUsd * 240 : undefined;

        breakdown.team = {
            total: { usd: teamCostUsd, aud: convertUsdToAud(teamCostUsd, rate) },
            monthly: { usd: teamMonthlyUsd, aud: convertUsdToAud(teamMonthlyUsd, rate) },
            yearly: { usd: teamYearlyUsd, aud: convertUsdToAud(teamYearlyUsd, rate) },
            perDev: dailyPerDevUsd ? { usd: dailyPerDevUsd, aud: convertUsdToAud(dailyPerDevUsd, rate) } : undefined,
            perDevMonthly: perDevMonthlyUsd ? { usd: perDevMonthlyUsd, aud: convertUsdToAud(perDevMonthlyUsd, rate) } : undefined,
            perDevYearly: perDevYearlyUsd ? { usd: perDevYearlyUsd, aud: convertUsdToAud(perDevYearlyUsd, rate) } : undefined
        };
    }

    // Add product breakdown if product params exist
    if (productParams && productCostUsd > 0) {
        const productMonthlyUsd = productCostUsd * 20;
        const productYearlyUsd = productCostUsd * 240;

        breakdown.product = {
            total: { usd: productCostUsd, aud: convertUsdToAud(productCostUsd, rate) },
            monthly: { usd: productMonthlyUsd, aud: convertUsdToAud(productMonthlyUsd, rate) },
            yearly: { usd: productYearlyUsd, aud: convertUsdToAud(productYearlyUsd, rate) }
        };
    }

    return {
        dailyTotalUsd: dailyCostUsd,
        dailyPerDevUsd,
        dailyTokenUsage: dailyUsage,
        roiAnalysis,
        breakdown: Object.keys(breakdown).length > 0 ? breakdown : undefined,
        monthlyAndYearly: {
            monthlyTotalUsd: dailyCostUsd * 20, // 20 working days
            yearlyTotalUsd: dailyCostUsd * 240, // 240 working days
            monthlyPerDevUsd: dailyPerDevUsd ? dailyPerDevUsd * 20 : undefined,
            yearlyPerDevUsd: dailyPerDevUsd ? dailyPerDevUsd * 240 : undefined
        }
    };
};

/** Calculates traditional project costs. */
const calculateTraditionalCostsInternal = (
    projectParams: ProjectParameters | undefined,
    globalParams: GlobalParameters
): { cost: CurrencyPair; time: number } => {
    if (!projectParams) {
        return { cost: { usd: 0, aud: 0 }, time: 0 };
    }

    const manualHours = safeGetNumber(projectParams.manualDevHours);
    const hourlyRateAud = safeGetNumber(projectParams.averageHourlyRate);
    const rate = safeGetNumber(globalParams.currencyRate, 1); // Avoid division by zero

    if (rate === 0) {
        console.error("Currency rate cannot be zero.");
        return { cost: { usd: 0, aud: 0 }, time: manualHours };
    }

    // Convert AUD hourly rate to USD for internal calculation
    const hourlyRateUsd = convertAudToUsd(hourlyRateAud, rate);
    const totalUsd = hourlyRateUsd * manualHours;
    const totalAud = convertUsdToAud(totalUsd, rate); // Convert back and round AUD

    return {
        cost: { usd: totalUsd, aud: totalAud },
        time: manualHours
    };
};

/** Calculates agentic project costs (inference + human). */
const calculateAgenticCostsInternal = (
    projectParams: ProjectParameters | undefined,
    llmConfig: LLMConfig,
    globalParams: GlobalParameters
): { breakdown: AgenticBreakdown; time: number; tokenUsage: TokenUsage } => {
    const emptyResult = {
        breakdown: {
            inference: { usd: 0, aud: 0 },
            human: { usd: 0, aud: 0 },
            total: { usd: 0, aud: 0 }
        },
        time: 0,
        tokenUsage: { input: 0, output: 0, cacheWrite: 0, cacheRead: 0 }
    };

    if (!projectParams) {
        return emptyResult;
    }

    const rate = safeGetNumber(globalParams.currencyRate, 1);
    if (rate === 0) {
        console.error("Currency rate cannot be zero.");
        return emptyResult;
    }

    // 1. Calculate Inference Cost (Tokens)
    const { usd: inferenceCostUsd, usage: tokenUsage } = calculateTokenCostUsd(
        safeGetNumber(projectParams.totalProjectTokens),
        safeGetNumber(projectParams.outputTokenPercentage, 80), // Default to 80% output ratio
        safeGetNumber(projectParams.cachedTokenPercentage, 80) / 100, // Convert percentage to ratio
        llmConfig,
        globalParams
    );
    // const inferenceCostAud = convertUsdToAud(inferenceCostUsd, rate);

    // 2. Calculate Agentic Human Cost
    const manualHours = safeGetNumber(projectParams.manualDevHours);
    const agenticMultiplier = safeGetNumber(projectParams.agenticMultiplier, 3); // Speed multiplier (default: 3x faster)
    const primaryModel = getModelProfile(llmConfig.primaryModelId);
    const modelSpeedFactor = primaryModel ? safeGetNumber(primaryModel.modelSpeedMultiplier, 1.0) : 1.0;

    // Effective time = Manual time / (Agentic Speed * Model Speed) - adjust multiplier based on model speed
    const effectiveAgenticMultiplier = agenticMultiplier / modelSpeedFactor;
    const agenticHours = manualHours / effectiveAgenticMultiplier;

    // Get AI processing time (doesn't affect cost)
    // const aiProcessingTime = safeGetNumber(projectParams.aiProcessingTime, 0);

    const hourlyRateAud = safeGetNumber(projectParams.averageHourlyRate);
    const hourlyRateUsd = convertAudToUsd(hourlyRateAud, rate);

    // Calculate human cost (agentic hours + setup time)
    const humanCostUsd = hourlyRateUsd * agenticHours;
    // const humanCostAud = convertUsdToAud(humanCostUsd, rate);

    // 3. Calculate Total Agentic Cost
    const totalAgenticCostUsd = inferenceCostUsd + humanCostUsd;
    // const totalAgenticCostAud = convertUsdToAud(totalAgenticCostUsd, rate); // Recalculate AUD total for rounding consistency

    // Apply final cost multiplier if provided
    const finalMultiplier = safeGetNumber(globalParams.totalCostMultiplier, 1.0);

    const finalTotalUsd = totalAgenticCostUsd * finalMultiplier;
    const finalTotalAud = convertUsdToAud(finalTotalUsd, rate);
    const finalInferenceAud = convertUsdToAud(inferenceCostUsd * finalMultiplier, rate);
    const finalHumanAud = convertUsdToAud(humanCostUsd * finalMultiplier, rate);

    return {
        breakdown: {
            inference: { usd: inferenceCostUsd * finalMultiplier, aud: finalInferenceAud },
            human: { usd: humanCostUsd * finalMultiplier, aud: finalHumanAud },
            total: { usd: finalTotalUsd, aud: finalTotalAud }
        },
        time: agenticHours,
        tokenUsage: tokenUsage
    };
};

// --- Main Calculation Function ---

export const calculateCosts = (req: CalculationRequest): CalculationResult => {
    const result: CalculationResult = {};
    const { globalParams, modelConfig, projectParams, productParams, teamParams, projectType } = req;

    const rate = safeGetNumber(globalParams.currencyRate);
    if (rate <= 0) {
        throw new Error("Invalid currency exchange rate provided.");
    }

    // --- Populate Base Info ---
    result.customerName = globalParams.customerName;
    result.projectName = globalParams.projectName;
    result.projectDescription = globalParams.projectDescription;
    result.disclaimerText = globalParams.disclaimerText ?? "Estimates are based on industry standards for the gains seen from Agentic software development and token usage to support the calculations. Actual results will vary for each specific use case and implementation.";

    // --- Traditional Calculation (if project params exist) ---
    if (projectParams && (projectType === 'oneoff' || projectType === 'both')) {
        const { cost, time } = calculateTraditionalCostsInternal(projectParams, globalParams);
        result.traditionalCost = cost;
        result.traditionalTime = time;
    }

    // --- Agentic Calculation (if project params exist) ---
    let agenticTokenUsage: TokenUsage | undefined = undefined;
    if (projectParams && (projectType === 'oneoff' || projectType === 'both')) {
        const { breakdown, time, tokenUsage } = calculateAgenticCostsInternal(projectParams, modelConfig, globalParams);
        result.agenticCost = breakdown;
        result.agenticTime = time;
        agenticTokenUsage = tokenUsage; // Store for combined usage later

        // Calculate Human Guidance Cost
        if (projectParams.humanGuidanceTime !== undefined) {
            const hourlyRateAud = safeGetNumber(projectParams.averageHourlyRate);
            const hourlyRateUsd = convertAudToUsd(hourlyRateAud, rate);
            const humanGuidanceCostUsd = hourlyRateUsd * projectParams.humanGuidanceTime;
            const humanGuidanceCostAud = convertUsdToAud(humanGuidanceCostUsd, rate);

            result.humanGuidanceCost = {
                usd: humanGuidanceCostUsd,
                aud: humanGuidanceCostAud
            };
            result.humanGuidanceTime = projectParams.humanGuidanceTime;
        }

        // Add AI Processing Time (no cost impact)
        if (projectParams.aiProcessingTime !== undefined) {
            result.aiProcessingTime = projectParams.aiProcessingTime;
        }

        // Add Project AI Setup Time and Cost
        if (projectParams.projectAiSetupTime !== undefined) {
            const hourlyRateAud = safeGetNumber(projectParams.averageHourlyRate);
            const hourlyRateUsd = convertAudToUsd(hourlyRateAud, rate);
            const setupCostUsd = hourlyRateUsd * projectParams.projectAiSetupTime;
            const setupCostAud = convertUsdToAud(setupCostUsd, rate);

            result.projectAiSetupTime = projectParams.projectAiSetupTime;
            result.projectAiSetupCost = {
                usd: setupCostUsd,
                aud: setupCostAud
            };
        }

        // Calculate Total Project Time
        const agenticTime = safeGetNumber(result.agenticTime);
        const humanGuidanceTime = safeGetNumber(result.humanGuidanceTime);
        const aiProcessingTime = safeGetNumber(result.aiProcessingTime);
        const projectAiSetupTime = safeGetNumber(result.projectAiSetupTime);

        result.totalProjectTime = agenticTime + humanGuidanceTime + aiProcessingTime + projectAiSetupTime;
    }

    // --- Daily Cost Calculation (if team or product params exist) ---
    if ((teamParams || productParams) && (projectType === 'ongoing' || projectType === 'both')) {
        const dailyCostsData = calculateDailyCostsInternal(teamParams, productParams, modelConfig, globalParams);
        const { dailyTotalUsd, dailyPerDevUsd, monthlyAndYearly, dailyTokenUsage, roiAnalysis, breakdown } = dailyCostsData;
        const { monthlyTotalUsd, yearlyTotalUsd, monthlyPerDevUsd, yearlyPerDevUsd } = monthlyAndYearly;

        // Convert to AUD
        const dailyTotalAud = convertUsdToAud(dailyTotalUsd, rate);
        const monthlyTotalAud = convertUsdToAud(monthlyTotalUsd, rate);
        const yearlyTotalAud = convertUsdToAud(yearlyTotalUsd, rate);
        const dailyPerDevAud = dailyPerDevUsd ? convertUsdToAud(dailyPerDevUsd, rate) : undefined;
        const monthlyPerDevAud = monthlyPerDevUsd ? convertUsdToAud(monthlyPerDevUsd, rate) : undefined;
        const yearlyPerDevAud = yearlyPerDevUsd ? convertUsdToAud(yearlyPerDevUsd, rate) : undefined;

        result.dailyCosts = {
            total: { usd: dailyTotalUsd, aud: dailyTotalAud },
            monthly: { usd: monthlyTotalUsd, aud: monthlyTotalAud },
            yearly: { usd: yearlyTotalUsd, aud: yearlyTotalAud },
            perDev: dailyPerDevUsd !== undefined ? { usd: dailyPerDevUsd, aud: dailyPerDevAud! } : undefined,
            perDevMonthly: monthlyPerDevUsd !== undefined ? { usd: monthlyPerDevUsd, aud: monthlyPerDevAud! } : undefined,
            perDevYearly: yearlyPerDevUsd !== undefined ? { usd: yearlyPerDevUsd, aud: yearlyPerDevAud! } : undefined,
            roiAnalysis,
            breakdown
        };

        // Combine token usage if both project and daily are calculated
        if (agenticTokenUsage) {
            // Simple addition for now, might need more sophisticated merging
            agenticTokenUsage.input += dailyTokenUsage.input;
            agenticTokenUsage.output += dailyTokenUsage.output;
            agenticTokenUsage.cacheWrite += dailyTokenUsage.cacheWrite;
            agenticTokenUsage.cacheRead += dailyTokenUsage.cacheRead;
        } else {
            agenticTokenUsage = dailyTokenUsage;
        }
    }
    result.tokenUsage = agenticTokenUsage;

    // --- Savings Analysis (if traditional and agentic project costs calculated) ---
    if (result.traditionalCost && result.traditionalCost.usd > 0 && result.agenticCost && result.agenticCost.total.usd >= 0 && result.traditionalTime !== undefined && result.agenticTime !== undefined) {
        const costSavingsUsd = result.traditionalCost.usd - result.agenticCost.total.usd;
        const costSavingsAud = convertUsdToAud(costSavingsUsd, rate); // Use converted AUD for consistency
        const timeSavings = result.traditionalTime - result.agenticTime;

        // Calculate the monetary value of time savings using the hourly rate
        let timeSavingsValueUsd = 0;
        if (projectParams?.averageHourlyRate) {
            const hourlyRateUsd = convertAudToUsd(projectParams.averageHourlyRate, rate);
            timeSavingsValueUsd = hourlyRateUsd * timeSavings;
        }

        // Total return includes both cost savings and the value of time saved
        const totalReturnUsd = costSavingsUsd + timeSavingsValueUsd;

        // ROI = ((Cost Savings + Time Savings Value) / Agentic Cost) * 100
        const roi = result.agenticCost.total.usd > 0 ? (totalReturnUsd / result.agenticCost.total.usd) * 100 : Infinity; // Avoid division by zero
        const percentageSavings = (costSavingsUsd / result.traditionalCost.usd) * 100;

        result.savingsAnalysis = {
            cost: { usd: costSavingsUsd, aud: costSavingsAud },
            percentage: percentageSavings,
            timeInHours: timeSavings,
            roi: roi
        };
    }

    // --- FTE Equivalent Cost (if project params exist) ---
    if (projectParams) {
        const monthlyHours = 8 * 20; // Approx 20 working days/month
        const hourlyRateAud = safeGetNumber(projectParams.averageHourlyRate);
        const hourlyRateUsd = convertAudToUsd(hourlyRateAud, rate);
        const fteCostUsd = hourlyRateUsd * monthlyHours;
        const fteCostAud = convertUsdToAud(fteCostUsd, rate);
        result.fteEquivalentCost = { usd: fteCostUsd, aud: fteCostAud };
    }

    // --- Visualisation Data ---
    const visualisationData: ChartDataset[] = [];
    if (result.traditionalCost) {
        visualisationData.push({
            name: 'Traditional Cost',
            value: result.traditionalCost.aud, // Display AUD
            errorMargin: result.traditionalCost.aud * 0.1 // Default 10%
        });
    }
    if (result.agenticCost) {
        visualisationData.push({
            name: 'Agentic Cost',
            value: result.agenticCost.total.aud, // Display AUD
            errorMargin: result.agenticCost.total.aud * 0.1 // Default 10%
        });
    }
    if (result.humanGuidanceCost) {
        visualisationData.push({
            name: 'Human Guidance Cost',
            value: result.humanGuidanceCost.aud, // Display AUD
            errorMargin: result.humanGuidanceCost.aud * 0.1 // Default 10%
        });
    }
    if (result.projectAiSetupCost) {
        visualisationData.push({
            name: 'Project AI Setup Cost',
            value: result.projectAiSetupCost.aud, // Display AUD
            errorMargin: result.projectAiSetupCost.aud * 0.1 // Default 10%
        });
    }
    if (result.fteEquivalentCost) {
         visualisationData.push({
            name: 'Monthly FTE Cost', // Compare agentic cost to FTE cost
            value: result.fteEquivalentCost.aud, // Display AUD
            errorMargin: result.fteEquivalentCost.aud * 0.1 // Default 10%
        });
    }
     if (result.dailyCosts) {
         visualisationData.push({
            name: 'Monthly Ongoing Cost', // Estimate based on daily
            value: result.dailyCosts.total.aud * 30, // Display AUD
            errorMargin: result.dailyCosts.total.aud * 30 * 0.1 // Default 10%
        });
    }
    result.visualisationData = visualisationData;

    // --- Calculation Descriptions (Basic Examples) ---
    // TODO: Make these more detailed and context-aware
    const calculations: string[] = [];
    if (result.traditionalCost && projectParams) {
        calculations.push(`Traditional Cost: ${projectParams.manualDevHours} hrs * A$${projectParams.averageHourlyRate}/hr = A$${result.traditionalCost.aud.toLocaleString()}`);
    }
    if (result.agenticCost && projectParams) {
        calculations.push(`Agentic Inference Cost (Project): ${result.tokenUsage?.input.toLocaleString()} input tokens, ${result.tokenUsage?.output.toLocaleString()} output tokens => A$${result.agenticCost.inference.aud.toLocaleString()}`);
        calculations.push(`Agentic Human Cost (Project): ${result.agenticTime?.toFixed(1)} hrs * A$${projectParams.averageHourlyRate}/hr = A$${result.agenticCost.human.aud.toLocaleString()}`);
    }
    if (result.humanGuidanceCost && projectParams) {
        calculations.push(`Human Guidance Cost: ${result.humanGuidanceTime} hrs * A$${projectParams.averageHourlyRate}/hr = A$${result.humanGuidanceCost.aud.toLocaleString()}`);
    }
    if (result.aiProcessingTime !== undefined) {
        calculations.push(`AI Processing Time: ${result.aiProcessingTime} hrs (no cost impact)`);
    }
    if (result.projectAiSetupTime !== undefined && projectParams) {
        calculations.push(`Project AI Setup Cost: ${result.projectAiSetupTime} hrs * A$${projectParams.averageHourlyRate}/hr = A$${result.projectAiSetupCost?.aud.toLocaleString()}`);
    }
    if (result.totalProjectTime !== undefined) {
        calculations.push(`Total Project Time: ${result.totalProjectTime.toFixed(1)} hrs`);
    }
     if (result.dailyCosts) {
        calculations.push(`Daily Ongoing Cost: A$${result.dailyCosts.total.aud.toLocaleString()}`);
        if(result.dailyCosts.perDev) {
             calculations.push(`Daily Cost Per Dev: A$${result.dailyCosts.perDev.aud.toLocaleString()}`);
        }
        if (result.dailyCosts.breakdown?.team) {
            calculations.push(`Daily Team Cost: A$${result.dailyCosts.breakdown.team.total.aud.toLocaleString()}`);
        }
        if (result.dailyCosts.breakdown?.product) {
            calculations.push(`Daily Product Cost: A$${result.dailyCosts.breakdown.product.total.aud.toLocaleString()}`);
        }
    }
    result.calculations = calculations;

    return result;
};
