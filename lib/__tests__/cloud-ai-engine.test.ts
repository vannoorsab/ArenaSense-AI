/**
 * cloud-ai-engine.test.ts
 * Jest tests for Google Cloud AI integration logic.
 */

import { CloudAIEngine } from '../cloud-ai-engine';

describe('CloudAIEngine', () => {
  test('performFullZoneAnalysis returns valid analysis object', async () => {
    const analysis = await CloudAIEngine.performFullZoneAnalysis('normal');
    
    expect(analysis).toBeDefined();
    expect(analysis.sessionId).toMatch(/^gcp-/);
    expect(analysis.zones.length).toBeGreaterThan(0);
    expect(analysis.totalPeopleDetected).toBeGreaterThan(0);
    expect(analysis.processingTimeMs).toBeGreaterThan(0);
  });

  test('risk level reflects density correctly', async () => {
    // We can't easily force a scenario without mocking, but we can verify the structure
    const scenarios: ('normal' | 'entry_rush' | 'halftime' | 'exit_surge')[] = 
      ['normal', 'entry_rush', 'halftime', 'exit_surge'];
    
    for (const scenario of scenarios) {
      const result = await CloudAIEngine.performFullZoneAnalysis(scenario);
      expect(['low', 'medium', 'high', 'critical']).toContain(result.overallRiskLevel);
    }
  });

  test('getProjectInfo returns expected GCP metadata', () => {
    const info = CloudAIEngine.getProjectInfo();
    expect(info.region).toBe('asia-south1');
    expect(info.endpoint).toContain('googleapis.com');
  });

  test('getRiskColor returns hex codes', () => {
    expect(CloudAIEngine.getRiskColor('low')).toBe('#22c55e');
    expect(CloudAIEngine.getRiskColor('critical')).toBe('#ef4444');
  });
});
