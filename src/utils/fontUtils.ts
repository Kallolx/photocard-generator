/**
 * Detects if the text contains mainly Bengali characters.
 * @param text The text to check.
 * @returns True if Bengali characters are detected, false otherwise.
 */
export const isBengali = (text: string): boolean => {
  if (!text) return false;
  // Bengali Unicode range: \u0980-\u09FF
  return /[\u0980-\u09FF]/.test(text);
};

/**
 * Returns the appropriate font class name based on the text language.
 * Uses 'font-noto-bengali' for Bengali and 'font-dm-sans' for English/other.
 * @param text The text content.
 * @returns The Tailwind CSS font class name.
 */
export const getFontClassName = (text: string): string => {
  return isBengali(text) ? "font-noto-bengali" : "font-dm-sans";
};
