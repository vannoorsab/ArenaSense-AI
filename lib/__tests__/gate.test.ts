import { GateService } from '../services/gate-service';

describe('GateService', () => {
  test('✅ getUpdatedGates(): initializes all gates correctly from config', () => {
    const gates = GateService.getUpdatedGates(null);
    expect(gates).toBeDefined();
    expect(gates.length).toBeGreaterThan(4);
    expect(gates[0].id).toBeDefined();
    expect(gates[0].timestamp).toBeLessThanOrEqual(Date.now());
  });

  test('✅ getUpdatedGates(): handles scenario transitions (Exit Surge)', () => {
    const gates = GateService.getUpdatedGates(null, 'exit_surge');
    const exitGate = gates.find(g => g.id.includes('exit'));
    // exit-north should be trending towards 90%+ in exit_surge
    expect(exitGate!.density).toBeGreaterThan(30); 
  });

  test('✅ routing logic: generates intelligent suggestions for high density', () => {
    const mockGates = GateService.getUpdatedGates(null);
    // Setup a bottleneck: Entry North is at 95%
    const northEntry = mockGates.find(g => g.id === 'entry-north')!;
    northEntry.density = 95;
    northEntry.status = 'high';
    northEntry.trend = 'increasing';

    // Setup an alternative: Entry South is at 10%
    const southEntry = mockGates.find(g => g.id === 'entry-south')!;
    southEntry.density = 10;
    southEntry.status = 'low';
    southEntry.isOpen = true;

    const suggestions = GateService.generateSuggestions(mockGates);
    
    expect(suggestions.length).toBeGreaterThan(0);
    const topSuggestion = suggestions.find(s => s.fromGate === northEntry.name);
    expect(topSuggestion).toBeDefined();
    expect(topSuggestion?.urgency).toBe('critical');
    expect(topSuggestion?.toGate).toBe(southEntry.name);
  });

  test('🛡️ wait time model: scales wait time correctly with density', () => {
    // Access private method via any or rely on public results
    const gatesLow = GateService.getUpdatedGates(null);
    gatesLow[0].density = 10;
    const lowWait = GateService.getUpdatedGates(gatesLow)[0].waitTimeMinutes;
    
    const gatesHigh = GateService.getUpdatedGates(null);
    gatesHigh[0].density = 90;
    const highWait = GateService.getUpdatedGates(gatesHigh)[0].waitTimeMinutes;
    
    expect(highWait).toBeGreaterThan(lowWait);
    expect(highWait).toBeGreaterThan(15);
  });

  test('❌ getUpdatedGates(): fallback for invalid inputs', () => {
    const result = GateService.getUpdatedGates([] as any, 'invalid_scenario');
    expect(Array.isArray(result)).toBe(true);
  });
});
