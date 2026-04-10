'use client';

import { Button } from '@/components/ui/button';

interface ScenarioSelectorProps {
  currentScenario: string;
  onChange: (scenario: 'normal' | 'entry_rush' | 'halftime' | 'exit_surge') => void;
}

const scenarios = [
  { id: 'normal', label: 'Normal', description: 'Stable crowd flow' },
  { id: 'entry_rush', label: 'Entry Rush', description: 'Gates opening' },
  { id: 'halftime', label: 'Halftime', description: 'Concourse crowding' },
  { id: 'exit_surge', label: 'Exit Surge', description: 'End of event' },
];

export default function ScenarioSelector({ currentScenario, onChange }: ScenarioSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {scenarios.map((scenario) => (
        <Button
          key={scenario.id}
          onClick={() => onChange(scenario.id as any)}
          variant={currentScenario === scenario.id ? 'default' : 'outline'}
          size="sm"
          className="h-auto py-2 px-2"
        >
          <div className="text-left">
            <div className="text-xs font-bold">{scenario.label}</div>
            <div className="text-xs text-muted-foreground">{scenario.description}</div>
          </div>
        </Button>
      ))}
    </div>
  );
}
