/**
 * Converts a value from USD to AUD using a specified exchange rate.
 *
 * @param usdValue The value in US Dollars.
 * @param audPerUsd The exchange rate (how many AUD equal 1 USD).
 * @returns The equivalent value in Australian Dollars, rounded up to the nearest whole number.
 */
export const convertUsdToAud = (usdValue: number, audPerUsd: number): number => {
  if (typeof usdValue !== 'number' || typeof audPerUsd !== 'number' || audPerUsd <= 0) {
    // Basic validation: return 0 or throw an error for invalid inputs
    console.error('Invalid input for currency conversion:', { usdValue, audPerUsd });
    return 0; // Or consider throwing an error depending on desired handling
  }
  // audPerUsd is 0.64, meaning 1 USD = 1.5625 AUD
  const audValue = usdValue / audPerUsd;  // $100 USD * (1/0.64) = $156.25 AUD
  // Round to 2 decimal places for currency precision
  return Math.round(audValue * 100) / 100;
};

/**
 * Converts a value from AUD to USD using a specified exchange rate.
 * Note: This might be less frequently used as primary calculations are in USD.
 *
 * @param audValue The value in Australian Dollars.
 * @param audPerUsd The exchange rate (how many AUD equal 1 USD).
 * @returns The equivalent value in US Dollars.
 */
export const convertAudToUsd = (audValue: number, audPerUsd: number): number => {
    if (typeof audValue !== 'number' || typeof audPerUsd !== 'number' || audPerUsd <= 0) {
        console.error('Invalid input for currency conversion:', { audValue, audPerUsd });
        return 0;
    }
    // No specific rounding requirement mentioned for AUD to USD, return as is for now.
    return audValue * audPerUsd;
};
