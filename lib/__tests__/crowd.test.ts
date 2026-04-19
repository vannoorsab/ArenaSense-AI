import { CrowdService } from '../services/crowd-service';

describe('CrowdService', () => {
  test('✅ initialize(): creates valid initial state with normal input', () => {
    const state = CrowdService.initialize(25000);
    expect(state).toBeDefined();
    expect(state.crowdData.size).toBeGreaterThan(0);
    expect(state.timestamp).toBeLessThanOrEqual(Date.now());
    expect(state.scenarioType).toBe('normal');
  });

  test('✅ initialize(): handles zero attendees gracefully', () => {
    const state = CrowdService.initialize(0);
    expect(state.crowdData.size).toBeGreaterThan(0);
    state.crowdData.forEach(zone => {
      expect(zone.currentCount).toBe(0);
      expect(zone.density).toBe(0);
    });
  });

  test('✅ initialize(): fallback for negative input', () => {
    const state = CrowdService.initialize(-100);
    // Should fallback to default 45000
    const total = Array.from(state.crowdData.values()).reduce((sum, z) => sum + z.currentCount, 0);
    expect(total).toBeGreaterThan(40000);
  });

  test('✅ processStep(): updates densities realistically over time', () => {
    const initialState = CrowdService.initialize(30000);
    const zoneId = 'entrance-main';
    const initialDensity = initialState.crowdData.get(zoneId)!.density;
    
    // Simulate entry rush
    const nextState = CrowdService.processStep(initialState, 'entry_rush');
    const nextDensity = nextState.crowdData.get(zoneId)!.density;
    
    expect(nextState.timestamp).toBeGreaterThanOrEqual(initialState.timestamp);
    // Entry rush should significantly increase entrance density
    expect(nextDensity).toBeGreaterThan(initialDensity);
  });

  test('✅ generatePredictions(): identifies high density zones correctly', () => {
    const state = CrowdService.initialize(90000); // Forced high density
    const predictions = CrowdService.generatePredictions(state.crowdData, 'normal');
    
    expect(Array.isArray(predictions)).toBe(true);
    expect(predictions.length).toBeGreaterThan(0);
    expect(predictions[0].predictedDensity).toBeLessThanOrEqual(100);
    expect(predictions[0].confidence).toBeGreaterThan(75);
  });

  test('❌ processStep(): fallback prevents crash on null state', () => {
    // We updated the service to catch errors and return previous state or throw
    // Our new implementation of processStep has a try/catch
    const result = CrowdService.processStep(null as any);
    expect(result).toBeNull(); // Should return what was passed if it fails, or handle it
  });
});
