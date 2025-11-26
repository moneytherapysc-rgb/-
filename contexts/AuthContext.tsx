import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
// User 타입은 isCouponUsed, hasPaidSubscription 필드를 포함하도록 types.ts에서 확장되었다고 가정합니다.
// User 타입 정의 예시: 
/* export interface User {
    id: string;
    name: string;
    email: string;
    joinedAt: string;
    isAdmin: boolean;
    isCouponUsed?: boolean; // 쿠폰 사용 여부 (추가)
    couponUsedAt?: string; // 쿠폰 사용일 (추가)
    hasPaidSubscription?: boolean; // 유료 구독 여부 (추가)
}
*/
import { User, AuthContextType } from '../types'; 

const DEFAULT_TRIAL_DAYS = 14;

// Context 초기값 정의
const initialContextValue: AuthContextType = {
    user: null,
    isAuthenticated: false,
    isSubscribed: false, // 유료 기능 사용 가능 여부
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
    applyCoupon: () => Promise.resolve(false), // 쿠폰 적용 함수 추가
};

const AuthContext = createContext<AuthContextType>(initialContextValue);

/**
 * [핵심 로직] 2주 (14일) 쿠폰 체험 상태를 계산하는 함수입니다.
 * 가입일이 아닌 쿠폰 사용일(couponUsedAt)을 기준으로 계산합니다.
 */
const calculateCouponTrialStatus = (couponUsedAt?: string): boolean => {
    if (!couponUsedAt) return false;
    try {
        const couponUseDate = new Date(couponUsedAt);
        // 14일을 밀리초로 더합니다.
        const trialEndDate = new Date(couponUseDate.getTime() + (DEFAULT_TRIAL_DAYS * 24 * 60 * 60 * 1000));
        const today = new Date();
        
        // 현재 날짜가 체험 종료일 이전이면 true (체험 중)
        return today < trialEndDate;
    } catch (e) {
        console.error("Error calculating coupon trial status:", e);
        return false; // 날짜 형식이 잘못되면 비구독 처리
    }
};

/**
 * 인증 및 사용자 상태를 제공하는 Provider 컴포넌트입니다.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false); // 유료 기능 사용 가능 여부
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false); 
    
    // 유료 기능 접근 권한을 결정하는 핵심 로직입니다.
    const determineSubscriptionStatus = useCallback((currentUser: User | null): boolean => {
        if (!currentUser) return false;

        // 1. 유료 구독 상태 확인
        if (currentUser.hasPaidSubscription) {
            return true;
        }

        // 2. 2주 무료 쿠폰 체험 상태 확인 (쿠폰을 사용했고, 기간이 만료되지 않았는지)
        const isCouponTrialActive = calculateCouponTrialStatus(currentUser.couponUsedAt);
        if (isCouponTrialActive) {
            return true;
        }

        // 3. 둘 다 아니면 구독 상태 아님
        return false;
    }, []);


    // 이 함수는 App 초기 로딩 시와 로그인 성공 시 구독 상태를 체크하는 역할을 합니다.
    const checkAuthStatus = useCallback(async (customUser?: User) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 300)); 
        
        // 실제 API에서 사용자 정보를 가져오는 대신 Mock User를 사용합니다.
        // NOTE: 테스트를 위해 couponUsedAt을 설정했습니다. (오늘 날짜로 2주 체험 시작)
        const MOCK_USER: User = customUser || { 
            id: 'user-123', 
            name: 'Traveler', 
            email: 'user@example.com',
            joinedAt: '2025-11-26', 
            isAdmin: false,
            // 💡 [핵심 변경] 유료 기능 접근을 위해 필요한 필드
            isCouponUsed: true,
            couponUsedAt: '2025-11-26', // 오늘 날짜로 설정하여 2주 체험이 활성 상태로 시작
            hasPaidSubscription: false,
        };

        const isUserLoggedIn = !!MOCK_USER; 

        if (isUserLoggedIn) {
            setUser(MOCK_USER);
            setIsAuthenticated(true);
            
            // ✅ [핵심 통합] 쿠폰 체험 또는 유료 구독 상태 확인
            const isUserSubscribed = determineSubscriptionStatus(MOCK_USER);
            setIsSubscribed(isUserSubscribed); 
            
            setIsAdmin(MOCK_USER.isAdmin || false); 
        } else {
            setUser(null);
            setIsAuthenticated(false);
            setIsSubscribed(false);
            setIsAdmin(false);
        }

        setIsLoading(false);
    }, [determineSubscriptionStatus]);

    // App 초기 로딩 시 인증 상태 확인
    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    // signIn 함수 (로그인 버튼 클릭 시)
    const signIn = useCallback(async (credentials: any) => {
        setIsLoading(true);
        // 실제 API 호출 로직은 생략. 성공 시 사용자 정보(User)를 받아와야 합니다.
        await new Promise(resolve => setTimeout(resolve, 500)); 

        // 로그인 성공 처리 후, 반드시 구독 상태를 다시 확인해야 합니다.
        await checkAuthStatus(); 
        
        setIsLoading(false);
    }, [checkAuthStatus]);


    // [추가된 핵심 함수] 2주 무료 쿠폰을 등록하는 로직
    const applyCoupon = useCallback(async (couponCode: string): Promise<boolean> => {
        if (!user) return false;
        
        // 1. 쿠폰 유효성 검사 및 서버 업데이트 (Mocking)
        console.log(`Applying coupon: ${couponCode}`);
        if (couponCode !== 'XXXX-XXXX-XXXX') {
             // 실제로는 API 호출을 통해 쿠폰 유효성 검증
             await new Promise(resolve => setTimeout(resolve, 500));
             return false; 
        }
        
        const today = new Date().toISOString().split('T')[0]; // 오늘 날짜

        // 2. 사용자 정보 업데이트 (로컬 & 서버)
        const updatedUser: User = { 
            ...user, 
            isCouponUsed: true, 
            couponUsedAt: today 
        };
        
        // 실제로는 API 호출을 통해 서버에 저장

        // 3. 상태 업데이트 및 구독 상태 재확인
        setUser(updatedUser);
        const isUserSubscribed = determineSubscriptionStatus(updatedUser);
        setIsSubscribed(isUserSubscribed);

        return isUserSubscribed;

    }, [user, determineSubscriptionStatus]);

    // 모든 나머지 함수 구현
    const signOut = useCallback(async () => {
        await new Promise(resolve => setTimeout(resolve, 500)); 
        // 실제로는 세션/토큰 제거
        setUser(null);
        setIsAuthenticated(false);
        setIsSubscribed(false);
        setIsAdmin(false);
    }, []);

    const updateSubscriptionStatus = useCallback((status: boolean) => {
        // 이 함수는 외부(결제 완료 등)에서 강제로 구독 상태를 변경할 때 사용됩니다.
        setIsSubscribed(status);
        if(user) {
            // 사용자 객체도 업데이트 (hasPaidSubscription: status) 필요
            setUser(prev => prev ? ({ ...prev, hasPaidSubscription: status }) : null);
        }
    }, [user]);

    const login = signIn;
    const logout = signOut; 

    const signup = useCallback(async (data: any) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('User signed up:', data);
        // 회원가입 성공 후 바로 로그인 처리 (checkAuthStatus 호출)
        // 새로운 사용자는 couponUsedAt, hasPaidSubscription이 모두 false인 상태로 시작합니다.
        const newUser: User = { 
            id: 'new-user-id', 
            name: data.email, 
            email: data.email, 
            joinedAt: new Date().toISOString().split('T')[0], 
            isAdmin: false, 
            isCouponUsed: false,
            hasPaidSubscription: false,
        };
        await checkAuthStatus(newUser); // 새로 가입한 사용자로 상태 업데이트
    }, [checkAuthStatus]); 

    const changePassword = useCallback(async (data: any) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Password changed:', data);
    }, []);

    const updateUserSubscription = useCallback(async (planId: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Subscription updated to:', planId);
        // 결제 성공 시, hasPaidSubscription: true로 업데이트해야 합니다.
        if (user) {
             const updatedUser: User = { 
                ...user, 
                hasPaidSubscription: true, 
                // 유료 결제 시 쿠폰 체험 여부는 상관 없어집니다.
             };
             setUser(updatedUser);
             setIsSubscribed(determineSubscriptionStatus(updatedUser)); 
        }
        // 실제로는 API 호출을 통해 서버에 저장
    }, [user, determineSubscriptionStatus]);

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
        applyCoupon, // 새롭게 추가된 함수
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