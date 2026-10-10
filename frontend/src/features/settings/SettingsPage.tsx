import React from 'react';
import { useTheme } from '../../shared/lib/useTheme';
import { useI18n } from '../../shared/i18n';
import { useHealthQuery, useMetaQuery } from '../../shared/api/queries';
import { Sun, Moon, Globe, Database, Activity, CheckCircle2, AlertTriangle, Layers, BookOpen } from 'lucide-react';
import { formatInt } from '../../shared/lib/utils';

interface SettingsPageProps {
  onNavigateToStyleGuide?: () => void;
}

export function SettingsPage({ onNavigateToStyleGuide }: SettingsPageProps) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useHealthQuery();
  const { data: meta } = useMetaQuery();

  const isDbOk = health?.db === 'ok';

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
      {/* Editorial Header */}
      <header className="border-b border-rule pb-6">
        <div className="text-2xs uppercase tracking-widest font-mono text-ink-3 mb-1">
          ARCHIVE SYSTEM CONFIGURATION
        </div>
        <h1 className="text-3xl md:text-5xl font-serif text-ink tracking-tight font-normal">
          {t.settings}
        </h1>
        <p className="text-sm md:text-base text-ink-2 mt-2 max-w-2xl leading-relaxed">
          Manage scouting archive preferences, visual themes, language localization, and live data telemetry.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section 01: Theme & Display */}
        <section className="space-y-4">
          <div className="border-t-2 border-rule-strong pt-3 flex items-center justify-between">
            <span className="text-2xs font-mono font-bold tracking-wider uppercase text-ink">
              01 / {t.themeChoice}
            </span>
          </div>

          <div className="p-5 rounded bg-bg-raised border border-rule space-y-4">
            <p className="text-xs text-ink-2 leading-relaxed">
              Select visual mode optimized for print readability and ambient lighting conditions.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Light (Warm Paper) */}
              <button
                onClick={() => setTheme('light')}
                className={`p-4 rounded border text-left flex flex-col justify-between h-28 transition-all ${
                  theme === 'light'
                    ? 'border-accent bg-[#F4F0E8] text-[#14110F] shadow-sm ring-1 ring-accent'
                    : 'border-rule bg-bg-sunken text-ink-2 hover:border-ink-3'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-accent' : 'text-ink-3'}`} />
                  {theme === 'light' && <span className="text-3xs font-mono font-bold text-accent uppercase">Active</span>}
                </div>
                <div>
                  <div className="text-xs font-bold font-serif">{t.themeLight}</div>
                  <div className="text-3xs font-mono text-ink-3">#F4F0E8 warm paper</div>
                </div>
              </button>

              {/* Dark (Warm Ink) */}
              <button
                onClick={() => setTheme('dark')}
                className={`p-4 rounded border text-left flex flex-col justify-between h-28 transition-all ${
                  theme === 'dark'
                    ? 'border-accent bg-[#0F0E0C] text-[#F2EDE3] shadow-sm ring-1 ring-accent'
                    : 'border-rule bg-bg-sunken text-ink-2 hover:border-ink-3'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-accent' : 'text-ink-3'}`} />
                  {theme === 'dark' && <span className="text-3xs font-mono font-bold text-accent uppercase">Active</span>}
                </div>
                <div>
                  <div className="text-xs font-bold font-serif">{t.themeDark}</div>
                  <div className="text-3xs font-mono text-ink-3">#0F0E0C warm ink</div>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Section 02: Language & Localization */}
        <section className="space-y-4">
          <div className="border-t-2 border-rule-strong pt-3 flex items-center justify-between">
            <span className="text-2xs font-mono font-bold tracking-wider uppercase text-ink">
              02 / {t.languageChoice}
            </span>
          </div>

          <div className="p-5 rounded bg-bg-raised border border-rule space-y-4">
            <p className="text-xs text-ink-2 leading-relaxed">
              Full internationalization and bidirectional layout (LTR / RTL) engine support.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* English */}
              <button
                onClick={() => setLanguage('en')}
                className={`p-4 rounded border text-left flex flex-col justify-between h-28 transition-all ${
                  language === 'en'
                    ? 'border-accent bg-bg-sunken text-ink shadow-sm ring-1 ring-accent'
                    : 'border-rule bg-bg text-ink-2 hover:border-ink-3'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Globe className="w-5 h-5 text-accent" />
                  {language === 'en' && <span className="text-3xs font-mono font-bold text-accent uppercase">Active</span>}
                </div>
                <div>
                  <div className="text-xs font-bold font-serif">English (LTR)</div>
                  <div className="text-3xs font-mono text-ink-3">Default International</div>
                </div>
              </button>

              {/* Arabic */}
              <button
                onClick={() => setLanguage('ar')}
                className={`p-4 rounded border text-right flex flex-col justify-between h-28 transition-all ${
                  language === 'ar'
                    ? 'border-accent bg-bg-sunken text-ink shadow-sm ring-1 ring-accent'
                    : 'border-rule bg-bg text-ink-2 hover:border-ink-3'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Globe className="w-5 h-5 text-accent" />
                  {language === 'ar' && <span className="text-3xs font-mono font-bold text-accent uppercase">نشط</span>}
                </div>
                <div>
                  <div className="text-xs font-bold font-serif">العربية (RTL)</div>
                  <div className="text-3xs font-mono text-ink-3">تخطيط لغوي متكامل</div>
                </div>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Section 03: Live Database & Engine Telemetry */}
      <section className="space-y-4">
        <div className="border-t-2 border-rule-strong pt-3 flex items-center justify-between">
          <span className="text-2xs font-mono font-bold tracking-wider uppercase text-ink">
            03 / {t.systemHealth}
          </span>
          <button
            onClick={() => refetchHealth()}
            className="text-2xs font-mono text-accent hover:underline flex items-center gap-1"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Ping /api/health</span>
          </button>
        </div>

        <div className="p-5 rounded bg-bg-raised border border-rule space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Database Engine */}
            <div className="p-3 rounded bg-bg-sunken border border-rule">
              <span className="text-3xs font-mono uppercase text-ink-3 block">Relational DB</span>
              <div className="flex items-center gap-1.5 mt-1">
                {isDbOk ? (
                  <CheckCircle2 className="w-4 h-4 text-positive shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                )}
                <span className="text-xs font-mono font-bold text-ink">
                  {healthLoading ? 'Testing...' : isDbOk ? 'PostgreSQL 16 OK' : 'Degraded (Fallback)'}
                </span>
              </div>
            </div>

            {/* Live Latency */}
            <div className="p-3 rounded bg-bg-sunken border border-rule">
              <span className="text-3xs font-mono uppercase text-ink-3 block">{t.latency}</span>
              <div className="text-base font-mono font-bold text-ink mt-0.5 tabular-nums">
                {health?.latencyMs !== undefined ? `${health.latencyMs} ms` : '—'}
              </div>
            </div>

            {/* Analytics Engine */}
            <div className="p-3 rounded bg-bg-sunken border border-rule">
              <span className="text-3xs font-mono uppercase text-ink-3 block">Analytics Engine</span>
              <div className="text-xs font-mono font-bold text-ink mt-1">
                v{meta?.source?.analytics_engine_version ?? '1.0.0'}
              </div>
            </div>

            {/* Coordinate System */}
            <div className="p-3 rounded bg-bg-sunken border border-rule">
              <span className="text-3xs font-mono uppercase text-ink-3 block">Spatial Grid</span>
              <div className="text-xs font-mono font-bold text-ink mt-1">
                105m × 68m FIFA
              </div>
            </div>
          </div>

          {/* Detailed Corpus Metadata */}
          <div className="border-t border-rule pt-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-2xs font-mono text-ink-2">
            <div>
              <span className="text-ink-3 block">FIXTURES:</span>
              <span className="text-ink font-bold tabular-nums">{formatInt(meta?.n_matches ?? 1941)} games</span>
            </div>
            <div>
              <span className="text-ink-3 block">SPADL EVENTS:</span>
              <span className="text-ink font-bold tabular-nums">2.46M actions</span>
            </div>
            <div>
              <span className="text-ink-3 block">SCOUTED ATHLETES:</span>
              <span className="text-ink font-bold tabular-nums">{formatInt(meta?.n_players ?? 3031)} players</span>
            </div>
            <div>
              <span className="text-ink-3 block">CALIBRATED CLUBS:</span>
              <span className="text-ink font-bold tabular-nums">142 squads</span>
            </div>
          </div>
        </div>
      </section>

      {/* Style Guide Shortcut Banner */}
      {onNavigateToStyleGuide && (
        <div className="p-5 rounded border border-rule bg-bg-raised flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-accent shrink-0" />
            <div>
              <h4 className="text-sm font-serif font-bold text-ink">{t.styleGuide}</h4>
              <p className="text-xs text-ink-2">
                Inspect typographic scale, color tokens, plates, figures, and pitch visual primitives.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToStyleGuide}
            className="px-3.5 py-1.5 rounded text-xs font-mono font-medium border border-rule bg-bg-sunken hover:bg-bg text-ink shrink-0"
          >
            Open Style Guide →
          </button>
        </div>
      )}
    </div>
  );
}
