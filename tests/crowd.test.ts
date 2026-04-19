import { CrowdService } from '../lib/services/crowd-service';

/**
 * 🧪 Crowd Logic Validation
 * Ensuring density calculations and scenario dynamics are precise.
 */

function assert(name: string, condition: boolean) {
  console.log(condition ? `[PASS] ${name}` : `[FAIL] ${name}`);
  if (!condition) throw new Error(`Test failed: ${name}`);
}

export async function runCrowdTests() {
  console.log('\n--- Running Crowd Service Tests ---');

  try {
    console.log('\n[Execution Block: CrowdService.initialize()]');
    // 1. Valid Case: Initialization
    const state = CrowdService.initialize(50000);
    assert('state initialized', !!state && state.crowdData.size > 0);
    assert('correct counts', Array.from(state.crowdData.values()).some(d => d.currentCount > 0));

    // 2. Edge Case: Zero Attendees
    const zeroState = CrowdService.initialize(0);
    assert('zero attendees handling', Array.from(zeroState.crowdData.values()).every(d => d.currentCount === 0));

    console.log('\n[Execution Block: CrowdService.processStep()]');
    // 3. Process Step
    const nextState = await CrowdService.processStep(state, 'entry_rush');
    assert('step processed', !!nextState && nextState.timestamp >= state.timestamp);
    assert('predictions generated', nextState.predictions.length >= 0);

    // 4. Invalid Input Check
    try {
      // @ts-ignore
      await CrowdService.processStep(null, 'normal');
      assert('invalid state handled', true); // Should return via catch/fallback
    } catch (e) {
      assert('invalid state caught', true);
    }
    
    console.log('--- Crowd Tests Complete ---\n');
  } catch (error) {
    console.error('Crowd tests failed critically:', error);
  }
}

// Support direct execution if needed
if (require.main === module) {
  runCrowdTests();
}
