// =============================
// SYSTEM INSTRUCTION
// =============================
export interface SystemInstruction {
  id: string;
  name: string;
  content: string;
  isActive: boolean;
}

// =============================
// HISTORY
// =============================
export interface HistoryItem {
  id: string;
  type: string;     // "channel" | "keyword" | "video"
  value: string;
  timestamp: number;
}

// =============================
// FOLDER
// =============================
export interface Folder {
  id: string;
  name: string;
  createdAt: number;
}

// =============================
// FAVORITE ITEM
// =============================
export interface FavoriteItem {
  id: string;
  type: "channel" | "keyword" | "video";
  value: string;
  folderId?: string;
  createdAt: number;
}

// =============================
// NOTICE
// =============================
export interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: string;
}

// =============================
// USER + SUBSCRIPTION
// =============================
export interface User {
  id: string;
  email: string;
  name: string;

  // 관리자 대시보드가 요구함
  joinedAt: string;
  isAdmin: boolean;

  subscription?: {
    plan: "free" | "pro" | "premium";
    status: "active" | "expired" | "none";
    startDate: string;
    endDate: string;
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  discount?: number;
  description?: string;
}

// =============================
// COUPON
// =============================
// AdminDashboard가 다음 필드를 반드시 사용함:
// - expiresAt
// - discountPercent
// - usedBy.length / usedBy.join → string[] 필수
export interface Coupon {
  id: string;
  code: string;

  durationMonths: 0.5 | 1 | 3 | 6 | 12;
  isUsed: boolean;
  createdAt: string;

  expiresAt: string;
  discountPercent: number;

  usedBy: string[];  // ★ 수정됨 (string → string[])
  usedAt?: string;
}

// =============================
// YOUTUBE CORE TYPES
// =============================
export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  uploadsPlaylistId: string;
  videoCount: number;
  publishedAt: string;
  subscriberCount: number;
  viewCount: number;
}

export interface VideoDetails {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

export interface VideoStatistics {
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

export interface AnalyzedVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  tags: string[];
  hashtags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  popularityScore: number;
  duration: number;
  videoType: "short" | "regular";
  channelId: string;
  channelTitle: string;
  country: string;
}

// =============================
// EXTRA CHANNEL STATS
// =============================
export interface ChannelExtraStats {
  firstVideoDate: string;
  averageUploadIntervalAll: string;
  averageUploadIntervalRecent: string;
}

// =============================
// STRATEGY RESULT
// =============================
export interface StrategyResult {
  coreConcept: { title: string; description: string };
  detailedPlan: {
    contentDirection: { title: string; details: string };
    uploadSchedule: { title: string; details: string };
    communityEngagement: { title: string; details: string };
    keywordStrategy: { title: string; details: string };
  };
  initialStrategy: {
    title: string;
    phases: {
      phaseTitle: string;
      focus: string;
      actionItems: string[];
    }[];
  };
  suggestedTitles: { title: string; titles: string[] };
  kpiSettings: {
    title: string;
    kpis: { kpiTitle: string; description: string }[];
  };
  riskManagement: {
    title: string;
    risks: { riskTitle: string; strategy: string }[];
  };
  revenueModel: {
    title: string;
    streams: { revenueTitle: string; description: string }[];
  };
}

// =============================
// GROWTH ANALYSIS RESULT
// =============================
export interface GrowthAnalysisResult {
  title: string;
  overallSummary: string;
  phases: {
    phaseTitle: string;
    period: string;
    performanceSummary: string;
    strategyAnalysis: string;
    keyVideos: { title: string; reason: string }[];
    quantitativeAnalysis: {
      title: string;
      avgViews: string;
      likeViewRatio: string;
      commentViewRatio: string;
    };
    contentStrategyAnalysis: {
      title: string;
      avgVideoDuration: string;
      uploadFrequency: string;
      titleThumbnailStrategy: string;
    };
  }[];
}

// =============================
// CONSULTING RESULT
// =============================
export interface ConsultingResult {
  overallDiagnosis: { title: string; summary: string };
  detailedAnalysis: { area: string; problem: string; solution: string }[];
  actionPlan: {
    shortTerm: { title: string; period: string; steps: string[] };
    longTerm: { title: string; period: string; steps: string[] };
  };
}

// =============================
// SUMMARY OBJECT
// =============================
export interface SummaryObject {
  title: string;
  coreMessage: string;
  structure: string;
  summaryPoints: string[];
}

// =============================
// GENERATED SCRIPT
// =============================
export interface GeneratedScript {
  title: string;
  description: string;
  sections: { heading: string; content: string }[];
}

// =============================
// GENERATED TITLES
// =============================
export interface GeneratedTitles {
  fresh: string[];
  stable: string[];
}

// =============================
// THUMBNAIL TEXT
// =============================
export interface GeneratedThumbnailText {
  emotional: string[];
  informational: string[];
  visual: string[];
}

// =============================
// TRENDING KEYWORD
// =============================
export interface TrendingKeyword {
  rank: number;
  keyword: string;
  videoCount: number;
  totalViews: number;
  mainCategory: string;
  mainChannelType: string;
}

// =============================
// RISING CREATOR
// =============================
export interface RisingCreator {
  rank: number;
  name: string;
  videoCount: number;
  channelId: string;
  thumbnailUrl: string;
}

// =============================
// VIDEO CATEGORY
// =============================
export interface VideoCategory {
  id: string;
  title: string;
}

// =============================
// GOOGLE TREND ITEM
// =============================
export interface GoogleTrendItem {
  keyword: string;
  volume: string;
}

// =============================
// KEYWORD ANALYSIS
// =============================
export interface KeywordAnalysisResult {
  relatedKeywords: string[];
  volumes: {
    keyword: string;
    pcVolume: number;
    mobileVolume: number;
    totalVolume: number;
  }[];
}

// =============================
// THUMBNAIL ANALYSIS
// =============================
export interface ThumbnailAnalysisResult {
  overallScore: number;
  scores: { visibility: number; curiosity: number; textReadability: number; design: number };
  feedback: { strengths: string[]; weaknesses: string[]; improvements: string[] };
}

// =============================
// COMMENT ANALYSIS
// =============================
export interface CommentAnalysisResult {
  sentiment: { positive: number; negative: number; neutral: number };
  keywords: string[];
  summary: { pros: string[]; cons: string[]; oneLine: string };
}

// =============================
// CHANNEL BATTLE
// =============================
export interface BattleStats {
  subscribers: number;
  totalViews: number;
  avgViews: number;
  engagementRate: number;
  uploadFrequency: number;
  videoCount: number;
  powerScore: number;
}

export interface ChannelBattleResult {
  channelA: YouTubeChannel;
  channelB: YouTubeChannel;
  statsA: BattleStats;
  statsB: BattleStats;
  winner: "A" | "B" | "Tie";
  radarData: { subject: string; A: number; B: number; fullMark: number }[];
}

// =============================
// SHORTS IDEA
// =============================
export interface ShortsIdea {
  title: string;
  hook: string;
  script: string;
  visualGuide: string;
}

// =============================
// TREND INSIGHT RESULT
// =============================
export interface TrendInsightResult {
  naver: { rank: number; keyword: string; searchVolume: string; status: string }[];
  google: { rank: number; keyword: string; searchVolume: string; status: string }[];
}

// =============================
// TREND RANK
// =============================
export interface TrendRankItem {
  rank: number;
  keyword: string;
  searchVolume: string;
  status: string;
}

// =============================
// CALENDAR TREND EVENT
// =============================
export interface CalendarTrendEvent {
  date: string;
  event: string;
  category: "holiday" | "trend" | "season" | "release";
  intensity: "High" | "Medium" | "Low";
}

// =============================
// SCHEDULED CONTENT
// =============================
export interface ScheduledContent {
  id: string;
  date: string;
  title: string;
  description: string;
  status: "idea" | "draft" | "published";
}
