import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
    ChartBarIcon, PencilIcon, BookOpenIcon, SettingsIcon, FireIcon, 
    UsersIcon, StarIcon, KeyIcon, BrainIcon, SearchIcon, HomeIcon, 
    PhotoIcon, ChatBubbleIcon, BookmarkIcon, SwordsIcon, LightningIcon, 
    YouTubeIcon, HeadsetIcon, MegaphoneIcon, MoneyIcon, CoffeeIcon, PaletteIcon,
    MicrophoneIcon, CalendarIcon, ExclamationCircleIcon
} from './icons';

type AppView =
    | 'home' | 'channel' | 'script' | 'trending' | 'admin'
    | 'keyword_analysis' | 'keyword_video' | 'thumbnail'
    | 'comment_analysis' | 'library' | 'battle'
    | 'shorts_generator' | 'notice' | 'image_gen'
    | 'voice_studio' | 'calendar';

interface SidebarProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  onOpenApiKeyModal: () => void;
  onOpenGuideModal: () => void;
  onOpenLoginModal: () => void;
  onOpenPricingModal: () => void;
  onOpenInstructionModal: () => void;
  onOpenProfileModal: () => void;
  onOpenQuotaModal: () => void;
}

interface NavLinkProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
    colorClass?: string;
    badge?: string;
    locked?: boolean;
}

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
        <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
        />
    </svg>
);

const NavLink: React.FC<NavLinkProps> = ({ icon, label, isActive, onClick, colorClass, badge, locked }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 group ${
            isActive 
            ? 'bg-slate-700 text-white shadow-md' 
            : 'text-slate-400 hover:bg-slate-700 hover:text-white'
        }`}
    >
        <div className="flex items-center space-x-3">
            <div className={`${isActive ? 'text-white' : colorClass || 'text-slate-500 group-hover:text-white'} transition-colors`}>
                {icon}
            </div>
            <span className="font-medium truncate">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            {badge && (
                <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                    {badge}
                </span>
            )}
            {locked && <LockIcon />}
        </div>
    </button>
);

const Sidebar: React.FC<SidebarProps> = ({
    activeView,
    onViewChange,
    onOpenApiKeyModal,
    onOpenGuideModal,
    onOpenLoginModal,
    onOpenPricingModal,
    onOpenInstructionModal,
    onOpenProfileModal,
    onOpenQuotaModal
}) => {

    // 🔥 logout → signout 으로 변경 (AuthContextType에 맞춤)
    const { user, isSubscribed, signout } = useAuth();

    const handleProtectedNav = (view: AppView) => {
        if (!user) return onOpenLoginModal();
        if (!isSubscribed) return onOpenPricingModal();
        onViewChange(view);
    };

    const handleNormalNav = (view: AppView) => {
        if (!user && view !== 'home' && view !== 'notice') {
            return onOpenLoginModal();
        }
        onViewChange(view);
    };

    const isLocked = !user || !isSubscribed;

    return (
        <aside className="w-64 bg-slate-800 text-white flex flex-col flex-shrink-0 h-screen sticky top-0 shadow-2xl font-sans">

            {/* User Header */}
            <div className="p-6 border-b border-slate-700">
                {user ? (
                    <div className="flex items-center space-x-3 cursor-pointer group" onClick={onOpenProfileModal}>
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shadow-lg group-hover:bg-indigo-600 transition-colors">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                                {user.name}
                            </p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                        <SettingsIcon />
                    </div>
                ) : (
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleNormalNav('home')}>
                        <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center shadow-lg text-white">
                            <i className="fas fa-robot"></i>
                        </div>
                        <span className="text-lg font-extrabold tracking-tight text-white">유메이커</span>
                    </div>
                )}
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                <div className="mb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">메인 메뉴</div>

                <NavLink icon={<HomeIcon />} label="홈" isActive={activeView === 'home'} onClick={() => handleNormalNav('home')} />

                <NavLink
                    icon={<MegaphoneIcon className="w-5 h-5" />}
                    label="공지사항"
                    isActive={activeView === 'notice'}
                    onClick={() => handleNormalNav('notice')}
                />

                <NavLink
                    icon={<PaletteIcon />}
                    label="AI 이미지 스튜디오"
                    isActive={activeView === 'image_gen'}
                    onClick={() => handleProtectedNav('image_gen')}
                    colorClass="text-indigo-400"
                    locked={isLocked}
                />

                <NavLink
                    icon={<MicrophoneIcon />}
                    label="AI 보이스 스튜디오"
                    isActive={activeView === 'voice_studio'}
                    onClick={() => handleProtectedNav('voice_studio')}
                    colorClass="text-teal-400"
                    badge="NEW"
                    locked={isLocked}
                />

                <NavLink
                    icon={<LightningIcon />}
                    label="쇼츠 아이디어"
                    isActive={activeView === 'shorts_generator'}
                    onClick={() => handleProtectedNav('shorts_generator')}
                    colorClass="text-yellow-500"
                    locked={isLocked}
                />
            </nav>

            {/* Bottom */}
            <div className="p-4 bg-slate-900 border-t border-slate-700 space-y-1">
                <NavLink
                    icon={<BrainIcon />}
                    label="AI 페르소나 설정"
                    isActive={false}
                    onClick={onOpenInstructionModal}
                />

                {user ? (
                    <>
                        <NavLink
                            icon={<StarIcon />}
                            label="멤버십 관리"
                            isActive={false}
                            onClick={onOpenPricingModal}
                        />

                        {/* 🔥 logout → signout */}
                        <button
                            onClick={signout}
                            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-colors mt-2"
                        >
                            <i className="fas fa-sign-out-alt w-5 h-5"></i>
                            <span className="font-medium">로그아웃</span>
                        </button>
                    </>
                ) : (
                    <NavLink
                        icon={<UsersIcon />}
                        label="로그인"
                        isActive={false}
                        onClick={onOpenLoginModal}
                    />
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
