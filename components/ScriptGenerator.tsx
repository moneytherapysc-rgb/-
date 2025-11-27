// components/ProtectedRoute.tsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import LoginModal from "./LoginModal";
import PaywallScreen from "./PaywallScreen";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, profile, loading } = useAuth();

    // auth 상태 로딩 중
    if (loading) return <div className="text-center py-20">확인 중...</div>;

    // 로그인 안 된 사용자
    if (!user) {
        return <LoginModal />;
    }

    // 로그인은 되었지만 무료회원 → Paywall 이동
    if (profile && !profile.is_premium) {
        return <PaywallScreen />;
    }

    // 유료회원 → 정상 접근
    return <>{children}</>;
};

export default ProtectedRoute;
