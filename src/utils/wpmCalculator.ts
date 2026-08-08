export interface TypingStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  cpm: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  totalKeystrokes: number;
}

/**
 * Calculates Net WPM (Words Per Minute).
 * Formula: (Correct Characters / 5) / (Time in Minutes)
 */
export function calculateWpm(correctChars: number, timeInSeconds: number): number {
  if (timeInSeconds <= 0 || correctChars <= 0) return 0;
  const minutes = timeInSeconds / 60;
  const netWpm = correctChars / 5 / minutes;
  return Math.max(0, Math.round(netWpm));
}

/**
 * Calculates Raw WPM (Includes incorrect and extra typed characters).
 * Formula: (Total Typed Characters / 5) / (Time in Minutes)
 */
export function calculateRawWpm(totalTypedChars: number, timeInSeconds: number): number {
  if (timeInSeconds <= 0 || totalTypedChars <= 0) return 0;
  const minutes = timeInSeconds / 60;
  const rawWpm = totalTypedChars / 5 / minutes;
  return Math.max(0, Math.round(rawWpm));
}

/**
 * Calculates Typing Accuracy Percentage.
 * Formula: (Correct Keystrokes / Total Keystrokes) * 100
 */
export function calculateAccuracy(correctKeystrokes: number, totalKeystrokes: number): number {
  if (totalKeystrokes <= 0) return 100;
  const accuracy = (correctKeystrokes / totalKeystrokes) * 100;
  // Clamp between 0 and 100 with 1 decimal precision
  return Math.min(100, Math.max(0, Number(accuracy.toFixed(1))));
}

/**
 * Calculates CPM (Characters Per Minute).
 * Formula: Correct Characters / (Time in Minutes)
 */
export function calculateCpm(correctChars: number, timeInSeconds: number): number {
  if (timeInSeconds <= 0 || correctChars <= 0) return 0;
  const minutes = timeInSeconds / 60;
  return Math.max(0, Math.round(correctChars / minutes));
}
