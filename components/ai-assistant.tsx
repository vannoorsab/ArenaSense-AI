'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Send, Volume2, Loader, Navigation, ShieldAlert, MapPin, Utensils, DoorOpen, Sparkles } from 'lucide-react';
import { ResilienceService } from '@/lib/services/resilience-service';
import { AIResponseService } from '@/lib/services/ai-response-service';
import { InputValidator } from '@/lib/services/input-validator';
import { formatZoneName } from '@/lib/utils/zone-formatter';

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

/**
 * AI Assistant Component
 * Provides an interactive chat interface powered by Google Gemini (simulated).
 * Features voice input, text-to-speech, and offline resilience.
 */
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

    const cleanup = ResilienceService.setupNetworkListener((status) => {
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
      const response = AIResponseService.generateQuickActionResponse(actionId, currentZone, crowdDensity);
      addAssistantMessage(response);
      setIsProcessing(false);
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedInput = InputValidator.sanitizeString(input);
    if (!sanitizedInput || isProcessing) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: sanitizedInput,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const userInput = sanitizedInput;
    setInput('');
    setIsProcessing(true);

    setTimeout(() => {
      const response = AIResponseService.generateNaturalLanguageResponse(userInput, currentZone, crowdDensity);
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
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <CardTitle className="text-base">Gemini Intelligence</CardTitle>
          </div>
          <span 
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              networkStatus === 'online'
                ? 'bg-green-100 text-green-700'
                : 'bg-orange-100 text-orange-700'
            }`}
            role="status"
            aria-label={`System is ${networkStatus}`}
          >
            {networkStatus === 'online' ? 'Cloud Connected' : 'Edge Local Mode'}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col p-3 space-y-3">
        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Quick assistance actions">
          {QUICK_ACTIONS.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action.id)}
              disabled={isProcessing}
              className="h-9 text-xs justify-start gap-2"
              aria-label={`Ask Gemini to ${action.label}`}
            >
              <action.icon className={`w-3.5 h-3.5 ${action.color}`} aria-hidden="true" />
              {action.label}
            </Button>
          ))}
        </div>

        {/* Messages */}
        <div 
          className="h-[180px] overflow-y-auto space-y-2 pr-1 scrollbar-thin focus-visible:outline-none"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-label="Chat history"
        >
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


