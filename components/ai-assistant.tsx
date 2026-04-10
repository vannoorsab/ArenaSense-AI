'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Send, Volume2, Loader, Navigation, ShieldAlert, MapPin, Utensils, DoorOpen } from 'lucide-react';
import { ResilienceSystem } from '@/lib/resilience-system';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AIAssistantProps {
  currentZone: string;
  crowdDensity: number;
  onNavigate?: (zone: string) => void;
  onQuickAction?: (action: string) => void;
}

const QUICK_ACTIONS = [
  { id: 'exit', label: 'Find Exit', icon: DoorOpen, color: 'text-green-600' },
  { id: 'avoid', label: 'Avoid Crowd', icon: Navigation, color: 'text-primary' },
  { id: 'facility', label: 'Nearest Facility', icon: MapPin, color: 'text-secondary' },
  { id: 'food', label: 'Food & Drinks', icon: Utensils, color: 'text-accent' },
];

export default function AIAssistant({
  currentZone,
  crowdDensity,
  onNavigate,
  onQuickAction,
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.onstart = () => setIsListening(true);
        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setInput(transcript);
        };
      }
    }

    const cleanup = ResilienceSystem.setupNetworkListener((status) => {
      setNetworkStatus(status);
    });

    return cleanup;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      addAssistantMessage(
        `Welcome! I'm your stadium assistant. You're in ${formatZoneName(currentZone)} (${crowdDensity.toFixed(0)}% density). Use the quick actions below or ask me anything!`
      );
    }
  }, []);

  const addAssistantMessage = (content: string) => {
    const message: Message = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const handleQuickAction = (actionId: string) => {
    const actionMessages: Record<string, string> = {
      exit: 'Find the nearest exit',
      avoid: 'Help me avoid crowded areas',
      facility: 'Where is the nearest restroom?',
      food: 'Where can I get food?',
    };

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: actionMessages[actionId] || 'Help',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    onQuickAction?.(actionId);

    setIsProcessing(true);
    setTimeout(() => {
      const response = generateQuickActionResponse(actionId, currentZone, crowdDensity);
      addAssistantMessage(response);
      setIsProcessing(false);
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const userInput = input;
    setInput('');
    setIsProcessing(true);

    setTimeout(() => {
      const response = generateAIResponse(userInput, currentZone, crowdDensity);
      addAssistantMessage(response);
      setIsProcessing(false);
    }, 600);
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      addAssistantMessage('Voice input is not available in your browser. Please type your question instead.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined') return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="border-b border-border pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">AI Assistant</CardTitle>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            networkStatus === 'online'
              ? 'bg-green-100 text-green-700'
              : 'bg-orange-100 text-orange-700'
          }`}>
            {networkStatus === 'online' ? 'Online' : 'Offline'}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col p-3 space-y-3">
        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action.id)}
              disabled={isProcessing}
              className="h-9 text-xs justify-start gap-2"
            >
              <action.icon className={`w-3.5 h-3.5 ${action.color}`} />
              {action.label}
            </Button>
          ))}
        </div>

        {/* Messages */}
        <div className="h-[180px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-lg text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p>{msg.content}</p>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleSpeak(msg.content)}
                    className="mt-1 opacity-60 hover:opacity-100 flex items-center gap-1 text-[10px]"
                  >
                    <Volume2 className="w-3 h-3" /> Listen
                  </button>
                )}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-muted px-3 py-2 rounded-lg">
                <Loader className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? 'Listening...' : 'Ask anything...'}
            className="flex-1 px-3 py-2 border border-border rounded-lg bg-card text-xs"
            disabled={isProcessing || isListening}
          />
          <Button
            type="button"
            onClick={handleVoiceInput}
            variant="outline"
            size="sm"
            disabled={isProcessing}
            className="px-2"
          >
            <Mic className={`w-4 h-4 ${isListening ? 'text-destructive animate-pulse' : ''}`} />
          </Button>
          <Button type="submit" size="sm" disabled={isProcessing || !input.trim()} className="px-2">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function formatZoneName(zone: string): string {
  return zone
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function generateQuickActionResponse(action: string, currentZone: string, crowdDensity: number): string {
  switch (action) {
    case 'exit':
      return 'The nearest exit is Gate North, about 2 minutes walk. It\'s currently clear with no congestion. I recommend heading there via the upper concourse.';
    case 'avoid':
      return crowdDensity > 60
        ? 'Your area is quite busy. Move to the East Concourse - it\'s 40% less crowded right now. Take the stairs on your left.'
        : 'Good news! Your current area has moderate traffic. The West section is even quieter if you need more space.';
    case 'facility':
      return 'Nearest restrooms are 1 minute away in the North Concourse. Current wait time is approximately 3 minutes. South restrooms have no wait.';
    case 'food':
      return 'Food courts: North Concourse (5 min wait), South Concourse (8 min wait). For fastest service, try the grab-and-go station near Gate East.';
    default:
      return 'How can I help you navigate the stadium?';
  }
}

function generateAIResponse(userInput: string, currentZone: string, crowdDensity: number): string {
  const lowerInput = userInput.toLowerCase();

  if (lowerInput.includes('bathroom') || lowerInput.includes('restroom') || lowerInput.includes('toilet')) {
    return 'Nearest restrooms: North Concourse (1 min, ~3 min wait) or South Concourse (2 min, no wait). I recommend South for faster service.';
  }

  if (lowerInput.includes('food') || lowerInput.includes('hungry') || lowerInput.includes('drink') || lowerInput.includes('eat')) {
    return 'Best option now: North Food Court has the shortest lines (5 min). For drinks only, try the express stand at Gate East.';
  }

  if (lowerInput.includes('exit') || lowerInput.includes('leave') || lowerInput.includes('go home')) {
    return 'Nearest exit: Gate North (2 min walk, clear). Alternative: Gate East (3 min, moderate traffic). I suggest Gate North.';
  }

  if (lowerInput.includes('crowd') || lowerInput.includes('busy') || lowerInput.includes('quiet') || lowerInput.includes('empty')) {
    return `Current density here: ${crowdDensity.toFixed(0)}%. ${crowdDensity > 60 ? 'Quite busy. East Concourse is 40% quieter.' : 'Comfortable level. West side is even emptier.'}`;
  }

  if (lowerInput.includes('help') || lowerInput.includes('emergency') || lowerInput.includes('medical')) {
    return 'For emergencies, medical staff are at the West Concourse Medical Center. For life-threatening situations, alert staff or call 911 immediately.';
  }

  if (lowerInput.includes('shop') || lowerInput.includes('merchandise') || lowerInput.includes('buy')) {
    return 'Merchandise: East Concourse (shorter line) or North Entrance. Team store near Gate South has the best selection.';
  }

  if (lowerInput.includes('seat') || lowerInput.includes('section')) {
    return `You're in ${formatZoneName(currentZone)}. Need help finding a specific section? Tell me your seat number.`;
  }

  return `I'm here to help! Current location: ${formatZoneName(currentZone)} (${crowdDensity.toFixed(0)}% density). Ask about exits, food, restrooms, or crowd levels.`;
}
