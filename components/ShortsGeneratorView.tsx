import React, { useState, useEffect } from 'react';
import ProtectedRoute from "../components/ProtectedRoute";
import { generateShortsIdeas } from '../services/youtubeService';
import { getInstructions } from '../services/instructionService';
import type { ShortsIdea, SystemInstruction } from '../types';
import { LightningIcon, CopyIcon, BrainIcon } from './icons';

const ShortsGeneratorView: React.FC = () => {
    // Short-form States
    const [keyword, setKeyword] = useState('');
    const [isLoadingIdea, setIsLoadingIdea] = useState(false);
    const [ideas, setIdeas] = useState<ShortsIdea[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Instructions
    const [instructions, setInstructions] = useState<SystemInstruction[]>([]);
    const [selectedInstructionId, setSelectedInstructionId] = useState<string>('');

    useEffect(() => {
        const loaded = getInstructions();
        setInstructions(loaded);

        const active = loaded.find(i => i.isActive) || loaded[0];
        if (active) setSelectedInstructionId(active.id);
    }, []);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setIsLoadingIdea(true);
        setError(null);
        setIdeas([]);

        try {
            const selectedContent =
                instructions.find(i => i.id === selectedInstructionId)?.content;

            const result = await generateShortsIdeas(keyword.trim(), selectedContent);
            setIdeas(result);
        } catch (err: any) {
            setError(err.message || '아이디어 생성 중 오류가 발생했습니다.');
        } finally {
            setIsLoadingIdea(false);
        }
    };

    const copyIdea = (idea: ShortsIdea) => {
        const text =
            `[${idea.title}]\n\n` +
            `HOOK: ${idea.hook}\n\n` +
            `대본:\n${idea.script}\n\n` +
            `연출: ${idea.visualGuide}`;

        navigator.clipboard.writeText(text);
        alert('대본이 복사되었습니다!');
    };

    return (
        <ProtectedRoute>
            <div className="max-w-5xl mx-auto font-sans animate-fade-in-up pb-12">
                {/* Header */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg mb-8 text-center border border-slate-200 dark:border-slate-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 mb-4">
                        <LightningIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                        쇼츠 아이디어 생성기
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        키워드만 입력하면 3초 훅이 포함된 5가지 바이럴 쇼츠 대본이 쏟아집니다.
                    </p>
                </div>

                {/* Persona Selector */}
                <form onSubmit={handleGenerate} className="max-w-2xl mx-auto mb-10 space-y-4">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg border border-slate-200 dark:border-slate-600 w-fit mx-auto">
                        <BrainIcon className="w-5 h-5 text-slate-500 dark:text-slate-400 ml-2" />
                        <select
                            value={selectedInstructionId}
                            onChange={(e) => setSelectedInstructionId(e.target.value)}
                            className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer pr-2"
                        >
                            {instructions.map(inst => (
                                <option
                                    key={inst.id}
                                    value={inst.id}
                                    className="bg-white dark:bg-slate-800"
                                >
                                    {inst.name} {inst.isActive ? '(기본)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Keyword Input */}
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="주제 키워드를 입력하세요 (예: 편의점 꿀조합, 아이폰 꿀팁)"
                            className="w-full px-6 py-4 text-lg bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-full focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 dark:text-white shadow-sm transition-all"
                            disabled={isLoadingIdea}
                        />
                        <button
                            type="submit"
                            disabled={isLoadingIdea || !keyword.trim()}
                            className="absolute right-2 px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-full transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-600"
                        >
                            {isLoadingIdea ? '생성 중...' : '대본 생성'}
                        </button>
                    </div>
                </form>

                {/* Error */}
                {error && (
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Generated Ideas */}
                {ideas.length > 0 && (
                    <div className="grid gap-6">
                        {ideas.map((idea, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                                        <span className="text-yellow-500 mr-2">#{index + 1}</span>
                                        {idea.title}
                                    </h3>
                                    <button
                                        onClick={() => copyIdea(idea)}
                                        className="text-slate-400 hover:text-blue-500 transition-colors"
                                        title="복사"
                                    >
                                        <CopyIcon />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    {/* Hook */}
                                    <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border-l-4 border-red-500">
                                        <span className="text-xs font-bold text-red-600 dark:text-red-400 block mb-1">🪝 3초 HOOK</span>
                                        <p className="text-slate-800 dark:text-slate-200 font-medium">{idea.hook}</p>
                                    </div>

                                    {/* Script */}
                                    <div>
                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">📜 촬영 대본</span>
                                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                            {idea.script}
                                        </p>
                                    </div>

                                    {/* Visual Guide */}
                                    <div className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg">
                                        <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 block mb-1">🎥 촬영/편집 가이드</span>
                                        <p className="text-slate-600 dark:text-slate-300 text-xs">
                                            {idea.visualGuide}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default ShortsGeneratorView;
