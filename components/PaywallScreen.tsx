import React, { useState, useEffect, useContext, createContext } from 'react';

// ====================================================================
// [1] MOCK/DEPENDENCIES (단일 파일 구성을 위해 내부 정의)
// ====================================================================

// --- 1.1 Types ---
type ShortsIdea = {
    title: string;
    hook: string;
    script: string;
    visualGuide: string;
};

type SystemInstruction = {
    id: string;
    name: string;
    content: string;
    isActive?: boolean;
};

// --- 1.2 Icons (Lucide-react 대신 인라인 SVG 사용) ---
const LightningIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);

const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
);

const BrainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-7.35 1.48 5.5 5.5 0 0 0 .58 8.8 5 5 0 0 0 9.89 0 5.5 5.5 0 0 0 .58-8.8A3 3 0 1 0 12 5"/><path d="M10 20a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v2h4z"/><path d="M14 20a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2h-4z"/><path d="M14 17a3 3 0 0 0-6 0"/><path d="M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/></svg>
);


// --- 1.3 Services Mock ---
const getInstructions = (): SystemInstruction[] => [
    { id: '1', name: '바이럴 쇼츠 전문가 (기본)', content: '당신은 유튜브 쇼츠에 특화된 바이럴 마케팅 전문가입니다. 모든 대본은 3초 이내에 시청자의 이목을 끄는 강력한 후크(Hook)를 포함해야 하며, 60초를 넘지 않는 짧고 명쾌한 구성으로 5가지 아이디어를 한국어로 생성합니다.', isActive: true },
    { id: '2', name: '교육 콘텐츠 기획자', content: '당신은 복잡한 지식을 쉽고 재미있게 전달하는 교육 콘텐츠 기획자입니다. 시청자가 하나의 지식을 얻어갈 수 있도록 3가지 아이디어를 생성합니다.', isActive: false },
];

const generateShortsIdeas = async (keyword: string, instruction: string | undefined): Promise<ShortsIdea[]> => {
    // API 호출 대신 더미 데이터를 5초 후에 반환하는 Mock 함수
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    const baseTitle = `${keyword}로 떡상하는 방법`;
    const instructionName = getInstructions().find(i => i.content === instruction)?.name || '기본 전문가';

    return [
        {
            title: baseTitle + " #1",
            hook: `(충격!) 아무도 모르는 ${keyword}의 진실 3가지`,
            script: `여러분, 시간 낭비는 그만! ${keyword}를 이렇게 사용하면 인생이 바뀝니다. \n1. 의외의 활용법 \n2. 숨겨진 기능 \n3. 전문가의 팁`,
            visualGuide: "빠른 컷 편집, 자막 강조, 긴장감 있는 배경 음악. 팁 설명 시 화면 분할.",
        },
        {
            title: baseTitle + " #2",
            hook: `이 영상을 넘기면 100만원을 잃습니다.`,
            script: `안녕하세요, 저는 ${instructionName}입니다. ${keyword}에 대한 흔한 오해를 풀어드립니다. \n오해 1: 사실이 아님 \n오해 2: 반전의 진실`,
            visualGuide: "클로즈업으로 시작, 오해 설명 시 재미있는 밈 이미지 삽입.",
        },
        {
            title: baseTitle + " #3",
            hook: `당신의 ${keyword}는 틀렸습니다.`,
            script: `지금 바로 고쳐야 할 ${keyword} 실수 5가지. \n이것만 알면 당신도 고수!`,
            visualGuide: "빠르게 숫자를 카운트하며 리스트 형식으로 보여줌.",
        },
    ];
};

// --- 1.4 Auth Context Mock ---
interface AuthContextType {
    isAuthenticated: boolean;
    isSubscribed: boolean;
    isLoading: boolean;
}

// 실제 환경에서는 Context Provider가 필요하지만, 단일 파일이므로 Hook만 정의합니다.
const useAuth = (): AuthContextType => {
    // 실제 서비스의 인증 상태를 시뮬레이션합니다.
    const [auth, setAuth] = useState<AuthContextType>({
        isAuthenticated: true, // 로그인 상태 가정
        isSubscribed: false,    // **테스트를 위해 기본 false로 설정하여 PaywallScreen이 보이도록 합니다.**
        isLoading: false,      // 로딩 완료 가정
    });

    useEffect(() => {
        // 실제 API 호출 없이, 2초 후에 구독 상태를 true로 바꿔서 Paywall을 해제하는 Mock 로직을 추가할 수 있습니다.
        // setTimeout(() => setAuth(prev => ({ ...prev, isSubscribed: true })), 5000);
    }, []);

    return auth;
};

// --- 1.5 CouponModal Mock (PaywallScreen의 종속성) ---
interface CouponModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CouponModal: React.FC<CouponModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const [couponCode, setCouponCode] = useState('');
    const [resultMessage, setResultMessage] = useState('');

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setResultMessage(`쿠폰 코드 '${couponCode}' 등록을 시도했습니다. (Mock)`);
        // 실제 로직: API 호출 후 구독 상태 업데이트
        // Mock에서는 닫는 것만 처리
        setTimeout(() => {
            onClose();
            setCouponCode('');
            setResultMessage('');
        }, 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 border-t-4 border-purple-500">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">쿠폰 등록</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                    2주 무료 체험 또는 이벤트 쿠폰 코드를 입력하세요.
                </p>

                <form onSubmit={handleRegister} className="space-y-4">
                    <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="쿠폰 코드 입력 (예: FREE2WEEKS)"
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-800 dark:text-white"
                        required
                    />
                    <button
                        type="submit"
                        disabled={!couponCode.trim()}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors disabled:bg-purple-400"
                    >
                        등록하기
                    </button>
                </form>

                {resultMessage && (
                    <div className="mt-4 p-3 text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg">
                        {resultMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 1.6 PaywallScreen (사용자가 제공한 코드로 업데이트) ---
interface PaywallScreenProps {
    featureName: string; // 어떤 기능에 대한 Paywall인지 명시
}

const PaywallScreen: React.FC<PaywallScreenProps> = ({ featureName }) => {
    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
    
    // LightningIcon을 사용하여 유료 기능임을 시각적으로 강조
    const YellowLockIcon = (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" fill="#FBBF24" opacity="0.2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#FBBF24" strokeWidth="2"/>
            <circle cx="12" cy="16" r="1" fill="#FBBF24"/>
        </svg>
    );

    return (
        // Tailwind CSS를 사용하여 디자인된 Paywall 화면
        <div className="flex flex-col items-center justify-center p-8 bg-slate-900 dark:bg-slate-900 min-h-[50vh] sm:min-h-full rounded-xl sm:rounded-lg shadow-2xl border-t-8 border-yellow-500/50 text-white max-w-4xl mx-auto my-8">
            
            <YellowLockIcon className="w-16 h-16 text-yellow-500 mb-6"/>
            
            <h2 className="text-4xl font-extrabold text-yellow-400 mb-4 sm:text-5xl">
                프리미엄 기능: {featureName}
            </h2>
            <p className="text-gray-300 text-lg text-center mb-10 max-w-xl">
                이 기능은 **유료 구독자** 또는 **2주 무료 체험 사용자**에게만 제공됩니다.
                지금 바로 잠금을 해제하고 채널 성장에 필요한 강력한 도구를 사용하세요!
            </p>

            {/* 쿠폰 등록 버튼 */}
            <button 
                onClick={() => setIsCouponModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-8 rounded-full transition-transform transform hover:scale-105 mb-4 shadow-lg text-lg w-full sm:w-auto"
            >
                🎁 2주 무료 체험 쿠폰 등록하기
            </button>
            
            {/* 요금제 페이지 이동 버튼 */}
            <a 
                href="/pricing" // 실제 요금제 페이지 경로로 변경하세요.
                onClick={(e) => { e.preventDefault(); console.log("요금제 페이지로 이동 (Mock)"); alert("⚠️ 실제 서비스에서는 요금제 페이지로 이동합니다."); }}
                className="text-blue-400 hover:text-blue-300 underline text-sm mt-2"
            >
                또는, 요금제 선택 후 즉시 구독 시작하기
            </a>

            {/* CouponModal 연결 */}
            <CouponModal 
                isOpen={isCouponModalOpen} 
                onClose={() => setIsCouponModalOpen(false)} 
            />
        </div>
    );
};


// ====================================================================
// [2] MAIN COMPONENT (사용자 요청 코드)
// ====================================================================

const ShortsGeneratorView: React.FC = () => {
    // 💡 useAuth에서 구독 및 인증 상태를 가져옵니다.
    const { isAuthenticated, isSubscribed, isLoading: isAuthLoading } = useAuth();

    const [keyword, setKeyword] = useState('');
    const [isLoading, setIsLoading] = useState(false); // 기능 자체의 로딩 상태
    const [ideas, setIdeas] = useState<ShortsIdea[]>([]);
    const [error, setError] = useState<string | null>(null);
    
    // Persona State
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
        
        // 🚨 [Paywall Guard] 이미 위에서 차단하지만, 버튼 이벤트에서도 이중 체크합니다.
        if (!isSubscribed) {
            setError("프리미엄 기능입니다. 구독 상태를 확인해 주세요.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setIdeas([]);

        try {
            const selectedContent = instructions.find(i => i.id === selectedInstructionId)?.content;
            // Mock generateShortsIdeas를 호출합니다.
            const result = await generateShortsIdeas(keyword.trim(), selectedContent);
            setIdeas(result);
        } catch (err: any) {
            // navigator.clipboard.writeText는 iframe에서 보안 문제로 인해 실패할 수 있습니다.
            // 성공/실패 메시지 대신 콘솔에만 기록합니다.
            setError(err.message || '아이디어 생성 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const copyIdea = (idea: ShortsIdea) => {
        const textToCopy = `[${idea.title}]\n\nHOOK: ${idea.hook}\n\n📜 대본:\n${idea.script}\n\n🎥 연출: ${idea.visualGuide}`;
        
        // 브라우저 클립보드 API를 사용합니다.
        navigator.clipboard.writeText(textToCopy).then(() => {
            console.log('클립보드에 대본이 복사되었습니다!');
        }).catch(err => {
            console.error('클립보드 복사 실패:', err);
            // 사용자에게 오류를 알리는 대신 console에만 기록합니다.
        });
    };

    // ------------------------------------------------------------------
    // 🛑 [핵심 PAYWALL 로직] 접근 차단 🛑
    // ------------------------------------------------------------------

    // 1. 인증 로딩 중 (AuthContext의 로딩)
    if (isAuthLoading) {
        return <div className="max-w-5xl mx-auto p-8 text-center text-slate-400 dark:text-slate-500">사용자 권한 확인 중...</div>;
    }
    
    // 2. 미인증 사용자 처리
    if (!isAuthenticated) {
        return <div className="max-w-5xl mx-auto p-8 text-center text-red-500 dark:text-red-400">로그인 후 이 기능을 이용할 수 있습니다.</div>;
    }
    
    // 3. 비구독자 및 체험 기간 만료 사용자 차단
    if (!isSubscribed) {
        // PaywallScreen 컴포넌트를 렌더링하여 쿠폰 등록을 유도합니다.
        return <PaywallScreen featureName="AI 쇼츠 대본 생성" />;
    }

    // ------------------------------------------------------------------
    // ✅ 구독자 및 체험 기간 중인 경우: 실제 기능 렌더링
    // ------------------------------------------------------------------
    return (
        <div className="max-w-5xl mx-auto font-sans animate-fade-in-up pb-12 p-4 md:p-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg mb-8 text-center border border-slate-200 dark:border-slate-700">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 mb-4">
                    <LightningIcon className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                    쇼츠 아이디어 생성기
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                    키워드만 입력하면 3초 훅이 포함된 바이럴 쇼츠 대본이 쏟아집니다.
                </p>
            </div>

            <form onSubmit={handleGenerate} className="max-w-2xl mx-auto mb-10 space-y-6">
                {/* Persona Selector */}
                <div className="flex justify-center">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg border border-slate-200 dark:border-slate-600 w-fit">
                        <BrainIcon className="w-5 h-5 text-slate-500 dark:text-slate-400 ml-2" />
                        <select 
                            value={selectedInstructionId}
                            onChange={(e) => setSelectedInstructionId(e.target.value)}
                            className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer pr-2"
                        >
                            {instructions.map(inst => (
                                <option key={inst.id} value={inst.id} className="bg-white dark:bg-slate-800">
                                    {inst.name} {inst.isActive ? '(기본)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="relative flex items-center shadow-lg rounded-full">
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="주제 키워드를 입력하세요 (예: 편의점 꿀조합, 아이폰 꿀팁)"
                        className="w-full px-6 py-4 text-lg bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-full focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 dark:text-white shadow-inner transition-all pr-[120px]"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !keyword.trim()}
                        className="absolute right-1.5 px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-full transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>생성 중...</span>
                            </div>
                        ) : '대본 생성'}
                    </button>
                </div>
            </form>

            {error && (
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg mb-6 max-w-2xl mx-auto">
                    {error}
                </div>
            )}

            {ideas.length > 0 && (
                <div className="grid gap-6">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-4 border-b pb-2 border-yellow-500">
                        ✨ 생성된 쇼츠 아이디어 ({ideas.length}개)
                    </h3>
                    {ideas.map((idea, index) => (
                        <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 flex justify-between items-start">
                                <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">
                                    <span className="text-yellow-600 dark:text-yellow-400 mr-2">IDEA #{index + 1}</span>
                                    {idea.title}
                                </h3>
                                <button onClick={() => copyIdea(idea)} className="flex items-center space-x-1 text-slate-500 hover:text-blue-500 transition-colors bg-white dark:bg-slate-700 p-2 rounded-full shadow-md" title="대본 전체 복사">
                                    <CopyIcon className='w-4 h-4'/>
                                    <span className="text-sm font-medium hidden sm:inline">복사</span>
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border-l-4 border-red-500">
                                    <span className="text-sm font-bold text-red-600 dark:text-red-400 block mb-2 flex items-center">
                                        <LightningIcon className='w-4 h-4 mr-2'/> 3초 HOOK (초반 3초 집중 유도!)
                                    </span>
                                    <p className="text-slate-800 dark:text-slate-200 text-lg font-bold italic">"{idea.hook}"</p>
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400 block mb-2">📜 촬영 대본 (Script)</span>
                                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">{idea.script}</p>
                                    </div>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border-l-4 border-indigo-500">
                                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 block mb-2">🎥 촬영/편집 가이드</span>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm">{idea.visualGuide}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <style>{`
                /* Tailwind CSS is assumed to be available */
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ShortsGeneratorView;