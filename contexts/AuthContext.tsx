import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, AuthContextType } from '../types';

// 초기 Context 값은 사용될 때 반드시 덮어쓰여야 하므로, 
// 타입 추론을 위해 AuthContextType을 따르되, 사용되지 않는 함수는 빈 함수로 정의합니다.
const initialContextValue: AuthContextType = {
    user: null,
    isAuthenticated: false,
    isSubscribed: false,
    isLoading: true,
    signIn: () => Promise.resolve(),
    signOut: () => Promise.resolve(),
    updateSubscriptionStatus: () => {},
};

const AuthContext = createContext<AuthContextType>(initialContextValue);

/**
 * 인증 및 사용자 상태를 제공하는 Provider 컴포넌트입니다.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 가상의 인증 및 구독 상태 로딩 로직
    useEffect(() => {
        // 실제 애플리케이션에서는 여기서 토큰 검증, 세션 복원 등을 수행합니다.
        const checkAuthStatus = async () => {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 지연

            // 임시 데이터: 실제 사용자 정보가 있다면 인증 상태를 true로 설정
            const mockUser: User = { id: 'user-123', name: 'Traveler', email: 'user@example.com' };
            const isUserLoggedIn = !!mockUser; // 예시: 항상 로그인되어 있다고 가정

            if (isUserLoggedIn) {
                setUser(mockUser);
                setIsAuthenticated(true);
                // 구독 상태도 여기서 체크하거나, 로그인 후 별도 API로 체크합니다.
                // TS2322 오류 메시지에 언급된 'free-trial' 로직을 여기에 반영합니다.
                // 'free-trial'은 현재 명시된 타입에 없으므로, isSubscribed로 간주되는 로직을 넣습니다.
                // 여기서 isSubscribed 값을 결정합니다.
                const userSubscriptionStatus = true; // 예시: 현재는 구독 상태라고 가정
                setIsSubscribed(userSubscriptionStatus);
            } else {
                setUser(null);
                setIsAuthenticated(false);
                setIsSubscribed(false);
            }

            setIsLoading(false);
        };

        checkAuthStatus();
    }, []);

    const signIn = useCallback(async (credentials: any) => {
        setIsLoading(true);
        // 실제 API 호출 로직을 구현합니다.
        await new Promise(resolve => setTimeout(resolve, 500)); 

        const mockUser: User = { id: 'user-123', name: 'Adventurer', email: 'adventurer@example.com' };
        
        setUser(mockUser);
        setIsAuthenticated(true);
        setIsSubscribed(true); // 로그인 성공 시 구독 상태도 설정
        setIsLoading(false);
    }, []);

    const signOut = useCallback(async () => {
        // 실제 API 로그아웃 로직을 구현합니다.
        await new Promise(resolve => setTimeout(resolve, 500)); 

        setUser(null);
        setIsAuthenticated(false);
        setIsSubscribed(false);
    }, []);

    const updateSubscriptionStatus = useCallback((status: boolean) => {
        setIsSubscribed(status);
        // 서버 측 상태 업데이트 로직이 있다면 여기에 추가
    }, []);


    const contextValue = {
        user,
        isAuthenticated,
        isSubscribed,
        isLoading,
        signIn,
        signOut,
        updateSubscriptionStatus,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Auth Context를 사용하기 위한 사용자 정의 Hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};