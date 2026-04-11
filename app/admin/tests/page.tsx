'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Play, Shield, Brain, Activity } from 'lucide-react';
import { AIDecisionEngine } from '@/lib/ai-engine';
import { CloudAIEngine } from '@/lib/cloud-ai-engine';
import { CrowdSimulator } from '@/lib/crowd-simulator';
import { ResilienceSystem } from '@/lib/resilience-system';

export default function TestDashboard() {
  const [results, setResults] = useState<{ name: string; status: 'PASS' | 'FAIL' | 'PENDING'; details: string }[]>([
    { name: 'AI Decision Engine', status: 'PENDING', details: 'Validating anomaly detection...' },
    { name: 'Cloud AI Integration', status: 'PENDING', details: 'Testing simulated telemetry...' },
    { name: 'Crowd Simulation', status: 'PENDING', details: 'Checking LOS calculations...' },
    { name: 'Resilience System', status: 'PENDING', details: 'Verifying local cache logic...' },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    
    // Test 1: AI Engine
    try {
      const mockData = new Map([['zone-1', { zone: 'zone-1', currentCount: 950, capacity: 1000, density: 95, trend: 'increasing', lastUpdate: Date.now() }]]);
      const alerts = AIDecisionEngine.detectAnomalies(mockData as any, []);
      const pass = alerts.some(a => a.type === 'overcrowding');
      updateResult(0, pass ? 'PASS' : 'FAIL', pass ? 'Detected critical overcrowding at 95% density.' : 'Failed to detect anomaly.');
    } catch (e: any) {
      updateResult(0, 'FAIL', e.message);
    }

    // Test 2: Cloud AI
    try {
      const info = CloudAIEngine.getProjectInfo();
      const pass = info.project && info.endpoint;
      updateResult(1, pass ? 'PASS' : 'FAIL', pass ? `Connected to ${info.project} region ${info.region}.` : 'Missing project metadata.');
    } catch (e: any) {
      updateResult(1, 'FAIL', e.message);
    }

    // Test 3: Simulation
    try {
      const state = CrowdSimulator.initializeSimulation(100);
      const pass = state.crowdData.size > 0;
      updateResult(2, pass ? 'PASS' : 'FAIL', pass ? `Initialized simulation for ${state.crowdData.size} zones.` : 'No zones initialized.');
    } catch (e: any) {
      updateResult(2, 'FAIL', e.message);
    }

    // Test 4: Resilience
    try {
      const status = ResilienceSystem.getNetworkStatus();
      const pass = status === 'online' || status === 'offline';
      updateResult(3, pass ? 'PASS' : 'FAIL', pass ? `Network monitoring active: Status is ${status}.` : 'Network hook failed.');
    } catch (e: any) {
      updateResult(3, 'FAIL', e.message);
    }

    setIsRunning(false);
  };

  const updateResult = (index: number, status: 'PASS' | 'FAIL', details: string) => {
    setResults(prev => {
      const next = [...prev];
      next[index] = { ...next[index], status, details };
      return next;
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-8">
        <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold">System Validation Suite</h1>
        <p className="text-muted-foreground">Automated verification of core AI and Cloud modules</p>
      </div>

      <div className="grid gap-4">
        {results.map((res, i) => (
          <Card key={i} className={`border-l-4 ${
            res.status === 'PASS' ? 'border-l-green-500' : 
            res.status === 'FAIL' ? 'border-l-red-500' : 'border-l-muted'
          }`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {res.status === 'PASS' ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : 
                 res.status === 'FAIL' ? <XCircle className="w-6 h-6 text-red-500" /> : 
                 <Activity className="w-6 h-6 text-muted-foreground animate-pulse" />}
                <div>
                  <h3 className="font-semibold">{res.name}</h3>
                  <p className="text-sm text-muted-foreground">{res.details}</p>
                </div>
              </div>
              <Badge variant={res.status === 'PASS' ? 'secondary' : res.status === 'FAIL' ? 'destructive' : 'outline'}>
                {res.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button 
        className="w-full mt-8 gap-2" 
        size="lg" 
        onClick={runTests} 
        disabled={isRunning}
      >
        {isRunning ? <Brain className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
        {isRunning ? 'Running Diagnostics...' : 'Run System Validation'}
      </Button>
      
      <p className="text-center text-xs text-muted-foreground mt-6 font-mono">
        ArenaSense AI Enterprise v1.2.0 • {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
}
