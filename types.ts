export interface User {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  isAdmin: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isSubscribed: boolean;
  isCouponUsed: boolean;
  isAdmin: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  signout: () => Promise<void>;

  updateSubscriptionStatus: () => Promise<void>;
  applyCoupon: (couponCode: string) => Promise<boolean>;
  updateUserSubscription: (updated: User) => void;

  getAllUsers: () => Promise<any[]>;
  deleteUser: (id: string) => Promise<void>;
}

/* --- 여기 아래 추가! --- */

export interface ShortsIdea {
  id: string;
  title: string;
  description: string;
  keyword: string;

  // ShortsGeneratorView에서 사용되는 필드들
  hook: string;
  script: string;
  visualGuide: string;
}

export interface SystemInstruction {
    id: string;
    name: string;       // ← ★ 이거 반드시 추가!
    title: string;
    content: string;
    isActive: boolean;
}