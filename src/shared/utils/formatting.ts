export const formatTokens = (tokens: number): string => {
  return `${Math.round(tokens / 1000000)}M`;
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatTimeRounded = (hours: number): string => {
  const roundedHours = Math.round(hours);
  if (roundedHours < 8) {
    return `${roundedHours} Hours`;
  }
  const days = Math.round(hours / 8);
  return `${days} Days (${roundedHours} Hours)`;
};
