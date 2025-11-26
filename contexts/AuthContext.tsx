import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, AuthContextType } from '../types'; // types 임포트

// 초기 Context 값 정의
const initialContextValue: AuthContextType = {
    user: null,
    isAuthenticated: false,
    isSubscribed: false,
    isLoading: true,
    signIn: () => Promise.resolve(),
    signOut: () => Promise.resolve(),
    updateSubscriptionStatus: () => {},
    // 👇👇👇 types.ts 확장에 맞춰 추가된 초기값 👇👇👇
    isAdmin: false, 
    login: () => Promise.resolve(), 
    signup: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    changePassword: () => Promise.resolve(),
    updateUserSubscription: () => Promise.resolve(),
    getAllUsers: () => Promise.resolve([] as User[]), 
    deleteUser: () => Promise.resolve(),
    // 👆👆👆 types.ts 확장에 맞춰 추가된 초기값 👆👆👆
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
    const [isAdmin, setIsAdmin] = useState(false); // 👈 isAdmin 상태 추가

    // 가상의 인증 및 구독 상태 로딩 로직
    useEffect(() => {
        const checkAuthStatus = async () => {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 지연

            // 임시 데이터: 실제 사용자 정보가 있다면 인증 상태를 true로 설정
            const mockUser: User = { 
                id: 'user-123', 
                name: 'Traveler', 
                email: 'user@example.com',
                joinedAt: '2025-11-26', // 👈 TS2741 오류 해결
                isAdmin: false, // Mock User에게 관리자 권한 부여
            };
            const isUserLoggedIn = !!mockUser; 

            if (isUserLoggedIn) {
                setUser(mockUser);
                setIsAuthenticated(true);
                
                // 구독 상태 체크
                const userSubscriptionStatus = true; // 예시: 현재는 구독 상태라고 가정
                setIsSubscribed(userSubscriptionStatus);
                setIsAdmin(mockUser.isAdmin || false); // 관리자 상태 설정
            } else {
                setUser(null);
                setIsAuthenticated(false);
                setIsSubscribed(false);
                setIsAdmin(false);
            }

            setIsLoading(false);
        };

        checkAuthStatus();
    }, []);

    const signIn = useCallback(async (credentials: any) => {
        setIsLoading(true);
        // 실제 API 호출 로직을 구현합니다.
        await new Promise(resolve => setTimeout(resolve, 500)); 

        const mockUser: User = { 
            id: 'user-123', 
            name: 'Adventurer', 
            email: 'adventurer@example.com',
            joinedAt: '2025-11-26', // 👈 TS2741 오류 해결
            isAdmin: false, // 일반 사용자 Mock
        };
        
        setUser(mockUser);
        setIsAuthenticated(true);
        setIsSubscribed(true); // 로그인 성공 시 구독 상태도 설정
        setIsAdmin(mockUser.isAdmin || false);
        setIsLoading(false);
    }, []);

    const signOut = useCallback(async () => {
        // 실제 API 로그아웃 로직을 구현합니다.
        await new Promise(resolve => setTimeout(resolve, 500)); 

        setUser(null);
        setIsAuthenticated(false);
        setIsSubscribed(false);
        setIsAdmin(false);
    }, []);

    const updateSubscriptionStatus = useCallback((status: boolean) => {
        setIsSubscribed(status);
        // 서버 측 상태 업데이트 로직이 있다면 여기에 추가
    }, []);

    // 👇👇👇 TS2339 오류 해결을 위한 함수 구현 👇👇👇
    
    // login/logout은 signIn/signOut의 별칭으로 사용
    const login = signIn;
    const logout = signOut; 

    // signup 함수 구현 (임시)
    const signup = useCallback(async (data: any) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('User signed up:', data);
        // 성공 시 로그인 상태로 전환하는 로직 필요
    }, [signIn]); 

    // changePassword 함수 구현 (임시)
    const changePassword = useCallback(async (data: any) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Password changed:', data);
    }, []);

    // updateUserSubscription 함수 구현 (임시)
    const updateUserSubscription = useCallback(async (planId: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Subscription updated to:', planId);
        setIsSubscribed(true); // 성공 시 구독 상태 업데이트
    }, []);

    // getAllUsers 함수 구현 (임시)
    const getAllUsers = useCallback(async (): Promise<User[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        // 관리자용 Mock User 목록 반환
        return [{ id: '1', email: 'admin@a.com', name: 'Admin', joinedAt: '2025-01-01', isAdmin: true }]; 
    }, []);

    // deleteUser 함수 구현 (임시)
    const deleteUser = useCallback(async (userId: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('User deleted:', userId);
    }, []);
    // 👆👆👆 TS2339 오류 해결을 위한 함수 구현 👆👆👆


    // contextValue에 모든 상태와 함수를 포함
    const contextValue: AuthContextType = {
        user,
        isAuthenticated,
        isSubscribed,
        isLoading,
        signIn,
        signOut,
        updateSubscriptionStatus,
        // 👇👇👇 contextValue에 추가된 항목 👇👇👇
        isAdmin,
        login,
        signup,
        logout,
        changePassword,
        updateUserSubscription,
        getAllUsers,
        deleteUser,
        // 👆👆👆 contextValue에 추가된 항목 👆👆👆
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