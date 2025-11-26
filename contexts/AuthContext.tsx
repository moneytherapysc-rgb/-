import React, { createContext, useContext, useState } from "react";
import type { AuthContextType, User } from "../types";

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isSubscribed: false,
  isCouponUsed: false,
  isAdmin: false,
  isLoading: true,

  login: async () => {},
  signup: async () => {},
  signout: async () => {},

  updateSubscriptionStatus: async () => {},
  applyCoupon: async () => true,

  updateUserSubscription: () => {},   // ⭐ 추가된 부분

  getAllUsers: async () => [],
  deleteUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCouponUsed, setIsCouponUsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string) => {
    console.log("Mock login");
    setIsAuthenticated(true);

    setUser({
      id: "1",
      name: "Mock User",
      email: email,
      joinedAt: "2025-01-01",
      isAdmin: false,
    });

    setIsLoading(false);
  };

  const signup = async (email: string, password: string) => {
    console.log("Mock signup");
  };

  const signout = async () => {
    console.log("Mock signout");
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateSubscriptionStatus = async () => {
    console.log("Mock updateSubscriptionStatus");
    setIsSubscribed(true);
  };

  const applyCoupon = async (couponCode: string) => {
    console.log("Mock applyCoupon:", couponCode);
    setIsSubscribed(true);
    setIsCouponUsed(true);
    return true;
  };

  const getAllUsers = async () => {
    console.log("Mock getAllUsers");
    return [];
  };

  const deleteUser = async (id: string) => {
    console.log("Mock deleteUser", id);
  };

  /* ----------------------------------------
      ⭐ 핵심: PricingModal에서 요청하는 함수 추가
      updateUserSubscription(updatedUser)
  ---------------------------------------- */
  const updateUserSubscription = (updated: User) => {
    console.log("updateUserSubscription 실행됨:", updated);

    setUser(updated);
    setIsSubscribed(true);
    setIsCouponUsed((updated as any)?.isCouponUsed ?? false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isSubscribed,
        isCouponUsed,
        isAdmin,
        isLoading,

        login,
        signup,
        signout,

        updateSubscriptionStatus,
        applyCoupon,

        updateUserSubscription,   // ⭐ Provider에 등록됨

        getAllUsers,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
