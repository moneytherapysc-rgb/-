/* ============================
   🔥 Channel Battle Result 
   ============================ */

export interface ChannelInfo {
    title: string;
    thumbnailUrl: string;
}

export interface ChannelStats {
    subscribers: number;
    totalViews: number;
    avgViews: number;
    engagementRate: number;   // %
    uploadFrequency: number;  // 월 업로드 수
    videoCount: number;
    powerScore: number;       // 승부 점수
}

export interface RadarStatItem {
    subject: string;  // 예: "구독자", "조회수", "참여율"
    A: number;        // 채널 A 점수
    B: number;        // 채널 B 점수
}

export interface ChannelBattleResult {
    winner: "A" | "B" | "Tie";

    channelA: ChannelInfo;
    channelB: ChannelInfo;

    statsA: ChannelStats;
    statsB: ChannelStats;

    radarData: RadarStatItem[];
}
