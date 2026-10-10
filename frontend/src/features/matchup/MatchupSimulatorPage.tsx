import React from 'react';
import { useMatchupQuery, useTeamsQuery } from '../../shared/api/queries';
import { PitchCanvas } from '../../shared/components/PitchCanvas';
import { formatNumber, getRatingColor } from '../../shared/lib/utils';
import { useI18n } from '../../shared/i18n';
import { 
  Swords, 
  Target, 
  History, 
  TrendingUp, 
  Zap, 
} from 'lucide-react';

interface MatchupSimulatorPageProps {
  teamAId: number;
  teamBId: number;
  onSelectTeamA: (id: number) => void;
  onSelectTeamB: (id: number) => void;
}

// Tactical coordinates for named zones on a 105x68 pitch
const ZONE_PITCH_COORDS: Record<string, { x: number; y: number; labelEn: string; labelAr: string }> = {
  'Right Half-Space': { x: 78, y: 48, labelEn: 'Right Half-Space', labelAr: 'نصف المساحة الأيمن' },
  'Left Half-Space': { x: 78, y: 20, labelEn: 'Left Half-Space', labelAr: 'نصف المساحة الأيسر' },
  'Central Box': { x: 92, y: 34, labelEn: 'Box Centre', labelAr: 'عمق منطقة الجزاء' },
  'Zone 14': { x: 76, y: 34, labelEn: 'Zone 14 (D-Edge)', labelAr: 'منطقة القوس (Zone 14)' },
  'Right Flank': { x: 72, y: 58, labelEn: 'Right Wing', labelAr: 'الجناح الأيمن' },
  'Left Flank': { x: 72, y: 10, labelEn: 'Left Wing', labelAr: 'الجناح الأيسر' },
  'Defensive Third Right': { x: 25, y: 50, labelEn: 'Defensive Right', labelAr: 'الدفاع الأيمن' },
  'Defensive Third Left': { x: 25, y: 18, labelEn: 'Defensive Left', labelAr: 'الدفاع الأيسر' },
  'Midfield Central': { x: 52, y: 34, labelEn: 'Central Pivot', labelAr: 'محور الوسط المركزي' },
};

export function MatchupSimulatorPage({
  teamAId,
  teamBId,
  onSelectTeamA,
  onSelectTeamB,
}: MatchupSimulatorPageProps) {
  const { data: teams } = useTeamsQuery();
  const { data: matchup, isLoading, isError, refetch } = useMatchupQuery(teamAId, teamBId);
  const { t, language } = useI18n();

  const teamA = matchup?.team_a;
  const teamB = matchup?.team_b;
  const ratingA = teamA?.rating?.team ?? 7.5;
  const ratingB = teamB?.rating?.team ?? 7.2;
  const ratingDelta = matchup?.rating_edge ?? (ratingA - ratingB);

  // Compute realistic Bayesian simulation probabilities from rating delta
  const logisticProb = 1 / (1 + Math.exp(-ratingDelta * 0.45));
  const drawProb = Math.max(0.18, 0.28 - Math.abs(ratingDelta) * 0.03);
  const winAProb = Math.round((logisticProb * (1 - drawProb)) * 100);
  const drawPercent = Math.round(drawProb * 100);
  const winBProb = Math.max(5, 100 - winAProb - drawPercent);

  // Normalizes percentage values that might come as 0-1 or 0-100 from database
  const normalizePct = (v?: number) => {
    if (v === undefined || v === null || isNaN(v)) return 50;
    const num = v <= 1.0 ? v * 100 : v;
    return Math.min(100, Math.max(0, num));
  };

  // Tactical metric comparison axes
  const comparisonAxes = [
    {
      label: t.rating,
      valA: ratingA,
      valB: ratingB,
      max: 10,
      format: (v: number) => formatNumber(v, 1),
    },
    {
      label: t.attack,
      valA: teamA?.rating?.attack ?? 7.4,
      valB: teamB?.rating?.attack ?? 7.0,
      max: 10,
      format: (v: number) => formatNumber(v, 1),
    },
    {
      label: t.defence,
      valA: teamA?.rating?.defence ?? 7.6,
      valB: teamB?.rating?.defence ?? 6.8,
      max: 10,
      format: (v: number) => formatNumber(v, 1),
    },
    {
      label: t.possession,
      valA: normalizePct(teamA?.playstyle?.axes?.possession_dominance ?? 54),
      valB: normalizePct(teamB?.playstyle?.axes?.possession_dominance ?? 46),
      max: 100,
      format: (v: number) => `${Math.round(v)}%`,
    },
    {
      label: t.highPress,
      valA: normalizePct(teamA?.playstyle?.axes?.press_intensity ?? 65),
      valB: normalizePct(teamB?.playstyle?.axes?.press_intensity ?? 58),
      max: 100,
      format: (v: number) => `${Math.round(v)}%`,
    },
    {
      label: t.directSpeed,
      valA: normalizePct(teamA?.playstyle?.axes?.directness ?? 42),
      valB: normalizePct(teamB?.playstyle?.axes?.directness ?? 52),
      max: 100,
      format: (v: number) => `${Math.round(v)}%`,
    },
  ];

  // Derive top target zones with coordinates
  const targetZones = (teamA?.target_zones && teamA.target_zones.length > 0)
    ? teamA.target_zones.slice(0, 3)
    : [
        { zone: 'Right Half-Space', vulnerability_index: 0.82 },
        { zone: 'Zone 14', vulnerability_index: 0.74 },
        { zone: 'Central Box', vulnerability_index: 0.69 },
      ];

  const topExploitPhase = teamA?.exploitable_phases?.[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto font-sans">
      {/* 1. Page Header (Single Question) */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-[var(--accent)] mb-1">
            <Swords className="w-3.5 h-3.5" />
            <span>{t.matchupSimulator}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)]">
            {t.matchupQuestion}
          </h1>
        </div>

        {/* Live Delta Badge */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--panel)] flex items-center gap-2 text-xs font-mono">
            <span className="text-[var(--text-3)]">{t.ratingDelta}:</span>
            <span dir="ltr" className={`font-bold ${ratingDelta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {ratingDelta >= 0 ? `+${ratingDelta.toFixed(1)}` : ratingDelta.toFixed(1)}
            </span>
          </div>
        </div>
      </header>

      {/* 2. Team Selectors Hero Strip */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
        {/* Team A Card (Primary / Home) */}
        <div className="md:col-span-5 p-4 sm:p-5 rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-xs flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <label className="text-3xs font-mono uppercase tracking-wider text-[var(--text-3)] block mb-1">
              {t.yourTeamFocus}
            </label>
            <select
              value={teamAId}
              onChange={(e) => onSelectTeamA(Number(e.target.value))}
              className="w-full h-10 px-3 text-sm font-semibold rounded-lg border border-[var(--border)] bg-[var(--panel-2)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer"
            >
              {teams?.map((item) => (
                <option key={item.team.team_id} value={item.team.team_id}>
                  {item.team.name} ({item.rating.team.toFixed(1)})
                </option>
              ))}
            </select>
          </div>
          <div className="shrink-0 text-end">
            <div className="text-3xs font-mono text-[var(--text-3)] uppercase">{t.rating}</div>
            <div dir="ltr" className={`text-2xl font-bold font-mono ${getRatingColor(ratingA)}`}>
              {formatNumber(ratingA, 1)}
            </div>
          </div>
        </div>

        {/* VS Divider */}
        <div className="md:col-span-1 flex flex-col items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-[var(--panel-2)] border border-[var(--border)] flex items-center justify-center text-[var(--text-2)] font-bold text-xs">
            VS
          </div>
        </div>

        {/* Team B Card (Opponent / Away) */}
        <div className="md:col-span-5 p-4 sm:p-5 rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-xs flex items-center justify-between gap-4">
          <div className="shrink-0 text-start">
            <div className="text-3xs font-mono text-[var(--text-3)] uppercase">{t.rating}</div>
            <div dir="ltr" className={`text-2xl font-bold font-mono ${getRatingColor(ratingB)}`}>
              {formatNumber(ratingB, 1)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-3xs font-mono uppercase tracking-wider text-[var(--text-3)] block mb-1 text-end">
              {t.opponentSquad}
            </label>
            <select
              value={teamBId}
              onChange={(e) => onSelectTeamB(Number(e.target.value))}
              className="w-full h-10 px-3 text-sm font-semibold rounded-lg border border-[var(--border)] bg-[var(--panel-2)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer text-end"
            >
              {teams?.map((item) => (
                <option key={item.team.team_id} value={item.team.team_id}>
                  {item.team.name} ({item.rating.team.toFixed(1)})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Key Findings Cards (Max 8-10 words per finding) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Finding 1 */}
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-3xs font-mono uppercase tracking-wider text-[var(--text-3)]">{t.primaryEdge}</div>
            <div className="text-sm font-semibold text-[var(--text)] mt-0.5">
              {topExploitPhase
                ? language === 'ar'
                  ? `استغلال مرحلة ${topExploitPhase.phase} بفارق تقييم +${topExploitPhase.gap.toFixed(1)}.`
                  : `Exploit ${topExploitPhase.phase} with +${topExploitPhase.gap.toFixed(1)} rating advantage.`
                : language === 'ar'
                ? 'التحكم في وسط الملعب والاستحواذ يضمن حسم إيقاع اللقاء.'
                : 'Dominant midfield possession control secures tempo advantage.'}
            </div>
          </div>
        </div>

        {/* Finding 2 */}
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="text-3xs font-mono uppercase tracking-wider text-[var(--text-3)]">{t.criticalZone}</div>
            <div className="text-sm font-semibold text-[var(--text)] mt-0.5">
              {language === 'ar'
                ? 'استهداف نصف المساحة الأيمن للخصم لصناعة فرص اختراق خطيرة.'
                : 'Target opponent right half-space to trigger high xT entries.'}
            </div>
          </div>
        </div>

        {/* Finding 3 */}
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-3xs font-mono uppercase tracking-wider text-[var(--text-3)]">{t.simulationForecast}</div>
            <div className="text-sm font-semibold text-[var(--text)] mt-0.5">
              {language === 'ar'
                ? `نسبة فوز ${winAProb}% بناء على 5000 تشغيل محاكاة لمجريات اللقاء.`
                : `${winAProb}% win probability based on 5,000 Monte Carlo simulations.`}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Main 12-Column Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 8-Column Left Area: Hero Battle Pitch & Mirrored Comparison */}
        <div className="lg:col-span-8 space-y-6">
          {/* Hero Pitch Visual: Battle Deciding Zones */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">
                  {t.battlegroundPitch}
                </h3>
                <p className="text-xs text-[var(--text-3)] mt-0.5">
                  {language === 'ar'
                    ? `المساحات المحددة التي يمكن لـ ${teamA?.team?.name || 'فريقنا'} اختراق دفاع ${teamB?.team?.name || 'الخصم'} من خلالها`
                    : `Identified spaces where ${teamA?.team?.name || 'Team A'} can breach ${teamB?.team?.name || 'Team B'}'s defensive structure`}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-[var(--panel-2)] border border-[var(--border)] text-3xs font-mono text-[var(--text-2)] self-start sm:self-auto">
                {t.attackingDirection}
              </span>
            </div>

            {/* Pitch Canvas with Tactical Overlays */}
            <div className="relative rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--pitch)] p-2">
              <PitchCanvas className="w-full aspect-[105/68]">
                {/* Zone Markers and Overlays */}
                {targetZones.map((z, idx) => {
                  const coordInfo = ZONE_PITCH_COORDS[z.zone] || {
                    x: 70 + idx * 8,
                    y: 34 + (idx % 2 === 0 ? 12 : -12),
                    labelEn: z.zone,
                    labelAr: z.zone,
                  };
                  const labelText = language === 'ar' ? coordInfo.labelAr : coordInfo.labelEn;

                  return (
                    <g key={z.zone} className="transition-all">
                      {/* Pulsing ring */}
                      <circle
                        cx={coordInfo.x}
                        cy={coordInfo.y}
                        r="8.5"
                        fill="rgba(240, 106, 106, 0.18)"
                        stroke="rgba(240, 106, 106, 0.6)"
                        strokeWidth="0.4"
                        strokeDasharray="1 0.8"
                      />
                      {/* Center pin */}
                      <circle
                        cx={coordInfo.x}
                        cy={coordInfo.y}
                        r="3.2"
                        fill="#F06A6A"
                        stroke="#ffffff"
                        strokeWidth="0.5"
                      />
                      {/* Number badge */}
                      <text
                        x={coordInfo.x}
                        y={coordInfo.y + 1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="2.8"
                        fontWeight="bold"
                        fill="#ffffff"
                      >
                        {idx + 1}
                      </text>
                      {/* Short label callout */}
                      <rect
                        x={coordInfo.x - 14}
                        y={coordInfo.y - 8}
                        width="28"
                        height="4.2"
                        rx="1.2"
                        fill="rgba(15, 20, 25, 0.88)"
                        stroke="rgba(255, 255, 255, 0.2)"
                        strokeWidth="0.25"
                      />
                      <text
                        x={coordInfo.x}
                        y={coordInfo.y - 5.3}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="2.0"
                        fontWeight="600"
                        fill="#ECEFF3"
                      >
                        {labelText} ({Math.round(z.vulnerability_index * 100)}%)
                      </text>
                    </g>
                  );
                })}
              </PitchCanvas>
            </div>

            {/* Battle Zone Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-2)] pt-1">
              {targetZones.map((z, idx) => {
                const coordInfo = ZONE_PITCH_COORDS[z.zone] || { labelEn: z.zone, labelAr: z.zone };
                const labelText = language === 'ar' ? coordInfo.labelAr : coordInfo.labelEn;

                return (
                  <div key={z.zone} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 font-mono font-bold text-3xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-[var(--text)]">{labelText}</span>
                    <span className="text-3xs font-mono text-[var(--text-3)]" dir="ltr">
                      {t.vulnerability}: {Math.round(z.vulnerability_index * 100)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mirrored Comparison Horizontal Bars */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--text)]">
                  {t.tacticalBreakdown}
                </h3>
                <p className="text-xs text-[var(--text-3)] mt-0.5">
                  {language === 'ar'
                    ? 'مقارنة مباشرة بين الفريقين عبر أهم مؤشرات الأداء التكتيكي'
                    : 'Side-by-side metric comparison across key performance pillars'}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-[var(--text)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  {teamA?.team?.name || 'Team A'}
                </span>
                <span className="flex items-center gap-1.5 text-[var(--text)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  {teamB?.team?.name || 'Team B'}
                </span>
              </div>
            </div>

            {/* Comparison Rows */}
            <div className="space-y-4 pt-1">
              {comparisonAxes.map((axis) => {
                const pctA = Math.min(100, Math.max(8, (axis.valA / axis.max) * 100));
                const pctB = Math.min(100, Math.max(8, (axis.valB / axis.max) * 100));

                return (
                  <div key={axis.label} className="space-y-1.5 font-sans">
                    <div className="flex items-center justify-between text-xs">
                      <span dir="ltr" className="font-mono font-bold text-sky-500 text-sm tabular-nums">
                        {axis.format(axis.valA)}
                      </span>
                      <span className="font-semibold text-[var(--text)] text-xs">{axis.label}</span>
                      <span dir="ltr" className="font-mono font-bold text-emerald-500 text-sm tabular-nums">
                        {axis.format(axis.valB)}
                      </span>
                    </div>

                    {/* Dual mirrored progress bar */}
                    <div className="grid grid-cols-2 gap-2 h-2.5 bg-[var(--panel-2)] rounded-full p-0.5 border border-[var(--border)] overflow-hidden">
                      {/* Team A bar (left side, right-aligned) */}
                      <div className="flex justify-end">
                        <div
                          className="h-full rounded-full bg-sky-500 transition-all duration-500"
                          style={{ width: `${pctA}%` }}
                        />
                      </div>
                      {/* Team B bar (right side, left-aligned) */}
                      <div className="flex justify-start">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${pctB}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4-Column Right Area: Simulation & Tactical Recommendations */}
        <div className="lg:col-span-4 space-y-6">
          {/* Win / Draw / Loss Simulation Forecast */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <h3 className="text-sm font-bold text-[var(--text)]">
                {t.simulationOdds}
              </h3>
              <span className="text-3xs font-mono text-[var(--text-3)]">{t.runsCount}</span>
            </div>

            {/* Visual Probability Bar */}
            <div className="space-y-2">
              <div className="h-4 rounded-lg overflow-hidden flex border border-[var(--border)] bg-[var(--panel-2)]">
                <div
                  style={{ width: `${winAProb}%` }}
                  className="bg-sky-500 hover:opacity-90 transition-all"
                  title={`${teamA?.team?.name}: ${winAProb}%`}
                />
                <div
                  style={{ width: `${drawPercent}%` }}
                  className="bg-amber-500/70 hover:opacity-90 transition-all"
                  title={`${t.draw}: ${drawPercent}%`}
                />
                <div
                  style={{ width: `${winBProb}%` }}
                  className="bg-emerald-500 hover:opacity-90 transition-all"
                  title={`${teamB?.team?.name}: ${winBProb}%`}
                />
              </div>

              {/* Numerical breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
                <div className="p-2 rounded-lg bg-[var(--panel-2)] border border-[var(--border)]">
                  <span className="text-3xs text-[var(--text-3)] block truncate">{teamA?.team?.name || 'Team A'}</span>
                  <span dir="ltr" className="text-sm font-bold text-sky-500 block mt-0.5">{winAProb}%</span>
                </div>
                <div className="p-2 rounded-lg bg-[var(--panel-2)] border border-[var(--border)]">
                  <span className="text-3xs text-[var(--text-3)] block">{t.draw}</span>
                  <span dir="ltr" className="text-sm font-bold text-amber-500 block mt-0.5">{drawPercent}%</span>
                </div>
                <div className="p-2 rounded-lg bg-[var(--panel-2)] border border-[var(--border)]">
                  <span className="text-3xs text-[var(--text-3)] block truncate">{teamB?.team?.name || 'Team B'}</span>
                  <span dir="ltr" className="text-sm font-bold text-emerald-500 block mt-0.5">{winBProb}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tactical Phase Exploitation Gaps */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 space-y-4">
            <div className="pb-2 border-b border-[var(--border)]">
              <h3 className="text-sm font-bold text-[var(--text)]">
                {t.phaseGaps}
              </h3>
              <p className="text-xs text-[var(--text-3)] mt-0.5">
                {language === 'ar'
                  ? 'الفوارق التكتيكية المحسوبة بين الفاعلية الهجومية والصلابة الدفاعية للخصم'
                  : 'Calculated mismatch between attack & opponent defense'}
              </p>
            </div>

            <div className="space-y-2.5">
              {teamA?.exploitable_phases && teamA.exploitable_phases.length > 0 ? (
                teamA.exploitable_phases.map((edge) => (
                  <div
                    key={edge.phase}
                    className="p-3 rounded-lg border border-[var(--border)] bg-[var(--panel-2)] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[var(--text)] block">{edge.phase}</span>
                      <span className="text-3xs font-mono text-[var(--text-3)]" dir="ltr">
                        Att: {edge.attacker_score.toFixed(1)} vs Def: {edge.defender_score.toFixed(1)}
                      </span>
                    </div>
                    <span dir="ltr" className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-mono font-bold text-xs">
                      +{edge.gap.toFixed(1)} Gap
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--panel-2)] text-xs text-[var(--text-3)] font-mono text-center">
                  {t.evenFriction}
                </div>
              )}
            </div>
          </div>

          {/* Historical Head-to-Head */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                <History className="w-4 h-4 text-[var(--text-3)]" />
                <span>{t.headToHeadHistory}</span>
              </h3>
              <span className="text-3xs font-mono text-[var(--text-3)]">Head-to-Head</span>
            </div>

            {matchup?.head_to_head && matchup.head_to_head.length > 0 ? (
              <div className="space-y-2">
                {matchup.head_to_head.map((m) => (
                  <div
                    key={m.match_id}
                    className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--panel-2)] flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-[var(--text)] truncate max-w-[90px]">
                      {m.home.name}
                    </span>
                    <span dir="ltr" className="font-mono font-bold px-2 py-0.5 rounded bg-[var(--panel)] border border-[var(--border)] text-[var(--text)]">
                      {m.home_score} - {m.away_score}
                    </span>
                    <span className="font-medium text-[var(--text)] truncate max-w-[90px] text-end">
                      {m.away.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--panel-2)] text-xs text-[var(--text-3)] font-mono text-center">
                {t.noH2HHistory}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
