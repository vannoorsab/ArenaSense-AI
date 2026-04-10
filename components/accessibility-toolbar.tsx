'use client';
/**
 * accessibility-toolbar.tsx
 * Floating accessibility controls: font size, high contrast, keyboard hints.
 * Keyboard shortcut: Alt+A to toggle.
 * WCAG 2.1 AA compliant.
 */

import { useState, useEffect, useCallback } from 'react';
import { Accessibility, Type, Eye, Keyboard, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FontSize = 'normal' | 'large' | 'xl';

const FONT_SIZE_MAP: Record<FontSize, string> = {
  normal: '16px',
  large: '18px',
  xl: '21px',
};

export default function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [showKeymap, setShowKeymap] = useState(false);

  // Keyboard shortcut: Alt+A
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.altKey && e.key === 'a') {
      e.preventDefault();
      setIsOpen(prev => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // Apply font size to root
  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZE_MAP[fontSize];
  }, [fontSize]);

  // Apply high contrast class to root
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const fontSizeIndex: Record<FontSize, number> = { normal: 0, large: 1, xl: 2 };
  const fontSizes: FontSize[] = ['normal', 'large', 'xl'];
  const currentIndex = fontSizeIndex[fontSize];

  function increaseFontSize() {
    if (currentIndex < fontSizes.length - 1) {
      setFontSize(fontSizes[currentIndex + 1]);
    }
  }

  function decreaseFontSize() {
    if (currentIndex > 0) {
      setFontSize(fontSizes[currentIndex - 1]);
    }
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2"
      role="complementary"
      aria-label="Accessibility controls"
    >
      {/* Panel */}
      {isOpen && (
        <div
          className="bg-card border border-border rounded-xl shadow-2xl p-4 w-56 space-y-3"
          role="dialog"
          aria-modal="false"
          aria-label="Accessibility options"
        >
          {/* Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Accessibility className="w-4 h-4 text-primary" aria-hidden="true" />
              <span className="text-sm font-semibold">Accessibility</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsOpen(false)}
              aria-label="Close accessibility panel"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Font Size */}
          <div role="group" aria-labelledby="font-size-label">
            <div className="flex items-center gap-1.5 mb-2">
              <Type className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
              <span id="font-size-label" className="text-xs text-muted-foreground font-medium">Text Size</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={decreaseFontSize}
                disabled={currentIndex === 0}
                aria-label="Decrease text size"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
              <span className="flex-1 text-center text-xs font-medium capitalize" aria-live="polite" aria-atomic="true">
                {fontSize.charAt(0).toUpperCase() + fontSize.slice(1)}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={increaseFontSize}
                disabled={currentIndex === fontSizes.length - 1}
                aria-label="Increase text size"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
              <span className="text-xs text-muted-foreground font-medium">High Contrast</span>
            </div>
            <button
              role="switch"
              aria-checked={highContrast}
              aria-label={`High contrast mode: ${highContrast ? 'on' : 'off'}`}
              onClick={() => setHighContrast(prev => !prev)}
              className={`w-9 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                ${highContrast ? 'bg-primary' : 'bg-muted'}`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white shadow transition-transform ${highContrast ? 'translate-x-4' : 'translate-x-0.5'}`}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Keyboard shortcuts */}
          <div>
            <button
              className="flex items-center gap-1.5 text-xs text-muted-foreground w-full hover:text-foreground transition-colors"
              onClick={() => setShowKeymap(prev => !prev)}
              aria-expanded={showKeymap}
              aria-controls="keymap-list"
            >
              <Keyboard className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Keyboard Shortcuts</span>
              <ChevronUp className={`w-3 h-3 ml-auto transition-transform ${showKeymap ? '' : 'rotate-180'}`} aria-hidden="true" />
            </button>
            {showKeymap && (
              <ul id="keymap-list" className="mt-2 space-y-1" role="list">
                {[
                  ['Alt+A', 'Toggle accessibility'],
                  ['Tab', 'Navigate elements'],
                  ['Space/Enter', 'Activate buttons'],
                  ['Esc', 'Close dialogs'],
                ].map(([key, desc]) => (
                  <li key={key} className="flex items-center justify-between text-[10px]">
                    <kbd className="bg-muted px-1.5 py-0.5 rounded text-[9px] font-mono border border-border">{key}</kbd>
                    <span className="text-muted-foreground">{desc}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Skip link hint */}
          <p className="text-[9px] text-muted-foreground border-t border-border pt-2">
            Press <kbd className="bg-muted px-1 rounded">Alt+A</kbd> anywhere to toggle this panel.
          </p>
        </div>
      )}

      {/* Floating Toggle Button */}
      <Button
        variant="default"
        size="icon"
        className="rounded-full w-10 h-10 shadow-lg"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={`${isOpen ? 'Close' : 'Open'} accessibility controls (Alt+A)`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Accessibility className="w-5 h-5" aria-hidden="true" />
      </Button>
    </div>
  );
}
