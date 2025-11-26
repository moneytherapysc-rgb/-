import React from 'react';
import { PaletteIcon, MicrophoneIcon, CalendarIcon } from './icons';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 border-b-2 border-slate-200 dark:border-slate-700 pb-2">{title}</h3>
        <div className="space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{children}</div>
    </div>
);

const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-lg max-w-4xl w-full text-left border-t-4 border-red-500 relative animate-fade-in-up max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                <i className="fas fa-book-open text-red-500 mr-2"></i>
                사용 설명서
            </h2>
            <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-3xl font-light w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="닫기"
            >
            &times;
            </button>
        </div>

        <div className="overflow-y-auto pr-2 flex-grow">
            <Section title="앱 개요">
                <p className="text-lg"><strong>유메이커(Yumaker)</strong>는 크리에이터의 성장을 돕는 올인원 AI 데이터 분석 도구입니다.</p>
                <p>채널 정밀 분석부터 키워드 발굴, 영상 조회수 크롤링, 쇼츠 대본 생성, 그리고 콘텐츠 제작(이미지/음성)까지 유튜브 운영에 필요한 모든 도구를 제공합니다.</p>
            </Section>

            <Section title="1. 시작하기">
                <p>앱의 모든 기능을 사용하려면 <strong>YouTube Data API v3 키</strong>가 필요합니다.</p>
                <ul className="list-disc list-inside mt-2 pl-4 text-slate-500 dark:text-slate-400">
                    <li><strong>회원가입 및 로그인:</strong> 이메일로 간편하게 가입하고 로그인하세요.</li>
                    <li><strong>API 키 설정:</strong> 로그인 후 좌측 사이드바 하단의 'API 키 설정' 버튼을 눌러 Google Cloud Console에서 발급받은 키를 입력해주세요.</li>
                </ul>
            </Section>

            <Section title="2. 주요 기능 완벽 가이드">
                <div className="space-y-8">
                    
                    {/* 2.1 채널 분석 */}
                    <div>
                        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
                            <span className="bg-blue-100 text-blue-600 p-1.5 rounded-md"><i className="fas fa-chart-bar"></i></span> 
                            2.1 채널 분석
                        </h4>
                        <p>특정 채널의 모든 영상을 분석하여 성과 지표와 AI 성장 전략을 도출합니다.</p>
                        <ul className="list-disc list-inside mt-2 pl-4 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                            <li><strong>AI 리포트 3종:</strong> 경쟁 전략, 성장 과정 분석, 채널 정밀 진단(컨설팅) 보고서 제공.</li>
                            <li><strong>데이터 시각화:</strong> 조회수, 좋아요, 인기 점수 분포 및 타임라인 그래프 제공.</li>
                        </ul>
                    </div>

                    {/* 2.2 키워드 분석 */}
                    <div>
                        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
                            <span className="bg-green-100 text-green-600 p-1.5 rounded-md"><i className="fas fa-search"></i></span> 
                            2.2 키워드 분석 (검색량 & 태그)
                        </h4>
                        <p>관심 키워드의 <strong>예상 검색량(PC/모바일)</strong>과 <strong>연관 추천 태그</strong>를 AI가 분석합니다.</p>
                        <ul className="list-disc list-inside mt-2 pl-4 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                            <li><strong>태그 자동생성:</strong> 영상 업로드 시 바로 사용할 수 있는 최적의 태그 목록 제공.</li>
                            <li><strong>AI 채널 전략:</strong> 해당 키워드로 채널을 운영할 때의 로드맵과 컨셉 제안.</li>
                        </ul>
                    </div>

                    {/* 2.3 키워드 영상 검색 */}
                    <div>
                        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
                            <span className="bg-red-100 text-red-600 p-1.5 rounded-md"><i className="fab fa-youtube"></i></span> 
                            2.3 떡상 영상 분석 (실데이터 크롤링)
                        </h4>
                        <p>키워드와 관련된 <strong>실제 유튜브 영상 데이터</strong>를 대량으로 수집하여 분석합니다. 시장 조사에 필수적입니다.</p>
                        <ul className="list-disc list-inside mt-2 pl-4 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                            <li><strong>대량 수집:</strong> 옵션을 통해 최대 <strong>500개</strong> 영상까지 한 번에 분석 가능.</li>
                            <li><strong>정밀 필터링:</strong> 카테고리, 영상 길이(쇼츠/롱폼), 최소 조회수, 국가(한국/해외) 필터 지원.</li>
                            <li><strong>영상 저장:</strong> 분석된 영상 목록에서 북마크 버튼을 눌러 '마이 라이브러리'에 저장.</li>
                        </ul>
                    </div>

                    {/* 2.4 쇼츠 아이디어 생성 */}
                    <div>
                        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
                            <span className="bg-yellow-100 text-yellow-600 p-1.5 rounded-md"><i className="fas fa-bolt"></i></span> 
                            2.4 쇼츠 아이디어 생성기
                        </h4>
                        <p>키워드 하나만 입력하면 AI가 <strong>3초 훅, 촬영 대본, 연출 가이드</strong>가 포함된 쇼츠 기획안 5개를 즉시 생성합니다.</p>
                        <ul className="list-disc list-inside mt-2 pl-4 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                            <li><strong>페르소나 선택:</strong> '재치있는 입담꾼', '냉철한 독설가' 등 AI의 어조를 설정하여 다양한 스타일의 대본 작성 가능.</li>
                        </ul>
                    </div>

                    {/* 2.5 AI 썸네일 클리닉 */}
                    <div>
                        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
                            <span className="bg-pink-100 text-pink-600 p-1.5 rounded-md"><i className="fas fa-image"></i></span> 
                            2.5 AI 썸네일 클리닉 (A/B 테스트)
                        </h4>
                        <p>제작한 썸네일을 업로드하면 AI가 시인성, 호기심 등 4가지 지표로 점수를 매기고 피드백을 줍니다.</p>
                        <ul className="list-disc list-inside mt-2 pl-4 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                            <li><strong>A/B 테스트:</strong> 두 개의 시안을 비교 업로드하면 AI가 승자를 예측하고 항목별로 상세 비교해줍니다.</li>
                        </ul>
                    </div>

                    {/* 2.6 채널 전투력 비교 */}
                    <div>
                        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
                            <span className="bg-slate-200 text-slate-700 p-1.5 rounded-md"><i className="fas fa-fist-raised"></i></span> 
                            2.6 채널 1:1 전투력 비교
                        </h4>
                        <p>나의 채널과 경쟁 채널(롤모델)을 1:1로 매칭하여 구독자, 조회수, 활동성 등을 레이더 차트로 비교 분석합니다.</p>
                    </div>

                    {/* 2.7 마이 라이브러리 */}
                    <div>
                        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
                            <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-md"><i className="fas fa-bookmark"></i></span> 
                            2.7 마이 라이브러리
                        </h4>
                        <p>분석했던 채널, 키워드, 그리고 유용한 영상들을 폴더별로 정리하여 나만의 레퍼런스 보드를 만드세요.</p>
                    </div>

                    {/* 2.8 AI 이미지 스튜디오 */}
                    <div>
                        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
                            <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-md"><PaletteIcon className="w-4 h-4" /></span> 
                            2.8 AI 이미지 스튜디오 <span className="text-xs text-red-500 bg-red-100 px-1 rounded ml-2">NEW</span>
                        </h4>
                        <p>텍스트 프롬프트로 고화질 이미지를 생성하거나, 기존 이미지를 AI로 편집할 수 있습니다.</p>
                        <ul className="list-disc list-inside mt-2 pl-4 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                            <li><strong>이미지 생성:</strong> 원하는 장면을 글로 묘사하면 AI가 3~5초 만에 이미지를 그려줍니다. (16:9, 1:1 등 비율 선택 가능)</li>
                            <li><strong>이미지 편집:</strong> 원본 이미지를 올리고 "선글라스 씌워줘", "배경을 우주로 바꿔줘"와 같이 명령하면 AI가 수정해줍니다.</li>
                        </ul>
                    </div>

                    {/* 2.9 AI 보이스 스튜디오 */}
                    <div>
                        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
                            <span className="bg-teal-100 text-teal-600 p-1.5 rounded-md"><MicrophoneIcon className="w-4 h-4" /></span> 
                            2.9 AI 보이스 스튜디오 <span className="text-xs text-red-500 bg-red-100 px-1 rounded ml-2">NEW</span>
                        </h4>
                        <p>대본을 입력하면 전문 성우급 AI 내레이션(TTS)을 생성하여 MP3/WAV 파일로 다운로드할 수 있습니다.</p>
                        <ul className="list-disc list-inside mt-2 pl-4 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                            <li><strong>10종 보이스:</strong> 뉴스톤, 예능톤, 다큐톤 등 다양한 상황에 맞는 10가지 목소리 페르소나를 제공합니다.</li>
                            <li><strong>속도 최적화:</strong> 최대 300자(쇼츠 1편 분량) 생성에 최적화되어 있어 5초 이내에 결과물을 받아볼 수 있습니다.</li>
                        </ul>
                    </div>

                    {/* 2.10 트렌드 캘린더 */}
                    <div>
                        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
                            <span className="bg-pink-100 text-pink-600 p-1.5 rounded-md"><CalendarIcon className="w-4 h-4" /></span> 
                            2.10 트렌드 예측 캘린더 <span className="text-xs text-red-500 bg-red-100 px-1 rounded ml-2">NEW</span>
                        </h4>
                        <p>AI가 다가올 시즌 이슈와 트렌드를 월별 달력에 미리 예측하여 표시해줍니다.</p>
                        <ul className="list-disc list-inside mt-2 pl-4 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                            <li><strong>스마트 기획:</strong> 날짜를 클릭하면 해당 날짜의 트렌드 이슈에 맞는 영상 기획안을 AI가 자동으로 작성해줍니다.</li>
                            <li><strong>스케줄 관리:</strong> 생성된 기획안을 캘린더에 저장하여 채널 업로드 스케줄을 관리할 수 있습니다.</li>
                        </ul>
                    </div>
                </div>
            </Section>

            <Section title="3. 팁 & 노하우">
                <ul className="list-disc list-inside space-y-2 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700/50 text-slate-700 dark:text-slate-300">
                    <li><strong>대본 분석 시:</strong> 유튜브 영상 링크만으로는 분석이 부정확할 수 있습니다. <code>DownSub.com</code> 등에서 자막 파일(.txt)을 다운로드하여 업로드하면 최고의 결과를 얻을 수 있습니다.</li>
                    <li><strong>API 할당량:</strong> 키워드 영상 검색 시 500개를 선택하면 API 사용량이 많아집니다. 할당량이 초과되면 다음 날 다시 이용하거나 프로젝트를 변경해야 합니다.</li>
                </ul>
            </Section>

            <Section title="4. 요금제 및 멤버십 안내">
                <p className="mb-4">유메이커는 합리적인 가격으로 최고의 AI 분석 기능을 제공합니다.</p>
                
                <div className="mb-6 p-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h5 className="font-extrabold text-lg">🎉 오픈 기념 초특가</h5>
                        <span className="bg-yellow-400 text-red-900 text-xs font-bold px-2 py-1 rounded-full">500명 인원한정</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black">₩9,900</span>
                        <span className="text-sm opacity-80 mb-1">/ 1개월</span>
                    </div>
                    <p className="text-sm font-bold text-yellow-200 mt-1">하루 약 330원</p>
                    <p className="text-sm mt-2 opacity-90">
                        한달 커피 두잔값으로 AI 기능을 무제한 체험해보세요.<br/>
                        선착순 500명 한정으로 조기 마감될 수 있습니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600 text-center">
                        <h5 className="font-bold text-slate-800 dark:text-white mb-1">스타터 플랜</h5>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">₩18,900</p>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">하루 약 630원</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">부담 없이 시작하는<br/>가성비 입문용</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600 text-center">
                        <h5 className="font-bold text-slate-800 dark:text-white mb-1">그로스 플랜</h5>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">₩49,900<span className="text-xs text-slate-500">/3개월</span></p>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">하루 약 554원</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">본격적인 채널 성장을<br/>위한 최적의 선택</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border-2 border-blue-500 relative text-center">
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">BEST</div>
                        <h5 className="font-bold text-slate-800 dark:text-white mb-1">프로 플랜</h5>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">₩169,000<span className="text-xs text-slate-500">/1년</span></p>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">하루 약 463원</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">월 14,000원대로 누리는<br/>압도적인 혜택</p>
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-4">
                    * 모든 플랜은 AI 분석 횟수 제한 없이 무제한으로 이용 가능합니다.<br/>
                    * 결제 후 7일 이내 사용 이력이 없을 경우 전액 환불 가능합니다.
                </p>
            </Section>
        </div>
      </div>
       <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default GuideModal;