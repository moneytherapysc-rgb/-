
import React, { useState, useEffect } from 'react';
import { predictMonthlyTrends, generatePlanForDate } from '../services/youtubeService';
import type { CalendarTrendEvent, ScheduledContent } from '../types';
import { CalendarIcon, PlusIcon, CheckCircleIcon, TrashIcon, SparklesIcon } from './icons';

const ContentCalendarView: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [trends, setTrends] = useState<CalendarTrendEvent[]>([]);
    const [schedule, setSchedule] = useState<ScheduledContent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Modal State
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTrend, setSelectedTrend] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    useEffect(() => {
        loadTrends();
        // Load schedule from local storage or API in a real app
        const storedSchedule = localStorage.getItem('yt_macgyver_schedule');
        if (storedSchedule) {
            setSchedule(JSON.parse(storedSchedule));
        }
    }, [year, month]);

    const loadTrends = async () => {
        setIsLoading(true);
        try {
            const data = await predictMonthlyTrends(year, month);
            setTrends(data);
        } catch (error) {
            console.error("Failed to load trends", error);
        } finally {
            setIsLoading(false);
        }
    };

    const changeMonth = (delta: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    };

    const handleDateClick = (dateStr: string) => {
        const trend = trends.find(t => t.date === dateStr);
        setSelectedDate(dateStr);
        setSelectedTrend(trend ? trend.event : null);
        setIsModalOpen(true);
    };

    const handleAutoGenerate = async () => {
        if (!selectedDate) return;
        setIsGenerating(true);
        try {
            const trendTopic = selectedTrend || "자유 주제";
            const newPlan = await generatePlanForDate(selectedDate, trendTopic);
            const updatedSchedule = [...schedule, newPlan];
            setSchedule(updatedSchedule);
            localStorage.setItem('yt_macgyver_schedule', JSON.stringify(updatedSchedule));
            setIsModalOpen(false);
        } catch (error) {
            alert("생성 실패");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDeletePlan = (id: string) => {
        if(window.confirm("일정을 삭제하시겠습니까?")) {
            const updated = schedule.filter(s => s.id !== id);
            setSchedule(updated);
            localStorage.setItem('yt_macgyver_schedule', JSON.stringify(updated));
        }
    };

    const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
    const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m - 1, 1).getDay();

    const renderCalendarGrid = () => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50"></div>);
        }

        // Days
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const trend = trends.find(t => t.date === dateStr);
            const plan = schedule.find(s => s.date === dateStr);
            const isToday = new Date().toISOString().slice(0, 10) === dateStr;

            days.push(
                <div 
                    key={d} 
                    onClick={() => handleDateClick(dateStr)}
                    className={`h-32 border border-slate-200 dark:border-slate-700 p-2 relative cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group ${isToday ? 'bg-indigo-50 dark:bg-indigo-900/10' : 'bg-white dark:bg-slate-800'}`}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-bold ${isToday ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full' : 'text-slate-700 dark:text-slate-300'}`}>
                            {d}
                        </span>
                        {trend && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium truncate max-w-[80px] ${
                                trend.intensity === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 
                                trend.intensity === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' : 
                                'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                            }`}>
                                {trend.event}
                            </span>
                        )}
                    </div>

                    {plan ? (
                        <div className="mt-2 p-1.5 bg-indigo-100 dark:bg-indigo-900/40 rounded border-l-4 border-indigo-500">
                            <p className="text-xs font-bold text-indigo-800 dark:text-indigo-200 truncate">{plan.title}</p>
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 truncate">{plan.status}</p>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <PlusIcon className="w-6 h-6 text-indigo-300 dark:text-indigo-600" />
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    return (
        <div className="max-w-6xl mx-auto font-sans animate-fade-in-up pb-12 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <CalendarIcon className="w-7 h-7 text-indigo-500" />
                        트렌드 예측 캘린더
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        AI가 예측한 시즌 이슈에 맞춰 빈 날짜를 클릭하여 촬영 스케줄을 채워보세요.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <i className="fas fa-chevron-left text-slate-600 dark:text-slate-300"></i>
                    </button>
                    <span className="text-xl font-bold text-slate-800 dark:text-slate-100 min-w-[100px] text-center">
                        {year}년 {month}월
                    </span>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <i className="fas fa-chevron-right text-slate-600 dark:text-slate-300"></i>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex-1">
                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                        <div key={day} className={`py-3 text-center text-sm font-bold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-slate-600 dark:text-slate-400'}`}>
                            {day}
                        </div>
                    ))}
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 bg-slate-200 dark:bg-slate-700 gap-px border-b border-slate-200 dark:border-slate-700">
                    {isLoading ? (
                        <div className="col-span-7 h-96 flex flex-col items-center justify-center bg-white dark:bg-slate-800">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
                            <p className="text-slate-500 dark:text-slate-400">AI가 {month}월의 트렌드를 예측하고 있습니다...</p>
                        </div>
                    ) : (
                        renderCalendarGrid()
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && selectedDate && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                        
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                            {selectedDate} 기획하기
                        </h3>
                        
                        {selectedTrend ? (
                            <div className="mb-6 mt-2 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800 flex items-center gap-3">
                                <SparklesIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                <div>
                                    <p className="text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase">AI 예측 트렌드</p>
                                    <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">{selectedTrend}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 mt-1">특이사항이 없는 날입니다. 자유 주제로 기획해보세요.</p>
                        )}

                        {schedule.find(s => s.date === selectedDate) ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                                    <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">
                                        {schedule.find(s => s.date === selectedDate)?.title}
                                    </h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                        {schedule.find(s => s.date === selectedDate)?.description}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => {
                                        handleDeletePlan(schedule.find(s => s.date === selectedDate)!.id);
                                        setIsModalOpen(false);
                                    }}
                                    className="w-full py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <TrashIcon className="w-4 h-4" /> 일정 삭제
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={handleAutoGenerate}
                                disabled={isGenerating}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        AI 기획 중...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-5 h-5" />
                                        {selectedTrend ? '트렌드 맞춤 영상 자동 기획' : '자유 주제 영상 자동 기획'}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentCalendarView;
