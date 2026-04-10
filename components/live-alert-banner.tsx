'use client';

import { useState, useEffect, useCallback } from 'react';
import { BroadcastAlert } from '@/lib/types';
import { AlertSync } from '@/lib/alert-sync';
import { X, AlertTriangle, Info, Zap, ShieldAlert, Navigation } from 'lucide-react';

const TYPE_CONFIG: Record<BroadcastAlert['type'], {
  bg: string; border: string; icon: any; label: string;
}> = {
  info:      { bg: 'bg-blue-600',   border: 'border-blue-400',  icon: Info,         label: 'INFO' },
  warning:   { bg: 'bg-amber-500',  border: 'border-amber-400', icon: AlertTriangle, label: 'ALERT' },
  danger:    { bg: 'bg-red-600',    border: 'border-red-400',   icon: Zap,          label: 'CROWD ALERT' },
  emergency: { bg: 'bg-red-700',    border: 'border-red-300',   icon: ShieldAlert,  label: '🚨 EMERGENCY' },
};

interface LiveAlertBannerProps {
  className?: string;
}

export default function LiveAlertBanner({ className = '' }: LiveAlertBannerProps) {
  const [alerts, setAlerts] = useState<BroadcastAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const refresh = useCallback(() => {
    const live = AlertSync.retrieveActiveAlerts();
    setAlerts(live);
  }, []);

  useEffect(() => {
    refresh();
    const unsub = AlertSync.subscribe(setAlerts);
    // Periodic refresh to handle expiry
    const tick = setInterval(refresh, 3000);
    return () => { unsub(); clearInterval(tick); };
  }, [refresh]);

  const visible = alerts.filter(a => !dismissed.has(a.id));

  if (visible.length === 0) return null;

  const latest = visible[0];
  const cfg = TYPE_CONFIG[latest.type] || TYPE_CONFIG.info;
  const Icon = cfg.icon as any;

  const dismiss = (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
    AlertSync.dismissAlert(id);
  };

  return (
    <div className={`w-full z-50 ${className}`} role="alert">
      <div className={`${cfg.bg} text-white px-4 py-3 relative`}>
        <div className="max-w-7xl mx-auto">
          {/* Main alert */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black tracking-widest opacity-80">
                  {cfg.label}
                </span>
                <span className="text-[10px] opacity-60">
                  {new Date(latest.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm font-semibold leading-snug">{latest.message}</p>

              {latest.suggestion && (
                <p className="text-xs mt-1 opacity-90 flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  {latest.suggestion}
                </p>
              )}
            </div>

            <button
              onClick={() => dismiss(latest.id)}
              className="flex-shrink-0 p-1 rounded-md hover:bg-white/20 transition-colors"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* More alerts indicator */}
          {visible.length > 1 && (
            <div className="mt-2 flex gap-1 ml-8 flex-wrap">
              {visible.slice(1).map(a => {
                const c = TYPE_CONFIG[a.type];
                return (
                  <button
                    key={a.id}
                    onClick={() => dismiss(a.id)}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center gap-1"
                  >
                    <c.icon className="w-2.5 h-2.5" />
                    {a.message.slice(0, 40)}…
                    <X className="w-2.5 h-2.5 opacity-60" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Animated pulse bar for emergency */}
        {latest.type === 'emergency' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 overflow-hidden">
            <div className="h-full bg-white/70 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
