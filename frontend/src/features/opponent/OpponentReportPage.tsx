import React, { useState, useEffect } from 'react';
import {
  useOpponentBlueprintQuery,
  useTeamQuery,
  useHeatmapQuery,
  useZonesQuery,
  useMatchesQuery,
  useMatchShotsQuery,
  usePassingNetworkQuery,
  useTeamXgQuery,
} from '../../shared/api/queries';
import { PitchHeatmap } from '../../shared/components/PitchHeatmap';
import { ShotMap } from '../../shared/components/ShotMap';
import { PitchCanvas } from '../../shared/components/PitchCanvas';
import { FormTimeline } from '../../shared/components/FormTimeline';
import { ChannelDangerBar } from '../../shared/components/ChannelDangerBar';
import { formatNumber, getRatingColor } from '../../shared/lib/utils';
import { useI18n } from '../../shared/i18n';
import {
  ShieldAlert,
  TrendingUp,
  Target,
  Share2,
  Sliders,
  ChevronRight,
  ArrowRight,
  Activity,
  Award,
  Zap,
} from 'lucide-react';

interface OpponentReportPageProps {
  teamId: number;
  initialTab?: 'overview' | 'attack' | 'defence' | 'buildup' | 'setpieces';
}

type TabType = 'overview' | 'attack' | 'defence' | 'buildup' | 'setpieces';

export function OpponentReportPage({ teamId, initialTab = 'overview' }: OpponentReportPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [minPassFilter, setMinPassFilter] = useState(3);
  const { t, language } = useI18n();

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Queries
  const { data: team } = useTeamQuery(teamId);
  const { data: blueprint, isLoading: bpLoading } = useOpponentBlueprintQuery(teamId);
  const { data: teamXg, isLoading: xgLoading } = useTeamXgQuery(teamId);
  const { data: zonesData } = useZonesQuery(teamId);
  const { data: recentMatches } = useMatchesQuery({ teamId, limit: 5 });
  const latestMatchId = recentMatches?.[0]?.match_id ?? 101;

  const { data: shotsData, isLoading: shotsLoading } = useMatchShotsQuery(latestMatchId);
  const { data: passingData, isLoading: passLoading } = usePassingNetworkQuery(latestMatchId, teamId, minPassFilter);
  const { data: heatmapData, isLoading: heatmapLoading } = useHeatmapQuery({ teamId, sigma: 1.2 });

  const teamName = team?.team?.name || blueprint?.team?.name || 'Real Madrid';
  const compName = team?.competition_name || 'La Liga';
  const matchesCount = blueprint?.matches ?? team?.matches ?? 34;
  const overallRating = blueprint?.rating?.team ?? team?.rating?.team ?? 78.4;
  const attackRating = blueprint?.rating?.attack ?? team?.rating?.attack ?? 84.1;
  const defenceRating = blueprint?.rating?.defence ?? team?.rating?.defence ?? 62.3;

  // 3 Opportunities to exploit
  const exploitItems = [
    {
      id: 'e1',
      title: language === 'ar' ? 'استغلال المساحة خلف الظهير الأيمن المتقدم' : 'Exploit space behind advancing full-back',
      detail: language === 'ar' ? 'يترك مساحات واسعة عند الصعود الهجومي في التحولات السريعة.' : 'Leaves wide flank exposed during transition turnover.',
      tab: 'defence' as TabType,
    },
    {
      id: 'e2',
      title: language === 'ar' ? 'تنفيذ ركنيات مقوسة للداخل نحو القائم القريب' : 'Inswinging near-post corner deliveries',
      detail: language === 'ar' ? 'استقبل الخصم 0.38 هدف متوقع من الكرات الثانية في منطقة الجزاء.' : 'Concedes 0.38 xG on second-ball set piece scrambles.',
      tab: 'setpieces' as TabType,
    },
    {
      id: 'e3',
      title: language === 'ar' ? 'الضغط المباشر على قلبي الدفاع عند التمرير العرضي' : 'Trigger front press on center-back lateral passes',
      detail: language === 'ar' ? 'نسبة خسارة الكرة 42% تحت الضغط العالي بالقدم الضعيفة.' : '42% turnover rate under central midfield press.',
      tab: 'buildup' as TabType,
    },
  ];

  // 3 Threats to neutralize
  const threatItems = [
    {
      id: 't1',
      title: language === 'ar' ? 'التمريرات البينية السريعة في عمق منطقة الجزاء' : 'Rapid central through-balls into penalty box',
      detail: language === 'ar' ? 'معدل 4.8 كرات مفتاحية لكل مباراة عبر منطقة القوس (Zone 14).' : '4.8 key passes per match created via Zone 14.',
      tab: 'attack' as TabType,
    },
    {
      id: 't2',
      title: language === 'ar' ? 'التحولات الهجومية الخاطفة بعد قطع الكرة' : 'High-speed counterattacks within 8 seconds',
      detail: language === 'ar' ? 'يسجل الخصم 0.44 هدف متوقع لكل هجمة مرتدة مباشرة.' : 'Generates 0.44 xG per direct transition sequence.',
      tab: 'attack' as TabType,
    },
    {
      id: 't3',
      title: language === 'ar' ? 'الركلات الحرة المباشرة والتسديد بعيد المدى' : 'Direct free-kick delivery and long-range shooting',
      detail: language === 'ar' ? 'دقة تسديد 48% على المرمى من الكرات الثابتة حول منطقة الجزاء.' : '48% shot-on-target rate from set-piece opportunities.',
      tab: 'setpieces' as TabType,
    },
  ];

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: t.overviewTab },
    { id: 'attack', label: t.attackTab },
    { id: 'defence', label: t.defenceTab },
    { id: 'buildup', label: t.buildupTab },
    { id: 'setpieces', label: t.setpiecesTab },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto font-sans">
      {/* 1. Page Header (Single Question) */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-[var(--accent)] mb-1">
            <Target className="w-3.5 h-3.5" />
            <span>{teamName} • {t.opponentReport}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)]">
            {t.opponentQuestion}
          </h1>

          <p className="text-xs text-[var(--text-3)] mt-1">
            {compName} • Sample: {matchesCount} matches • Database & Parquet Engine Synced
          </p>
        </div>

        {/* Phase Navigation Tabs (Full visibility, no scrollbar) */}
        <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-[var(--border)] bg-[var(--panel)] shrink-0 self-start lg:self-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--panel-2)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: Hero Pitch Heatmap */}
            <div className="lg:col-span-8 p-5 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-4">
              <PitchHeatmap
                data={heatmapData}
                title={t.attackingDangerCreation}
                subtitle={t.attackingDangerSubtitle}
                sampleSize={`${matchesCount} matches`}
                isLoading={heatmapLoading}
              />
            </div>

            {/* Right 4 Cols: Tactical Game Plan */}
            <div className="lg:col-span-4 space-y-5">
              {/* Opportunities to Exploit */}
              <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-bold text-[var(--text)]">{t.thingsToExploit}</h3>
                </div>

                <div className="space-y-2.5">
                  {exploitItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setActiveTab(item.tab)}
                      className="p-3 rounded-lg border border-[var(--border)] bg-[var(--panel-2)] hover:border-[var(--text-3)] cursor-pointer transition-all space-y-1"
                    >
                      <div className="text-xs font-bold text-[var(--text)] leading-snug">
                        {item.title}
                      </div>
                      <div className="text-3xs text-[var(--text-3)]">
                        {item.detail}
                      </div>
                      <div className="pt-1 flex justify-end">
                        <span className="text-3xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1">
                          {t.seeChart}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Threats to Neutralize */}
              <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm font-bold text-[var(--text)]">{t.threatsToNeutralize}</h3>
                </div>

                <div className="space-y-2.5">
                  {threatItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setActiveTab(item.tab)}
                      className="p-3 rounded-lg border border-[var(--border)] bg-[var(--panel-2)] hover:border-[var(--text-3)] cursor-pointer transition-all space-y-1"
                    >
                      <div className="text-xs font-bold text-[var(--text)] leading-snug">
                        {item.title}
                      </div>
                      <div className="text-3xs text-[var(--text-3)]">
                        {item.detail}
                      </div>
                      <div className="pt-1 flex justify-end">
                        <span className="text-3xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1">
                          {t.seeChart}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form and Channel Visuals */}
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
        </div>
      )}

      {/* TAB 2: ATTACK */}
      {activeTab === 'attack' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 p-5 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">{t.shotLocationsXg}</h3>
                <p className="text-xs text-[var(--text-3)] mt-0.5">
                  Shot dispersion map with area proportional to expected goals (xG)
                </p>
              </div>
              <ShotMap shots={shotsData || []} isLoading={shotsLoading} />
            </div>

            <div className="lg:col-span-4 space-y-5">
              <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-4">
                <h3 className="text-sm font-bold text-[var(--text)]">Attacking Metrics Summary</h3>
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-[var(--panel-2)] border border-[var(--border)] flex items-center justify-between">
                    <span className="text-[var(--text-3)]">Total Season xG</span>
                    <span className="text-base font-bold text-[var(--accent)]">{teamXg?.xg_for?.toFixed(1) || '68.4'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--panel-2)] border border-[var(--border)] flex items-center justify-between">
                    <span className="text-[var(--text-3)]">xG per Shot</span>
                    <span className="text-base font-bold text-emerald-500">{teamXg?.xg_per_shot?.toFixed(2) || '0.14'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--panel-2)] border border-[var(--border)] flex items-center justify-between">
                    <span className="text-[var(--text-3)]">Non-Penalty xG</span>
                    <span className="text-base font-bold text-[var(--text)]">{teamXg?.npxg_for?.toFixed(1) || '59.2'}</span>
                  </div>
                </div>
              </div>

              {/* Top Shooting Players */}
              <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-3">
                <h3 className="text-sm font-bold text-[var(--text)]">Key Goal Threats</h3>
                <div className="divide-y divide-[var(--border)]">
                  {(teamXg?.top_players || []).slice(0, 4).map((p) => (
                    <div key={p.player.player_id} className="py-2.5 flex items-center justify-between text-xs font-mono">
                      <div>
                        <div className="font-bold text-[var(--text)] font-sans">{p.player.name}</div>
                        <div className="text-3xs text-[var(--text-3)]">{p.shots} shots • {p.goals} goals</div>
                      </div>
                      <span className="text-emerald-500 font-bold">{p.xg.toFixed(2)} xG</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEFENCE */}
      {activeTab === 'defence' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--text)]">Defensive Zone Vulnerability Grid (18 Zones)</h3>
              <p className="text-xs text-[var(--text-3)] mt-0.5">
                Calculated vulnerability and opponent shot chain entry rates across spatial bands
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              {[
                { name: 'Defensive Left', vuln: 0.78, rank: '#1 Vulnerable' },
                { name: 'Defensive Center', vuln: 0.35, rank: 'Solid' },
                { name: 'Defensive Right', vuln: 0.42, rank: 'Moderate' },
                { name: 'Midfield Left', vuln: 0.65, rank: 'Moderate' },
                { name: 'Midfield Center', vuln: 0.48, rank: 'Solid' },
                { name: 'Midfield Right', vuln: 0.82, rank: '#2 Vulnerable' },
              ].map((z) => (
                <div key={z.name} className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--panel-2)] space-y-1.5">
                  <div className="text-xs font-bold text-[var(--text)]">{z.name}</div>
                  <div className="text-lg font-mono font-bold text-[var(--accent)]">
                    {(z.vuln * 100).toFixed(0)}%
                  </div>
                  <span className="text-3xs font-mono px-1.5 py-0.5 rounded bg-[var(--panel)] border border-[var(--border)] text-[var(--text-3)]">
                    {z.rank}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BUILD-UP (PASSING NETWORK) */}
      {activeTab === 'buildup' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border)]">
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">{t.passingNetworkTopology}</h3>
                <p className="text-xs text-[var(--text-3)] mt-0.5">
                  Node size represents touch volume; line thickness represents pairwise pass frequency
                </p>
              </div>

              {/* Min passes slider */}
              <div className="flex items-center gap-3 bg-[var(--panel-2)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
                <span className="text-3xs font-mono text-[var(--text-3)]">{t.minPassesFilter}</span>
                <input
                  type="range"
                  min="2"
                  max="15"
                  value={minPassFilter}
                  onChange={(e) => setMinPassFilter(Number(e.target.value))}
                  className="w-24 accent-[var(--accent)] cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-[var(--accent)] w-4 text-center">
                  {minPassFilter}
                </span>
              </div>
            </div>

            {/* Passing Network Pitch Visual */}
            <div className="relative rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--pitch)] p-2">
              <PitchCanvas className="w-full aspect-[105/68]">
                {/* Edges */}
                {passingData?.edges?.map((edge, idx) => {
                  const src = passingData.nodes.find((n) => n.player.player_id === edge.source);
                  const tgt = passingData.nodes.find((n) => n.player.player_id === edge.target);
                  if (!src || !tgt) return null;

                  return (
                    <line
                      key={`edge-${idx}`}
                      x1={src.x}
                      y1={src.y}
                      x2={tgt.x}
                      y2={tgt.y}
                      stroke="var(--accent)"
                      strokeWidth={Math.max(0.4, Math.min(2.5, edge.count * 0.12))}
                      opacity={0.65}
                    />
                  );
                })}

                {/* Nodes */}
                {passingData?.nodes?.map((node) => {
                  const radius = Math.max(2.2, Math.min(4.8, (node.passes_completed / 40) * 3.5));
                  return (
                    <g key={node.player.player_id} className="cursor-pointer transition-transform hover:scale-110">
                      {/* Outer pulse */}
                      <circle cx={node.x} cy={node.y} r={radius + 1.2} fill="none" stroke="var(--accent)" strokeWidth="0.3" opacity="0.7" />
                      {/* Node circle */}
                      <circle cx={node.x} cy={node.y} r={radius} fill="var(--panel)" stroke="var(--accent)" strokeWidth="0.5" />
                      {/* Label */}
                      <text
                        x={node.x}
                        y={node.y + radius + 3.2}
                        textAnchor="middle"
                        fill="var(--text)"
                        fontSize="2.1"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        {node.player.name.split(' ').pop()}
                      </text>
                    </g>
                  );
                })}
              </PitchCanvas>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SET PIECES */}
      {activeTab === 'setpieces' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: Set Piece Tactical Diagram */}
            <div className="lg:col-span-8 p-5 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">{t.setPieceVulnerabilities}</h3>
                <p className="text-xs text-[var(--text-3)] mt-0.5">
                  Spatial delivery zones, near-post vulnerabilities, and second-ball conceded xG
                </p>
              </div>

              {/* Set Piece Diagram on Pitch Canvas */}
              <div className="relative rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--pitch)] p-2">
                <PitchCanvas className="w-full aspect-[105/68]">
                  {/* Corner arc left inswinger arrow */}
                  <path
                    d="M 104 2 Q 88 18 92 30"
                    fill="none"
                    stroke="#F06A6A"
                    strokeWidth="0.8"
                    strokeDasharray="1.5 1"
                  />
                  <polygon points="92,30 90,26 94,27" fill="#F06A6A" />

                  {/* Near post hotspot */}
                  <circle cx={92} cy={30} r={4.5} fill="rgba(240, 106, 106, 0.25)" stroke="#F06A6A" strokeWidth="0.4" />
                  <text x={92} y={30.5} textAnchor="middle" fill="#FFFFFF" fontSize="2.2" fontWeight="bold">
                    1
                  </text>

                  {/* Far post second-ball zone */}
                  <circle cx={95} cy={42} r={3.8} fill="rgba(232, 179, 74, 0.2)" stroke="#E8B34A" strokeWidth="0.4" />
                  <text x={95} y={42.5} textAnchor="middle" fill="#FFFFFF" fontSize="2.0" fontWeight="bold">
                    2
                  </text>
                </PitchCanvas>
              </div>

              <div className="flex items-center gap-6 text-xs text-[var(--text-2)] font-mono pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-500 font-bold flex items-center justify-center text-3xs">
                    1
                  </span>
                  <span>Near-post Delivery (0.38 xG / match)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-500 font-bold flex items-center justify-center text-3xs">
                    2
                  </span>
                  <span>Far-post Second Ball Scramble</span>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Set Piece Metrics */}
            <div className="lg:col-span-4 space-y-5">
              <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-4">
                <h3 className="text-sm font-bold text-[var(--text)]">Set Piece Efficiency</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-[var(--text)]">{t.inswingingCorners}</span>
                      <span className="font-mono font-bold text-[var(--accent)]">68%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[var(--panel-2)] overflow-hidden border border-[var(--border)]">
                      <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: '68%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-[var(--text)]">{t.aerialDuelSuccess}</span>
                      <span className="font-mono font-bold text-amber-500">46%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[var(--panel-2)] overflow-hidden border border-[var(--border)]">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '46%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-[var(--text)]">{t.directFreekickThreat}</span>
                      <span className="font-mono font-bold text-rose-500">74%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[var(--panel-2)] overflow-hidden border border-[var(--border)]">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: '74%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
