/**
 * input-validator.ts
 * Security utility for sanitizing and validating user inputs.
 * Prevents XSS and ensures data integrity.
 */

export class InputValidator {
  /**
   * Sanitizes a string input to remove potentially dangerous HTML/scripts
   */
  static sanitizeString(input: string): string {
    if (!input) return '';
    // Basic sanitization: remove tags
    return input.replace(/<[^>]*>?/gm, '').trim();
  }

  /**
   * Validates if a zone ID exists in the system
   */
  static isValidZoneId(zoneId: string, validZones: string[]): boolean {
    return validZones.includes(zoneId);
  }

  /**
   * Validates numeric inputs to be within expected ranges
   */
  static validateRange(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
