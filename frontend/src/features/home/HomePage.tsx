import React, { useState } from 'react';
import {
  useOpponentBlueprintQuery,
  useTeamQuery,
  useHeatmapQuery,
  useSquadRatingsQuery,
} from '../../shared/api/queries';
import { PitchHeatmap } from '../../shared/components/PitchHeatmap';
import { ChannelDangerBar } from '../../shared/components/ChannelDangerBar';
import { FormTimeline } from '../../shared/components/FormTimeline';
import { formatNumber, getRatingColor } from '../../shared/lib/utils';
import { useI18n } from '../../shared/i18n';
import {
  ArrowRight,
  Sparkles,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
  Swords,
} from 'lucide-react';

interface HomePageProps {
  selectedTeamId: number;
  onNavigateToOpponent: (teamId: number, targetTab?: string) => void;
  onNavigateToSquads?: () => void;
  onNavigateToMatchup?: () => void;
}

export function HomePage({
  selectedTeamId,
  onNavigateToOpponent,
  onNavigateToSquads,
  onNavigateToMatchup,
}: HomePageProps) {
  const [activeEvidence, setActiveEvidence] = useState<string | null>(null);
  const { t, language } = useI18n();

  // Queries
  const { data: team, isLoading: teamLoading } = useTeamQuery(selectedTeamId);
  const { data: blueprint, isLoading: bpLoading } = useOpponentBlueprintQuery(selectedTeamId);
  const { data: heatmap, isLoading: heatmapLoading } = useHeatmapQuery({
    teamId: selectedTeamId,
    sigma: 1.2,
  });
  const { data: squadRatings } = useSquadRatingsQuery(team?.competition_id ?? undefined);

  const teamName = team?.team?.name || blueprint?.team?.name || 'Real Madrid';
  const compName = team?.competition_name || 'La Liga';
  const matchesCount = blueprint?.matches ?? team?.matches ?? 34;
  const overallRating = blueprint?.rating?.team ?? team?.rating?.team ?? 78.4;
  const attackRating = blueprint?.rating?.attack ?? team?.rating?.attack ?? 84.1;
  const defenceRating = blueprint?.rating?.defence ?? team?.rating?.defence ?? 62.3;

  // Key actionable insights for coaches (max 8-10 words per finding)
  const insights = [
    {
      id: 'right-wing',
      finding: language === 'ar' ? 'صناعة 64% من الفرص المفتوحة عبر الجناح الأيمن.' : 'Creates 64% of open-play chances down the right wing.',
      action: language === 'ar' ? 'مضاعفة التغطية الدفاعية على الظهير الأيمن.' : 'Double up on the wide receiver.',
      tab: 'attack',
      badge: language === 'ar' ? 'هجومي' : 'Attack',
      color: 'bg-amber-500',
    },
    {
      id: 'set-pieces',
      finding: language === 'ar' ? 'ضعف واضح في التغطية الهوائية عند القائم القريب بالركنيات.' : 'Concedes 0.38 xG on near-post corner deliveries.',
      action: language === 'ar' ? 'تنفيذ ركنيات مقوسة للداخل نحو القائم الأول.' : 'Target near post with inswinging deliveries.',
      tab: 'setpieces',
      badge: language === 'ar' ? 'كرات ثابتة' : 'Set Piece',
      color: 'bg-rose-500',
    },
    {
      id: 'buildup-press',
      finding: language === 'ar' ? 'معدل خسارة الكرة 42% لقلبي الدفاع تحت الضغط العالي.' : '42% turnover rate under high central pressing.',
      action: language === 'ar' ? 'تطبيق ضغط متقدم بمجرد استلام المحور للكرة.' : 'Trigger aggressive front press on pivot receipt.',
      tab: 'buildup',
      badge: language === 'ar' ? 'بناء اللعب' : 'Build-up',
      color: 'bg-blue-500',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto font-sans">
      {/* 1. NEXT MATCH HERO KICKER & HEADLINE */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-[var(--accent)] mb-1">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span>{t.nextMatch} • Sat, 14 Sep</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
            vs {teamName}
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-3)] mt-1">
            {compName} • Sample: {matchesCount} matches
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {onNavigateToMatchup && (
            <button
              onClick={onNavigateToMatchup}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--panel)] hover:bg-[var(--panel-2)] text-[var(--text)] transition-colors cursor-pointer"
            >
              <Swords className="w-3.5 h-3.5 text-[var(--text-3)]" />
              <span>{t.simulateMatchup}</span>
            </button>
          )}

          <button
            onClick={() => onNavigateToOpponent(selectedTeamId)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[var(--accent)] text-white hover:opacity-95 transition-opacity shadow-xs cursor-pointer"
          >
            <span>{t.fullScoutReport}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. MAIN 12-COLUMN GRID (Hero Pitch Heatmap Left 8 Cols + Insights Panel Right 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (8 Columns): Hero Pitch Heatmap */}
        <div className="lg:col-span-8 p-5 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-4">
          <PitchHeatmap
            data={heatmap}
            title={t.attackingDangerCreation}
            subtitle={t.attackingDangerSubtitle}
            sampleSize={`${matchesCount} matches`}
            isLoading={heatmapLoading}
          />
        </div>

        {/* Right (4 Columns): Insights Panel & Key Stat Ratings */}
        <div className="lg:col-span-4 space-y-5">
          {/* Key Match Insights Panel */}
          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                <h2 className="text-sm font-bold text-[var(--text)]">{t.keyMatchInsights}</h2>
              </div>
              <span className="text-3xs text-[var(--text-3)]">{t.clickToHighlight}</span>
            </div>

            <div className="space-y-3">
              {insights.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigateToOpponent(selectedTeamId, item.tab)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    activeEvidence === item.id
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]'
                      : 'border-[var(--border)] bg-[var(--panel-2)] hover:border-[var(--text-3)]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${item.color} mt-1.5 shrink-0`} />
                    <div className="space-y-1 flex-1">
                      <div className="text-xs font-bold text-[var(--text)] leading-snug">
                        {item.finding}
                      </div>
                      <div className="text-3xs text-[var(--text-2)] leading-normal">
                        {item.action}
                      </div>
                      <div className="pt-1 flex items-center justify-between">
                        <span className="px-1.5 py-0.5 rounded text-3xs font-mono font-bold bg-[var(--panel)] border border-[var(--border)] text-[var(--text-3)]">
                          {item.badge}
                        </span>
                        <span className="text-3xs text-[var(--accent)] font-semibold flex items-center gap-1 hover:underline">
                          {t.seeChart}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Ratings Row */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--border)] text-center font-mono">
              <div className="p-2.5 rounded-lg bg-[var(--panel-2)] border border-[var(--border)]">
                <span className="text-3xs text-[var(--text-3)] font-medium uppercase block">{t.rating}</span>
                <span className={`text-lg font-bold ${getRatingColor(overallRating)}`}>
                  {formatNumber(overallRating, 1)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--panel-2)] border border-[var(--border)]">
                <span className="text-3xs text-[var(--text-3)] font-medium uppercase block">{t.attack}</span>
                <span className="text-lg font-bold text-[var(--accent)]">{formatNumber(attackRating, 1)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--panel-2)] border border-[var(--border)]">
                <span className="text-3xs text-[var(--text-3)] font-medium uppercase block">{t.defence}</span>
                <span className="text-lg font-bold text-[var(--text)]">{formatNumber(defenceRating, 1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SUPPORTING ROW: Attack Distribution by Channel + Form Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-6 rounded-xl border border-[var(--border)] bg-[var(--panel)]">
          <ChannelDangerBar
            channels={{ left: 28, centre: 24, right: 48 }}
            title={t.attackShareByChannel}
            subtitle="Share of opponent final-third entries and shot-creating actions"
          />
        </div>

        <div className="md:col-span-6 rounded-xl border border-[var(--border)] bg-[var(--panel)]">
          <FormTimeline
            title={t.opponentRecentForm}
            subtitle="Last 5 competitive matches with scorelines and expected goals (xG)"
          />
        </div>
      </div>

      {/* 4. LEAGUE SQUAD FORM TABLE */}
      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
          <div>
            <h3 className="text-sm font-bold text-[var(--text)]">{t.leagueBenchmarkForm}</h3>
            <p className="text-xs text-[var(--text-3)]">Top ranked clubs in {compName}</p>
          </div>
          {onNavigateToSquads && (
            <button
              onClick={onNavigateToSquads}
              className="text-xs text-[var(--accent)] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{t.viewAllStandings}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--panel)] font-sans">
          {(squadRatings?.slice(0, 5) || []).map((row, idx) => {
            const isSelected = row.team.team_id === selectedTeamId;
            return (
              <div
                key={row.team.team_id}
                onClick={() => onNavigateToOpponent(row.team.team_id)}
                className={`p-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-[var(--panel-2)] transition-colors ${
                  isSelected ? 'bg-[var(--panel-2)]/80 border-s-2 border-[var(--accent)]' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs text-[var(--text-3)] w-5 tabular-nums">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[var(--text)] truncate flex items-center gap-2">
                      <span>{row.team.name}</span>
                      {isSelected && (
                        <span className="text-3xs font-semibold text-[var(--accent)] border border-[var(--accent)]/30 bg-[var(--accent)]/15 px-1.5 py-0.5 rounded">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="text-3xs text-[var(--text-3)]">
                      {row.team.country ?? 'Global'} • {row.playstyle || 'Balanced'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 font-mono">
                  <div className="text-end hidden sm:block">
                    <span className="text-3xs text-[var(--text-3)] uppercase block font-medium">{t.attack}</span>
                    <span className="text-xs tabular-nums text-[var(--text)] font-bold">
                      {formatNumber(row.attack_rating, 1)}
                    </span>
                  </div>
                  <div className="text-end hidden sm:block">
                    <span className="text-3xs text-[var(--text-3)] uppercase block font-medium">{t.defence}</span>
                    <span className="text-xs tabular-nums text-[var(--text)] font-bold">
                      {formatNumber(row.defence_rating, 1)}
                    </span>
                  </div>
                  <div className="text-end min-w-[3.2rem]">
                    <span className="text-3xs text-[var(--text-3)] uppercase block font-medium">{t.rating}</span>
                    <span className={`text-xs tabular-nums font-bold ${getRatingColor(row.team_rating)}`}>
                      {formatNumber(row.team_rating, 1)}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-3)] shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
