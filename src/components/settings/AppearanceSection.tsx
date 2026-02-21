import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function AppearanceSection() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary p-2 rounded-lg">
            {isDark ? <Moon size={20} /> : <Sun size={20} />}
          </div>
          <div className="text-left">
            <h2 className="text-sm font-semibold text-text-main">Appearance</h2>
            <p className="text-xs text-text-muted">
              {isDark ? "Dark mode" : "Light mode"}
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
            isDark ? "bg-primary" : "bg-slate-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
              isDark ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </section>
  );
}
