
import React, { useState, useEffect } from 'react';
import {
    cleanTranscript,
    summarizeTranscriptForCreation,
    recreateScriptFromSummary,
    generateTitlesFromScript,
    generateThumbnailTextFromTitles,
} from '../services/youtubeService';
import { getInstructions } from '../services/instructionService';
import type { GeneratedScript, SummaryObject, GeneratedTitles, GeneratedThumbnailText, SystemInstruction } from '../types';
import { CopyIcon, ClipboardCheckIcon, UploadIcon, YouTubeIcon, SparklesIcon, CheckCircleIcon, BrainIcon, InformationCircleIcon } from './icons';

type Step = 'input' | 'cleaning' | 'summarizing' | 'creating' | 'titling' | 'thumb nailing' | 'complete';

const ScriptGenerator: React.FC = () => {
    // --- State for Inputs ---
    const [benchmarkLink, setBenchmarkLink] = useState('');
    const [originalScript, setOriginalScript] = useState('');
    const [uploadedFileContent, setUploadedFileContent] = useState('');
    const [uploadedFileName, setUploadedFileName] = useState('');
    
    // --- State for Persona Selection ---
    const [instructions, setInstructions] = useState<SystemInstruction[]>([]);
    const [selectedInstructionId, setSelectedInstructionId] = useState<string>('');

    // --- State for Process Control ---
    const [currentStep, setCurrentStep] = useState<Step>('input');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- State for Step Results ---
    const [cleanedScript, setCleanedScript] = useState<string | null>(null);
    const [summary, setSummary] = useState<SummaryObject | null>(null);
    const [newScript, setNewScript] = useState<GeneratedScript | null>(null);
    const [titles, setTitles] = useState<GeneratedTitles | null>(null);
    const [thumbnailTexts, setThumbnailTexts] = useState<GeneratedThumbnailText | null>(null);

    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

    useEffect(() => {
        const loadedInstructions = getInstructions();
        setInstructions(loadedInstructions);
        // Default to the active one, or the first one
        const activeInst = loadedInstructions.find(i => i.isActive) || loadedInstructions[0];
        if (activeInst) {
            setSelectedInstructionId(activeInst.id);
        }
    }, []);

    const resetState = () => {
        setIsLoading(false);
        setError(null);
        setCurrentStep('input');
        setCleanedScript(null);
        setSummary(null);
        setNewScript(null);
        setTitles(null);
        setThumbnailTexts(null);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setUploadedFileContent(e.target?.result as string);
                    setUploadedFileName(file.name);
                };
                reader.readAsText(file);
            } else {
                setError('텍스트 파일(.txt, .md)만 업로드할 수 있습니다.');
            }
        }
    };
    
    // Helper to get content for the currently selected instruction
    const getSelectedInstructionContent = (): string | undefined => {
        const selected = instructions.find(i => i.id === selectedInstructionId);
        return selected?.content;
    };
    
    const handleProceed = async () => {
        setIsLoading(true);
        setError(null);
        const instructionContent = getSelectedInstructionContent();

        try {
            if (currentStep === 'cleaning') {
                const result = await summarizeTranscriptForCreation(cleanedScript!, instructionContent);
                setSummary(result);
                setCurrentStep('summarizing');
            } else if (currentStep === 'summarizing') {
                const context = { benchmarkLink, fileContent: uploadedFileContent };
                const result = await recreateScriptFromSummary(summary!, context, instructionContent);
                setNewScript(result);
                setCurrentStep('creating');
            } else if (currentStep === 'creating') {
                const result = await generateTitlesFromScript(newScript!, instructionContent);
                setTitles(result);
                setCurrentStep('titling');
            } else if (currentStep === 'titling') {
                const result = await generateThumbnailTextFromTitles(titles!, instructionContent);
                setThumbnailTexts(result);
                setCurrentStep('thumb nailing');
            } else if (currentStep === 'thumb nailing') {
                setCurrentStep('complete');
            }
        } catch (err: any) {
            setError(err.message || '작업 중 알 수 없는 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStart = async () => {
        if (!originalScript.trim()) {
            setError('분석할 원본 스크립트를 입력해주세요.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setCurrentStep('cleaning');
        const instructionContent = getSelectedInstructionContent();

        try {
            const result = await cleanTranscript(originalScript, instructionContent);
            setCleanedScript(result);
        } catch (err: any) {
            setError(err.message || '스크립트 정리 중 알 수 없는 오류가 발생했습니다.');
            setCurrentStep('input'); // Revert on error
        } finally {
            setIsLoading(false);
        }
    };

    const isStepComplete = (step: Step) => {
        const order: Step[] = ['input', 'cleaning', 'summarizing', 'creating', 'titling', 'thumb nailing', 'complete'];
        return order.indexOf(currentStep) >= order.indexOf(step);
    };
    
    const InputLabel: React.FC<{ htmlFor?: string, title: string, optional?: boolean }> = ({ htmlFor, title, optional }) => (
        <label htmlFor={htmlFor} className="block text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {title}
            {optional && <span className="text-sm font-normal text-slate-500 ml-2">(선택)</span>}
        </label>
    );

    const StepResult: React.FC<{ title: string; step: Step; children: React.ReactNode; icon: React.ReactNode; }> = ({ title, step, children, icon }) => {
        if (!isStepComplete(step)) return null;

        return (
            <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 animate-fade-in-up">
                <h3 className="flex items-center text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                    <span className="w-8 h-8 flex items-center justify-center text-green-500 mr-3">
                        {isStepComplete(step) ? <CheckCircleIcon className="w-6 h-6"/> : icon}
                    </span>
                    {title}
                </h3>
                <div className="pl-11">{children}</div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">AI 스크립트 벤치마킹 & 재창조</h2>
                <p className="text-center text-slate-500 dark:text-slate-400 mb-8">유튜브 대가 AI가 기존 영상을 분석하여 완전히 새로운 콘텐츠로 재탄생시킵니다.</p>

                {currentStep === 'input' && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div>
                            <InputLabel htmlFor="benchmark-link" title="벤치마킹할 유튜브 링크" optional/>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                    <YouTubeIcon className="h-5 w-5"/>
                                </span>
                                <input id="benchmark-link" type="text" value={benchmarkLink} onChange={(e) => setBenchmarkLink(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="w-full pl-10 pr-4 py-3 text-base bg-white dark:bg-slate-700 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        </div>
                        <div>
                            <InputLabel htmlFor="original-script" title="* 원본 스크립트 (대본)"/>
                            <textarea id="original-script" value={originalScript} onChange={(e) => setOriginalScript(e.target.value)}
                                placeholder="분석하고 싶은 영상의 대본 전체를 여기에 붙여넣으세요..." rows={8}
                                className="w-full px-4 py-3 text-base bg-white dark:bg-slate-700 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                            <div className="mt-3 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                                <div className="flex items-start gap-3">
                                    <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-slate-600 dark:text-slate-300 w-full">
                                        <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">💡 팁: 유튜브 대본 쉽게 가져오는 법</p>
                                        
                                        <div className="space-y-3">
                                            <div>
                                                <p className="font-semibold text-xs text-indigo-600 dark:text-indigo-400 mb-1">방법 1. 직접 복사하여 붙여넣기</p>
                                                <ol className="list-decimal list-inside space-y-0.5 text-xs">
                                                    <li>유튜브 영상 하단 <strong>'...더보기'</strong> &gt; <strong>'스크립트 표시'</strong> 클릭</li>
                                                    <li>우측에 나오는 스크립트를 드래그하여 복사 후 위 입력창에 붙여넣기</li>
                                                </ol>
                                            </div>
                                            
                                            <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
                                                <p className="font-semibold text-xs text-indigo-600 dark:text-indigo-400 mb-1">방법 2. 파일로 다운로드하여 업로드 (추천)</p>
                                                <ol className="list-decimal list-inside space-y-0.5 text-xs">
                                                    <li>유튜브 영상 <strong>'공유'</strong> 버튼 &gt; <strong>링크 복사</strong></li>
                                                    <li>
                                                        <a href="https://downsub.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-bold mx-1">
                                                            DownSub.com
                                                        </a> 
                                                        에 링크를 붙여넣고 다운로드
                                                    </li>
                                                    <li>다운로드 받은 <strong>TXT 파일</strong>을 아래 <strong>'추가 참고 파일'</strong>에 업로드</li>
                                                </ol>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <InputLabel title="추가 참고 파일" optional/>
                             <div className="flex items-center gap-4">
                                <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 dark:bg-slate-600 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors">
                                    <UploadIcon />
                                    <span>파일 선택 (.txt, .md)</span>
                                </label>
                                <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".txt,.md,text/plain,text/markdown"/>
                                {uploadedFileName && <p className="text-sm text-slate-500 dark:text-slate-400">첨부 파일: <span className="font-semibold">{uploadedFileName}</span></p>}
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="instruction-select" title="AI 지침 (페르소나) 선택"/>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                    <BrainIcon className="h-5 w-5"/>
                                </span>
                                <select 
                                    id="instruction-select"
                                    value={selectedInstructionId}
                                    onChange={(e) => setSelectedInstructionId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 text-base bg-white dark:bg-slate-700 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none cursor-pointer"
                                >
                                    {instructions.map((instruction) => (
                                        <option key={instruction.id} value={instruction.id}>
                                            {instruction.name} {instruction.isActive ? '(기본 설정)' : ''}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700 dark:text-slate-300">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                * 선택한 페르소나에 맞춰 AI가 스크립트를 작성합니다.
                            </p>
                        </div>

                         <button onClick={handleStart}
                            className="w-full py-4 text-lg font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 mt-4"
                            disabled={isLoading || !originalScript.trim()}>
                            {isLoading ? '분석 중...' : '분석 시작'}
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg text-red-700 dark:text-red-300 text-center">
                    <p className="font-bold">오류 발생!</p>
                    <p>{error}</p>
                    <button onClick={resetState} className="mt-2 text-sm font-semibold text-red-600 hover:underline">다시 시작하기</button>
                </div>
            )}
            
            {currentStep !== 'input' && (
                <div className="space-y-6">
                    <StepResult title="1단계: 원본 스크립트 정리" step="cleaning" icon={<SparklesIcon/>}>
                        <pre className="whitespace-pre-wrap bg-white dark:bg-slate-800 p-4 rounded-md text-sm font-sans leading-relaxed">{cleanedScript}</pre>
                    </StepResult>

                    <StepResult title="2단계: 핵심 내용 요약" step="summarizing" icon={<SparklesIcon/>}>
                        {summary && <div className="space-y-3 text-sm">
                           <p><strong>핵심 메시지:</strong> {summary.coreMessage}</p>
                           <p><strong>구조:</strong> {summary.structure}</p>
                           <ul className="list-disc list-inside space-y-1">
                                {summary.summaryPoints.map((p, i) => <li key={i}>{p}</li>)}
                           </ul>
                        </div>}
                    </StepResult>

                    <StepResult title="3단계: 새로운 스크립트로 재창조" step="creating" icon={<SparklesIcon/>}>
                        {newScript && <div className="text-sm space-y-4">
                            <h4 className="font-bold text-lg">{newScript.title}</h4>
                            <p className="text-xs italic">{newScript.description}</p>
                            <div className="p-3 bg-white dark:bg-slate-800 rounded">
                                <p className="font-semibold">오프닝:</p>
                                <p>{newScript.script.opening.narration}</p>
                            </div>
                        </div>}
                    </StepResult>
                    
                    <StepResult title="4단계: 유튜브 영상 제목 생성" step="titling" icon={<SparklesIcon/>}>
                         {titles && <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <h4 className="font-bold mb-2">신선한 버전</h4>
                                <ul className="list-disc list-inside space-y-1">{titles.fresh.map((t,i) => <li key={i}>{t}</li>)}</ul>
                            </div>
                            <div>
                                <h4 className="font-bold mb-2">안정적 버전</h4>
                                <ul className="list-disc list-inside space-y-1">{titles.stable.map((t,i) => <li key={i}>{t}</li>)}</ul>
                            </div>
                        </div>}
                    </StepResult>

                    <StepResult title="5단계: 썸네일 문구 생성" step="thumb nailing" icon={<SparklesIcon/>}>
                         {thumbnailTexts && <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <h4 className="font-bold mb-2">감정 자극형</h4>
                                <ul className="list-disc list-inside space-y-1">{thumbnailTexts.emotional.map((t,i) => <li key={i}>{t}</li>)}</ul>
                            </div>
                             <div>
                                <h4 className="font-bold mb-2">정보 전달형</h4>
                                <ul className="list-disc list-inside space-y-1">{thumbnailTexts.informational.map((t,i) => <li key={i}>{t}</li>)}</ul>
                            </div>
                             <div>
                                <h4 className="font-bold mb-2">시각 대비형</h4>
                                <ul className="list-disc list-inside space-y-1">{thumbnailTexts.visual.map((t,i) => <li key={i}>{t}</li>)}</ul>
                            </div>
                        </div>}
                    </StepResult>

                    {currentStep !== 'complete' && isStepComplete(currentStep) && !isLoading && (
                        <div className="text-center p-4">
                             <p className="text-slate-600 dark:text-slate-300 mb-4">다음 단계로 넘어갈까요?</p>
                             <button onClick={handleProceed} className="px-6 py-3 text-base font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400" disabled={isLoading}>
                                네, 계속 진행해주세요
                            </button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex items-center justify-center gap-3 text-center p-4 text-slate-500 dark:text-slate-400">
                             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                            <p className="font-semibold">AI 전문가가 작업 중입니다...</p>
                        </div>
                    )}
                    
                    {currentStep === 'complete' && (
                         <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-500/30 text-center animate-fade-in-up">
                            <h3 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">모든 작업이 완료되었습니다!</h3>
                            <p className="text-slate-700 dark:text-slate-300 mb-4">이제 새로운 콘텐츠를 제작할 시간입니다.</p>
                             <button onClick={resetState} className="px-6 py-3 text-base font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                                새로운 분석 시작하기
                            </button>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ScriptGenerator;
