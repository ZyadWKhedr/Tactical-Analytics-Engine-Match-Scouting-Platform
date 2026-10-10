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

  // Header & Controls
  scope: string;
  allCompetitions: string;
  quickSearch: string;
  pgActive: string;
  dbDisconnected: string;
  themeToggle: string;
  language: string;

  // Home Page
  databaseMatches: string;
  eventCorpus: string;
  activeCompetitions: string;
  scoutedPlayers: string;
  currentFocusOpponent: string;
  sample: string;
  overallRating: string;
  attackPower: string;
  defenceRating: string;
  expectedThreat: string;
  zoneResistance: string;
  keyVulnerability: string;
  primaryStrength: string;
  fullBlueprintReport: string;
  squadRatingsLeaderboard: string;
  viewFullTable: string;
  dataPipelineHealth: string;
  analystWorkflow: string;
  analystWorkflowDesc: string;

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
  brandSubtitle: 'Match Intelligence',
  scoutingModules: 'Scouting Modules',
  executiveHome: 'Executive Home',
  opponentReport: 'Opponent Report',
  squadRatings: 'Squad Ratings',
  playerScouting: 'Player Scouting',
  matchupSimulator: 'Matchup Simulator',

  scope: 'Scope:',
  allCompetitions: 'All Competitions',
  quickSearch: 'Quick search...',
  pgActive: 'PGSQL Active',
  dbDisconnected: 'DB Disconnected',
  themeToggle: 'Toggle light/dark theme',
  language: 'Language',

  databaseMatches: 'Database Matches',
  eventCorpus: 'Event Corpus',
  activeCompetitions: 'Competitions',
  scoutedPlayers: 'Scouted Players',
  currentFocusOpponent: 'Current Focus Opponent',
  sample: 'Sample',
  overallRating: 'Overall Rating',
  attackPower: 'Attack Power',
  defenceRating: 'Defence Rating',
  expectedThreat: 'Expected Threat',
  zoneResistance: 'Zone Resistance',
  keyVulnerability: 'Key Vulnerability',
  primaryStrength: 'Primary Strength',
  fullBlueprintReport: 'Full Blueprint Report',
  squadRatingsLeaderboard: 'Squad Ratings Leaderboard',
  viewFullTable: 'View full table',
  dataPipelineHealth: 'Data Pipeline Health',
  analystWorkflow: 'Analyst Workflow',
  analystWorkflowDesc: 'Use ⌘K to rapidly switch between scouted squads. Pitch graphics operate on standard 105×68m FIFA coordinates.',

  playstyleFingerprint: 'Playstyle Fingerprint',
  playstyle: 'Playstyle',
  conf: 'conf',
  strengths: 'Strengths (Percentile ≥ 75th)',
  weaknesses: 'Weaknesses (Percentile ≤ 30th)',
  situationalPressTriggers: 'Situational Press Triggers',
  pressBlindSpots: 'Pressing Blind Spots',
  keyPlayerThreats: 'Key Player Threats',
  tacticalGamePlan: 'Tactical Game Plan Recommendations',
  pitchZones: '6x5 Pitch Zones',
  shotMaps: 'xG Shot Maps',
  passingNetwork: 'Passing Network',
  blueprintTendencies: 'Blueprint & Tendencies',
  vulnerabilityIndex: 'Vulnerability Index',

  teamA: 'Team A (Home / Focus)',
  teamB: 'Team B (Opponent)',
  h2hSim: 'H2H SIM',
  ratingDelta: 'RATING DELTA',
  phaseExploitation: 'Phase Exploitation Opportunities',
  tacticalMatchupSim: 'Tactical Matchup Simulation',
  headToHeadHistory: 'Historical Head-to-Head Matches',
  noH2HHistory: 'No recent head-to-head fixtures found in database sample.',

  rank: 'Rank',
  club: 'Club',
  rating: 'Rating',
  attack: 'Attack',
  defence: 'Defence',
  archetype: 'Playstyle Archetype',
  scout: 'Scout',
  matches: 'Matches',
  shots: 'Shots',
  goals: 'Goals',
  xg: 'xG',
  xa: 'xA',
  minutes: 'Minutes',
  role: 'Role / Pos',
  retryQuery: 'Retry query',
  noRecords: 'No records found',
  loading: 'Computing analytics...',
};

const ar: Translations = {
  brandName: 'نظام تكتيكي',
  brandSubtitle: 'استخبارات المباريات والتحليل',
  scoutingModules: 'وحدات الاستكشاف',
  executiveHome: 'لوحة التحكم الرئيسية',
  opponentReport: 'تقرير الخصم',
  squadRatings: 'تقييمات الفرق',
  playerScouting: 'استكشاف اللاعبين',
  matchupSimulator: 'محاكي المواجهات',

  scope: 'النطاق:',
  allCompetitions: 'جميع البطولات',
  quickSearch: 'بحث سريع...',
  pgActive: 'قاعدة البيانات متصلة',
  dbDisconnected: 'غير متصل بقاعدة البيانات',
  themeToggle: 'تبديل المظهر الفاتح/الداكن',
  language: 'اللغة',

  databaseMatches: 'مباريات القاعدة',
  eventCorpus: 'مخزون الأحداث',
  activeCompetitions: 'البطولات النشطة',
  scoutedPlayers: 'اللاعبون المستكشفون',
  currentFocusOpponent: 'الخصم قيد التركيز',
  sample: 'العينة',
  overallRating: 'التقييم العام',
  attackPower: 'القوة الهجومية',
  defenceRating: 'التقييم الدفاعي',
  expectedThreat: 'التهديد المتوقع (xT)',
  zoneResistance: 'المقاومة المكانية',
  keyVulnerability: 'نقطة الضعف الرئيسية',
  primaryStrength: 'نقطة القوة الرئيسية',
  fullBlueprintReport: 'تقرير المخطط الشامل',
  squadRatingsLeaderboard: 'ترتيب تقييمات الفرق',
  viewFullTable: 'عرض الجدول كاملاً',
  dataPipelineHealth: 'حالة مسار البيانات',
  analystWorkflow: 'سير عمل المحلل',
  analystWorkflowDesc: 'استخدم ⌘K للتبديل السريع بين الفرق. تعمل رسومات الملعب بنظام الإحداثيات القياسي 105×68 م.',

  playstyleFingerprint: 'بصمة أسلوب اللعب',
  playstyle: 'أسلوب اللعب',
  conf: 'ثقة',
  strengths: 'نقاط القوة (المئين ≥ 75)',
  weaknesses: 'نقاط الضعف (المئين ≤ 30)',
  situationalPressTriggers: 'محفزات الضغط الظرفي',
  pressBlindSpots: 'النقاط العمياء في الضغط',
  keyPlayerThreats: 'أبرز اللاعبين خطورة',
  tacticalGamePlan: 'توصيات خطة المباراة التكتيكية',
  pitchZones: 'مصفوفة مناطق الملعب 6×5',
  shotMaps: 'خرائط التسديدات (xG)',
  passingNetwork: 'شبكة التمريرات',
  blueprintTendencies: 'المخطط والميول التكتيكية',
  vulnerabilityIndex: 'مؤشر الهشاشة',

  teamA: 'الفريق أ (المستضيف / التركيز)',
  teamB: 'الفريق ب (الخصم)',
  h2hSim: 'محاكاة المواجهة',
  ratingDelta: 'فارق التقييم',
  phaseExploitation: 'فرص استغلال مراحل اللعب',
  tacticalMatchupSim: 'محاكاة المواجهة التكتيكية',
  headToHeadHistory: 'المواجهات المباشرة التاريخية',
  noH2HHistory: 'لا توجد مواجهات مباشرة سابقة في عينة البيانات.',

  rank: 'الترتيب',
  club: 'النادي',
  rating: 'التقييم',
  attack: 'الهجوم',
  defence: 'الدفاع',
  archetype: 'نمط اللعب التكتيكي',
  scout: 'استكشاف',
  matches: 'المباريات',
  shots: 'التسديدات',
  goals: 'الأهداف',
  xg: 'xG',
  xa: 'xA',
  minutes: 'الدقائق',
  role: 'المركز / الدور',
  retryQuery: 'إعادة المحاولة',
  noRecords: 'لا توجد سجلات',
  loading: 'جاري حساب النماذج التكتيكية...',
};

const dictionaries: Record<Language, Translations> = { en, ar };

interface I18nStore {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
}

export const useI18n = create<I18nStore>((set) => {
  const savedLang = (localStorage.getItem('tactical_lang') as Language) || 'en';
  // Apply direction to HTML element on boot
  document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = savedLang;

  return {
    language: savedLang,
    t: dictionaries[savedLang] || en,
    setLanguage: (lang: Language) => {
      localStorage.setItem('tactical_lang', lang);
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
      set({ language: lang, t: dictionaries[lang] || en });
    },
  };
});
