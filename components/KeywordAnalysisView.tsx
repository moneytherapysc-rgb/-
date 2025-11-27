import React, { useState, useEffect } from 'react';
import { analyzeKeywordVolume, generateKeywordStrategyAnalysis } from '../services/youtubeService';
import { addToHistory, isFavorite, addToFavorites, removeFromFavoritesByValue, getFolders } from '../services/storageService';
import type { KeywordAnalysisResult, Folder, StrategyResult } from '../types';
import KeywordTrendOverview from './KeywordTrendOverview';
import { SearchIcon, BookmarkIcon, BrainIcon } from './icons';
import StrategyModal from './StrategyModal';

// 🔥 추가됨: ProtectedRoute import
import ProtectedRoute from './ProtectedRoute';

interface KeywordAnalysisViewProps {
    initialQuery?: string;
}

const KeywordAnalysisView: React.FC<KeywordAnalysisViewProps> = ({ initialQuery }) => {
    const [query, setQuery] = useState(initialQuery || '');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<KeywordAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const [isFavorited, setIsFavorited] = useState(false);
    const [showFolderSelect, setShowFolderSelect] = useState(false);
    const [folders, setFolders] = useState<Folder[]>([]);

    const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
    const [isStrategyLoading, setIsStrategyLoading] = useState(false);
    const [strategyError, setStrategyError] = useState<string | null>(null);
    const [strategyResult, setStrategyResult] = useState<StrategyResult | null>(null);

    useEffect(() => {
        if (initialQuery) {
            performSearch(initialQuery);
        }
    }, [initialQuery]);

    useEffect(() => {
        if (result) {
            checkFavoriteStatus();
        } else {
            setIsFavorited(false);
        }
    }, [result, query]);

    const checkFavoriteStatus = () => {
        setIsFavorited(isFavorite('keyword', query));
    };

    const performSearch = async (keyword: string) => {
        if (!keyword.trim()) return;
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await analyzeKeywordVolume(keyword.trim());
            setResult(data);

            addToHistory({
                type: 'keyword',
                value: keyword.trim(),
                title: keyword.trim()
            });
        } catch (err: any) {
            setError(err.message || '분석 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(query);
    };

    const handleFavoriteClick = () => {
        if (!result) return;
        if (isFavorited) {
            removeFromFavoritesByValue('keyword', query);
            setIsFavorited(false);
        } else {
            setFolders(getFolders());
            setShowFolderSelect(!showFolderSelect);
        }
    };

    const handleAddToFolder = (folderId: string) => {
        addToFavorites({
            type: 'keyword',
            value: query,
            title: query,
            folderId
        });
        setIsFavorited(true);
        setShowFolderSelect(false);
    };

    const handleGenerateStrategy = async () => {
        if (!query.trim()) return;
        setIsStrategyModalOpen(true);
        setIsStrategyLoading(true);
        setStrategyError(null);
        setStrategyResult(null);

        try {
            const result = await generateKeywordStrategyAnalysis(query.trim());
            setStrategyResult(result);
        } catch (err: any) {
            setStrategyError(err.message || '전략 생성 중 오류가 발생했습니다.');
        } finally {
            setIsStrategyLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="max-w-6xl mx-auto font-sans">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg mb-8 border border-slate-200 dark:border-slate-700">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center justify-center gap-2">
                            키워드 분석
                            {result && (
                                <div className="relative">
                                    <button 
                                        onClick={handleFavoriteClick}
                                        className={`p-1.5 rounded-full transition-colors ${
                                            isFavorited 
                                                ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                                                : 'text-slate-300 hover:text-yellow-500'
                                        }`}
                                        title={isFavorited ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                                    >
                                        <BookmarkIcon className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
                                    </button>

                                    {showFolderSelect && (
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-600 z-20 animate-fade-in-up text-left">
                                            <div className="p-2 border-b border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-500 dark:text-slate-400">
                                                폴더 선택
                                            </div>

                                            <button
                                                onClick={() => handleAddToFolder('uncategorized')}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                                            >
                                                미분류
                                            </button>

                                            {folders.map(f => (
                                                <button
                                                    key={f.id}
                                                    onClick={() => handleAddToFolder(f.id)}
                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 truncate"
                                                >
                                                    {f.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </h2>

                        <p className="text-slate-500 dark:text-slate-400">
                            키워드의 검색량과 연관 태그를 분석하여 황금 키워드를 발굴하세요.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSearch}
                        className="max-w-2xl mx-auto flex shadow-md rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-600 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-200 transition-all"
                    >
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="분석할 키워드를 입력하세요 (예: 스마트스토어, 브이로그)"
                            className="flex-grow px-6 py-4 text-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 outline-none"
                            disabled={isLoading}
                        />

                        <button
                            type="submit"
                            disabled={isLoading || !query.trim()}
                            className="bg-red-600 hover:bg-red-700 text-white px-8 font-bold text-lg transition-colors disabled:bg-slate-400 flex items-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <SearchIcon /> 검색
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl text-red-700 dark:text-red-300 text-center mb-6">
                        <i className="fas fa-exclamation-circle mr-2"></i>
                        {error}
                    </div>
                )}

                {result && (
                    <div className="animate-fade-in-up">
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={handleGenerateStrategy}
                                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:-translate-y-0.5"
                            >
                                <BrainIcon className="w-5 h-5" />
                                <span>AI 채널 전략 분석</span>
                            </button>
                        </div>

                        <KeywordTrendOverview data={result} />
                    </div>
                )}

                {!result && !isLoading && !error && (
                    <div className="text-center py-20 opacity-50">
                        <div className="text-6xl mb-4 text-slate-300 dark:text-slate-600">
                            <i className="fas fa-chart-pie"></i>
                        </div>
                        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                            키워드를 입력하고 검색 버튼을 눌러 분석을 시작하세요.
                        </p>
                    </div>
                )}

                <StrategyModal
                    isOpen={isStrategyModalOpen}
                    onClose={() => setIsStrategyModalOpen(false)}
                    strategy={strategyResult}
                    isLoading={isStrategyLoading}
                    error={strategyError}
                    title="AI 키워드 전략 분석"
                />

                <style>{`
                    @keyframes fade-in-up {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in-up {
                        animation: fade-in-up 0.5s ease-out forwards;
                    }
                `}</style>
            </div>
        </ProtectedRoute>
    );
};

export default KeywordAnalysisView;
