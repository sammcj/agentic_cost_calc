import { formatNumber } from '../../../client/components/inputs/NumericInput';

describe('Token Display', () => {
  it('should format token values correctly', () => {
    // Test the formatNumber function with different values
    expect(formatNumber(5000000, 1)).toBe('5,000,000.0');
    expect(formatNumber(5000000 / 1000, 1)).toBe('5,000.0');
    expect(formatNumber(5000000 / 1000000, 1)).toBe('5.0');
  });

  it('should verify token display conversion', () => {
    // Original code (K)
    const originalTokens = 5000000;
    const originalDisplay = formatNumber(originalTokens / 1000, 1) + 'k';
    expect(originalDisplay).toBe('5,000.0k');

    // New code (M)
    const newDisplay = formatNumber(originalTokens / 1000000, 1) + 'M';
    expect(newDisplay).toBe('5.0M');

    // Verify that the original token value is still the same
    const displayedValue = 5.0; // What the user sees in the UI
    const storedValueK = displayedValue * 1000; // If we were storing in K
    const storedValueM = displayedValue * 1000000; // If we're storing in M

    expect(storedValueK).toBe(5000); // Not equal to original
    expect(storedValueM).toBe(5000000); // Equal to original
  });
});
