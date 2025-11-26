import React from 'react';
import { ChartBarIcon, SearchIcon, FireIcon, PencilIcon, PhotoIcon, ChatBubbleIcon, SwordsIcon, LightningIcon, YouTubeIcon, StarIcon, BookOpenIcon, HeadsetIcon, MoneyIcon, CoffeeIcon, CheckCircleIcon, GiftIcon, PaletteIcon, MicrophoneIcon, CalendarIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';

interface HomeViewProps {
  onNavigate: (view: 'channel' | 'script' | 'trending' | 'keyword_analysis' | 'keyword_video' | 'thumbnail' | 'comment_analysis' | 'battle' | 'shorts_generator' | 'image_gen' | 'voice_studio' | 'calendar') => void;
  onOpenPricingModal: () => void;
  onOpenGuideModal: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenPricingModal, onOpenGuideModal }) => {
  const { user } = useAuth();
  const isPro = user?.subscription?.status === 'active';

  const features = [
    {
      id: 'channel',
      title: '채널 분석',
      description: '채널의 성과를 분석하고 AI가 제안하는 맞춤형 성장 전략을 확인하세요.',
      icon: <ChartBarIcon />,
      colorClass: 'bg-blue-500',
      hoverClass: 'hover:bg-blue-600',
      view: 'channel' as const
    },
    {
      id: 'keyword_analysis',
      title: '키워드 분석 (검색량)',
      description: 'AI가 추정한 키워드 검색량과 연관 태그를 분석하여 황금 키워드를 발굴하세요.',
      icon: <SearchIcon />,
      colorClass: 'bg-green-500',
      hoverClass: 'hover:bg-green-600',
      view: 'keyword_analysis' as const
    },
    {
      id: 'calendar',
      title: '트렌드 예측 캘린더',
      description: 'AI가 시즌 이슈를 예측하고 빈 날짜를 클릭하면 촬영 스케줄을 자동으로 채워줍니다.',
      icon: <CalendarIcon className="w-6 h-6" />,
      colorClass: 'bg-pink-500',
      hoverClass: 'hover:bg-pink-600',
      view: 'calendar' as const
    },
    {
      id: 'image_gen',
      title: 'AI 이미지 스튜디오',
      description: '텍스트로 고화질 이미지를 생성하거나 기존 이미지를 편집하는 강력한 AI 도구입니다.',
      icon: <PaletteIcon className="w-6 h-6" />,
      colorClass: 'bg-indigo-600',
      hoverClass: 'hover:bg-indigo-700',
      view: 'image_gen' as const
    },
    {
      id: 'voice_studio',
      title: 'AI 보이스 스튜디오',
      description: '대본만 넣으면 전문 성우급 AI 내레이션을 생성해줍니다. (TTS)',
      icon: <MicrophoneIcon className="w-6 h-6" />,
      colorClass: 'bg-teal-500',
      hoverClass: 'hover:bg-teal-600',
      view: 'voice_studio' as const
    },
    {
      id: 'keyword_video',
      title: '떡상 영상 분석',
      description: '최대 500개의 실제 영상을 크롤링하여 조회수, 경쟁도, 인기 분포를 정밀 분석합니다.',
      icon: <YouTubeIcon className="w-6 h-6" />,
      colorClass: 'bg-red-600',
      hoverClass: 'hover:bg-red-700',
      view: 'keyword_video' as const
    },
    {
      id: 'shorts_generator',
      title: '쇼츠 아이디어 생성',
      description: '키워드만 입력하면 3초 훅과 촬영 대본이 포함된 바이럴 쇼츠 기획안을 즉시 생성합니다.',
      icon: <LightningIcon className="w-6 h-6" />,
      colorClass: 'bg-yellow-500',
      hoverClass: 'hover:bg-yellow-600',
      view: 'shorts_generator' as const
    },
    {
      id: 'battle',
      title: '채널 전투력 비교',
      description: '라이벌 채널과 1:1로 구독자, 조회수, 성장세를 비교하고 승자를 가려보세요.',
      icon: <SwordsIcon className="w-6 h-6" />,
      colorClass: 'bg-slate-700',
      hoverClass: 'hover:bg-slate-800',
      view: 'battle' as const
    },
    {
      id: 'thumbnail',
      title: 'AI 썸네일 클리닉',
      description: '썸네일을 업로드하면 AI가 CTR 점수를 매기고 A/B 테스트로 더 나은 시안을 골라줍니다.',
      icon: <PhotoIcon className="w-6 h-6" />,
      colorClass: 'bg-pink-500',
      hoverClass: 'hover:bg-pink-600',
      view: 'thumbnail' as const
    },
    {
      id: 'script',
      title: 'AI 스크립트 벤치마킹',
      description: '성공한 영상의 대본을 AI가 분석하여 내 채널에 맞는 새로운 대본으로 재창조합니다.',
      icon: <PencilIcon className="w-6 h-6" />,
      colorClass: 'bg-purple-500',
      hoverClass: 'hover:bg-purple-600',
      view: 'script' as const
    },
    {
      id: 'trending',
      title: '급상승 트렌드',
      description: '현재 유튜브 인기 급상승 영상과 라이징 크리에이터를 실시간으로 파악하세요.',
      icon: <FireIcon className="w-6 h-6" />,
      colorClass: 'bg-orange-500',
      hoverClass: 'hover:bg-orange-600',
      view: 'trending' as const
    },
    {
      id: 'comment_analysis',
      title: '댓글 민심 분석',
      description: '영상 댓글을 AI가 분석하여 시청자의 긍정/부정 감정과 핵심 여론을 요약합니다.',
      icon: <ChatBubbleIcon className="w-6 h-6" />,
      colorClass: 'bg-indigo-500',
      hoverClass: 'hover:bg-indigo-600',
      view: 'comment_analysis' as const
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 font-sans animate-fade-in-up">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-block p-3 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <div className="text-red-600 dark:text-red-400">
                <i className="fas fa-robot fa-3x"></i>
            </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          YouTube <span className="text-red-600">Yumaker</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          유튜브 크리에이터를 위한 올인원 데이터 분석 솔루션.<br/>
          데이터 기반의 전략과 AI의 통찰력으로 채널을 빠르게 성장시키세요.
        </p>
      </div>

      {/* Promotional Banners Grid */}
      {!isPro && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Banner 1: Open Special */}
            <div 
                onClick={onOpenPricingModal}
                className="relative bg-gradient-to-r from-[#EB3349] to-[#F45C43] rounded-2xl p-6 text-white shadow-2xl overflow-hidden cursor-pointer transform transition-all hover:scale-[1.01] group border-2 border-transparent hover:border-white/20 flex flex-col justify-between h-full"
            >
                {/* Badge */}
                <div className="absolute top-0 right-0 bg-[#FFD700] text-red-900 text-xs font-black px-3 py-1 rounded-bl-xl shadow-md z-20">
                    500명 인원한정
                </div>
                
                {/* Background Elements */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white opacity-10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 mb-4">
                    <h3 className="text-2xl font-extrabold leading-tight drop-shadow-sm mb-2">
                        <span className="mr-2">🔥</span>
                        오픈 특가 (1개월)
                    </h3>
                    <p className="text-red-50 font-medium text-sm opacity-95 mb-4">
                        커피 두잔값으로 AI 기능 무제한 체험!
                    </p>
                    <div className="flex flex-col gap-2">
                        <span className="flex items-center gap-1.5 text-sm font-bold bg-black/20 px-3 py-1.5 rounded-full border border-white/10 w-fit">
                            <CheckCircleIcon className="w-4 h-4 text-[#FFD700]" /> 모든 기능 무제한
                        </span>
                        <span className="flex items-center gap-1.5 text-sm font-bold bg-black/20 px-3 py-1.5 rounded-full border border-white/10 w-fit">
                            <CheckCircleIcon className="w-4 h-4 text-[#FFD700]" /> AI 컨설팅 포함
                        </span>
                    </div>
                </div>

                <div className="relative z-10 mt-auto pt-4 border-t border-white/20">
                    <div className="flex items-end justify-between mb-3">
                        <div className="text-[#FFD700] font-bold text-sm">
                            하루 약 330원
                        </div>
                        <div className="text-right">
                            <span className="text-red-200 line-through text-xs mr-1.5 font-medium">₩18,900</span>
                            <span className="text-3xl font-black tracking-tighter drop-shadow-md">₩9,900</span>
                        </div>
                    </div>
                    <button 
                        className="w-full bg-white text-[#EB3349] hover:bg-gray-50 font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        지금 바로 시작하기 <i className="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>

            {/* Banner 2: Free Trial Link */}
            <a 
                href="https://forms.gle/wfZn5TnpBtwzrJot9"
                target="_blank"
                rel="noopener noreferrer"
                className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-2xl overflow-hidden cursor-pointer transform transition-all hover:scale-[1.01] group border-2 border-transparent hover:border-white/20 flex flex-col justify-between h-full"
            >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
                
                <div className="relative z-10 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <GiftIcon className="w-6 h-6 text-yellow-300" />
                        </div>
                        <span className="bg-indigo-800/50 text-indigo-200 text-xs font-bold px-3 py-1 rounded-full border border-indigo-400/30">
                            선착순 무료 체험
                        </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-indigo-200 mb-2">아직 망설여지시나요?</h3>
                    <p className="text-2xl md:text-3xl font-extrabold leading-tight text-white drop-shadow-md">
                        2주 무료쿠폰 발급받고<br/>
                        <span className="text-yellow-300 underline decoration-wavy decoration-yellow-500/50">체험해보기</span>
                    </p>
                </div>

                <div className="relative z-10 mt-auto">
                    <p className="text-sm text-indigo-100 opacity-90 mb-4 bg-white/10 p-2 rounded-lg border border-white/10 text-center">
                        📢 신청폼 작성 시 100% 지급!
                    </p>
                    <button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-3 px-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
                        쿠폰 신청하러 가기 <i className="fas fa-external-link-alt"></i>
                    </button>
                </div>
            </a>
        </div>
      )}

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        
        {/* Membership Card */}
        <button
            onClick={onOpenPricingModal}
            className={`group relative overflow-hidden rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border hover:-translate-y-1 text-left ${
                isPro 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 ring-1 ring-white/10'
            }`}
        >
             <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full opacity-20 group-hover:opacity-30 transition-opacity ${isPro ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
             
             <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl text-white shadow-md flex-shrink-0 ${isPro ? 'bg-blue-600' : 'bg-yellow-600'}`}>
                    <StarIcon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className={`text-xl font-bold mb-2 transition-colors ${isPro ? 'text-white' : 'text-yellow-400 group-hover:text-yellow-300'}`}>
                        {isPro ? '멤버십 이용 중' : '멤버십 업그레이드'}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                        {isPro 
                            ? `현재 PRO 플랜을 이용하고 있습니다. (${new Date(user!.subscription!.endDate).toLocaleDateString()} 만료)` 
                            : '기능 제한 없이 유메이커의 모든 도구를 무제한으로 이용해보세요.'}
                    </p>
                </div>
             </div>
             
             <div className={`mt-6 flex items-center text-sm font-semibold transition-colors ${isPro ? 'text-blue-400 group-hover:text-blue-300' : 'text-yellow-500 group-hover:text-yellow-400'}`}>
                {isPro ? '멤버십 정보 확인' : '요금제 보러가기'} <i className="fas fa-arrow-right ml-2 transform group-hover:translate-x-1 transition-transform"></i>
             </div>
        </button>

        {/* Side Hustle Card */}
        <a
            href="https://forms.gle/Bd1fCohSNBLKnh4G9"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border hover:-translate-y-1 text-left bg-gradient-to-br from-green-900 to-emerald-900 border-green-700 ring-1 ring-white/10"
        >
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full opacity-20 bg-green-400 group-hover:opacity-30 transition-opacity"></div>
             
             <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl text-white shadow-md flex-shrink-0 bg-green-600">
                    <MoneyIcon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2 text-green-100 group-hover:text-white transition-colors">
                        월 1,000 부업유튜브
                    </h3>
                    <p className="text-sm text-green-100/80 leading-relaxed">
                        유튜브로 부수입을 만드는 시크릿 노하우. 지금 신청하고 전자책을 받아보세요.
                    </p>
                </div>
             </div>
             
             <div className="mt-6 flex items-center text-sm font-semibold text-green-300 group-hover:text-white transition-colors">
                신청하러 가기 <i className="fas fa-external-link-alt ml-2 transform group-hover:translate-x-1 transition-transform"></i>
             </div>
        </a>

        {/* Cafe Link Card */}
        <a
            href="https://cafe.naver.com/sanoblesse"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border hover:-translate-y-1 text-left bg-gradient-to-br from-amber-900 to-yellow-900 border-amber-700 ring-1 ring-white/10"
        >
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full opacity-20 bg-amber-400 group-hover:opacity-30 transition-opacity"></div>
             
             <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl text-white shadow-md flex-shrink-0 bg-amber-600">
                    <CoffeeIcon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2 text-amber-100 group-hover:text-white transition-colors">
                        유튜브 스터디 카페
                    </h3>
                    <p className="text-sm text-amber-100/80 leading-relaxed">
                        크리에이터들과 정보를 공유하고 함께 성장하는 커뮤니티에 참여하세요.
                    </p>
                </div>
             </div>
             
             <div className="mt-6 flex items-center text-sm font-semibold text-amber-300 group-hover:text-white transition-colors">
                카페 바로가기 <i className="fas fa-external-link-alt ml-2 transform group-hover:translate-x-1 transition-transform"></i>
             </div>
        </a>

        {/* Feature Guide Section */}
        <div className="col-span-full mt-8 mb-4">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"></div>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
                
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                    <i className="fas fa-compass text-blue-400"></i> 기능 활용 가이드
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {/* Card 1: Analysis */}
                    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:bg-slate-700/50 transition-colors group">
                        <div className="h-32 mb-4 bg-slate-900 rounded-lg flex items-end justify-center p-4 gap-2 border border-slate-700/50 overflow-hidden relative">
                            <div className="w-4 bg-blue-900 h-1/3 rounded-t group-hover:h-1/2 transition-all duration-500"></div>
                            <div className="w-4 bg-blue-700 h-1/2 rounded-t group-hover:h-2/3 transition-all duration-500 delay-75"></div>
                            <div className="w-4 bg-blue-500 h-2/3 rounded-t group-hover:h-full transition-all duration-500 delay-150 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                            
                            <div className="absolute top-2 right-2 text-[10px] text-slate-500 font-mono">DATA</div>
                        </div>
                        <h4 className="font-bold text-lg text-blue-200 mb-2">데이터 기반 성장</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            내 채널과 경쟁사를 분석하여<br/>
                            성장 그래프를 우상향으로 만드세요.
                        </p>
                    </div>

                    {/* Card 2: Creative */}
                    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:bg-slate-700/50 transition-colors group">
                        <div className="h-32 mb-4 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-700/50 relative">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <div className="w-12 h-16 bg-slate-800 border border-slate-600 rounded flex flex-col p-2 gap-1 shadow-lg transform group-hover:-rotate-6 transition-transform duration-300">
                                <div className="w-full h-1 bg-slate-600 rounded"></div>
                                <div className="w-2/3 h-1 bg-slate-600 rounded"></div>
                            </div>
                            <div className="w-12 h-16 bg-yellow-500/20 border border-yellow-500/50 rounded flex flex-col p-2 gap-1 absolute shadow-[0_0_15px_rgba(234,179,8,0.2)] transform group-hover:rotate-6 transition-transform duration-300 backdrop-blur-sm">
                                <div className="w-full h-1 bg-yellow-200/50 rounded"></div>
                                <div className="w-2/3 h-1 bg-yellow-200/50 rounded"></div>
                                <div className="mt-auto w-4 h-4 bg-yellow-400 rounded-full self-end"></div>
                            </div>
                        </div>
                        <h4 className="font-bold text-lg text-yellow-200 mb-2">AI 크리에이티브</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            쇼츠 대본부터 썸네일 피드백까지<br/>
                            AI가 제작 시간을 단축시켜줍니다.
                        </p>
                    </div>

                    {/* Card 3: Strategy */}
                    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:bg-slate-700/50 transition-colors group">
                        <div className="h-32 mb-4 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-700/50 relative overflow-hidden">
                            <div className="absolute w-full h-full grid grid-cols-6 grid-rows-4 gap-1 opacity-20">
                                {[...Array(24)].map((_, i) => (
                                    <div key={i} className="bg-green-500/20 rounded-sm"></div>
                                ))}
                            </div>
                            <div className="bg-green-900/80 text-green-400 border border-green-500/50 px-3 py-1 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center gap-2 transform group-hover:scale-110 transition-transform duration-300">
                                <SearchIcon className="w-3 h-3" /> 황금 키워드
                            </div>
                        </div>
                        <h4 className="font-bold text-lg text-green-200 mb-2">전략적 키워드</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            검색량이 많고 경쟁은 적은<br/>
                            블루오션 키워드를 발굴하세요.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => onNavigate(feature.view)}
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:-translate-y-1 text-left"
          >
            <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity ${feature.colorClass}`}></div>
            
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl text-white shadow-md ${feature.colorClass} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                {feature.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex items-center text-sm font-semibold text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
              바로가기 <i className="fas fa-arrow-right ml-2 transform group-hover:translate-x-1 transition-transform"></i>
            </div>
          </button>
        ))}
      </div>

      {/* Support Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={onOpenGuideModal}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group"
          >
              <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  <BookOpenIcon className="w-6 h-6" />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">사용법 가이드</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">기능 사용법이 궁금하신가요? 상세 가이드를 확인하세요.</p>
              </div>
          </button>

          <a 
            href="http://pf.kakao.com/_aWxfIG"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group"
          >
              <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/30 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                  <HeadsetIcon className="w-6 h-6" />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">CS 고객센터</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">문의사항이나 불편한 점이 있다면 언제든 연락주세요.</p>
              </div>
          </a>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default HomeView;