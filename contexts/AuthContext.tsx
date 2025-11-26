import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, AuthContextType } from '../types'; 
// import { signInWithEmail, signUpWithEmail, signOutUser, ... } from '../services/authService'; // 실제 인증 서비스를 사용한다면 추가

// 초기 Context 값 정의 (types.ts 확장 반영)
const initialContextValue: AuthContextType = {
    user: null,
    isAuthenticated: false,
    isSubscribed: false,
    isLoading: true,
    signIn: () => Promise.resolve(),
    signOut: () => Promise.resolve(),
    updateSubscriptionStatus: () => {},
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
 * [핵심 로직] 2주 (14일) 무료 체험 상태를 계산하는 함수입니다.
 */
const calculateTrialStatus = (joinedAt: string): boolean => {
    try {
        const joinDate = new Date(joinedAt);
        // 14일 (14 * 24시간 * 60분 * 60초 * 1000ms)을 밀리초로 더합니다.
        const trialEndDate = new Date(joinDate.getTime() + (14 * 24 * 60 * 60 * 1000));
        const today = new Date();
        
        // 현재 날짜가 체험 종료일 이전이면 true (체험 중)
        return today < trialEndDate;
    } catch (e) {
        console.error("Error calculating trial status:", e);
        return false; // 날짜 형식이 잘못되면 비구독 처리
    }
};

/**
 * 인증 및 사용자 상태를 제공하는 Provider 컴포넌트입니다.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false); 
    
    // 이 함수는 App 초기 로딩 시와 로그인 성공 시 구독 상태를 체크하는 역할을 합니다.
    const checkAuthStatus = useCallback(async () => {
        await new Promise(resolve => setTimeout(resolve, 500)); 
        
        // Mock User Data: [joinedAt] 날짜를 기준으로 체험 기간을 계산합니다.
        // NOTE: 테스트를 위해 가입일을 '2025-11-05' (만료됨)로 설정했습니다.
        const mockUser: User = { 
            id: 'user-123', 
            name: 'Traveler', 
            email: 'user@example.com',
            joinedAt: '2025-11-05', // 👈 이 날짜를 변경하여 체험 상태를 테스트할 수 있습니다.
            isAdmin: false,
        };
        const isUserLoggedIn = !!mockUser; 

        if (isUserLoggedIn) {
            setUser(mockUser);
            setIsAuthenticated(true);
            
            // -------------------------------------------------------------
            // ✅ [핵심 통합] 2주 무료 체험 로직 적용
            // -------------------------------------------------------------
            const isTrialActive = calculateTrialStatus(mockUser.joinedAt); 
            
            // NOTE: 실제 구현 시에는 isTrialActive OR user.subscription?.status === 'active'가 됩니다.
            setIsSubscribed(isTrialActive); 
            // -------------------------------------------------------------
            
            setIsAdmin(mockUser.isAdmin || false); 
        } else {
            setUser(null);
            setIsAuthenticated(false);
            setIsSubscribed(false);
            setIsAdmin(false);
        }

        setIsLoading(false);
    }, []);

    // App 초기 로딩 시 인증 상태 확인
    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    // signIn 함수 (로그인 버튼 클릭 시)
    const signIn = useCallback(async (credentials: any) => {
        setIsLoading(true);
        // 실제 API 호출 로직은 생략
        await new Promise(resolve => setTimeout(resolve, 500)); 

        // 로그인 성공 처리 후, 반드시 구독 상태를 다시 확인해야 합니다.
        await checkAuthStatus(); 
        
        setIsLoading(false);
    }, [checkAuthStatus]);


    // 모든 나머지 함수 구현 (TS2339 해결)
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

    const login = signIn;
    const logout = signOut; 

    const signup = useCallback(async (data: any) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('User signed up:', data);
        // 회원가입 후 checkAuthStatus를 호출하여 로그인 상태로 전환하는 로직 필요
    }, [checkAuthStatus]); 

    const changePassword = useCallback(async (data: any) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Password changed:', data);
    }, []);

    const updateUserSubscription = useCallback(async (planId: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Subscription updated to:', planId);
        // 구독 업데이트는 실제 구독 상태를 true로 변경해야 합니다.
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