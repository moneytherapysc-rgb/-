import React, { useState, useRef } from 'react';
import { UploadIcon, PhotoIcon, CheckCircleIcon, LightbulbIcon, ChartBarIcon, FireIcon } from './icons';
import { analyzeThumbnail, fileToBase64 } from '../services/youtubeService';
import type { ThumbnailAnalysisResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import ProtectedRoute from "./ProtectedRoute";  // ⭐ 추가된 부분

type ClinicMode = 'single' | 'compare';

const ThumbnailClinicView: React.FC = () => {
  const [mode, setMode] = useState<ClinicMode>('single');
  
  // Single Mode State
  const [singleImage, setSingleImage] = useState<File | null>(null);
  const [singlePreview, setSinglePreview] = useState<string | null>(null);
  const [singleResult, setSingleResult] = useState<ThumbnailAnalysisResult | null>(null);

  // Compare Mode State
  const [imageA, setImageA] = useState<File | null>(null);
  const [previewA, setPreviewA] = useState<string | null>(null);
  const [resultA, setResultA] = useState<ThumbnailAnalysisResult | null>(null);

  const [imageB, setImageB] = useState<File | null>(null);
  const [previewB, setPreviewB] = useState<string | null>(null);
  const [resultB, setResultB] = useState<ThumbnailAnalysisResult | null>(null);

  // Common State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const singleInputRef = useRef<HTMLInputElement>(null);
  const inputARef = useRef<HTMLInputElement>(null);
  const inputBRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, target: 'single' | 'A' | 'B') => {
    const file = e.target.files?.[0];
    processFile(file, target);
  };

  const processFile = (file: File | undefined, target: 'single' | 'A' | 'B') => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setError(null);
      
      if (target === 'single') {
        setSingleImage(file);
        setSinglePreview(url);
        setSingleResult(null);
      } else if (target === 'A') {
        setImageA(file);
        setPreviewA(url);
        setResultA(null);
      } else if (target === 'B') {
        setImageB(file);
        setPreviewB(url);
        setResultB(null);
      }
    } else if (file) {
      setError('이미지 파일만 업로드할 수 있습니다.');
    }
  };

  const handleAnalyzeSingle = async () => {
    if (!singleImage) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const base64 = await fileToBase64(singleImage);
      const result = await analyzeThumbnail(base64);
      setSingleResult(result);
    } catch (err: any) {
      setError(err.message || '분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeCompare = async () => {
    if (!imageA || !imageB) {
        setError('두 개의 이미지를 모두 업로드해주세요.');
        return;
    }
    setIsAnalyzing(true);
    setError(null);
    try {
        const [base64A, base64B] = await Promise.all([fileToBase64(imageA), fileToBase64(imageB)]);
        const [resA, resB] = await Promise.all([analyzeThumbnail(base64A), analyzeThumbnail(base64B)]);
        setResultA(resA);
        setResultB(resB);
    } catch (err: any) {
        setError(err.message || '비교 분석 중 오류가 발생했습니다.');
    } finally {
        setIsAnalyzing(false);
    }
  };

  const resetSingle = () => {
    setSingleImage(null);
    setSinglePreview(null);
    setSingleResult(null);
    setError(null);
    if(singleInputRef.current) singleInputRef.current.value = '';
  };

  const resetCompare = () => {
      setImageA(null);
      setPreviewA(null);
      setResultA(null);
      setImageB(null);
      setPreviewB(null);
      setResultB(null);
      setError(null);
      if(inputARef.current) inputARef.current.value = '';
      if(inputBRef.current) inputBRef.current.value = '';
  };

  // UploadBox component
  const UploadBox: React.FC<{ 
    label: string; 
    preview: string | null; 
    inputRef: React.RefObject<HTMLInputElement | null>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
  }> = ({ label, preview, inputRef, onChange, disabled }) => (
    <div className="flex-1">
      <input type="file" ref={inputRef} className="hidden" accept="image/*" onChange={onChange} disabled={disabled} />
      <div 
        className={`relative border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group ${
            preview 
            ? 'border-purple-500 bg-slate-900' 
            : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'
        }`}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-white font-bold"><i className="fas fa-exchange-alt mr-2"></i>이미지 변경</p>
            </div>
          </>
        ) : (
          <div className="text-center p-4">
            <UploadIcon className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="font-bold text-slate-600 dark:text-slate-300">{label}</p>
            <p className="text-xs text-slate-400 mt-1">클릭하여 업로드</p>
          </div>
        )}
      </div>
    </div>
  );

  // ScoreGauge component
  const ScoreGauge: React.FC<{ score: number, size?: 'sm' | 'lg' }> = ({ score, size = 'lg' }) => {
    const data = [{ name: 'Score', value: score }, { name: 'Rest', value: 100 - score }];
    const COLORS = score >= 80 ? ['#10b981', '#e5e7eb'] : score >= 50 ? ['#f59e0b', '#e5e7eb'] : ['#ef4444', '#e5e7eb'];
    const height = size === 'lg' ? 'h-48' : 'h-32';
    const fontSize = size === 'lg' ? 'text-4xl' : 'text-2xl';

    return (
      <div className={`relative ${height} w-full flex items-center justify-center`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={size === 'lg' ? 60 : 40} outerRadius={size === 'lg' ? 80 : 55} startAngle={180} endAngle={0} paddingAngle={0} dataKey="value">
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index]} stroke="none" />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-4 flex flex-col items-center">
            <span className={`${fontSize} font-extrabold text-slate-800 dark:text-white`}>{score}점</span>
            {size === 'lg' && <span className="text-sm text-slate-500 dark:text-slate-400">종합 점수</span>}
        </div>
      </div>
    );
  };

  const ComparisonBar: React.FC<{ label: string; valA: number; valB: number }> = ({ label, valA, valB }) => {
    const total = valA + valB;
    const percentA = total === 0 ? 50 : (valA / total) * 100;
    const percentB = total === 0 ? 50 : (valB / total) * 100;
    const winA = valA > valB;
    const winB = valB > valA;

    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm font-bold mb-1">
          <span className={`${winA ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>{valA}</span>
          <span className="text-slate-700 dark:text-slate-300">{label}</span>
          <span className={`${winB ? 'text-red-600 dark:text-red-400' : 'text-slate-500'}`}>{valB}</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
          <div className={`h-full transition-all duration-1000 ${winA ? 'bg-blue-500' : 'bg-blue-300 dark:bg-blue-800'}`} style={{ width: `${percentA}%` }}></div>
          <div className="w-0.5 bg-white dark:bg-slate-900"></div>
          <div className={`h-full transition-all duration-1000 ${winB ? 'bg-red-500' : 'bg-red-300 dark:bg-red-800'}`} style={{ width: `${percentB}%` }}></div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute> 
      {/* ⭐⭐⭐ 전체 UI 보호 시작 ⭐⭐⭐ */}

      <div className="max-w-6xl mx-auto font-sans animate-fade-in-up pb-12">

        {/* Header */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-t-2xl shadow-sm border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                      <PhotoIcon className="w-7 h-7" />
                  </div>
                  <div>
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">AI 썸네일 클리닉</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">CTR(클릭률)을 높이는 과학적인 분석</p>
                  </div>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                  <button
                      onClick={() => setMode('single')}
                      className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                          mode === 'single' 
                          ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' 
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                      }`}
                  >
                      단일 분석
                  </button>
                  <button
                      onClick={() => setMode('compare')}
                      className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                          mode === 'compare' 
                          ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' 
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                      }`}
                  >
                      A/B 테스트 (비교)
                  </button>
              </div>
          </div>
        </div>

        {/* Mode Content */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-b-2xl shadow-lg mb-8 min-h-[400px]">

          {/* SINGLE MODE */}
          {mode === 'single' && (
            <>
              {/* 업로드 전 */}
              {!singlePreview ? (
                  <div 
                      className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                      onClick={() => singleInputRef.current?.click()}
                  >
                      <input type="file" ref={singleInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'single')} />
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:text-purple-500 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                          <UploadIcon className="w-8 h-8" />
                      </div>
                      <p className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">썸네일 이미지 업로드</p>
                      <p className="text-slate-500 dark:text-slate-400">클릭하거나 파일을 드래그하여 분석을 시작하세요</p>
                  </div>
              ) : (
                <>
                  {/* 업로드 후 미리보기 */}
                  <div className="flex flex-col items-center">
                      <div className="relative mb-8 w-full max-w-lg shadow-xl rounded-lg overflow-hidden group">
                          <img src={singlePreview} alt="Thumbnail Preview" className="w-full h-auto" />
                          {!isAnalyzing && !singleResult && (
                              <button 
                                  onClick={resetSingle} 
                                  className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                  title="제거"
                              >
                                  &times;
                              </button>
                          )}
                      </div>

                      {/* 분석 버튼 */}
                      {!singleResult && (
                          <button 
                              onClick={handleAnalyzeSingle}
                              disabled={isAnalyzing}
                              className="px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold rounded-xl shadow-lg transition-transform transform hover:scale-105 flex items-center gap-2 disabled:opacity-70 disabled:scale-100"
                          >
                              {isAnalyzing ? (
                                  <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> 분석 중...</>
                              ) : (
                                  <><ChartBarIcon /> AI 분석 시작하기</>
                              )}
                          </button>
                      )}
                  </div>

                  {/* 분석 결과 */}
                  {singleResult && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10 animate-fade-in-up border-t border-slate-200 dark:border-slate-700 pt-10">
                          <div className="bg-slate-50 dark:bg-slate-700/30 p-6 rounded-2xl border border-slate-200 dark:border-slate-600">
                              <h3 className="text-lg font-bold text-center text-slate-800 dark:text-slate-200 mb-4">종합 점수</h3>
                              <ScoreGauge score={singleResult.overallScore} />
                              <div className="space-y-4 mt-4">
                                  {Object.entries(singleResult.scores).map(([key, val]) => (
                                      <div key={key}>
                                          <div className="flex justify-between text-sm mb-1 text-slate-600 dark:text-slate-300">
                                              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                              <span className="font-bold">{val}</span>
                                          </div>
                                          <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                                              <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${val}%` }}></div>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>

                          <div className="lg:col-span-2 space-y-6">
                              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800/50">
                                  <h4 className="font-bold text-green-800 dark:text-green-400 mb-3 flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> 잘된 점</h4>
                                  <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">{singleResult.feedback.strengths.map((s, i) => <li key={i} className="flex gap-2"><span className="text-green-500">•</span>{s}</li>)}</ul>
                              </div>
                              <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50">
                                  <h4 className="font-bold text-red-800 dark:text-red-400 mb-3 flex items-center gap-2"><i className="fas fa-exclamation-triangle"></i> 개선 필요</h4>
                                  <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">{singleResult.feedback.weaknesses.map((w, i) => <li key={i} className="flex gap-2"><span className="text-red-500">•</span>{w}</li>)}</ul>
                              </div>
                              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/50">
                                  <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-3 flex items-center gap-2"><LightbulbIcon className="w-5 h-5"/> AI 제안</h4>
                                  <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">{singleResult.feedback.improvements.map((imp, i) => <li key={i} className="flex gap-2"><span className="text-blue-500 font-bold">{i+1}.</span>{imp}</li>)}</ul>
                              </div>
                              <div className="text-right">
                                  <button onClick={resetSingle} className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline">다른 이미지 분석하기</button>
                              </div>
                          </div>
                      </div>
                  )}
                </>
              )}
            </>
          )}

          {/* COMPARE MODE */}
          {mode === 'compare' && (
            <>
              <div className="flex flex-col md:flex-row items-stretch gap-4 mb-8 relative">
                  <div className="flex-1 bg-blue-50 dark:bg-slate-700/30 p-4 rounded-xl border-2 border-blue-100 dark:border-slate-600">
                      <div className="text-center mb-3">
                          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-300">A안</span>
                      </div>
                      <UploadBox label="A안 이미지 업로드" preview={previewA} inputRef={inputARef} onChange={(e) => handleFileSelect(e, 'A')} disabled={isAnalyzing || !!resultA} />
                  </div>

                  <div className="flex items-center justify-center z-10 -my-4 md:my-0 md:-mx-4">
                      <div className="bg-white dark:bg-slate-800 rounded-full p-2 shadow-lg border-4 border-slate-100 dark:border-slate-600">
                          <span className="block w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-black italic text-sm">VS</span>
                      </div>
                  </div>

                  <div className="flex-1 bg-red-50 dark:bg-slate-700/30 p-4 rounded-xl border-2 border-red-100 dark:border-slate-600">
                      <div className="text-center mb-3">
                          <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded dark:bg-red-900 dark:text-red-300">B안</span>
                      </div>
                      <UploadBox label="B안 이미지 업로드" preview={previewB} inputRef={inputBRef} onChange={(e) => handleFileSelect(e, 'B')} disabled={isAnalyzing || !!resultB} />
                  </div>
              </div>

              {!resultA && !resultB && (
                  <div className="text-center">
                      <button 
                          onClick={handleAnalyzeCompare}
                          disabled={isAnalyzing || !imageA || !imageB}
                          className="px-12 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-lg font-bold rounded-full shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                      >
                          {isAnalyzing ? '비교 분석 중...' : '승자 예측하기'}
                      </button>
                  </div>
              )}

              {resultA && resultB && (
                <div className="animate-fade-in-up space-y-8 border-t border-slate-200 dark:border-slate-700 pt-8">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">종합 승자 예측</h3>
                        <div className="flex justify-center gap-8 items-end">
                            <div className={`flex flex-col items-center transition-all ${resultA.overallScore > resultB.overallScore ? 'scale-110 opacity-100' : 'scale-90 opacity-60 grayscale'}`}>
                                {resultA.overallScore > resultB.overallScore && <div className="text-yellow-500 text-3xl mb-2 animate-bounce"><i className="fas fa-crown"></i></div>}
                                <ScoreGauge score={resultA.overallScore} size="sm" />
                                <span className="font-bold text-blue-600 mt-2">A안</span>
                            </div>
                            <div className={`flex flex-col items-center transition-all ${resultB.overallScore > resultA.overallScore ? 'scale-110 opacity-100' : 'scale-90 opacity-60 grayscale'}`}>
                                {resultB.overallScore > resultA.overallScore && <div className="text-yellow-500 text-3xl mb-2 animate-bounce"><i className="fas fa-crown"></i></      div>}
                                <ScoreGauge score={resultB.overallScore} size="sm" />
                                <span className="font-bold text-red-600 mt-2">B안</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-700/30 p-6 rounded-2xl border border-slate-200 dark:border-slate-600 max-w-3xl mx-auto">
                        <h4 className="text-lg font-bold text-center mb-6 text-slate-700 dark:text-slate-200">항목별 상세 비교</h4>
                        <ComparisonBar label="시인성 (Visibility)" valA={resultA.scores.visibility} valB={resultB.scores.visibility} />
                        <ComparisonBar label="호기심 (Curiosity)" valA={resultA.scores.curiosity} valB={resultB.scores.curiosity} />
                        <ComparisonBar label="텍스트 가독성" valA={resultA.scores.textReadability} valB={resultB.scores.textReadability} />
                        <ComparisonBar label="디자인/구도" valA={resultA.scores.design} valB={resultB.scores.design} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
                            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">A안 AI 한줄평</h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                "{resultA.feedback.strengths[0]}"이 돋보이지만, "{resultA.feedback.improvements[0]}" 점은 개선이 필요합니다.
                            </p>
                        </div>
                        <div className="p-5 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/50">
                            <h4 className="font-bold text-red-800 dark:text-red-300 mb-2">B안 AI 한줄평</h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                "{resultB.feedback.strengths[0]}" 점이 강점입니다. "{resultB.feedback.improvements[0]}" 부분을 보완하면 더 좋습니다.
                            </p>
                        </div>
                    </div>

                    <div className="text-center pt-6">
                        <button onClick={resetCompare} className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                            새로운 비교하기
                        </button>
                    </div>
                </div>
              )}
            </>
          )}

          {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-center animate-fade-in-up">
                  <i className="fas fa-exclamation-circle mr-2"></i> {error}
              </div>
          )}
          
        </div>
      </div>

      {/* ⭐⭐⭐ ProtectedRoute 종료 ⭐⭐⭐ */}
    </ProtectedRoute>
  );
};

export default ThumbnailClinicView;
