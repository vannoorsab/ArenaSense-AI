import { AlertService } from '../lib/services/alert-service';

/**
 * 🧪 Alert Logic Validation
 * Ensures broadcast logic and AI thresholds work correctly.
 */

function assert(name: string, condition: boolean) {
  console.log(condition ? `[PASS] ${name}` : `[FAIL] ${name}`);
  if (!condition) throw new Error(`Test failed: ${name}`);
}

export function runAlertTests() {
  console.log('\n--- Running Alert Service Tests ---');

  try {
    console.log('\n[Execution Block: AlertService.broadcast()]');
    // 1. Valid Case: Broadcast Alert
    const msg = AlertService.broadcast('Test valid broadcast', 'info');
    assert('valid broadcast created', !!msg && msg.message === 'Test valid broadcast');

    const active = AlertService.getActiveAlerts();
    assert('active alerts contains broadcast', active.some(a => a.id === msg.id));

    // 3. Invalid Input
    const invalidBroadcast = AlertService.broadcast('' as any, 'warning');
    assert('invalid broadcast handled', invalidBroadcast.id === 'error-placeholder');

    console.log('\n[Execution Block: AlertService.triggerAiAlert()]');
    // 2. Edge Case: AI Thresholds
    const criticalAI = AlertService.triggerAiAlert('TestZone', 90);
    assert('critical ai alert triggered', !!criticalAI && criticalAI.type === 'danger');

    const warningAI = AlertService.triggerAiAlert('TestZone', 75);
    assert('warning ai alert triggered', !!warningAI && warningAI.type === 'warning');

    const noAlertAI = AlertService.triggerAiAlert('TestZone', 50);
    assert('safe density does not trigger', noAlertAI === null);

    console.log('--- Alert Tests Complete ---\n');
  } catch (error) {
    console.error('Alert tests failed critically:', error);
  }
}

if (require.main === module) {
  runAlertTests();
}
