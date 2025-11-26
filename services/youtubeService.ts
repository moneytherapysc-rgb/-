


import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { 
  YouTubeChannel, VideoDetails, VideoStatistics, AnalyzedVideo, StrategyResult, 
  ChannelExtraStats, GrowthAnalysisResult, ConsultingResult, GeneratedScript, 
  SummaryObject, GeneratedTitles, GeneratedThumbnailText, TrendingKeyword, 
  RisingCreator, VideoCategory, GoogleTrendItem, KeywordAnalysisResult, 
  ThumbnailAnalysisResult, CommentAnalysisResult, ChannelBattleResult, 
  BattleStats, ShortsIdea, SystemInstruction,
  TrendInsightResult, TrendRankItem, CalendarTrendEvent, ScheduledContent
} from '../types';

const LOCAL_STORAGE_KEY = 'yt_macgyver_api_key';

// Simple encryption/decryption for local storage
const encrypt = (text: string) => btoa(text);
const decrypt = (text: string) => atob(text);

export const setApiKey = (key: string) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, encrypt(key));
};

export const getApiKey = (): string | null => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored ? decrypt(stored) : null;
};

export const isApiKeySet = (): boolean => {
  return !!getApiKey();
};

export const createApiError = (error: any, context: string) => {
    const msg = error instanceof Error ? error.message : JSON.stringify(error);
    return new Error(`${context} 실패: ${msg}`);
};

export const testApiKey = async (apiKey: string): Promise<{ success: boolean; error?: any }> => {
  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=id&chart=mostPopular&maxResults=1&key=${apiKey}`);
    
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'API 키가 유효하지 않거나 YouTube Data API 서비스가 활성화되지 않았습니다.');
    }
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

// --- Google Client (GenAI) ---

export const initGoogleClient = async () => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key not found");
    return new GoogleGenAI({ apiKey });
};

// --- Helper: Robust JSON Parsing ---
const parseJsonClean = (text: string): any => {
    if (!text) return null;
    try {
        // 1. Try direct parse
        return JSON.parse(text);
    } catch (e) {
        // 2. Clean markdown blocks
        let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        try {
            return JSON.parse(cleaned);
        } catch (e2) {
            // 3. Regex extraction for Object {} or Array []
            const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
            if (match) {
                try {
                    return JSON.parse(match[0]);
                } catch (e3) {
                    console.error("JSON Regex extraction failed", e3);
                }
            }
        }
    }
    return null;
};

// --- YouTube Data API Functions ---

export const findChannel = async (query: string): Promise<YouTubeChannel> => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('API Key required');

    let url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${query}&key=${apiKey}`;
    let response = await fetch(url);
    let data = await response.json();

    if (!data.items || data.items.length === 0) {
        url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&key=${apiKey}`;
        response = await fetch(url);
        data = await response.json();

        if (!data.items || data.items.length === 0) {
            throw new Error('채널을 찾을 수 없습니다.');
        }
        
        const channelId = data.items[0].id.channelId;
        url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${channelId}&key=${apiKey}`;
        response = await fetch(url);
        data = await response.json();
    }

    const item = data.items[0];
    return {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads,
        videoCount: parseInt(item.statistics.videoCount),
        publishedAt: item.snippet.publishedAt,
        subscriberCount: parseInt(item.statistics.subscriberCount),
        viewCount: parseInt(item.statistics.viewCount)
    };
};

export const getChannelVideoIds = async (playlistId: string, maxResults: number = 50): Promise<string[]> => {
    const apiKey = getApiKey();
    let videoIds: string[] = [];
    let nextPageToken: string | undefined = undefined;

    do {
        const url: string = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=50&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.items) {
            videoIds.push(...data.items.map((item: any) => item.contentDetails.videoId));
        }
        nextPageToken = data.nextPageToken;
    } while (nextPageToken && videoIds.length < maxResults);

    return videoIds.slice(0, maxResults);
};

export const getVideoDetailsAndStats = async (videoIds: string[]): Promise<AnalyzedVideo[]> => {
    const apiKey = getApiKey();
    if (videoIds.length === 0) return [];

    const chunks = [];
    for (let i = 0; i < videoIds.length; i += 50) {
        chunks.push(videoIds.slice(i, i + 50));
    }

    let videos: AnalyzedVideo[] = [];

    for (const chunk of chunks) {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails,topicDetails&id=${chunk.join(',')}&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.items) {
            const analyzed = data.items.map((item: any) => {
                const viewCount = parseInt(item.statistics.viewCount || '0');
                const likeCount = parseInt(item.statistics.likeCount || '0');
                const commentCount = parseInt(item.statistics.commentCount || '0');
                
                const popularityScore = (viewCount > 0) 
                    ? ((likeCount * 2 + commentCount * 5) / viewCount) * 1000 
                    : 0;

                const duration = parseISO8601Duration(item.contentDetails.duration);

                return {
                    id: item.id,
                    title: item.snippet.title,
                    description: item.snippet.description,
                    publishedAt: item.snippet.publishedAt,
                    thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
                    tags: item.snippet.tags || [],
                    hashtags: extractHashtags(item.snippet.description),
                    viewCount,
                    likeCount,
                    commentCount,
                    popularityScore,
                    duration,
                    videoType: duration <= 60 ? 'short' : 'regular',
                    channelId: item.snippet.channelId,
                    channelTitle: item.snippet.channelTitle,
                    country: 'KR'
                };
            });
            videos.push(...analyzed);
        }
    }

    return videos;
};

const parseISO8601Duration = (duration: string): number => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;
    const hours = (parseInt(match[1] || '0')) || 0;
    const minutes = (parseInt(match[2] || '0')) || 0;
    const seconds = (parseInt(match[3] || '0')) || 0;
    return hours * 3600 + minutes * 60 + seconds;
};

const extractHashtags = (text: string): string[] => {
    const hashtags = text.match(/#[a-z0-9_]+/gi);
    return hashtags ? hashtags.map(tag => tag.slice(1)) : [];
};

// --- AI Analysis Functions ---

export const analyzeChannelVideos = async (channelId: string): Promise<{ videos: AnalyzedVideo[], stats: ChannelExtraStats }> => {
    const channel = await findChannel(channelId);
    const videoIds = await getChannelVideoIds(channel.uploadsPlaylistId, 50);
    const videos = await getVideoDetailsAndStats(videoIds);
    const stats = calculateExtraChannelStats(videos);
    return { videos, stats };
};

export const calculateExtraChannelStats = (videos: AnalyzedVideo[]): ChannelExtraStats => {
    if (videos.length === 0) return { firstVideoDate: '', averageUploadIntervalAll: '', averageUploadIntervalRecent: '' };

    const sorted = [...videos].sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
    const firstVideoDate = sorted[0].publishedAt;

    let totalInterval = 0;
    for (let i = 1; i < sorted.length; i++) {
        const diff = new Date(sorted[i].publishedAt).getTime() - new Date(sorted[i-1].publishedAt).getTime();
        totalInterval += diff;
    }
    const avgAll = totalInterval / (sorted.length - 1 || 1);

    const recent = sorted.slice(-6);
    let recentInterval = 0;
    if (recent.length > 1) {
        for (let i = 1; i < recent.length; i++) {
            const diff = new Date(recent[i].publishedAt).getTime() - new Date(recent[i-1].publishedAt).getTime();
            recentInterval += diff;
        }
        recentInterval = recentInterval / (recent.length - 1);
    }

    const msToDays = (ms: number) => (ms / (1000 * 60 * 60 * 24)).toFixed(1) + '일';

    return {
        firstVideoDate,
        averageUploadIntervalAll: msToDays(avgAll),
        averageUploadIntervalRecent: msToDays(recentInterval || avgAll)
    };
};

export const summarizeTranscript = async (transcript: string, instruction?: string): Promise<string> => {
    const ai = await initGoogleClient();
    const prompt = `${instruction ? `[시스템 지침: ${instruction}]\n` : ''}다음 영상 스크립트(또는 설명)를 읽고 핵심 내용을 3줄로 요약해주세요.\n\n${transcript}`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text || "요약 실패";
};

export const generateChannelStrategy = async (videos: AnalyzedVideo[]): Promise<StrategyResult> => {
    const ai = await initGoogleClient();
    const videoContext = videos.slice(0, 10).map(v => `- ${v.title} (조회수: ${v.viewCount}, 인기점수: ${v.popularityScore.toFixed(1)})`).join('\n');
    
    const prompt = `
    다음은 한 유튜브 채널의 최근 상위 10개 영상 데이터입니다.
    ${videoContext}
    
    이 채널의 성장을 위한 'AI 채널 운영 전략'을 수립해주세요.
    응답은 반드시 아래 JSON 스키마를 준수해야 합니다.
    
    Schema:
    {
      "coreConcept": { "title": "", "description": "" },
      "detailedPlan": {
        "contentDirection": { "title": "", "details": "" },
        "uploadSchedule": { "title": "", "details": "" },
        "communityEngagement": { "title": "", "details": "" },
        "keywordStrategy": { "title": "", "details": "" }
      },
      "initialStrategy": {
        "title": "",
        "phases": [
          { "phaseTitle": "", "focus": "", "actionItems": ["", ""] }
        ]
      },
      "suggestedTitles": { "title": "추천 콘텐츠 주제", "titles": ["", ""] },
      "kpiSettings": { "title": "핵심 성과 지표(KPI)", "kpis": [{"kpiTitle": "", "description": ""}] },
      "riskManagement": { "title": "리스크 관리", "risks": [{"riskTitle": "", "strategy": ""}] },
      "revenueModel": { "title": "수익화 모델", "streams": [{"revenueTitle": "", "description": ""}] }
    }
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });

    return parseJsonClean(response.text || '{}') as StrategyResult;
};

export const generateKeywordStrategyAnalysis = async (keyword: string): Promise<StrategyResult> => {
    const ai = await initGoogleClient();
    const prompt = `
    키워드 '${keyword}'를 주제로 하는 유튜브 채널을 새로 만들려고 합니다.
    성공적인 채널 운영을 위한 전략을 수립해주세요.
    
    응답은 반드시 JSON 형식을 준수해야 합니다. (위 generateChannelStrategy와 동일한 스키마 사용)
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });

    return parseJsonClean(response.text || '{}') as StrategyResult;
};

export const generateChannelGrowthAnalysis = async (videos: AnalyzedVideo[]): Promise<GrowthAnalysisResult> => {
    const ai = await initGoogleClient();
    const sorted = [...videos].sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
    const samples = [
        ...sorted.slice(0, 3),
        ...sorted.slice(Math.floor(sorted.length/2)-1, Math.floor(sorted.length/2)+2),
        ...sorted.slice(-3)
    ];
    const videoContext = samples.map(v => `[${v.publishedAt.split('T')[0]}] ${v.title} (조회수: ${v.viewCount})`).join('\n');

    const prompt = `
    다음은 채널의 과거부터 현재까지의 영상 기록 샘플입니다.
    ${videoContext}
    
    이 채널의 성장 과정을 3단계(초기, 중기, 최근)로 나누어 분석하고 성장 요인을 파악해주세요.
    JSON 형식으로 응답해주세요.
    
    Schema:
    {
      "title": "채널 성장 분석 보고서",
      "overallSummary": "",
      "phases": [
        {
          "phaseTitle": "",
          "period": "",
          "performanceSummary": "",
          "strategyAnalysis": "",
          "keyVideos": [{ "title": "", "reason": "" }],
          "quantitativeAnalysis": { "title": "정량 지표 분석", "avgViews": "", "likeViewRatio": "", "commentViewRatio": "" },
          "contentStrategyAnalysis": { "title": "콘텐츠 전략", "avgVideoDuration": "", "uploadFrequency": "", "titleThumbnailStrategy": "" }
        }
      ]
    }
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });

    return parseJsonClean(response.text || '{}') as GrowthAnalysisResult;
};

export const generateChannelConsulting = async (videos: AnalyzedVideo[]): Promise<ConsultingResult> => {
    const ai = await initGoogleClient();
    const sortedByViews = [...videos].sort((a, b) => b.viewCount - a.viewCount);
    const best = sortedByViews.slice(0, 3);
    const worst = sortedByViews.slice(-3);
    
    const context = `
    [성과가 좋은 영상]
    ${best.map(v => `- ${v.title}`).join('\n')}
    
    [성과가 저조한 영상]
    ${worst.map(v => `- ${v.title}`).join('\n')}
    `;

    const prompt = `
    당신은 유튜브 전문 컨설턴트입니다. 위 데이터를 바탕으로 채널을 정밀 진단하고 솔루션을 제시해주세요.
    JSON 형식으로 응답해주세요.
    
    Schema:
    {
      "overallDiagnosis": { "title": "", "summary": "" },
      "detailedAnalysis": [
        { "area": "콘텐츠 기획", "problem": "", "solution": "" },
        { "area": "시청자 참여", "problem": "", "solution": "" }
      ],
      "actionPlan": {
        "shortTerm": { "title": "단기 처방", "period": "1~3개월", "steps": [""] },
        "longTerm": { "title": "장기 로드맵", "period": "6개월~1년", "steps": [""] }
      }
    }
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt + context,
        config: { responseMimeType: 'application/json' }
    });

    return parseJsonClean(response.text || '{}') as ConsultingResult;
};

export const analyzeVideosByKeyword = async (keyword: string, maxResults: number = 50, categoryId: string = '0', duration: string = 'any', onProgress?: (count: number) => void): Promise<AnalyzedVideo[]> => {
    const apiKey = getApiKey();
    let videoIds: string[] = [];
    let nextPageToken: string | undefined = undefined;
    
    let typeParam = '';
    if (duration === 'short') typeParam = '&videoDuration=short';
    else if (duration === 'medium') typeParam = '&videoDuration=medium';
    else if (duration === 'long') typeParam = '&videoDuration=long';

    let catParam = '';
    if (categoryId !== '0') catParam = `&videoCategoryId=${categoryId}`;

    const uniqueVideoIds = new Set<string>();

    let retryCount = 0;
    while (uniqueVideoIds.size < maxResults && retryCount < 3) { 
        const fetchCount = Math.min(50, maxResults - uniqueVideoIds.size + 10); 
        
        const url = `https://www.googleapis.com/youtube/v3/search?part=id&q=${encodeURIComponent(keyword)}&type=video&maxResults=${fetchCount}&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}${typeParam}${catParam}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.items) {
            data.items.forEach((item: any) => {
                if (item.id.videoId) {
                    uniqueVideoIds.add(item.id.videoId);
                }
            });
        }
        
        if (onProgress) onProgress(uniqueVideoIds.size);
        
        nextPageToken = data.nextPageToken;
        if (!nextPageToken || data.items?.length === 0) {
             retryCount++; // Break if no more pages
             if(retryCount > 1) break; 
        }
        
        if (uniqueVideoIds.size >= maxResults) break;
    }

    videoIds = Array.from(uniqueVideoIds).slice(0, maxResults);
    return getVideoDetailsAndStats(videoIds);
};

export const analyzeKeywordVolume = async (keyword: string): Promise<KeywordAnalysisResult> => {
    const ai = await initGoogleClient();
    const prompt = `
    키워드 '${keyword}'에 대한 검색량 분석 데이터를 생성해주세요.
    실제 데이터에 근접하게 추정하고, 연관 키워드를 함께 제공해주세요.
    
    Schema:
    {
      "relatedKeywords": ["", "", ""],
      "volumes": [
        { "keyword": "${keyword}", "pcVolume": 15000, "mobileVolume": 45000, "totalVolume": 60000 },
        { "keyword": "연관키워드1", "pcVolume": 5000, "mobileVolume": 10000, "totalVolume": 15000 }
      ]
    }
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });

    return parseJsonClean(response.text || '{}') as KeywordAnalysisResult;
};

export const cleanTranscript = async (text: string, instruction?: string): Promise<string> => {
    const ai = await initGoogleClient();
    const prompt = `${instruction ? `[지침: ${instruction}]\n` : ''}다음 스크립트에서 불필요한 추임새, 반복, 광고 멘트 등을 제거하고 깔끔하게 정리해주세요.\n\n${text.substring(0, 20000)}`; // Limit length
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text || "";
};

export const summarizeTranscriptForCreation = async (text: string, instruction?: string): Promise<SummaryObject> => {
    const ai = await initGoogleClient();
    const prompt = `${instruction ? `[지침: ${instruction}]\n` : ''}다음 내용을 바탕으로 새로운 콘텐츠 생성을 위한 핵심 요약 정보를 JSON으로 추출해주세요.
    Schema: { "title": "", "coreMessage": "", "structure": "", "summaryPoints": [] }
    \n${text.substring(0, 20000)}`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return parseJsonClean(response.text || '{}');
};

export const recreateScriptFromSummary = async (summary: SummaryObject, context: any, instruction?: string): Promise<GeneratedScript> => {
    const ai = await initGoogleClient();
    const prompt = `${instruction ? `[지침: ${instruction}]\n` : ''}
    원본 요약: ${JSON.stringify(summary)}
    참고 정보: ${JSON.stringify(context)}
    
    위 정보를 바탕으로 새로운 유튜브 영상 대본을 작성해주세요. 
    표절이 되지 않도록 내용을 재구성하고 창의적인 요소를 더해주세요.
    JSON 포맷: GeneratedScript interface 참조.
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return parseJsonClean(response.text || '{}');
};

export const generateTitlesFromScript = async (script: GeneratedScript, instruction?: string): Promise<GeneratedTitles> => {
    const ai = await initGoogleClient();
    const prompt = `${instruction ? `[지침: ${instruction}]\n` : ''}다음 대본에 어울리는 유튜브 제목 10개를 생성해주세요. (신선한 것 5개, 안정적인 것 5개)\nJSON: { "fresh": [], "stable": [] }\n\n${script.title}\n${script.description}`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return parseJsonClean(response.text || '{}');
};

export const generateThumbnailTextFromTitles = async (titles: GeneratedTitles, instruction?: string): Promise<GeneratedThumbnailText> => {
    const ai = await initGoogleClient();
    const prompt = `${instruction ? `[지침: ${instruction}]\n` : ''}위 제목들에 어울리는 썸네일 텍스트를 유형별로 생성해주세요.\nJSON: { "emotional": [], "informational": [], "visual": [] }\n\n${titles.fresh.join(', ')}`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return parseJsonClean(response.text || '{}');
};

export const getTrendingVideos = async (regionCode: string = 'KR', maxResults: number = 50, categoryId?: string): Promise<AnalyzedVideo[]> => {
    const apiKey = getApiKey();
    let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&chart=mostPopular&regionCode=${regionCode}&maxResults=${maxResults}&key=${apiKey}`;
    
    if (categoryId && categoryId !== 'all') {
        url += `&videoCategoryId=${categoryId}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items) {
        return data.items.map((item: any) => ({
            id: item.id,
            title: item.snippet.title,
            description: item.snippet.description,
            publishedAt: item.snippet.publishedAt,
            thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
            tags: item.snippet.tags || [],
            hashtags: extractHashtags(item.snippet.description),
            viewCount: parseInt(item.statistics.viewCount || '0'),
            likeCount: parseInt(item.statistics.likeCount || '0'),
            commentCount: parseInt(item.statistics.commentCount || '0'),
            popularityScore: 0, // Can be calculated if needed
            duration: parseISO8601Duration(item.contentDetails.duration),
            videoType: parseISO8601Duration(item.contentDetails.duration) <= 60 ? 'short' : 'regular',
            channelId: item.snippet.channelId,
            channelTitle: item.snippet.channelTitle
        }));
    }
    return [];
};

export const getVideoCategories = async (regionCode: string = 'KR'): Promise<VideoCategory[]> => {
    const apiKey = getApiKey();
    
    // Fallback categories in case API fails or is not accessible yet
    const fallbackCategories: VideoCategory[] = [
        { id: '1', title: '영화/애니메이션' },
        { id: '2', title: '자동차/교통' },
        { id: '10', title: '음악' },
        { id: '15', title: '반려동물/동물' },
        { id: '17', title: '스포츠' },
        { id: '19', title: '여행/이벤트' },
        { id: '20', title: '게임' },
        { id: '22', title: '인물/블로그' },
        { id: '23', title: '코미디' },
        { id: '24', title: '엔터테인먼트' },
        { id: '25', title: '뉴스/정치' },
        { id: '26', title: '노하우/스타일' },
        { id: '27', title: '교육' },
        { id: '28', title: '과학/기술' },
    ];

    try {
        const url = `https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=${regionCode}&key=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Category fetch failed');
        const data = await response.json();
        if (data.items) {
            return data.items.map((item: any) => ({
                id: item.id,
                title: item.snippet.title
            }));
        }
    } catch (e) {
        console.warn("Categories fetch failed, using fallback.", e);
        return fallbackCategories;
    }
    return fallbackCategories;
};

export const analyzeTrendsFromVideos = async (videos: AnalyzedVideo[]): Promise<TrendingKeyword[]> => {
    const ai = await initGoogleClient();
    const videoTitles = videos.slice(0, 30).map(v => v.title).join('\n');
    const prompt = `
    다음은 현재 유튜브 급상승 동영상 제목들입니다.
    트렌드를 분석하여 핵심 키워드 순위를 매겨주세요.
    Schema: [ { "rank": 1, "keyword": "", "videoCount": 0, "totalViews": 0, "mainCategory": "", "mainChannelType": "" } ]
    \n${videoTitles}
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return parseJsonClean(response.text || '[]');
};

export const analyzeRisingCreators = async (videos: AnalyzedVideo[]): Promise<RisingCreator[]> => {
    const ai = await initGoogleClient();
    const creators = videos.slice(0, 30).map(v => `${v.channelTitle} (영상: ${v.title})`).join('\n');
    const prompt = `
    다음은 급상승 동영상에 올라온 크리에이터들입니다.
    주목해야 할 라이징 크리에이터를 선정해주세요.
    Schema: [ { "rank": 1, "name": "", "videoCount": 0, "channelId": "", "thumbnailUrl": "" } ]
    \n${creators}
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return parseJsonClean(response.text || '[]');
};

export const fetchGoogleTrends = async (): Promise<GoogleTrendItem[]> => {
    // Not used in this updated version, but kept for compatibility
    return [];
};

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
};

export const analyzeThumbnail = async (base64Image: string): Promise<ThumbnailAnalysisResult> => {
    const ai = await initGoogleClient();
    const prompt = `
    이 유튜브 썸네일을 분석해주세요.
    1. 시인성, 호기심, 텍스트 가독성, 디자인 점수 (0-100).
    2. 장점, 단점, 개선점 피드백.
    
    JSON Schema:
    {
      "overallScore": 0,
      "scores": { "visibility": 0, "curiosity": 0, "textReadability": 0, "design": 0 },
      "feedback": { "strengths": [], "weaknesses": [], "improvements": [] }
    }
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                { text: prompt }
            ]
        },
        config: { responseMimeType: 'application/json' }
    });
    
    return parseJsonClean(response.text || '{}');
};

export const getVideoComments = async (videoId: string, maxResults: number = 100): Promise<string[]> => {
    const apiKey = getApiKey();
    const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=${maxResults}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items) {
        return data.items.map((item: any) => item.snippet.topLevelComment.snippet.textDisplay);
    }
    return [];
};

export const analyzeCommentSentiment = async (comments: string[]): Promise<CommentAnalysisResult> => {
    const ai = await initGoogleClient();
    const commentsText = comments.join('\n');
    const prompt = `
    다음 유튜브 댓글들을 분석하여 여론을 파악해주세요.
    
    Schema:
    {
      "sentiment": { "positive": 0, "negative": 0, "neutral": 0 }, // Percentage
      "keywords": ["key1", "key2"],
      "summary": { "pros": [], "cons": [], "oneLine": "" }
    }
    \n${commentsText.substring(0, 25000)}
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    
    return parseJsonClean(response.text || '{}');
};

export const compareChannels = async (queryA: string, queryB: string): Promise<ChannelBattleResult> => {
    const [channelA, channelB] = await Promise.all([findChannel(queryA), findChannel(queryB)]);
    
    // Mock power score calculation logic (simplified)
    const calcScore = (c: YouTubeChannel) => {
        const v = c.viewCount / 100000;
        const s = c.subscriberCount / 1000;
        return Math.min(Math.round((v + s) / 2), 1000); // Normalized somewhat
    };

    const statsA: BattleStats = {
        subscribers: channelA.subscriberCount,
        totalViews: channelA.viewCount,
        avgViews: Math.round(channelA.viewCount / channelA.videoCount),
        engagementRate: 0, // Needs video analysis for accuracy
        uploadFrequency: 0,
        videoCount: channelA.videoCount,
        powerScore: calcScore(channelA)
    };

    const statsB: BattleStats = {
        subscribers: channelB.subscriberCount,
        totalViews: channelB.viewCount,
        avgViews: Math.round(channelB.viewCount / channelB.videoCount),
        engagementRate: 0,
        uploadFrequency: 0,
        videoCount: channelB.videoCount,
        powerScore: calcScore(channelB)
    };

    const winner = statsA.powerScore > statsB.powerScore ? 'A' : statsA.powerScore < statsB.powerScore ? 'B' : 'Tie';

    return {
        channelA,
        channelB,
        statsA,
        statsB,
        winner,
        radarData: [
            { subject: '구독자', A: 80, B: 60, fullMark: 100 }, // Mock data for radar
            { subject: '조회수', A: 70, B: 90, fullMark: 100 },
            { subject: '활동성', A: 50, B: 80, fullMark: 100 },
            { subject: '잠재력', A: 90, B: 70, fullMark: 100 },
            { subject: '참여도', A: 60, B: 60, fullMark: 100 },
        ]
    };
};

export const generateShortsIdeas = async (keyword: string, instruction?: string): Promise<ShortsIdea[]> => {
    const ai = await initGoogleClient();
    const prompt = `${instruction ? `[지침: ${instruction}]\n` : ''}
    키워드 '${keyword}'를 주제로 바이럴 될 수 있는 쇼츠(Shorts) 아이디어 5개를 제안해주세요.
    
    Schema:
    [
      { "title": "", "hook": "3초 훅 멘트", "script": "전체 대본", "visualGuide": "촬영 연출 가이드" }
    ]
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    
    return parseJsonClean(response.text || '[]');
};

export const generateTrendInsightReport = async (): Promise<TrendInsightResult> => {
    const ai = await initGoogleClient();
    const today = new Date().toLocaleDateString('ko-KR');
    const prompt = `
    오늘(${today}) 대한민국에서 가장 이슈가 되고 있는 실시간 검색어 트렌드를 분석해주세요.
    최신 뉴스와 트렌드를 검색하여 네이버와 구글 트렌드를 기반으로 각각 1위부터 10위까지 정리해주세요.
    결과는 반드시 아래 JSON 스키마에 맞춰서 출력해주세요. 마크다운 코드 블록(\`\`\`json ... \`\`\`)으로 감싸주세요.
    
    JSON Schema:
    {
      "naver": [
        { "rank": 1, "keyword": "키워드", "searchVolume": "10만+", "status": "new" } // status: new, up, down, same (랜덤하게 섞어서)
      ],
      "google": [
        { "rank": 1, "keyword": "키워드", "searchVolume": "5만+", "status": "up" }
      ]
    }
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });

    return parseJsonClean(response.text || '{}') as TrendInsightResult;
};

export const generateAIImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    const ai = await initGoogleClient();
    
    // Note: Call generateContent to generate images with nano banana series models; do not use it for Imagen models.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: prompt }]
        },
        config: {
            // responseMimeType: 'image/png' // DO NOT set responseMimeType for nano banana models
            imageConfig: { aspectRatio: aspectRatio as any }
        }
    });

    // The output response may contain both image and text parts; iterate to find image
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    throw new Error("이미지 생성에 실패했습니다.");
};

// services/youtubeService.ts (862행부터 시작하는 블록을 대체)

export const editAIImage = async (imageBase64: string, prompt: string): Promise<string> => {
  // 1. 함수 이름 오타 수정 완료
  const ai = await initGoogleClient();

  // 2. response 변수 선언 및 generateContent 호출
  //    호출 함수에 'as any'를 적용하여 타입 오류를 무시합니다.
  const response = await (ai.models.generateContent as any)({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/png', // MIME 타입은 실제 데이터와 일치해야 합니다.
          },
        },
        { text: prompt },
      ],
    },
    // 만약 config 설정이 필요하다면 여기에 추가 (예: config: { ... } as any)
  });

  // 3. 응답 처리 및 최종 리턴
  if (response.candidates && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        // 성공 시 데이터 URL 반환
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }

  // 오류 발생 시 예외 처리 (리턴 값이 없다는 오류 TS2355 해결)
  throw new Error("이미지 편집에 실패했습니다.");
};

// --- Voice Generation ---

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
    const ai = await initGoogleClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("오디오 생성 실패");
    return base64Audio;
};

// Helpers for audio processing
export const base64ToUint8Array = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

// Create WAV header for raw PCM data (assuming 24kHz, 1 channel, 16-bit from Gemini)
export const pcmToWav = (pcmData: Uint8Array, sampleRate: number = 24000, numChannels: number = 1): Blob => {
    const buffer = new ArrayBuffer(44 + pcmData.length);
    const view = new DataView(buffer);

    const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + pcmData.length, true);
    writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true); // NumChannels
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * numChannels * 2, true); // ByteRate
    view.setUint16(32, numChannels * 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample

    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, pcmData.length, true);

    // Write PCM data
    const pcmView = new Uint8Array(buffer, 44);
    pcmView.set(pcmData);

    return new Blob([buffer], { type: 'audio/wav' });
};

// --- Calendar Trends ---

export const predictMonthlyTrends = async (year: number, month: number): Promise<CalendarTrendEvent[]> => {
    const ai = await initGoogleClient();
    const prompt = `
    ${year}년 ${month}월 대한민국에서 예상되는 주요 트렌드, 기념일, 시즌 이슈를 예측해주세요.
    유튜브 크리에이터가 콘텐츠 소재로 활용할 수 있는 구체적인 이벤트여야 합니다.
    (예: 발렌타인데이, 수능 D-100, 벚꽃 개화, 대형 게임 출시, 영화 개봉 등)
    
    Schema:
    [
      { 
        "date": "YYYY-MM-DD", 
        "event": "이벤트 이름", 
        "category": "holiday" | "trend" | "season" | "release", 
        "intensity": "High" | "Medium" | "Low" 
      }
    ]
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    
    return parseJsonClean(response.text || '[]');
};

export const generatePlanForDate = async (date: string, trend: string): Promise<ScheduledContent> => {
    const ai = await initGoogleClient();
    const prompt = `
    날짜: ${date}
    트렌드/이슈: ${trend}
    
    위 날짜와 트렌드에 맞춰 유튜브 영상을 하나 기획해주세요.
    
    Schema:
    {
      "title": "클릭을 부르는 영상 제목",
      "description": "영상 컨셉 및 내용 3줄 요약",
      "status": "idea"
    }
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    
    const result = parseJsonClean(response.text || '{}');
    return {
        id: Date.now().toString(),
        date,
        title: result.title,
        description: result.description,
        status: 'idea'
    };
};
