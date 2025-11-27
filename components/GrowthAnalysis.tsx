/* ============================
   🔥 Growth Analysis Result
   ============================ */

export interface GrowthAnalysisPhaseQuant {
    title: string;
    avgViews: number;
    likeViewRatio: number;
    commentViewRatio: number;
}

export interface GrowthAnalysisPhaseContent {
    title: string;
    avgVideoDuration: string;        // 예: "8분 30초"
    uploadFrequency: string;         // 예: "주 3회"
    titleThumbnailStrategy: string;
}

export interface GrowthKeyVideo {
    title: string;
    reason: string;
}

export interface GrowthAnalysisPhase {
    phaseTitle: string;              // 구간명
    period: string;                  // 날짜 또는 기간
    performanceSummary: string;      // 성과
    strategyAnalysis: string;        // 전략 분석

    quantitativeAnalysis?: GrowthAnalysisPhaseQuant;
    contentStrategyAnalysis?: GrowthAnalysisPhaseContent;

    keyVideos?: GrowthKeyVideo[];
}

export interface GrowthAnalysisResult {
    title: string;                   // 분석 제목
    overallSummary: string;          // 총평
    phases: GrowthAnalysisPhase[];   // 단계별 분석
}
