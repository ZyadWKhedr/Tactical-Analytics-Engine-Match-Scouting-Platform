import { create } from 'zustand';

export type Language = 'en' | 'ar';

export interface Translations {
  // Navigation & Brand
  brandName: string;
  brandSubtitle: string;
  scoutingModules: string;
  executiveHome: string;
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
  pgActive: string;
  dbDisconnected: string;
  themeToggle: string;
  language: string;
  simpleView: string;
  advancedView: string;

  // Home Page & Readability Rules
  databaseMatches: string;
  eventCorpus: string;
  activeCompetitions: string;
  scoutedPlayers: string;
  currentFocusOpponent: string;
  sample: string;
  overallRating: string;
  attackPower: string;
  defenceRating: string;
  dangerCreated: string;
  zoneResistance: string;
  keyVulnerability: string;
  primaryStrength: string;
  fullBlueprintReport: string;
  squadRatingsLeaderboard: string;
  viewFullTable: string;
  viewAll: string;
  dataPipelineHealth: string;
  analystWorkflow: string;
  analystWorkflowDesc: string;
  keyTakeaways: string;
  howToReadThis: string;

  // Opponent Report
  playstyleFingerprint: string;
  playstyle: string;
  conf: string;
  strengths: string;
  weaknesses: string;
  situationalPressTriggers: string;
  pressBlindSpots: string;
  keyPlayerThreats: string;
  tacticalGamePlan: string;
  pitchZones: string;
  shotMaps: string;
  passingNetwork: string;
  blueprintTendencies: string;
  vulnerabilityIndex: string;

  // Matchup Simulator
  teamA: string;
  teamB: string;
  h2hSim: string;
  ratingDelta: string;
  phaseExploitation: string;
  tacticalMatchupSim: string;
  headToHeadHistory: string;
  noH2HHistory: string;

  // Settings & System
  systemHealth: string;
  databaseStatus: string;
  engineVersion: string;
  latency: string;
  themeChoice: string;
  themeLight: string;
  themeDark: string;
  languageChoice: string;

  // Common UI
  rank: string;
  club: string;
  rating: string;
  attack: string;
  defence: string;
  archetype: string;
  scout: string;
  matches: string;
  shots: string;
  goals: string;
  xg: string;
  xa: string;
  minutes: string;
  role: string;
  retryQuery: string;
  noRecords: string;
  loading: string;
}

const en: Translations = {
  brandName: 'TACTICAL OS',
  brandSubtitle: 'Match Intelligence Archive',
  scoutingModules: 'Scouting Modules',
  executiveHome: 'Executive Home',
  opponentReport: 'Opponent Report',
  squadRatings: 'Squad Ratings',
  playerScouting: 'Player Scouting',
  matchupSimulator: 'Matchup Simulator',
  settings: 'Settings',
  styleGuide: 'Style Guide',

  scope: 'Scope:',
  allCompetitions: 'All Competitions',
  quickSearch: 'Quick search (⌘K)...',
  pgActive: 'Database Connected',
  dbDisconnected: 'DB Offline',
  themeToggle: 'Toggle light/dark theme',
  language: 'Language',
  simpleView: 'Simple View',
  advancedView: 'Advanced View',

  databaseMatches: 'Database Fixtures',
  eventCorpus: 'SPADL Action Corpus',
  activeCompetitions: 'Competitions',
  scoutedPlayers: 'Scouted Players',
  currentFocusOpponent: 'Featured Opponent',
  sample: 'Sample',
  overallRating: 'Overall Rating',
  attackPower: 'Attacking Threat',
  defenceRating: 'Defensive Resilience',
  dangerCreated: 'Danger Created',
  zoneResistance: 'Spatial Resistance',
  keyVulnerability: 'Primary Vulnerability',
  primaryStrength: 'Key Tactical Strength',
  fullBlueprintReport: 'Open Complete Dossier',
  squadRatingsLeaderboard: 'Squad Efficiency Leaderboard',
  viewFullTable: 'View full leaderboard',
  viewAll: 'View all',
  dataPipelineHealth: 'Archive Infrastructure',
  analystWorkflow: 'Coach & Scout Directive',
  analystWorkflowDesc: 'Curated 30-second match preparation insights. Tap figures to inspect underlying tracking telemetry.',
  keyTakeaways: 'Key Takeaways & Tactical Brief',
  howToReadThis: 'How to read this figure',

  playstyleFingerprint: 'Tactical Playstyle DNA',
  playstyle: 'Playstyle',
  conf: 'conf',
  strengths: 'Tactical Strengths (Top 25%)',
  weaknesses: 'Defensive Fault Lines (Bottom 30%)',
  situationalPressTriggers: 'Situational Pressing Triggers',
  pressBlindSpots: 'Pressing Blind Spots',
  keyPlayerThreats: 'Key Player Threats',
  tacticalGamePlan: 'Recommended Tactical Game Plan',
  pitchZones: '6×5 Pitch Zone Breakdown',
  shotMaps: 'Shot Locations & Scoring Probability',
  passingNetwork: 'Passing Network & Distribution',
  blueprintTendencies: 'Tactical Tendencies & Exploitation',
  vulnerabilityIndex: 'Vulnerability Index',

  teamA: 'Team A (Home / Focus)',
  teamB: 'Team B (Opponent)',
  h2hSim: 'H2H Simulation',
  ratingDelta: 'Rating Edge',
  phaseExploitation: 'Phase Exploitation Vectors',
  tacticalMatchupSim: 'Tactical Matchup Simulation',
  headToHeadHistory: 'Historical Head-to-Head Records',
  noH2HHistory: 'No prior head-to-head fixtures recorded in this corpus window.',

  systemHealth: 'System & Database Health',
  databaseStatus: 'PostgreSQL Relational Storage',
  engineVersion: 'Analytics Engine Core',
  latency: 'Live Latency',
  themeChoice: 'Visual Theme',
  themeLight: 'Light (Warm Paper)',
  themeDark: 'Dark (Warm Ink)',
  languageChoice: 'Interface Language',

  rank: '#',
  club: 'Club',
  rating: 'Rating',
  attack: 'Attack',
  defence: 'Defence',
  archetype: 'Archetype',
  scout: 'Inspect',
  matches: 'Matches',
  shots: 'Shots',
  goals: 'Goals',
  xg: 'xG (Scoring Prob.)',
  xa: 'xA (Assist Prob.)',
  minutes: 'Minutes',
  role: 'Role',
  retryQuery: 'Retry query',
  noRecords: 'No archive records found',
  loading: 'Computing tactical models...',
};

const ar: Translations = {
  brandName: 'نظام تكتيكي',
  brandSubtitle: 'أرشيف استخبارات المباريات',
  scoutingModules: 'وحدات الاستكشاف',
  executiveHome: 'لوحة التحكم الرئيسية',
  opponentReport: 'تقرير الخصم',
  squadRatings: 'تقييمات الفرق',
  playerScouting: 'استكشاف اللاعبين',
  matchupSimulator: 'محاكي المواجهات',
  settings: 'الإعدادات',
  styleGuide: 'دليل التصميم',

  scope: 'النطاق:',
  allCompetitions: 'جميع البطولات',
  quickSearch: 'بحث سريع (⌘K)...',
  pgActive: 'قاعدة البيانات متصلة',
  dbDisconnected: 'قاعدة البيانات غير متصلة',
  themeToggle: 'تبديل المظهر الفاتح/الداكن',
  language: 'اللغة',
  simpleView: 'عرض مبسط',
  advancedView: 'عرض تفصيلي',

  databaseMatches: 'مباريات الأرشيف',
  eventCorpus: 'مخزون أحداث SPADL',
  activeCompetitions: 'البطولات النشطة',
  scoutedPlayers: 'اللاعبون المستكشفون',
  currentFocusOpponent: 'الخصم المحدد',
  sample: 'العينة',
  overallRating: 'التقييم العام',
  attackPower: 'القوة الهجومية',
  defenceRating: 'الصلابة الدفاعية',
  dangerCreated: 'مستوى الخطورة المصنوعة',
  zoneResistance: 'المقاومة المكانية',
  keyVulnerability: 'نقطة الضعف الرئيسية',
  primaryStrength: 'نقطة القوة الرئيسية',
  fullBlueprintReport: 'فتح الملف التكتيكي الكامل',
  squadRatingsLeaderboard: 'ترتيب كفاءة الفرق',
  viewFullTable: 'عرض جدول الترتيب كاملاً',
  viewAll: 'عرض الكل',
  dataPipelineHealth: 'البنية التحتية للأرشيف',
  analystWorkflow: 'توجيه المدرب والمحلل',
  analystWorkflowDesc: 'رؤى سريعة ومختصرة للتحضير للمباراة في 30 ثانية. انقر على أي شكل لمعاينة بيانات التتبع الدقيقة.',
  keyTakeaways: 'النقاط الجوهرية والملخص التكتيكي',
  howToReadThis: 'كيف تقرأ هذا الشكل',

  playstyleFingerprint: 'بصمة أسلوب اللعب',
  playstyle: 'أسلوب اللعب',
  conf: 'ثقة',
  strengths: 'نقاط القوة (أعلى 25%)',
  weaknesses: 'النقاط الدفاعية الهشة (أدنى 30%)',
  situationalPressTriggers: 'محفزات الضغط الظرفي',
  pressBlindSpots: 'النقاط العمياء في الضغط',
  keyPlayerThreats: 'أبرز اللاعبين خطورة',
  tacticalGamePlan: 'خطة اللعب التكتيكية الموصى بها',
  pitchZones: 'تقسيم مناطق الملعب 6×5',
  shotMaps: 'مواقع التسديدات واحتمالية التسجيل',
  passingNetwork: 'شبكة التمريرات وتوزيع الكرة',
  blueprintTendencies: 'الميول التكتيكية ومسارات الاستغلال',
  vulnerabilityIndex: 'مؤشر الهشاشة',

  teamA: 'الفريق أ (المستضيف / التركيز)',
  teamB: 'الفريق ب (الخصم)',
  h2hSim: 'محاكاة المواجهة',
  ratingDelta: 'فارق التقييم',
  phaseExploitation: 'مسارات استغلال مراحل اللعب',
  tacticalMatchupSim: 'محاكاة المواجهة التكتيكية',
  headToHeadHistory: 'سجل المواجهات المباشرة التاريخية',
  noH2HHistory: 'لا توجد مواجهات مباشرة سابقة في نافذة الأرشيف الحالية.',

  systemHealth: 'حالة النظام وقاعدة البيانات',
  databaseStatus: 'قاعدة بيانات PostgreSQL العلائقية',
  engineVersion: 'محرك التحليلات التكتيكية',
  latency: 'زمن الاستجابة المباشر',
  themeChoice: 'المظهر البصري',
  themeLight: 'فاتح (ورق دافئ)',
  themeDark: 'داكن (حبر دافئ)',
  languageChoice: 'لغة الواجهة',

  rank: '#',
  club: 'النادي',
  rating: 'التقييم',
  attack: 'الهجوم',
  defence: 'الدفاع',
  archetype: 'نمط اللعب التكتيكي',
  scout: 'معاينة',
  matches: 'المباريات',
  shots: 'التسديدات',
  goals: 'الأهداف',
  xg: 'xG (احتمالية التسجيل)',
  xa: 'xA (احتمالية الصناعة)',
  minutes: 'الدقائق',
  role: 'المركز',
  retryQuery: 'إعادة المحاولة',
  noRecords: 'لا توجد سجلات في الأرشيف',
  loading: 'جاري حساب النماذج التكتيكية...',
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
