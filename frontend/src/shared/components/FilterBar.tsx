import React from 'react';
import { Search, SlidersHorizontal, Sun, Moon, Globe } from 'lucide-react';
import { StatusIndicator } from './StatusIndicator';
import { useI18n, Language } from '../i18n';
import { useTheme } from '../lib/useTheme';
import type { CompetitionOut, TeamSummary } from '../../api/types';

interface FilterBarProps {
  competitions: CompetitionOut[];
  teams: TeamSummary[];
  selectedCompetitionId?: number;
  selectedTeamId?: number;
  onSelectCompetition: (id?: number) => void;
  onSelectTeam: (id: number) => void;
  onOpenSearch: () => void;
}

export function FilterBar({
  competitions,
  teams,
  selectedCompetitionId,
  selectedTeamId,
  onSelectCompetition,
  onSelectTeam,
  onOpenSearch,
}: FilterBarProps) {
  const { t, language, setLanguage } = useI18n();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-13 border-b border-border bg-card/90 px-4 flex items-center justify-between gap-3 backdrop-blur-md sticky top-0 z-30">
      {/* Left side selectors */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="hidden sm:inline">{t.scope}</span>
        </div>

        {/* Competition dropdown */}
        <select
          value={selectedCompetitionId ?? ''}
          onChange={(e) => onSelectCompetition(e.target.value ? Number(e.target.value) : undefined)}
          className="h-8 px-2.5 text-xs rounded border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-sans max-w-[150px] sm:max-w-[200px]"
        >
          <option value="">{t.allCompetitions}</option>
          {competitions.map((comp) => (
            <option key={comp.competition_id} value={comp.competition_id}>
              {comp.name} ({comp.season})
            </option>
          ))}
        </select>

        {/* Team dropdown */}
        <select
          value={selectedTeamId ?? ''}
          onChange={(e) => onSelectTeam(Number(e.target.value))}
          className="h-8 px-2.5 text-xs rounded border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-sans font-medium max-w-[160px] sm:max-w-[220px]"
        >
          {teams.map((t) => (
            <option key={t.team.team_id} value={t.team.team_id}>
              {t.team.name}
            </option>
          ))}
        </select>
      </div>

      {/* Center Search Shortcut */}
      <button
        onClick={onOpenSearch}
        className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded border border-border bg-surface/60 hover:bg-surface text-xs text-muted-foreground transition-colors w-56 justify-between"
      >
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5" />
          <span>{t.quickSearch}</span>
        </div>
        <kbd className="px-1.5 py-0.2 text-2xs font-mono text-muted-foreground bg-card border border-border rounded">
          ⌘K
        </kbd>
      </button>

      {/* Right side controls: Language, Theme & Health Status */}
      <div className="flex items-center gap-2.5">
        {/* Language Switcher */}
        <div className="flex items-center rounded border border-border bg-surface p-0.5 text-xs font-mono">
          <button
            onClick={() => setLanguage('en')}
            className={`px-1.5 py-0.5 rounded text-2xs transition-colors ${
              language === 'en'
                ? 'bg-card text-foreground font-bold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('ar')}
            className={`px-1.5 py-0.5 rounded text-2xs transition-colors ${
              language === 'ar'
                ? 'bg-card text-foreground font-bold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            عربي
          </button>
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded border border-border bg-surface hover:bg-surface-subtle text-foreground transition-colors"
          title={t.themeToggle}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-zinc-700" />}
        </button>

        {/* Live Status Indicator */}
        <StatusIndicator showLatency />
      </div>
    </header>
  );
}
