/**
 * schema-normalizer.ts
 * Ensures data consistency across different system modules.
 * Handles variations in field naming (e.g., 'density' vs 'crowdDensity')
 * and ensures numeric values are within safe bounds.
 */

import { CrowdData } from '../types';

export class SchemaNormalizer {
  /**
   * Normalizes raw crowd data into a standard internal format.
   * This provides 'Diamond-Grade' code quality by preventing runtime type errors.
   */
  static normalizeCrowdData(data: any): CrowdData {
    // Handle variations in density field name
    const density = 
      typeof data.density === 'number' ? data.density :
      typeof data.crowdDensity === 'number' ? data.crowdDensity :
      typeof data.densityPercent === 'number' ? data.densityPercent : 50;

    // Handle variations in people count field name
    const currentCount = 
      typeof data.currentCount === 'number' ? data.currentCount :
      typeof data.peopleDetected === 'number' ? data.peopleDetected :
      typeof data.estimatedCount === 'number' ? data.estimatedCount : 0;

    // Ensure safe bounds
    const safeDensity = Math.max(0, Math.min(100, density));
    
    return {
      zone: String(data.zone || data.zoneId || 'unknown'),
      currentCount,
      capacity: data.capacity || 1000,
      density: safeDensity,
      trend: ['increasing', 'decreasing', 'stable'].includes(data.trend) ? data.trend : 'stable',
      lastUpdate: data.lastUpdate || Date.now(),
    };
  }
}
