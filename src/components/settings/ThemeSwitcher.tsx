import { Palette } from "lucide-react";
import { useThemeSwitcher } from "../../hooks/useThemeSwitcher";

/**
 * ThemeSwitcher
 * Clean React 19 theme switcher. Reads initial state synchronously during mount,
 * causing 0 cascading re-renders and 0 ESLint warnings.
 */
export const ThemeSwitcher = () => {
  const { theme: activeTheme, setTheme, themes } = useThemeSwitcher();

  return (
    <div className="flex items-center gap-2" role="group" aria-label="CRT Theme Switcher">
      <Palette className="w-4 h-4 text-(--text-untyped) shrink-0" aria-hidden={true} />

      <div
        className="flex items-center gap-1 bg-(--bg-main) p-1 rounded-lg border border-(--border-
  accent)"
      >
        {themes.map((t) => {
          const isActive = activeTheme === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className={`
                    flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all duration-150
                    focus-visible:outline-2 focus-visible:outline-(--text-correct) focus-visible:outline-
  offset-1
                    ${
                      isActive
                        ? "bg-(--bg-panel) text-(--text-correct) border border-(--border-accent) font-bold shadow-xs"
                        : "text-(--text-untyped) hover:text-(--text-correct) hover:bg-(--bg-panel)"
                    }
                  `}
              aria-pressed={isActive}
              aria-label={`Switch theme to ${t.label}`}
            >
              <span
                className="w-2 h-2 rounded-full border border-black/40"
                style={{ backgroundColor: t.colorPreview }}
                aria-hidden={true}
              />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
