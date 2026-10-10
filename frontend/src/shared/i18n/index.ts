import { create } from 'zustand';

export type Language = 'en' | 'ar';

export interface Translations {
  // Navigation & Brand
  brandName: string;
  brandSubtitle: string;
  scoutingModules: string;
  home: string;
  opponentReport: string;
  squadRatings: string;
  playerScouting: string;
  matchupSimulator: string;
  settings: string;
  styleGuide: string;

  // Header & Controls
  scope: string;
  allCompetitions: string;
  quickSearch: string;
  liveDb: string;
  dbDisconnected: string;
  themeToggle: string;
  language: string;

  // Home Page
  nextMatch: string;
  homeHeadline: string;
  homeQuestion: string;
  fullScoutReport: string;
  simulateMatchup: string;
  attackingDangerCreation: string;
  attackingDangerSubtitle: string;
  keyMatchInsights: string;
  clickToHighlight: string;
  seeChart: string;
  leagueBenchmarkForm: string;
  viewAllStandings: string;
  attackShareByChannel: string;
  attackShareSubtitle: string;
  leftFlank: string;
  centralChannel: string;
  rightFlank: string;
  focus: string;
  opponentRecentForm: string;
  recentFormSubtitle: string;
  homeMatch: string;
  awayMatch: string;

  // Opponent Report
  overviewTab: string;
  attackTab: string;
  defenceTab: string;
  buildupTab: string;
  setpiecesTab: string;
  opponentQuestion: string;
  thingsToExploit: string;
  threatsToNeutralize: string;
  tacticalBlueprint: string;
  shotLocationsXg: string;
  passingNetworkTopology: string;
  minPassesFilter: string;
  setPieceVulnerabilities: string;
  inswingingCorners: string;
  outswingingCorners: string;
  aerialDuelSuccess: string;
  directFreekickThreat: string;

  // Squad Ratings
  squadRatingsQuestion: string;
  attackVsDefenceTitle: string;
  rankedStandings: string;
  quadrantTopRight: string;
  quadrantTopLeft: string;
  quadrantBottomRight: string;
  quadrantBottomLeft: string;

  // Player Scouting
  playerScoutingQuestion: string;
  scoutingCandidates: string;
  allPositions: string;
  forwards: string;
  midfielders: string;
  defenders: string;
  goalkeepers: string;
  scoutingVerdict: string;

  // Matchup Simulator
  matchupQuestion: string;
  teamA: string;
  teamB: string;
  yourTeamFocus: string;
  opponentSquad: string;
  ratingDelta: string;
  simulationForecast: string;
  primaryEdge: string;
  criticalZone: string;
  battlegroundPitch: string;
  tacticalBreakdown: string;
  phaseGaps: string;
  headToHeadHistory: string;
  noH2HHistory: string;
  possession: string;
  highPress: string;
  directSpeed: string;
  draw: string;
  simulationOdds: string;
  runsCount: string;
  attackingDirection: string;
  vulnerability: string;
  evenFriction: string;

  // Settings & System
  settingsTitle: string;
  settingsSubtitle: string;
  themeChoice: string;
  themeLight: string;
  themeDark: string;
  languageChoice: string;
  systemHealth: string;
  pingApiHealth: string;
  databaseStatus: string;
  engineVersion: string;
  latency: string;
  matchesProcessed: string;
  eventActions: string;
  scoutedAthletes: string;
  calibratedClubs: string;

  // Common UI
  rank: string;
  club: string;
  rating: string;
  attack: string;
  defence: string;
  matches: string;
  shots: string;
  goals: string;
  xg: string;
  xa: string;
  minutes: string;
  role: string;
  inspect: string;
  close: string;
  chanceCreation: string;
  progression: string;
  retention: string;
  dossier: string;
  percentileProfile: string;
  discoverView: string;
  tableView: string;
  xgTrendChart: string;
  matchCards: string;
  fullTable: string;
  xgCreated: string;
  xgConceded: string;
  venue: string;
  differential: string;
  retryQuery: string;
  noRecords: string;
  loading: string;
  less: string;
  more: string;
}

const en: Translations = {
  brandName: 'Tactical OS',
  brandSubtitle: 'Match Intelligence Platform',
  scoutingModules: 'Scouting Modules',
  home: 'Home',
  opponentReport: 'Opponent Report',
  squadRatings: 'Squad Ratings',
  playerScouting: 'Player Scouting',
  matchupSimulator: 'Matchup Simulator',
  settings: 'Settings',
  styleGuide: 'Style Guide',

  scope: 'Scope:',
  allCompetitions: 'All Competitions',
  quickSearch: 'Quick search (⌘K)...',
  liveDb: 'Live DB',
  dbDisconnected: 'DB Offline',
  themeToggle: 'Toggle theme',
  language: 'Language',

  nextMatch: 'NEXT MATCH',
  homeHeadline: 'Who do we play next, and what are the 3 things to do about it?',
  homeQuestion: 'Who do we play next, and what are the 3 things to do about it?',
  fullScoutReport: 'Full Scout Report',
  simulateMatchup: 'Simulate Matchup',
  attackingDangerCreation: 'Attacking Danger Creation',
  attackingDangerSubtitle: 'Smoothed spatial density of key passes and chance-creation actions',
  keyMatchInsights: 'Key Match Insights',
  clickToHighlight: 'Click to highlight',
  seeChart: 'See visual →',
  leagueBenchmarkForm: 'League Benchmark Form',
  viewAllStandings: 'View all standings',
  attackShareByChannel: 'Attack Share by Channel',
  attackShareSubtitle: 'Share of opponent final-third entries and shot-creating actions',
  leftFlank: 'Left Flank',
  centralChannel: 'Central Channel',
  rightFlank: 'Right Flank',
  focus: 'Focus',
  opponentRecentForm: 'Opponent Recent Form',
  recentFormSubtitle: 'Last 5 competitive matches with scorelines and expected goals (xG)',
  homeMatch: 'vs',
  awayMatch: '@',

  overviewTab: 'Overview',
  attackTab: 'Attack',
  defenceTab: 'Defence',
  buildupTab: 'Build-up',
  setpiecesTab: 'Set Pieces',
  opponentQuestion: 'How does the opponent attack, and where are they vulnerable?',
  thingsToExploit: 'Opportunities to Exploit',
  threatsToNeutralize: 'Threats to Neutralize',
  tacticalBlueprint: 'Tactical Blueprint & Tendencies',
  shotLocationsXg: 'Shot Locations & Expected Goals (xG)',
  passingNetworkTopology: 'Passing Network & Linkages',
  minPassesFilter: 'Min passes:',
  setPieceVulnerabilities: 'Set Piece Structure & Aerial Vulnerability',
  inswingingCorners: 'Inswinging Corners',
  outswingingCorners: 'Outswinging Corners',
  aerialDuelSuccess: 'Aerial Duel Win Rate',
  directFreekickThreat: 'Direct Free Kick Threat',

  squadRatingsQuestion: 'Where does each squad rank on tactical effectiveness?',
  attackVsDefenceTitle: 'Attack vs. Defence Quadrant',
  rankedStandings: 'Ranked League Standings',
  quadrantTopRight: 'Elite Balanced',
  quadrantTopLeft: 'Attack Heavy',
  quadrantBottomRight: 'Defensive Block',
  quadrantBottomLeft: 'Underperforming',

  playerScoutingQuestion: 'Which players fit our tactical system and recruitment profile?',
  scoutingCandidates: 'Scouted Player Candidates',
  allPositions: 'All Positions',
  forwards: 'Forwards',
  midfielders: 'Midfielders',
  defenders: 'Defenders',
  goalkeepers: 'Goalkeepers',
  scoutingVerdict: 'Scouting Verdict',

  matchupQuestion: 'Who wins the key battles, and how do we gain the edge?',
  teamA: 'Your Team',
  teamB: 'Opponent Team',
  yourTeamFocus: 'Your Team (Tactical Focus)',
  opponentSquad: 'Opponent Squad',
  ratingDelta: 'Rating Delta',
  simulationForecast: 'Simulation Forecast',
  primaryEdge: 'Primary Edge',
  criticalZone: 'Critical Zone',
  battlegroundPitch: 'Tactical Battleground & Vulnerability Sectors',
  tacticalBreakdown: 'Tactical Attribute Breakdown',
  phaseGaps: 'Phase Exploitation Gaps',
  headToHeadHistory: 'Head-to-Head History',
  noH2HHistory: 'No recent matches recorded in current season.',
  possession: 'Possession Share',
  highPress: 'High Press Intensity',
  directSpeed: 'Direct Speed',
  draw: 'Draw',
  simulationOdds: 'Match Simulation Odds',
  runsCount: '5,000 Runs',
  attackingDirection: 'Attacking Direction: Left → Right',
  vulnerability: 'Vulnerability',
  evenFriction: 'Even tactical friction across all match phases.',

  settingsTitle: 'Configuration & Engine Telemetry',
  settingsSubtitle: 'Manage visual preferences, multilingual layout, and live backend telemetry.',
  themeChoice: 'Theme & Appearance',
  themeLight: 'Light Mode',
  themeDark: 'Dark Mode',
  languageChoice: 'Language & Localization',
  systemHealth: 'Backend Infrastructure & Telemetry',
  pingApiHealth: 'Ping API Health',
  databaseStatus: 'Database Connection',
  engineVersion: 'Tactical Engine',
  latency: 'Latency',
  matchesProcessed: 'Matches Processed',
  eventActions: 'Event Actions (SPADL)',
  scoutedAthletes: 'Scouted Players',
  calibratedClubs: 'Calibrated Clubs',

  rank: '#',
  club: 'Club',
  rating: 'Rating',
  attack: 'Attack',
  defence: 'Defence',
  matches: 'Matches',
  shots: 'Shots',
  goals: 'Goals',
  xg: 'xG',
  xa: 'xA',
  minutes: 'Minutes',
  role: 'Role',
  inspect: 'Inspect',
  close: 'Close',
  chanceCreation: 'Chance Creation',
  progression: 'Progression',
  retention: 'Retention / Security',
  dossier: 'Scouting Dossier',
  percentileProfile: 'Positional Percentile Profile',
  discoverView: 'Discover',
  tableView: 'Table View',
  xgTrendChart: 'xG Performance Trend',
  matchCards: 'Match Cards',
  fullTable: 'Full Match Log',
  xgCreated: 'xG Created',
  xgConceded: 'xG Conceded',
  venue: 'Venue',
  differential: 'xG Delta',
  retryQuery: 'Retry',
  noRecords: 'No records found',
  loading: 'Loading analytics...',
  less: 'Less',
  more: 'More',
};

const ar: Translations = {
  brandName: 'نظام التحليل التكتيكي',
  brandSubtitle: 'منصة استخبارات المباريات والكشافة',
  scoutingModules: 'وحدات التحليل والتكتيك',
  home: 'الرئيسية',
  opponentReport: 'تقرير الخصم',
  squadRatings: 'تقييم الفرق',
  playerScouting: 'كشافة اللاعبين',
  matchupSimulator: 'محاكي المواجهة',
  settings: 'الإعدادات',
  styleGuide: 'دليل التصميم',

  scope: 'النطاق:',
  allCompetitions: 'جميع الدوريات والبطولات',
  quickSearch: 'بحث سريع (⌘K)...',
  liveDb: 'قاعدة البيانات متصلة',
  dbDisconnected: 'قاعدة البيانات غير متصلة',
  themeToggle: 'تبديل المظهر',
  language: 'اللغة',

  nextMatch: 'المباراة القادمة',
  homeHeadline: 'من سنواجه في المباراة القادمة، وما هي الخطوات الثلاث الحاسمة؟',
  homeQuestion: 'من سنواجه في المباراة القادمة، وما هي الخطوات الثلاث الحاسمة؟',
  fullScoutReport: 'تقرير الكشافة الكامل',
  simulateMatchup: 'محاكاة المواجهة التكتيكية',
  attackingDangerCreation: 'خريطة صناعة الخطورة الهجومية',
  attackingDangerSubtitle: 'الكثافة المكانية للتمريرات الحاسمة وفرص التسجيل الخطيرة',
  keyMatchInsights: 'أهم الملاحظات والقرارات التكتيكية',
  clickToHighlight: 'انقر لتحديد المنطقة على الملعب',
  seeChart: 'عرض المخطط التكتيكي ←',
  leagueBenchmarkForm: 'مقارنة أداء أندية الدوري',
  viewAllStandings: 'عرض جدول الترتيب الكامل',
  attackShareByChannel: 'توزيع الهجوم عبر الممرات',
  attackShareSubtitle: 'نسبة الدخول للثلث الهجومي وصناعة الفرص عبر الممرات',
  leftFlank: 'الجناح الأيسر',
  centralChannel: 'العمق / الممر المركزي',
  rightFlank: 'الجناح الأيمن',
  focus: 'تركيز',
  opponentRecentForm: 'نتائج المباريات الأخيرة للخصم',
  recentFormSubtitle: 'آخر 5 مباريات رسمية مع نتائج الأهداف والأهداف المتوقعة xG',
  homeMatch: 'داخل الأرض',
  awayMatch: 'خارج الأرض',

  overviewTab: 'نظرة عامة',
  attackTab: 'الهجوم',
  defenceTab: 'الدفاع',
  buildupTab: 'بناء اللعب',
  setpiecesTab: 'الكرات الثابتة',
  opponentQuestion: 'كيف يهاجم الخصم، وأين تكمن نقاط الضعف التكتيكية في صفوفه؟',
  thingsToExploit: 'نقاط ضعف للتركيز عليها واستغلالها',
  threatsToNeutralize: 'مصادر الخطورة الواجب تحييدها',
  tacticalBlueprint: 'المخطط التكتيكي وتوجهات اللعب',
  shotLocationsXg: 'خريطة التسديدات والأهداف المتوقعة (xG)',
  passingNetworkTopology: 'شبكة التمرير والترابط المكاني',
  minPassesFilter: 'الحد الأدنى للتمريرات:',
  setPieceVulnerabilities: 'هيكل الكرات الثابتة ونقاط الضعف الهوائية',
  inswingingCorners: 'الركنيات الملتفة للداخل',
  outswingingCorners: 'الركنيات الملتفة للخارج',
  aerialDuelSuccess: 'نسبة الفوز بالالتحامات الهوائية',
  directFreekickThreat: 'خطورة الركلات الحرة المباشرة',

  squadRatingsQuestion: 'كيف تترتب أندية الدوري من حيث الفاعلية الهجومية والصلابة الدفاعية؟',
  attackVsDefenceTitle: 'مخطط الفاعلية الهجومية مقابل الصلابة الدفاعية',
  rankedStandings: 'ترتيب أندية الدوري التكتيكي',
  quadrantTopRight: 'نخبة متوازنة',
  quadrantTopLeft: 'قوة هجومية عالية',
  quadrantBottomRight: 'تكتل دفاعي صلب',
  quadrantBottomLeft: 'أداء غير مستقر',

  playerScoutingQuestion: 'من هم اللاعبون الأنسب لنظامنا التكتيكي وأولويات التعاقد؟',
  scoutingCandidates: 'قائمة اللاعبين المرشحين للكشف والمتابعة',
  allPositions: 'جميع المراكز',
  forwards: 'الهجوم',
  midfielders: 'الوسط',
  defenders: 'الدفاع',
  goalkeepers: 'حراس المرمى',
  scoutingVerdict: 'التقرير التقييمي للكشاف',

  matchupQuestion: 'من سيكسب الصراعات المفصلية، وكيف نحسم التفوق التكتيكي؟',
  teamA: 'فريقنا',
  teamB: 'فريق الخصم',
  yourTeamFocus: 'فريقنا (التركيز التكتيكي)',
  opponentSquad: 'تشكيلة الخصم',
  ratingDelta: 'فارق التقييم',
  simulationForecast: 'توقعات محاكاة المباراة',
  primaryEdge: 'التفوق التكتيكي الأساسي',
  criticalZone: 'المنطقة الحاسمة',
  battlegroundPitch: 'خريطة ساحات الصراع والمساحات القابلة للاختراق',
  tacticalBreakdown: 'مقارنة المؤشرات التكتيكية بين الفريقين',
  phaseGaps: 'فوارق مراحل اللعب القابلة للاستغلال',
  headToHeadHistory: 'تاريخ المواجهات المباشرة',
  noH2HHistory: 'لا توجد مواجهات مباشرة سابقة في الموسم الحالي.',
  possession: 'نسبة الاستحواذ',
  highPress: 'حدة الضغط العالي',
  directSpeed: 'سرعة اللعب المباشر',
  draw: 'تعادل',
  simulationOdds: 'احتمالات محاكاة المباراة',
  runsCount: '5000 تشغيل محاكاة',
  attackingDirection: 'اتجاه الهجوم: من اليسار إلى اليمين',
  vulnerability: 'نسبة الضعف',
  evenFriction: 'تكافؤ تكتيكي عبر جميع مراحل اللعب.',

  settingsTitle: 'إعدادات النظام والاتصال المباشر',
  settingsSubtitle: 'إدارة المظهر البصري، وخيارات اللغة، والتحقق من صحة الاتصال بالخادم.',
  themeChoice: 'المظهر ووضع العرض',
  themeLight: 'الوضع الفاتح',
  themeDark: 'الوضع الداكن',
  languageChoice: 'لغة الواجهة',
  systemHealth: 'حالة البنية التحتية والاتصال المباشر',
  pingApiHealth: 'فحص الاتصال بالخادم',
  databaseStatus: 'اتصال قاعدة البيانات',
  engineVersion: 'محرك التحليل التكتيكي',
  latency: 'زمن الاستجابة',
  matchesProcessed: 'المباريات المحللة',
  eventActions: 'الأحداث التكتيكية المسجلة (SPADL)',
  scoutedAthletes: 'اللاعبون المتاحون للكشافة',
  calibratedClubs: 'الأندية المعتمدة في النظام',

  rank: '#',
  club: 'النادي',
  rating: 'التقييم',
  attack: 'الهجوم',
  defence: 'الدفاع',
  matches: 'المباريات',
  shots: 'التسديدات',
  goals: 'الأهداف',
  xg: 'xG',
  xa: 'xA',
  minutes: 'الدقائق',
  role: 'المركز',
  inspect: 'فحص وتدقيق',
  close: 'إغلاق',
  chanceCreation: 'صناعة الفرص',
  progression: 'التدرج بالكرة',
  retention: 'الاحتفاظ والأمان',
  dossier: 'ملف الكشافة التفصيلي',
  percentileProfile: 'المظهر المئوي للمركز',
  discoverView: 'استكشاف',
  tableView: 'عرض الجدول',
  xgTrendChart: 'مخطط مسار الأداء xG',
  matchCards: 'بطاقات المباريات',
  fullTable: 'سجل المباريات الكامل',
  xgCreated: 'الأهداف المتوقعة المصنوعة',
  xgConceded: 'الأهداف المتوقعة المستقبلة',
  venue: 'الملعب',
  differential: 'فارق xG',
  retryQuery: 'إعادة المحاولة',
  noRecords: 'لا توجد سجلات مطابقة',
  loading: 'جاري تحميل البيانات التكتيكية...',
  less: 'أقل',
  more: 'أكثر',
};

const dictionaries: Record<Language, Translations> = { en, ar };

interface I18nStore {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
}

export const useI18n = create<I18nStore>((set) => {
  const savedLang = (typeof localStorage !== 'undefined' ? localStorage.getItem('tactical_lang') : null) as Language || 'en';
  if (typeof document !== 'undefined') {
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLang;
  }

  return {
    language: savedLang,
    t: dictionaries[savedLang] || en,
    setLanguage: (lang: Language) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('tactical_lang', lang);
      }
      if (typeof document !== 'undefined') {
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
      }
      set({ language: lang, t: dictionaries[lang] || en });
    },
  };
});
