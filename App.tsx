
import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import HomeView from './components/HomeView';
import KeywordAnalysisView from './components/KeywordAnalysisView';
import KeywordVideoAnalysisView from './components/KeywordVideoAnalysisView';
import TrendingView from './components/TrendingView';
import ShortsGeneratorView from './components/ShortsGeneratorView';
import ThumbnailClinicView from './components/ThumbnailClinicView';
import CommentAnalysisView from './components/CommentAnalysisView';
import ChannelBattleView from './components/ChannelBattleView';
import MyLibraryView from './components/MyLibraryView';
import AdminDashboard from './components/AdminDashboard';
import NoticeBoardView from './components/NoticeBoardView';
import ScriptGenerator from './components/ScriptGenerator';
import ImageGenView from './components/ImageGenView';
import VoiceStudioView from './components/VoiceStudioView';
import ContentCalendarView from './components/ContentCalendarView';

// Modals
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import PricingModal from './components/PricingModal';
import ApiKeyMessage from './components/ApiKeyMessage';
import GuideModal from './components/GuideModal';
import InstructionModal from './components/InstructionModal';
import ProfileModal from './components/ProfileModal';
import SubscriptionNotificationModal from './components/SubscriptionNotificationModal';
import CancelSubscriptionModal from './components/CancelSubscriptionModal';
import QuotaInfoModal from './components/QuotaInfoModal';

// Channel Analysis Components
import SearchBar from './components/SearchBar';
import VideoCard from './components/VideoCard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import StrategyModal from './components/StrategyModal';
import GrowthAnalysisModal from './components/GrowthAnalysis';
import ConsultingModal from './components/ConsultingModal';
import { findChannel, analyzeChannelVideos, generateChannelStrategy, generateChannelGrowthAnalysis, generateChannelConsulting } from './services/youtubeService';
import type { AnalyzedVideo, YouTubeChannel, StrategyResult, GrowthAnalysisResult, ConsultingResult, ChannelExtraStats } from './types';
import { isApiKeySet } from './services/youtubeService';
import { KeyIcon } from './components/icons';

type AppView = 'home' | 'channel' | 'script' | 'trending' | 'admin' | 'keyword_analysis' | 'keyword_video' | 'thumbnail' | 'comment_analysis' | 'library' | 'battle' | 'shorts_generator' | 'notice' | 'image_gen' | 'voice_studio' | 'calendar';

const App: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<AppView>('home');
  const [targetKeyword, setTargetKeyword] = useState<string>('');
  const [apiKeySet, setApiKeySet] = useState(false);

  // Modals State
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSubNotifyModalOpen, setIsSubNotifyModalOpen] = useState(false);
  const [subNotifyType, setSubNotifyType] = useState<'expired' | 'warning'>('warning');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);

  // Channel Analysis State
  const [channelQuery, setChannelQuery] = useState('');
  const [isChannelLoading, setIsChannelLoading] = useState(false);
  const [analyzedVideos, setAnalyzedVideos] = useState<AnalyzedVideo[]>([]);
  const [channelInfo, setChannelInfo] = useState<YouTubeChannel | null>(null);
  const [channelStats, setChannelStats] = useState<ChannelExtraStats | null>(null);
  const [channelError, setChannelError] = useState<string | null>(null);
  
  // Channel Analysis Modals State
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [isGrowthModalOpen, setIsGrowthModalOpen] = useState(false);
  const [isConsultingModalOpen, setIsConsultingModalOpen] = useState(false);
  
  const [strategyResult, setStrategyResult] = useState<StrategyResult | null>(null);
  const [growthResult, setGrowthResult] = useState<GrowthAnalysisResult | null>(null);
  const [consultingResult, setConsultingResult] = useState<ConsultingResult | null>(null);
  
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    setApiKeySet(isApiKeySet());
  }, []);

  // Redirect to home if user logs out while on a protected route
  useEffect(() => {
    const publicViews: AppView[] = ['home', 'notice'];
    if (!user && !publicViews.includes(activeView)) {
        setActiveView('home');
    }
  }, [user, activeView]);

  const handleViewChange = (view: AppView) => {
    const publicViews: AppView[] = ['home', 'notice'];
    
    // CRITICAL SECURITY CHECK: Require login for non-public views
    if (!user && !publicViews.includes(view)) {
        setIsLoginModalOpen(true);
        return;
    }

    setActiveView(view);
    setTargetKeyword(''); 
  };

  const handleNavigateWithData = (view: 'channel' | 'keyword_analysis', data: string) => {
      if (!user) {
          setIsLoginModalOpen(true);
          return;
      }

      if (view === 'channel') {
          setActiveView('channel');
          handleChannelSearch(data);
      } else if (view === 'keyword_analysis') {
          setTargetKeyword(data);
          setActiveView('keyword_analysis');
      }
  };

  const triggerChannelAnalysis = (channelId: string) => {
      if (!user) {
          setIsLoginModalOpen(true);
          return;
      }
      setActiveView('channel');
      handleChannelSearch(channelId);
  };

  const openApiKeyModal = () => {
      if (!user) {
          setIsLoginModalOpen(true);
          return;
      }
      setIsApiKeyModalOpen(true);
  }

  // --- Channel Analysis Logic ---
  const handleChannelSearch = async (query: string) => {
      if (!query) return;
      setChannelQuery(query);
      setIsChannelLoading(true);
      setChannelError(null);
      setAnalyzedVideos([]);
      setChannelInfo(null);
      
      setStrategyResult(null);
      setGrowthResult(null);
      setConsultingResult(null);

      try {
          const { videos, stats } = await analyzeChannelVideos(query);
          if (videos.length > 0) {
              setAnalyzedVideos(videos);
              setChannelStats(stats);
              const channelId = videos[0].channelId;
              const info = await findChannel(channelId);
              setChannelInfo(info);
          } else {
              setChannelError("해당 채널에서 분석할 수 있는 영상을 찾지 못했습니다.");
          }
      } catch (err: any) {
          setChannelError(err.message || "채널 분석 중 오류가 발생했습니다.");
      } finally {
          setIsChannelLoading(false);
      }
  };

  const handleGenerateStrategy = async () => {
      if (analyzedVideos.length === 0) return;
      setIsStrategyModalOpen(true);
      setIsAIProcessing(true);
      setAiError(null);
      try {
          const result = await generateChannelStrategy(analyzedVideos);
          setStrategyResult(result);
      } catch (e: any) {
          setAiError(e.message);
      } finally {
          setIsAIProcessing(false);
      }
  };

  const handleGenerateGrowth = async () => {
      if (analyzedVideos.length === 0) return;
      setIsGrowthModalOpen(true);
      setIsAIProcessing(true);
      setAiError(null);
      try {
          const result = await generateChannelGrowthAnalysis(analyzedVideos);
          setGrowthResult(result);
      } catch (e: any) {
          setAiError(e.message);
      } finally {
          setIsAIProcessing(false);
      }
  };

  const handleGenerateConsulting = async () => {
      if (analyzedVideos.length === 0) return;
      setIsConsultingModalOpen(true);
      setIsAIProcessing(true);
      setAiError(null);
      try {
          const result = await generateChannelConsulting(analyzedVideos);
          setConsultingResult(result);
      } catch (e: any) {
          setAiError(e.message);
      } finally {
          setIsAIProcessing(false);
      }
  };

  const renderChannelAnalysisView = () => (
      <div className="max-w-6xl mx-auto font-sans min-h-[80vh] animate-fade-in-up">
          
          {/* Header & Search Section */}
          <div className={`flex flex-col items-center justify-center transition-all duration-500 ${analyzedVideos.length > 0 ? 'py-8' : 'py-20'}`}>
              {!analyzedVideos.length && !isChannelLoading && (
                  <div className="text-center mb-10">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-xl mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                          <i className="fas fa-search text-3xl"></i>
                      </div>
                      <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
                          채널 정밀 분석
                      </h2>
                      <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                          채널의 성과 지표부터 성장 전략까지,<br/>
                          데이터가 말해주는 숨겨진 인사이트를 발견하세요.
                      </p>
                  </div>
              )}

              <div className={`w-full transition-all duration-500 ${analyzedVideos.length > 0 ? 'max-w-4xl' : 'max-w-2xl'}`}>
                  <SearchBar 
                      onSearch={handleChannelSearch} 
                      isLoading={isChannelLoading} 
                      placeholder="분석하고 싶은 유튜브 채널명 또는 링크를 입력하세요"
                  />
                  {!analyzedVideos.length && !isChannelLoading && (
                      <div className="mt-6 flex flex-wrap justify-center gap-3">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-1">인기 검색:</span>
                          {['침착맨', '피식대학', '슈카월드', '김김TV'].map(tag => (
                              <button 
                                  key={tag}
                                  onClick={() => handleChannelSearch(tag)}
                                  className="text-xs px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:border-red-400 hover:text-red-500 transition-colors shadow-sm"
                              >
                                  #{tag}
                              </button>
                          ))}
                      </div>
                  )}
              </div>
          </div>

          {/* Error Message */}
          {channelError && (
              <div className="max-w-2xl mx-auto mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 p-4 rounded-xl text-center text-red-600 dark:text-red-400 shadow-sm flex items-center justify-center gap-2">
                  <i className="fas fa-exclamation-circle"></i>
                  {channelError}
              </div>
          )}

          {/* Loading State */}
          {isChannelLoading && (
               <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-600 mx-auto mb-4"></div>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">채널 데이터를 분석하고 있습니다...</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">영상 수에 따라 최대 1분 정도 소요될 수 있습니다.</p>
               </div>
          )}

          {/* Results */}
          {analyzedVideos.length > 0 && (
              <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button onClick={handleGenerateStrategy} className="p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition-transform hover:scale-105 flex items-center justify-center gap-2">
                          <i className="fas fa-chess-board"></i> 경쟁 전략 분석
                      </button>
                      <button onClick={handleGenerateGrowth} className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-transform hover:scale-105 flex items-center justify-center gap-2">
                          <i className="fas fa-chart-line"></i> 성장 과정 분석
                      </button>
                      <button onClick={handleGenerateConsulting} className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md transition-transform hover:scale-105 flex items-center justify-center gap-2">
                          <i className="fas fa-user-doctor"></i> AI 채널 컨설팅
                      </button>
                  </div>

                  <AnalyticsDashboard 
                      videos={analyzedVideos} 
                      displayVideos={analyzedVideos.slice(0, 20)} 
                      channel={channelInfo} 
                      channelStats={channelStats}
                  />

                  <div className="grid grid-cols-1 gap-4">
                      {analyzedVideos.slice(0, 10).map((video, idx) => (
                          <VideoCard key={video.id} video={video} rank={idx + 1} />
                      ))}
                  </div>
              </div>
          )}

          {/* AI Modals */}
          <StrategyModal 
              isOpen={isStrategyModalOpen} 
              onClose={() => setIsStrategyModalOpen(false)} 
              strategy={strategyResult} 
              isLoading={isAIProcessing} 
              error={aiError}
              title="AI 경쟁 전략 분석"
          />
          <GrowthAnalysisModal
              isOpen={isGrowthModalOpen}
              onClose={() => setIsGrowthModalOpen(false)}
              analysis={growthResult}
              isLoading={isAIProcessing}
              error={aiError}
          />
          <ConsultingModal
              isOpen={isConsultingModalOpen}
              onClose={() => setIsConsultingModalOpen(false)}
              consulting={consultingResult}
              isLoading={isAIProcessing}
              error={aiError}
          />
      </div>
  );

  const renderMainContent = () => {
      // Absolute Security Check for Rendering
      const publicViews: AppView[] = ['home', 'notice'];
      if (!user && !publicViews.includes(activeView)) {
          return (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                      <KeyIcon className="w-10 h-10 text-slate-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">로그인이 필요합니다</h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">이 기능을 사용하려면 먼저 로그인해주세요.</p>
                  <button 
                    onClick={() => setIsLoginModalOpen(true)}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                  >
                      로그인하기
                  </button>
              </div>
          );
      }

      switch (activeView) {
          case 'home': return <HomeView onNavigate={(view) => handleViewChange(view)} onOpenPricingModal={() => setIsPricingModalOpen(true)} onOpenGuideModal={() => setIsGuideModalOpen(true)} />;
          case 'channel': return renderChannelAnalysisView();
          case 'keyword_analysis': return <KeywordAnalysisView initialQuery={targetKeyword} />;
          case 'keyword_video': return <KeywordVideoAnalysisView onAnalyzeChannel={triggerChannelAnalysis} />;
          case 'trending': return <TrendingView />;
          case 'shorts_generator': return <ShortsGeneratorView />;
          case 'script': return <ScriptGenerator />;
          case 'thumbnail': return <ThumbnailClinicView />;
          case 'image_gen': return <ImageGenView />;
          case 'voice_studio': return <VoiceStudioView />;
          case 'calendar': return <ContentCalendarView />;
          case 'comment_analysis': return <CommentAnalysisView />;
          case 'battle': return <ChannelBattleView />;
          case 'library': return <MyLibraryView onNavigate={handleNavigateWithData} />;
          case 'admin': return <AdminDashboard onTriggerAlert={(type) => { setSubNotifyType(type); setIsSubNotifyModalOpen(true); }} onTriggerCancelTest={() => setIsCancelModalOpen(true)} />;
          case 'notice': return <NoticeBoardView />;
          default: return <HomeView onNavigate={(view) => handleViewChange(view)} onOpenPricingModal={() => setIsPricingModalOpen(true)} onOpenGuideModal={() => setIsGuideModalOpen(true)} />;
      }
  };

  return (
    <div className="min-h-screen font-sans flex bg-gray-100 dark:bg-slate-900">
      <Sidebar 
        activeView={activeView}
        onViewChange={handleViewChange}
        onOpenApiKeyModal={openApiKeyModal}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenPricingModal={() => setIsPricingModalOpen(true)}
        onOpenInstructionModal={() => setIsInstructionModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenQuotaModal={() => setIsQuotaModalOpen(true)}
      />

      <main className="flex-1 p-4 md:p-6 overflow-y-auto h-screen">
          {renderMainContent()}
      </main>
      
      {/* Global Modals */}
      <ApiKeyMessage 
        isOpen={isApiKeyModalOpen || (!!user && !apiKeySet && activeView !== 'home')} 
        onClose={() => {
            setIsApiKeyModalOpen(false);
            if (!apiKeySet && activeView !== 'home') {
                handleViewChange('home');
            }
        }} 
        onKeySubmit={() => { setIsApiKeyModalOpen(false); setApiKeySet(true); }} 
      />
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onSwitchToSignup={() => { setIsLoginModalOpen(false); setIsSignupModalOpen(true); }} 
      />
      <SignupModal 
        isOpen={isSignupModalOpen} 
        onClose={() => setIsSignupModalOpen(false)} 
        onSwitchToLogin={() => { setIsSignupModalOpen(false); setIsLoginModalOpen(true); }} 
      />
      <PricingModal 
        isOpen={isPricingModalOpen} 
        onClose={() => setIsPricingModalOpen(false)} 
        onOpenLoginModal={() => { setIsPricingModalOpen(false); setIsLoginModalOpen(true); }} 
      />
      <GuideModal isOpen={isGuideModalOpen} onClose={() => setIsGuideModalOpen(false)} />
      <QuotaInfoModal isOpen={isQuotaModalOpen} onClose={() => setIsQuotaModalOpen(false)} />
      <InstructionModal isOpen={isInstructionModalOpen} onClose={() => setIsInstructionModalOpen(false)} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <SubscriptionNotificationModal 
        isOpen={isSubNotifyModalOpen} 
        onClose={() => setIsSubNotifyModalOpen(false)} 
        onOpenPricing={() => { setIsSubNotifyModalOpen(false); setIsPricingModalOpen(true); }}
        type={subNotifyType}
        daysLeft={5}
      />
      <CancelSubscriptionModal 
        isOpen={isCancelModalOpen} 
        onClose={() => setIsCancelModalOpen(false)} 
      />
    </div>
  );
};

export default App;
