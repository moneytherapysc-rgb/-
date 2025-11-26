// types.ts 파일 전체 코드 (Auth Context 확장 및 AdminDashboard 타입 통합 완료)

// SubscriptionDetails 인터페이스 추가 (AdminDashboard에서 사용됨)
export interface SubscriptionDetails {
    status: 'active' | 'inactive' | 'trial';
    plan: string; // 예: '1month', '3months'
    endDate: string; // 구독 종료일
}

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

export interface VideoStatistics {
    viewCount: number;
    likeCount: number;
    commentCount: number;
}

export interface VideoDetails {
    id: string;
    title: string;
    description: string;
    publishedAt: string;
    thumbnailUrl: string;
    tags: string[]; // These are keywords
    hashtags: string[]; // These are from the description
    duration: number; // Duration in seconds
    videoType: 'short' | 'regular';
    channelId: string;
    channelTitle: string;
}

export interface AnalyzedVideo extends VideoDetails, VideoStatistics {
    popularityScore: number;
    country?: string;
}

export interface StrategyResult {
    coreConcept: {
        title: string;
        description: string;
    };
    detailedPlan: {
        contentDirection: {
            title: string;
            details: string;
        };
        uploadSchedule: {
            title: string;
            details: string;
        };
        communityEngagement: {
            title: string;
            details: string;
        };
        keywordStrategy: {
            title: string;
            details: string;
        };
    };
    initialStrategy: {
        title: string;
        phases: Array<{
            phaseTitle: string;
            focus: string;
            actionItems: string[];
        }>;
    };
    suggestedTitles: {
        title: string;
        titles: string[];
    };
    // New detailed strategy sections
    kpiSettings: {
        title: string;
        kpis: Array<{
            kpiTitle: string;
            description: string;
        }>;
    };
    riskManagement: {
        title: string;
        risks: Array<{
            riskTitle: string;
            strategy: string;
        }>;
    };
    revenueModel: {
        title: string;
        streams: Array<{
            revenueTitle: string;
            description: string;
        }>;
    };
}

export interface ChannelExtraStats {
    firstVideoDate: string;
    averageUploadIntervalAll: string;
    averageUploadIntervalRecent: string;
}

export interface GrowthPhase {
    phaseTitle: string;
    period: string;
    performanceSummary: string;
    strategyAnalysis: string;
    keyVideos: Array<{
        title: string;
        reason: string;
    }>;
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
}

export interface GrowthAnalysisResult {
    title: string;
    overallSummary: string;
    phases: GrowthPhase[];
}

export interface ConsultingResult {
    overallDiagnosis: {
        title: string;
        summary: string;
    };
    detailedAnalysis: Array<{
        area: string;
        problem: string;
        solution: string;
    }>;
    actionPlan: {
        shortTerm: {
            title: string;
            period: string;
            steps: string[];
        };
        longTerm: {
            title: string;
            period: string;
            steps: string[];
        };
    };
}

export interface GeneratedScript {
    title: string;
    description: string;
    script: {
        opening: {
            narration: string;
            visual_cue: string;
        };
        main_points: Array<{
            scene: string;
            narration: string;
            visual_cue: string;
        }>;
        closing: {
            narration: string;
            visual_cue: string;
        };
    };
}

export interface SummaryObject {
    title: string;
    coreMessage: string;
    structure: string;
    summaryPoints: string[];
}

export interface GeneratedTitles {
    fresh: string[];
    stable: string[];
}

export interface GeneratedThumbnailText {
    emotional: string[];
    informational: string[];
    visual: string[];
}

export interface TrendingKeyword {
    rank: number;
    keyword: string;
    videoCount: number;
    totalViews: number;
    mainCategory: string;
    mainChannelType: string;
}

export interface RisingCreator {
    rank: number;
    name: string;
    videoCount: number;
    channelId: string;
    thumbnailUrl: string;
}

export interface VideoCategory {
    id: string;
    title: string;
}

// User 인터페이스 (joinedAt 필드 포함)
export interface User {
    id: string;
    name: string;
    email: string;
    joinedAt: string;
    isAdmin: boolean;

    // 💡 [AdminDashboard 오류 해결] user.subscription 접근 허용
    subscription?: SubscriptionDetails; 
    
    // 💡 [AuthContext 구독 로직]
    isCouponUsed?: boolean;       // 2주 쿠폰 사용 여부
    couponUsedAt?: string;        // 쿠폰 사용 시작일 (YYYY-MM-DD 형식)
    hasPaidSubscription?: boolean; // 유료 결제 구독 여부
}

// AuthContextType 인터페이스 (모든 컴포넌트 오류 해결을 위한 타입 확장)
export interface AuthContextType {
    user: User | null; // 현재 인증된 사용자 정보
    isAuthenticated: boolean; // 로그인 상태
    isSubscribed: boolean; // 구독 상태 (가장 중요)
    isLoading: boolean; // 초기 인증 상태 로딩 중인지 여부
    
    // AuthContext 기본 함수들
    signIn: (credentials: any) => Promise<void>; 
    signOut: () => Promise<void>;
    updateSubscriptionStatus: (status: boolean) => void; 

    // Admin Dashboard 및 UI 상호작용 함수
    isAdmin: boolean;
    login: (credentials: any) => Promise<void>;
    signup: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    changePassword: (data: any) => Promise<void>;
    updateUserSubscription: (planId: string) => Promise<void>;
    getAllUsers: () => Promise<User[]>;
    deleteUser: (userId: string) => Promise<void>;
    
    // 쿠폰 로직 함수
    applyCoupon: (couponCode: string) => Promise<boolean>;
}

export interface Coupon {
    id: string;
    code: string;
    durationMonths: 0.5 | 1 | 3 | 6 | 12; // 0.5 for 2 weeks trial
    isUsed: boolean;
    createdAt: string;
    usedBy?: string;
    usedAt?: string;
}

export interface SubscriptionPlan {
    id: 'event_launch' | '1month' | '3months' | '6months' | '12months';
    name: string;
    price: number;
    durationMonths: number;
    discount?: number; // percentage
    description?: string;
}

export interface SystemInstruction {
    id: string;
    name: string;
    content: string;
    isActive: boolean;
}

export interface GoogleTrendItem {
    rank: number;
    keyword: string;
    searchVolume: string;
    growthRate: string;
    startedAt: string;
    trendStatus: string; // e.g. '활성', '계속됨'
    relatedQueries: string[];
    graphData: number[]; // Array of numbers for sparkline
}

export interface KeywordAnalysisResult {
    relatedKeywords: string[];
    volumes: Array<{
        keyword: string;
        pcVolume: number;
        mobileVolume: number;
        totalVolume: number;
    }>;
}

export interface ThumbnailAnalysisResult {
    overallScore: number;
    scores: {
        visibility: number; // 시인성
        curiosity: number; // 호기심 유발
        textReadability: number; // 텍스트 가독성
        design: number; // 디자인/구도
    };
    feedback: {
        strengths: string[];
        weaknesses: string[];
        improvements: string[];
    };
}

export interface CommentAnalysisResult {
    sentiment: {
        positive: number;
        negative: number;
        neutral: number;
    };
    keywords: string[];
    summary: {
        pros: string[];
        cons: string[];
        oneLine: string;
    };
}

export interface HistoryItem {
    id: string;
    type: 'channel' | 'keyword' | 'video';
    value: string; // Channel ID or Keyword or Video ID
    title: string; // Channel Title or Keyword or Video Title
    thumbnailUrl?: string;
    timestamp: number;
}

export interface Folder {
    id: string;
    name: string;
    createdAt: number;
}

export interface FavoriteItem {
    id: string;
    folderId: string;
    type: 'channel' | 'keyword' | 'video';
    value: string;
    title: string;
    thumbnailUrl?: string;
    createdAt: number;
}

export interface BattleStats {
    subscribers: number;
    totalViews: number;
    avgViews: number;
    engagementRate: number; // (Likes + Comments) / Views
    uploadFrequency: number; // Videos per month (approx)
    videoCount: number;
    powerScore: number; // 0-1000
}

export interface ChannelBattleResult {
    channelA: YouTubeChannel;
    channelB: YouTubeChannel;
    statsA: BattleStats;
    statsB: BattleStats;
    winner: 'A' | 'B' | 'Tie';
    radarData: Array<{
        subject: string;
        A: number;
        B: number;
        fullMark: number;
    }>;
}

export interface ShortsIdea {
    title: string;
    hook: string; // 3초 훅
    script: string; // 실제 대본 (구어체)
    visualGuide: string; // 촬영/편집 가이드
}

export interface Notice {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    author: string;
}

export interface TrendRankItem {
    rank: number;
    keyword: string;
    searchVolume?: string;
    status?: 'new' | 'up' | 'down' | 'same';
}

export interface TrendInsightResult {
    naver: TrendRankItem[];
    google: TrendRankItem[];
}

export interface CalendarTrendEvent {
    date: string; // YYYY-MM-DD
    event: string;
    category: 'holiday' | 'trend' | 'season' | 'release';
    intensity: 'High' | 'Medium' | 'Low';
}

export interface ScheduledContent {
    id: string;
    date: string; // YYYY-MM-DD
    title: string;
    description?: string;
    status: 'idea' | 'planned' | 'filming' | 'editing' | 'uploaded';
}