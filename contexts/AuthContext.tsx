import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';

// **********************************************************
// 💡 변경 사항: isSubscriptionActive 함수를 Context Type에 추가
// **********************************************************
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserSubscription: (updatedUser: User) => void;
  changePassword: (currentPw: string, newPw: string) => Promise<void>;
  isLoading: boolean;
  isAdmin: boolean;
  isSubscriptionActive: (user: User | null) => boolean; // <--- 구독 활성 상태 확인 함수 추가
  getAllUsers: () => User[];
  deleteUser: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'yt_macgyver_users';
const CURRENT_USER_KEY = 'yt_macgyver_current_user';

// Demo Admin Email
const ADMIN_EMAIL = 'admin@test.com';

// **********************************************************
// 💡 새로 추가된 핵심 로직: 구독 유효성 검사
// **********************************************************
const checkSubscriptionActive = (user: User | null): boolean => {
    if (!user || !user.subscription) {
        return false;
    }

    const sub = user.subscription;
    
    // 상태가 'active'가 아니면 false (예: expired, cancelled)
    if (sub.status !== 'active') {
        return false;
    }

    // 만료일이 현재 날짜보다 미래인지 확인
    const endDate = new Date(sub.endDate);
    const now = new Date();

    // 관리자 계정은 만료일 검사에서 제외 (무한 유효)
    if (user.email === ADMIN_EMAIL) {
        return true;
    }

    // 만료일이 현재보다 과거이면 false
    return endDate.getTime() > now.getTime();
};
// **********************************************************

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // 1. Load User
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAdmin(parsedUser.email === ADMIN_EMAIL);
    }

    // 2. Seed Admin Account
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    let users: User[] = usersJson ? JSON.parse(usersJson) : [];

    if (!users.some(u => u.email === ADMIN_EMAIL)) {
        const adminUser: User = {
            id: 'admin-root',
            name: '최고관리자',
            email: ADMIN_EMAIL,
            password: 'admin',
            joinedAt: new Date().toISOString(),
            subscription: {
                plan: '12months',
                status: 'active',
                startDate: new Date().toISOString(),
                // 관리자 계정은 10년 후 만료일로 설정
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString()
            }
        };
        users.push(adminUser);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }

    setIsLoading(false);
  }, []);

  const getAllUsers = (): User[] => {
      const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
  };

  const deleteUser = (email: string) => {
      const users = getAllUsers();
      const updatedUsers = users.filter(u => u.email !== email);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      
      // If the deleted user is currently logged in (which shouldn't happen in normal admin flow, but for safety)
      if (user?.email === email) {
          logout();
      }
  };

  const login = async (email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
        const users: User[] = usersJson ? JSON.parse(usersJson) : [];
        
        const foundUser = users.find(u => u.email === email && u.password === password);
        
        if (foundUser) {
          const { password, ...userWithoutPass } = foundUser;
          const isUserAdmin = email === ADMIN_EMAIL;
          
          const sessionUser = { ...userWithoutPass, isAdmin: isUserAdmin } as User;
          
          setUser(sessionUser);
          setIsAdmin(isUserAdmin);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
          resolve();
        } else {
          reject(new Error('이메일 또는 비밀번호가 올바르지 않습니다.'));
        }
      }, 800);
    });
  };

  const signup = async (name: string, email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
        const users: User[] = usersJson ? JSON.parse(usersJson) : [];
        
        if (users.some(u => u.email === email)) {
          reject(new Error('이미 가입된 이메일입니다.'));
          return;
        }
        
        // 💡 신규 가입자에게 2주 무료 쿠폰 자동 부여
        const now = new Date();
        const freeTrialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14일 추가

        const newUser: User = {
          id: Date.now().toString(),
          name,
          email,
          password,
          joinedAt: new Date().toISOString(),
          subscription: { // <--- 신규 가입 시 구독 정보 추가 (2주 무료 쿠폰)
            plan: 'free-trial',
            status: 'active',
            startDate: now.toISOString(),
            endDate: freeTrialEnd.toISOString()
          }
        };

        users.push(newUser);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        
        const { password: _, ...userWithoutPass } = newUser;
        const isUserAdmin = email === ADMIN_EMAIL;
        const sessionUser = { ...userWithoutPass, isAdmin: isUserAdmin } as User;

        setUser(sessionUser);
        setIsAdmin(isUserAdmin);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
        
        resolve();
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const updateUserSubscription = (updatedUser: User) => {
      setUser(updatedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      
      const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
      if (usersJson) {
          const users: User[] = JSON.parse(usersJson);
          const index = users.findIndex(u => u.email === updatedUser.email);
          if (index !== -1) {
              const password = users[index].password;
              users[index] = { ...updatedUser, password };
              localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
          }
      }
  };

  const changePassword = async (currentPw: string, newPw: string): Promise<void> => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              if (!user) {
                  reject(new Error('로그인이 필요합니다.'));
                  return;
              }

              const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
              const users: User[] = usersJson ? JSON.parse(usersJson) : [];
              const userIndex = users.findIndex(u => u.email === user.email);

              if (userIndex === -1) {
                  reject(new Error('사용자 정보를 찾을 수 없습니다.'));
                  return;
              }

              if (users[userIndex].password !== currentPw) {
                  reject(new Error('현재 비밀번호가 일치하지 않습니다.'));
                  return;
              }

              users[userIndex].password = newPw;
              localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
              resolve();
          }, 500);
      });
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUserSubscription, changePassword, isLoading, isAdmin, isSubscriptionActive: checkSubscriptionActive, getAllUsers, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};