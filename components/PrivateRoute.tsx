import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * 구독 및 인증 상태에 따라 라우팅을 제어하는 컴포넌트입니다.
 * * - 사용자가 인증되지 않았다면 (/signin) 페이지로 리디렉션합니다.
 * - 인증되었지만 구독하지 않았다면 (/subscribe) 페이지로 리디렉션합니다.
 * - 인증되었고 구독 중이라면 요청된 자식 컴포넌트(Outlet)를 렌더링합니다.
 */
const PrivateRoute: React.FC = () => {
    // AuthContext로부터 사용자 인증 및 구독 정보를 가져옵니다.
    const { user, isAuthenticated, isSubscribed, isLoading } = useAuth();

    // 인증 정보 로딩 중일 때는 아무것도 렌더링하지 않거나 로딩 스피너를 표시할 수 있습니다.
    // 현재는 간단히 null을 반환합니다.
    if (isLoading) {
        return null; // 또는 <div>Loading...</div>
    }

    // 1. 인증되지 않은 경우
    if (!isAuthenticated) {
        // 로그인 페이지로 리디렉션 (Navigate 컴포넌트 사용)
        return <Navigate to="/signin" replace />;
    }

    // 2. 인증되었지만 구독하지 않은 경우
    // NOTE: 구독 로직이 필요하다면 이 부분을 활성화합니다.
    // if (!isSubscribed) {
    //     // 구독 페이지로 리디렉션
    //     return <Navigate to="/subscribe" replace />;
    // }

    // 3. 인증되었고 모든 조건(선택적 구독 포함)을 충족하는 경우
    // 요청된 자식 경로의 컴포넌트를 렌더링합니다.
    return <Outlet />;
};

export default PrivateRoute;