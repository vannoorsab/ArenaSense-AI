import { GateService } from '../lib/services/gate-service';

/**
 * 🧪 Gate Management Validation
 * Testing wait times and AI routing logic.
 */

function assert(name: string, condition: boolean) {
  console.log(condition ? `[PASS] ${name}` : `[FAIL] ${name}`);
  if (!condition) throw new Error(`Test failed: ${name}`);
}

export function runGateTests() {
  console.log('\n--- Running Gate Service Tests ---');

  try {
    console.log('\n[Execution Block: GateService.getUpdatedGates()]');
    // 1. Initial State
    const gates = GateService.getUpdatedGates(null, 'normal');
    assert('gates initialized', gates.length > 0);
    assert('all gates open initially', gates.every(g => g.isOpen));

    // 3. Fallback: Closed Gates
    const closedGates = gates.map(g => ({ ...g, isOpen: false }));
    const updatedClosed = GateService.getUpdatedGates(closedGates, 'normal');
    assert('closed gates stay closed', updatedClosed.every(g => g.status === 'closed'));

    // 4. Invalid Input
    const invalid = GateService.getUpdatedGates([] as any, 'invalid_scenario');
    assert('invalid scenario fallback', invalid.length > 0);

    console.log('\n[Execution Block: GateService.generateSuggestions()]');
    // 2. High Congestion Routing
    const crowdedGates = gates.map(g => ({ ...g, density: 90 }));
    const suggestions = GateService.generateSuggestions(crowdedGates);
    assert('suggestions generated for congestion', suggestions.length > 0);

    console.log('--- Gate Tests Complete ---\n');
  } catch (error) {
    console.error('Gate tests failed critically:', error);
  }
}

if (require.main === module) {
  runGateTests();
}
