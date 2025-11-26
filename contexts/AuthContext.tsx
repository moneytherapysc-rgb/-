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
    // types.ts 확장에 맞춰 추가된 초기값
    isAdmin: false, 
    login: () => Promise.resolve(), 
    signup: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    changePassword: () => Promise.resolve(),
    updateUserSubscription: () => Promise.resolve(),
    getAllUsers: () => Promise.resolve([] as User[]), 
    deleteUser: () => Promise.resolve(),
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
    const [isAdmin, setIsAdmin] = useState(false); 

    // 가상의 인증 및 구독 상태 로딩 로직 (App 초기 로딩 시)
    useEffect(() => {
        const checkAuthStatus = async () => {
            await new Promise(resolve => setTimeout(resolve, 1000)); 
            
            const mockUser: User = { 
                id: 'user-123', 
                name: 'Traveler', 
                email: 'user@example.com',
                joinedAt: '2025-11-26', 
                isAdmin: false,
            };
            const isUserLoggedIn = !!mockUser; 

            if (isUserLoggedIn) {
                setUser(mockUser);
                setIsAuthenticated(true);
                
                // ❌ 1. 초기 인증 상태에서 구독 상태를 false로 설정하여 비구독자 테스트 허용
                setIsSubscribed(false); 
                setIsAdmin(mockUser.isAdmin || false); 
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

    // signIn 함수 (로그인 버튼 클릭 시)
    const signIn = useCallback(async (credentials: any) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500)); 

        const mockUser: User = { 
            id: 'user-123', 
            name: 'Adventurer', 
            email: 'adventurer@example.com',
            joinedAt: '2025-11-26', 
            isAdmin: false, 
        };
        
        setUser(mockUser);
        setIsAuthenticated(true);
        // ❌ 2. 로그인 성공 시 구독 상태를 false로 설정하여 비구독자 테스트 허용
        setIsSubscribed(false); 
        setIsAdmin(mockUser.isAdmin || false);
        setIsLoading(false);
    }, []);

    const signOut = useCallback(async () => {
        await new Promise(resolve => setTimeout(resolve, 500)); 
        setUser(null);
        setIsAuthenticated(false);
        setIsSubscribed(false);
        setIsAdmin(false);
    }, []);

    const updateSubscriptionStatus = useCallback((status: boolean) => {
        setIsSubscribed(status);
    }, []);

    // TS2339 오류 해결을 위한 함수 구현
    const login = signIn;
    const logout = signOut; 

    const signup = useCallback(async (data: any) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('User signed up:', data);
    }, [signIn]); 

    const changePassword = useCallback(async (data: any) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Password changed:', data);
    }, []);

    // updateUserSubscription 함수 (PricingModal에서 호출될 경우)
    const updateUserSubscription = useCallback(async (planId: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Subscription updated to:', planId);
        // ✅ 3. 구독 업데이트는 실제 구독 상태를 true로 변경해야 합니다.
        setIsSubscribed(true); 
    }, []);

    const getAllUsers = useCallback(async (): Promise<User[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [{ id: '1', email: 'admin@a.com', name: 'Admin', joinedAt: '2025-01-01', isAdmin: true }]; 
    }, []);

    const deleteUser = useCallback(async (userId: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('User deleted:', userId);
    }, []);


    // contextValue에 모든 상태와 함수를 포함
    const contextValue: AuthContextType = {
        user,
        isAuthenticated,
        isSubscribed,
        isLoading,
        signIn,
        signOut,
        updateSubscriptionStatus,
        isAdmin,
        login,
        signup,
        logout,
        changePassword,
        updateUserSubscription,
        getAllUsers,
        deleteUser,
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