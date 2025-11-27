import React, { useState, useEffect, useCallback } from 'react';
import { initGoogleClient, getTrendingVideos, getVideoCategories, analyzeTrendsFromVideos, analyzeRisingCreators } from '../services/youtubeService';
import type { VideoCategory, TrendingKeyword, RisingCreator } from '../types';
import { InformationCircleIcon, LikeIcon, ViewIcon } from './icons';
import ProtectedRoute from './ProtectedRoute';   // 🔥 중요: 보호 라우트 가져오기

const TrendingViewContent: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'hotVideos' | 'realtimeTrend' | 'risingCreators'>('hotVideos');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [categories, setCategories] = useState<VideoCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const [videos, setVideos] = useState<any[]>([]);
    const [trends, setTrends] = useState<TrendingKeyword[]>([]);
    const [creators, setCreators] = useState<RisingCreator[]>([]);

    const handleGenericError = (err: unknown) => {
        const message = (err instanceof Error) ? err.message : '알 수 없는 오류가 발생했습니다.';
        setError(message);
        console.error("오류 발생:", err);
    };

    const fetchDataForCategory = useCallback(async (categoryId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const videoData = await getTrendingVideos('KR', 50, categoryId);
            setVideos(videoData);

            if (videoData.length > 0) {
                try {
                    const [trendsResult, creatorsResult] = await Promise.all([
                        analyzeTrendsFromVideos(videoData),
                        analyzeRisingCreators(videoData)
                    ]);
                    setTrends(trendsResult);
                    setCreators(creatorsResult);
                } catch (aiError) {
                    console.error("AI Analysis failed:", aiError);
                    setTrends([]);
                    setCreators([]);
                }
            } else {
                setTrends([]);
                setCreators([]);
            }
        } catch (err) {
            handleGenericError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const initialize = async () => {
            try {
                await initGoogleClient();
                const fetchedCategories = await getVideoCategories();
                setCategories([{ id: 'all', title: '전체' }, ...fetchedCategories]);
                await fetchDataForCategory('all');
            } catch (err) {
                handleGenericError(err);
                setIsLoading(false);
            }
        };
        initialize();
    }, [fetchDataForCategory]);

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategory(categoryId);
        fetchDataForCategory(categoryId);
    };

    const formatNumber = (num: number): string => {
        if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
        if (num >= 10000) return `${Math.round(num / 10000)}만`;
        return new Intl.NumberFormat('ko-KR').format(num);
    };

    const formatDuration = (totalSeconds: number): string => {
        if (isNaN(totalSeconds) || totalSeconds < 0) return "00:00";
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        const paddedMinutes = String(minutes).padStart(2, '0');
        const paddedSeconds = String(seconds).padStart(2, '0');
        if (hours > 0) return `${hours}:${paddedMinutes}:${paddedSeconds}`;
        return `${paddedMinutes}:${paddedSeconds}`;
    };

    const TabButton: React.FC<{ tabId: any; children: React.ReactNode }> = ({ tabId, children }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-lg font-bold rounded-t-lg transition-colors ${
                activeTab === tabId
                    ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border-b-2 border-red-500'
                    : 'text-slate-500 dark:text-slate-400 hover:text-red-500'
            }`}
        >
            {children}
        </button>
    );

    const renderHotVideos = () => (
        <div>
            <div className="mb-4 flex flex-wrap gap-2">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                            selectedCategory === cat.id
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                        }`}
                    >
                        {cat.title}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {videos.map(video => (
                    <div key={video.id} className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden group">
                        <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank">
                            <div className="relative">
                                <img src={video.thumbnailUrl} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform" />
                                <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                    {formatDuration(video.duration)}
                                </span>
                            </div>
                            <div className="p-3">
                                <h3 className="font-bold text-sm line-clamp-2 text-slate-800 dark:text-slate-100">{video.title}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">{video.channelTitle}</p>
                                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1"><ViewIcon className="w-4 h-4"/>{formatNumber(video.viewCount)}회</span>
                                    <span className="flex items-center gap-1"><LikeIcon className="w-4 h-4"/>{formatNumber(video.likeCount)}</span>
                                </div>
                            </div>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderRealtimeTrend = () => (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-700">
                    <tr>
                        <th className="px-6 py-3 text-center">순위</th>
                        <th className="px-6 py-3">키워드</th>
                        <th className="px-6 py-3 text-center">영상 수</th>
                        <th className="px-6 py-3 text-right">총 조회수</th>
                        <th className="px-6 py-3">주요 카테고리</th>
                        <th className="px-6 py-3">주요 채널 유형</th>
                    </tr>
                </thead>
                <tbody>
                    {trends.length > 0 ? trends.map((trend) => (
                        <tr key={trend.rank} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                            <td className="font-bold text-lg text-center px-6 py-4">{trend.rank}</td>
                            <td className="px-6 py-4 font-bold">{trend.keyword}</td>
                            <td className="px-6 py-4 text-center">{trend.videoCount}개</td>
                            <td className="px-6 py-4 text-right font-semibold text-red-600">{formatNumber(trend.totalViews)}회</td>
                            <td className="px-6 py-4">{trend.mainCategory}</td>
                            <td className="px-6 py-4">{trend.mainChannelType}</td>
                        </tr>
                    )) : (
                        <tr><td colSpan={6} className="px-6 py-8 text-center">AI 분석 중...</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderRisingCreators = () => (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-700">
                    <tr>
                        <th className="px-6 py-3 text-center">순위</th>
                        <th className="px-6 py-3">크리에이터</th>
                        <th className="px-6 py-3 text-center">급상승 영상 수</th>
                    </tr>
                </thead>
                <tbody>
                    {creators.length > 0 ? creators.map((creator) => (
                        <tr key={creator.rank} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                            <td className="px-6 py-4 text-center font-bold text-lg">{creator.rank}</td>
                            <td className="px-6 py-4 font-bold">
                                <a href={`https://www.youtube.com/channel/${creator.channelId}`} target="_blank" className="flex items-center gap-3">
                                    <img src={creator.thumbnailUrl} className="w-10 h-10 rounded-full" />
                                    <span>{creator.name}</span>
                                </a>
                            </td>
                            <td className="px-6 py-4 text-center font-semibold text-red-600">{creator.videoCount}개</td>
                        </tr>
                    )) : (
                        <tr><td colSpan={3} className="px-6 py-8 text-center">데이터 분석 중...</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center p-10 h-96 flex flex-col justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-lg font-semibold">최신 트렌드 데이터를 불러오는 중...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center p-10 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-500/30 rounded-lg shadow-md">
                    <p className="text-lg font-semibold text-red-700">{error}</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'hotVideos': return renderHotVideos();
            case 'realtimeTrend': return renderRealtimeTrend();
            case 'risingCreators': return renderRisingCreators();
            default: return null;
        }
    };

    const SidePanel = ({ title, data }: any) => (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
                {title}
                <InformationCircleIcon className="w-4 h-4 text-slate-400" />
            </h3>

            {data.length > 0 ? (
                <ul className="space-y-2">
                    {data.slice(0, 5).map((item: any) => (
                        <li key={item.rank} className="text-sm flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-600 w-5 text-center">{item.rank}</span>
                                <span className="truncate">{item.keyword ?? item.name}</span>
                            </div>
                            <span className="text-xs text-slate-500">{item.videoCount}개</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-xs text-center py-4">데이터 분석 중...</p>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                <h2 className="text-3xl font-bold">유행성 급상승 동영상</h2>
                <p className="text-slate-500 mt-1">지금 유튜브를 뜨겁게 달구는 트렌드를 데이터로 확인하세요.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <div className="border-b mb-4">
                        <TabButton tabId="hotVideos">급상승 동영상</TabButton>
                        <TabButton tabId="realtimeTrend">실시간 트렌드</TabButton>
                        <TabButton tabId="risingCreators">라이징 크리에이터</TabButton>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
                        {renderContent()}
                    </div>
                </div>

                <div className="space-y-6">
                    <SidePanel title="실시간 급상승 순위" data={trends} />
                    <SidePanel title="라이징 크리에이터 랭킹" data={creators} />
                </div>
            </div>
        </div>
    );
};

/** 
 * 🔥 핵심: ProtectedRoute로 감싸서 바로 export
 * 로그인 X → /login 이동
 * 구독 X → /upgrade 이동
 */
const TrendingViewProtected = () => (
    <ProtectedRoute requireSubscription>
        <TrendingViewContent />
    </ProtectedRoute>
);

export default TrendingViewProtected;
