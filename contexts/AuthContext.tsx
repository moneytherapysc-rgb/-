import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, AuthContextType } from '../types';

const DEFAULT_TRIAL_DAYS = 14;

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
    getAllUsers: () => Promise.resolve([]),
    deleteUser: () => Promise.resolve(),
    applyCoupon: () => Promise.resolve(false),
};

const AuthContext = createContext<AuthContextType>(initialContextValue);

/** 쿠폰 트라이얼 계산 */
const calculateTrial = (couponUsedAt?: string): boolean => {
    if (!couponUsedAt) return false;
    try {
        const start = new Date(couponUsedAt);
        const end = new Date(start.getTime() + DEFAULT_TRIAL_DAYS * 24 * 60 * 60 * 1000);
        return new Date() < end;
    } catch {
        return false;
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {

    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    /** 유료/쿠폰 상태 계산 */
    const determineSubscriptionStatus = useCallback((u: User | null): boolean => {
        if (!u) return false;
        if (u.hasPaidSubscription) return true;
        if (calculateTrial(u.couponUsedAt)) return true;
        return false;
    }, []);

    /** 앱 시작 시: localStorage 에서 user 가져오기 */
    const loadUser = useCallback(() => {
        const stored = localStorage.getItem("auth_user");
        if (!stored) return null;
        try {
            return JSON.parse(stored) as User;
        } catch {
            return null;
        }
    }, []);

    /** 최초 실행 */
    useEffect(() => {
        const u = loadUser();
        if (u) {
            setUser(u);
            setIsAuthenticated(true);
            setIsSubscribed(determineSubscriptionStatus(u));
            setIsAdmin(!!u.isAdmin);
        }
        setIsLoading(false);
    }, [loadUser, determineSubscriptionStatus]);

    /** 로그인 */
    const signIn = useCallback(async (credentials: any) => {
        setIsLoading(true);

        // ⚠ 실제 서비스라면 서버와 통신
        const loggedInUser: User = {
            id: "user-" + credentials.email,
            email: credentials.email,
            name: credentials.email,
            joinedAt: new Date().toISOString(),
            isAdmin: false,

            isCouponUsed: false,
            couponUsedAt: undefined,
            hasPaidSubscription: false,
        };

        localStorage.setItem("auth_user", JSON.stringify(loggedInUser));

        setUser(loggedInUser);
        setIsAuthenticated(true);
        setIsSubscribed(false);
        setIsAdmin(false);

        setIsLoading(false);
    }, []);

    /** 로그아웃 */
    const signOut = useCallback(async () => {
        localStorage.removeItem("auth_user");
        setUser(null);
        setIsAuthenticated(false);
        setIsSubscribed(false);
        setIsAdmin(false);
    }, []);

    /** 쿠폰 적용 */
    const applyCoupon = useCallback(async (couponCode: string) => {
        if (!user) return false;

        const today = new Date().toISOString().split('T')[0];

        const updated: User = {
            ...user,
            isCouponUsed: true,
            couponUsedAt: today
        };

        localStorage.setItem("auth_user", JSON.stringify(updated));

        setUser(updated);
        setIsSubscribed(determineSubscriptionStatus(updated));

        return true;
    }, [user, determineSubscriptionStatus]);

    /** 유료 결제 완료 */
    const updateUserSubscription = useCallback(async () => {
        if (!user) return;
        const updated = { ...user, hasPaidSubscription: true };

        localStorage.setItem("auth_user", JSON.stringify(updated));

        setUser(updated);
        setIsSubscribed(true);
    }, [user]);

    const contextValue: AuthContextType = {
        user,
        isAuthenticated,
        isSubscribed,
        isLoading,

        signIn,
        signOut,
        updateSubscriptionStatus: () => {},

        isAdmin,
        login: signIn,
        signup: signIn,
        logout: signOut,

        changePassword: async () => {},
        updateUserSubscription,
        getAllUsers: async () => [],
        deleteUser: async () => {},
        applyCoupon,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
