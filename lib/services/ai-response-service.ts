/**
 * ai-response-service.ts
 * Logic for generating intelligent, context-aware responses from the AI Assistant.
 * Uses patterns similar to Google Gemini for helpful and conversational interactions.
 */

import { formatZoneName } from '../utils/zone-formatter';

export class AIResponseService {
  /**
   * Generates a response based on quick action buttons
   */
  static generateQuickActionResponse(action: string, currentZone: string, crowdDensity: number): string {
    const zoneLabel = formatZoneName(currentZone);
    
    switch (action) {
      case 'exit':
        return `The nearest exit from ${zoneLabel} is Gate North. It's about a 2-minute walk. Current flow is clear. I recommend heading there via the upper concourse.`;
      case 'avoid':
        return crowdDensity > 60
          ? `Your current area (${zoneLabel}) is becoming crowded. The East Concourse is 40% less dense right now. Take the stairs on your left for the quietest path.`
          : `Good news! ${zoneLabel} has moderate traffic. The West section is even quieter if you're looking for more space.`;
      case 'facility':
        return `Nearest restrooms are 1 minute away in the North Concourse. Current wait time is approx. 3 minutes. The South restrooms have no wait if you're heading that way.`;
      case 'food':
        return `Food court status: North Concourse (5 min wait), South Concourse (8 min wait). For fastest service, try the grab-and-go station near Gate East.`;
      default:
        return `How can I help you navigate the stadium? You're currently in ${zoneLabel}.`;
    }
  }

  /**
   * Generates a conversational response based on natural language input
   */
  static generateNaturalLanguageResponse(input: string, currentZone: string, crowdDensity: number): string {
    const lowerInput = input.toLowerCase();
    const zoneLabel = formatZoneName(currentZone);

    if (lowerInput.includes('bathroom') || lowerInput.includes('restroom') || lowerInput.includes('toilet')) {
      return `Nearest restrooms: North Concourse (1 min, ~3 min wait) or South Concourse (2 min, no wait). I recommend South for fastest service.`;
    }

    if (lowerInput.includes('food') || lowerInput.includes('hungry') || lowerInput.includes('drink') || lowerInput.includes('eat')) {
      return `Best option now: North Food Court has the shortest lines (5 min). For drinks only, the express stand at Gate East is clear.`;
    }

    if (lowerInput.includes('exit') || lowerInput.includes('leave') || lowerInput.includes('go home')) {
      return `Nearest exit from your location (${zoneLabel}): Gate North (2 min walk, clear). Alternative: Gate East (3 min, moderate traffic).`;
    }

    if (lowerInput.includes('crowd') || lowerInput.includes('busy') || lowerInput.includes('quiet') || lowerInput.includes('empty')) {
      return `Current density in ${zoneLabel}: ${crowdDensity.toFixed(0)}%. ${
        crowdDensity > 60 ? 'It is quite busy. The East Concourse is currently much quieter (~20% density).' : 'The area is comfortable. Enjoy the event!'
      }`;
    }

    if (lowerInput.includes('help') || lowerInput.includes('emergency') || lowerInput.includes('medical')) {
      return `For emergencies, medical staff are at the West Concourse Medical Center. Alert the nearest staff member or call stadium security immediately.`;
    }

    if (lowerInput.includes('shop') || lowerInput.includes('merchandise') || lowerInput.includes('buy')) {
      return `Official merchandise: East Concourse (shorter line) or the Main Team Store near Gate South.`;
    }

    return `I'm Gemini, your stadium assistant. I can help you find exits, food, restrooms, or navigate to quieter zones. You're currently in ${zoneLabel} (${crowdDensity.toFixed(0)}% density).`;
  }
}
