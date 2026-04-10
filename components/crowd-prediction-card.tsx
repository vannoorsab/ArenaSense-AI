'use client';
/**
 * crowd-prediction-card.tsx
 * Displays AI-powered crowd predictions with trend visualization.
 */

import { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, Minus, AlertCircle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calcFlowPrediction } from '@/lib/utils/crowd-math';

interface CrowdPredictionCardProps {
  sectionName: string;
  currentCount: number;
  capacity: number;
  matchPhase?: 'pre-match' | 'live' | 'post-match';
}

export default function CrowdPredictionCard({
  sectionName,
  currentCount,
  capacity,
  matchPhase = 'live',
}: CrowdPredictionCardProps) {
  const [animValue, setAnimValue] = useState(0);
  const prediction = calcFlowPrediction(currentCount, capacity, matchPhase);
  
  const predicted10 = Math.min(capacity, Math.max(0, currentCount + prediction.netChange * 10));
  const predicted30 = Math.min(capacity, Math.max(0, currentCount + prediction.netChange * 30 * 0.7));

  useEffect(() => {
    const timer = setTimeout(() => setAnimValue(currentCount), 300);
    return () => clearTimeout(timer);
  }, [currentCount]);

  const trend = prediction.netChange > 50 ? 'up' : prediction.netChange < -50 ? 'down' : 'stable';

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-red-500' : trend === 'down' ? 'text-green-500' : 'text-yellow-500';
  const trendLabel = trend === 'up' ? 'Increasing' : trend === 'down' ? 'Decreasing' : 'Stable';

  // Mini sparkline data points
  const sparkPoints = [
    currentCount * 0.85,
    currentCount * 0.9,
    currentCount * 0.95,
    currentCount,
    predicted10,
    (predicted10 + predicted30) / 2,
    predicted30,
  ];
  const sparkMax = Math.max(...sparkPoints, 1);
  const sparkMin = Math.min(...sparkPoints, 0);
  const sparkRange = sparkMax - sparkMin || 1;

  const svgPoints = sparkPoints.map((v, i) => {
    const x = (i / (sparkPoints.length - 1)) * 140;
    const y = 30 - ((v - sparkMin) / sparkRange) * 25;
    return `${x},${y}`;
  }).join(' ');

  const isCritical = predicted10 > capacity * 0.92;

  return (
    <Card className={`relative overflow-hidden ${isCritical ? 'border-red-500/50' : ''}`} role="region" aria-label={`Crowd prediction for ${sectionName}`}>
      {isCritical && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" aria-hidden="true" />
      )}
      <CardHeader className="pb-1 pt-3 px-3">
        <CardTitle className="text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-purple-500" aria-hidden="true" />
            <span>{sectionName}</span>
          </div>
          <div className="flex items-center gap-1">
            {isCritical && (
              <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" aria-label="Critical crowd level predicted" />
            )}
            <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} aria-label={`Trend: ${trendLabel}`} />
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-3 pb-3 space-y-2">
        {/* Sparkline */}
        <div aria-label={`Crowd trend sparkline showing ${trendLabel} trend`}>
          <svg
            viewBox="0 0 140 32"
            className="w-full h-8"
            aria-hidden="true"
          >
            {/* Predicted area shading */}
            <rect x="80" y="0" width="60" height="32" fill="currentColor" className="text-blue-500/5" />
            <text x="81" y="8" fontSize="5" fill="currentColor" className="text-muted-foreground">Predicted</text>
            
            {/* Sparkline */}
            <polyline
              points={svgPoints}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={trend === 'up' ? 'text-red-500' : trend === 'down' ? 'text-green-500' : 'text-yellow-500'}
            />
            {/* Current dot */}
            <circle cx={`${(3 / 6) * 140}`} cy={30 - ((currentCount - sparkMin) / sparkRange) * 25} r="2" className="text-blue-500 fill-current" />
          </svg>
        </div>

        {/* Numbers */}
        <div className="grid grid-cols-3 gap-1 text-center">
          <div>
            <p className="text-[10px] text-muted-foreground">Now</p>
            <p className="text-sm font-bold" aria-label={`Current count: ${currentCount.toLocaleString()}`}>
              {currentCount.toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">In 10 min</p>
            <p className={`text-sm font-bold ${predicted10 > capacity * 0.85 ? 'text-red-500' : ''}`}
               aria-label={`Predicted in 10 minutes: ${Math.round(predicted10).toLocaleString()}`}>
              {Math.round(predicted10).toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">In 30 min</p>
            <p className="text-sm font-bold text-muted-foreground"
               aria-label={`Predicted in 30 minutes: ${Math.round(predicted30).toLocaleString()}`}>
              {Math.round(predicted30).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Confidence & status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            <span>AI confidence: <strong>{prediction.confidencePercent}%</strong></span>
          </div>
          <Badge
            className={`text-[9px] h-4 ${
              isCritical ? 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30' :
              trend === 'up' ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' :
              'bg-green-500/20 text-green-600 dark:text-green-400'
            }`}
            aria-label={`Trend status: ${trendLabel}`}
          >
            {isCritical ? 'Near Capacity' : trendLabel}
          </Badge>
        </div>

        {/* Critical warning */}
        {isCritical && (
          <p className="text-[10px] text-red-600 dark:text-red-400 bg-red-500/10 rounded px-2 py-1 border border-red-500/20" role="alert">
            ⚠️ Crowd surge expected in ~{prediction.peakMinutesFromNow} min. Apply gate redirect.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
