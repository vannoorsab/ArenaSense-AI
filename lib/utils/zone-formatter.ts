/**
 * zone-formatter.ts
 * Utility for consistently formatting zone IDs for display.
 */

export function formatZoneName(zoneId: string): string {
  if (!zoneId || typeof zoneId !== 'string') return 'Unknown Zone';
  
  return zoneId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
