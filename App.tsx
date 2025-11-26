import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx'; // 확장자 명시
import { isApiKeySet, setApiKey } from './services/youtubeService.ts'; // 확장자 명시
import MainLayout from './components/MainLayout.tsx'; // 확장자 명시
import Home from './components/Home.tsx'; // 확장자 명시
import Strategy from './components/Strategy.tsx'; // 확장자 명시
import Tools from './components/Tools.tsx'; // 확장자 명시
import Settings from './components/Settings.tsx'; // 확장자 명시
import Admin from './components/Admin.tsx'; // 확장자 명시
import Auth from './components/Auth.tsx'; // 확장자 명시
import NotFound from './components/NotFound.tsx'; // 확장자 명시
import Subscription from './components/Subscription.tsx'; // 확장자 명시
import PrivateRoute from './components/PrivateRoute.tsx'; // 확장자 명시

// **********************************************************
// 💡 AppContent: 인증 및 구독 상태 확인 로직이 추가된 메인 컴포넌트
// **********************************************************
const AppContent: React.FC = () => {
    // AuthContext에서 user와 isSubscriptionActive를 가져옵니다.
    const { user, isLoading, isSubscriptionActive } = useAuth(); 
    
    // API 키 설정 상태를 로컬 state로 관리
    const [apiKeySet, setApiKeySet] = useState(isApiKeySet());

    useEffect(() => {
        // API 키가 변경될 때마다 상태를 업데이트합니다.
        setApiKeySet(isApiKeySet());
    }, [user]);

    // **핵심 수정 부분:** 서비스 이용 가능 여부를 판단하는 변수
    // 1. 로그인 했고, 2. 구독이 활성화되었으며, 3. API 키가 설정되어 있어야 합니다.
    const isSubscriberActive = isSubscriptionActive(user);
    const isServiceReady = isSubscriberActive && apiKeySet;

    // 만약 로그인이 필요 없다면, isServiceReady를 단순히 apiKeySet만으로 설정할 수 있지만,
    // 현재는 로그인 상태와 구독 상태를 함께 확인해야 합니다.
    
    // 로딩 중이거나 사용자가 없으면 Auth 페이지로 라우팅
    if (isLoading) {
        // 로딩 스피너 등을 여기에 표시할 수 있습니다.
        return <div>로딩 중...</div>; 
    }

    // Auth 페이지로의 라우팅을 위한 PrivateRoute 대체 함수
    const AuthOrHome = () => {
        const location = useLocation();
        if (user) {
            // 사용자가 로그인되어 있으면 홈으로
            return <Navigate to="/" state={{ from: location }} replace />;
        }
        // 로그인 되어 있지 않으면 Auth 페이지 보여줌
        return <Auth />;
    };

    return (
        <MainLayout isServiceReady={isServiceReady} isSubscriptionActive={isSubscriberActive} apiKeySet={apiKeySet}>
            <Routes>
                {/* 메인 서비스 페이지들은 PrivateRoute로 보호 */}
                <Route path="/" element={<Home isServiceReady={isServiceReady} />} />
                <Route path="/strategy" element={<PrivateRoute><Strategy /></PrivateRoute>} />
                <Route path="/tools" element={
                    <PrivateRoute>
                        <Tools isServiceReady={isServiceReady} />
                    </PrivateRoute>
                } />
                <Route path="/settings" element={
                    <PrivateRoute>
                        <Settings apiKeySet={apiKeySet} setApiKeySet={setApiKeySet} />
                    </PrivateRoute>
                } />
                <Route path="/admin" element={<PrivateRoute requiresAdmin={true}><Admin /></PrivateRoute>} />
                <Route path="/subscription" element={
                    <PrivateRoute>
                        <Subscription isSubscriptionActive={isSubscriberActive} />
                    </PrivateRoute>
                } />
                
                {/* Auth 페이지는 로그인 상태에 따라 리다이렉트 */}
                <Route path="/auth" element={<AuthOrHome />} />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </MainLayout>
    );
};

// **********************************************************
// App: 최상위 Context Provider
// **********************************************************
const App: React.FC = () => (
    <Router>
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    </Router>
);

export default App;