'use client';

import { AIRecommendation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Zap, MapPin, Clock, Users, ChevronRight, Sparkles } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: AIRecommendation;
}

const urgencyStyles = {
  low: {
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-700',
  },
  medium: {
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
  },
  high: {
    bg: 'bg-orange-50 border-orange-200',
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-700',
  },
  critical: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
  },
};

const typeConfig = {
  navigation: { icon: MapPin, label: 'Smart Route' },
  queue: { icon: Clock, label: 'Queue Tip' },
  safety: { icon: AlertTriangle, label: 'Safety Alert' },
  facility: { icon: Users, label: 'Facility' },
};

export default function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { icon: TypeIcon, label: typeLabel } = typeConfig[recommendation.type];
  const styles = urgencyStyles[recommendation.urgency];

  return (
    <Card 
      className={`${styles.bg} border overflow-hidden`}
      role={recommendation.urgency === 'critical' ? 'alert' : 'status'}
      aria-live="polite"
    >
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${styles.badge}`} aria-hidden="true">
              <TypeIcon className="w-4 h-4" />
            </div>
            <div>
              <p className={`text-[10px] font-medium ${styles.text}`}>{typeLabel}</p>
              <CardTitle className="text-sm leading-tight" aria-label={`Recommendation: ${recommendation.title}`}>
                {recommendation.title}
              </CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold bg-white/70 px-2 py-1 rounded-full">
            <Sparkles className="w-3 h-3 text-primary" />
            {recommendation.confidence}%
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3 space-y-3">
        <p className="text-xs text-foreground/80 leading-relaxed">{recommendation.description}</p>

        {/* Quick Stats */}
        {recommendation.context && (
          <div className="flex items-center gap-3 text-[10px]">
            {recommendation.context.estimated_wait && (
              <span className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded">
                <Clock className="w-3 h-3" />
                {recommendation.context.estimated_wait} min wait
              </span>
            )}
            {recommendation.context.current_density && (
              <span className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded">
                <Users className="w-3 h-3" />
                {recommendation.context.current_density}% density
              </span>
            )}
          </div>
        )}

        <Button 
          size="sm" 
          className="w-full h-8 text-xs gap-1 focus-visible:ring-2 focus-visible:ring-offset-2 ring-primary"
          variant={recommendation.urgency === 'critical' ? 'destructive' : 'default'}
          aria-label={`${recommendation.type === 'navigation' ? 'Navigate' : 'Action'} for ${recommendation.title}`}
        >
          {recommendation.type === 'navigation' ? 'Navigate' :
           recommendation.type === 'safety' ? 'Evacuate Now' :
           recommendation.type === 'queue' ? 'Go Now' : 'View'}
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
