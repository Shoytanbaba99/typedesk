import React, { useEffect } from 'react';
import { Clock, Type, Quote } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export type TestCategory = 'time' | 'words' | 'quote';
export type TimeOption = 15 | 30 | 60 | 120;
export type WordOption = 10 | 25 | 50 | 100;
export type QuoteOption = 'short' | 'medium' | 'long';

export interface ModeSettings {
  category: TestCategory;
  time: TimeOption;
  words: WordOption;
  quote: QuoteOption;
}

interface ModeSelectorProps {
  disabled?: boolean; // True when typing test is actively running
  onHydrate?: (settings: ModeSettings) => void; // Called once on initial mount to sync parent state
  onSettingsChange?: (settings: ModeSettings) => void; // Called on user interaction to trigger restart
}

const DEFAULT_SETTINGS: ModeSettings = {
  category: 'time',
  time: 30,
  words: 25,
  quote: 'medium',
};

/**
 * ModeSelector
 * RobCo Terminal mode toggle bar for Time, Word count, and Quote modes.
 */
export const ModeSelector: React.FC<ModeSelectorProps> = ({ 
  disabled = false, 
  onHydrate,
  onSettingsChange 
}) => {
  const [settings, setSettings] = useLocalStorage<ModeSettings>('typedesk-mode-settings', DEFAULT_SETTINGS);

  // Sync initial mount settings with parent state on load (state-only, no restart side-effects)
  useEffect(() => {
    onHydrate?.(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateCategory = (category: TestCategory) => {
    if (disabled) return;
    const next = { ...settings, category };
    setSettings(next);
    onSettingsChange?.(next);
  };

  const updateTime = (time: TimeOption) => {
    if (disabled) return;
    const next = { ...settings, category: 'time' as TestCategory, time };
    setSettings(next);
    onSettingsChange?.(next);
  };

  const updateWords = (words: WordOption) => {
    if (disabled) return;
    const next = { ...settings, category: 'words' as TestCategory, words };
    setSettings(next);
    onSettingsChange?.(next);
  };

  const updateQuote = (quote: QuoteOption) => {
    if (disabled) return;
    const next = { ...settings, category: 'quote' as TestCategory, quote };
    setSettings(next);
    onSettingsChange?.(next);
  };

  return (
    <div 
      className={`
        flex flex-wrap items-center justify-center gap-4 bg-(--bg-main) px-4 py-2 rounded-lg border border-(--border-accent) transition-opacity duration-200
        ${disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}
      `}
      role="toolbar"
      aria-disabled={disabled}
      aria-label={disabled ? "Typing Test Mode Controls (locked during test)" : "Typing Test Mode Controls"}
    >
      {/* Category Toggles */}
      <div className="flex items-center gap-1 border-r border-(--border-accent) pr-4">
        {/* Time Category */}
        <button
          type="button"
          onClick={() => updateCategory('time')}
          disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          className={`
            flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all duration-150
            focus-visible:outline-2 focus-visible:outline-(--text-correct)
            ${settings.category === 'time' 
              ? 'text-(--text-correct) font-bold crt-glow' 
              : 'text-(--text-untyped) hover:text-(--text-correct)'
            }
          `}
          aria-pressed={settings.category === 'time'}
        >
          <Clock className="w-3.5 h-3.5" aria-hidden={true} />
          <span>time</span>
        </button>

        {/* Words Category */}
        <button
          type="button"
          onClick={() => updateCategory('words')}
          disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          className={`
            flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all duration-150
            focus-visible:outline-2 focus-visible:outline-(--text-correct)
            ${settings.category === 'words' 
              ? 'text-(--text-correct) font-bold crt-glow' 
              : 'text-(--text-untyped) hover:text-(--text-correct)'
            }
          `}
          aria-pressed={settings.category === 'words'}
        >
          <Type className="w-3.5 h-3.5" aria-hidden={true} />
          <span>words</span>
        </button>

        {/* Quote Category */}
        <button
          type="button"
          onClick={() => updateCategory('quote')}
          disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          className={`
            flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all duration-150
            focus-visible:outline-2 focus-visible:outline-(--text-correct)
            ${settings.category === 'quote' 
              ? 'text-(--text-correct) font-bold crt-glow' 
              : 'text-(--text-untyped) hover:text-(--text-correct)'
            }
          `}
          aria-pressed={settings.category === 'quote'}
        >
          <Quote className="w-3.5 h-3.5" aria-hidden={true} />
          <span>quote</span>
        </button>
      </div>

      {/* Sub-Options Bar */}
      <div className="flex items-center gap-1">
        {/* Time Options */}
        {settings.category === 'time' && (
          ([15, 30, 60, 120] as TimeOption[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => updateTime(t)}
              disabled={disabled}
              tabIndex={disabled ? -1 : 0}
              aria-disabled={disabled}
              className={`
                px-2 py-0.5 rounded text-xs font-mono transition-all duration-150
                focus-visible:outline-2 focus-visible:outline-(--text-correct)
                ${settings.time === t 
                  ? 'text-(--text-correct) font-bold crt-glow bg-(--border-accent)' 
                  : 'text-(--text-untyped) hover:text-(--text-correct)'
                }
              `}
              aria-pressed={settings.time === t}
            >
              {t}s
            </button>
          ))
        )}

        {/* Word Options */}
        {settings.category === 'words' && (
          ([10, 25, 50, 100] as WordOption[]).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => updateWords(w)}
              disabled={disabled}
              tabIndex={disabled ? -1 : 0}
              aria-disabled={disabled}
              className={`
                px-2 py-0.5 rounded text-xs font-mono transition-all duration-150
                focus-visible:outline-2 focus-visible:outline-(--text-correct)
                ${settings.words === w 
                  ? 'text-(--text-correct) font-bold crt-glow bg-(--border-accent)' 
                  : 'text-(--text-untyped) hover:text-(--text-correct)'
                }
              `}
              aria-pressed={settings.words === w}
            >
              {w}
            </button>
          ))
        )}

        {/* Quote Options */}
        {settings.category === 'quote' && (
          (['short', 'medium', 'long'] as QuoteOption[]).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => updateQuote(q)}
              disabled={disabled}
              tabIndex={disabled ? -1 : 0}
              aria-disabled={disabled}
              className={`
                px-2 py-0.5 rounded text-xs font-mono transition-all duration-150 capitalize
                focus-visible:outline-2 focus-visible:outline-(--text-correct)
                ${settings.quote === q 
                  ? 'text-(--text-correct) font-bold crt-glow bg-(--border-accent)' 
                  : 'text-(--text-untyped) hover:text-(--text-correct)'
                }
              `}
              aria-pressed={settings.quote === q}
            >
              {q}
            </button>
          ))
        )}
      </div>
    </div>
  );
};