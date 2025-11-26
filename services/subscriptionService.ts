
import type { SubscriptionPlan, Coupon, User } from '../types';

const COUPONS_STORAGE_KEY = 'yt_macgyver_coupons';

// PortOne Global Declaration
declare global {
    interface Window {
        IMP: any;
    }
}

export const subscriptionPlans: SubscriptionPlan[] = [
    { 
        id: 'event_launch', 
        name: '🎉 오픈 특가 (1개월)', 
        price: 9900, 
        durationMonths: 1,
        description: '500명 인원한정! 한달 커피 두잔값으로 AI 기능을 무제한 체험해보세요.'
    },
    { 
        id: '1month', 
        name: '스타터 플랜 (1개월)', 
        price: 18900, 
        durationMonths: 1,
        // description: '가볍게 시작하는 가성비 요금제' 
    },
    { 
        id: '3months', 
        name: '그로스 플랜 (3개월)', 
        price: 49900, 
        durationMonths: 3, 
        discount: 12,
        // description: '채널 성장에 집중하는 분들을 위한 플랜'
    },
    { 
        id: '12months', 
        name: '프로 플랜 (1년)', 
        price: 169000, 
        durationMonths: 12, 
        discount: 25,
        // description: '장기 운영을 위한 압도적 혜택'
    },
];

// Real Payment Process via PortOne (Test Mode)
export const requestPayment = async (user: User, planId: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        if (!window.IMP) {
            reject(new Error("결제 모듈을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요."));
            return;
        }

        const plan = subscriptionPlans.find(p => p.id === planId);
        if (!plan) {
            reject(new Error('유효하지 않은 플랜입니다.'));
            return;
        }

        const { IMP } = window;
        // PortOne Test Identification Code
        // 실제 운영 시 본인의 가맹점 식별코드로 교체해야 합니다. (포트원 관리자 페이지 -> 시스템 설정 -> 내 정보)
        IMP.init('imp19424728'); 

        const data = {
            pg: 'html5_inicis', // KG이니시스 (테스트)
            pay_method: 'card',
            merchant_uid: `mid_${new Date().getTime()}`, // 주문번호
            name: plan.name,
            amount: plan.price,
            buyer_email: user.email,
            buyer_name: user.name,
            buyer_tel: '010-0000-0000', // 필수 항목이라 더미 데이터 사용
            m_redirect_url: window.location.href, // 모바일 결제 후 리다이렉트 될 URL
        };

        IMP.request_pay(data, (rsp: any) => {
            if (rsp.success) {
                // 결제 성공 시 로직
                // *주의* 실제 서비스에서는 여기서 백엔드 API를 호출하여 결제 위변조 검증을 해야 합니다.
                // 현재는 클라이언트 사이드 앱이므로 검증 없이 즉시 등급을 조정합니다.
                
                const startDate = new Date();
                const endDate = new Date();
                endDate.setMonth(startDate.getMonth() + plan.durationMonths);

                const updatedUser: User = {
                    ...user,
                    subscription: {
                        plan: planId as any,
                        status: 'active',
                        startDate: startDate.toISOString(),
                        endDate: endDate.toISOString(),
                    }
                };
                resolve(updatedUser);
            } else {
                // 결제 실패 시 로직
                const msg = rsp.error_msg || '결제가 취소되었습니다.';
                reject(new Error(msg));
            }
        });
    });
};

// Mock function kept for backward compatibility if needed, but unused now
export const processMockPayment = async (user: User, planId: string): Promise<User> => {
    return requestPayment(user, planId);
};


// --- Coupon Management (Admin) ---

const generateRandomCode = (length: number = 12): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        if (i > 0 && i % 4 === 0) result += '-';
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const getCoupons = (): Coupon[] => {
    const stored = localStorage.getItem(COUPONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const generateCoupons = (durationMonths: 0.5 | 1 | 3 | 6 | 12, count: number): Coupon[] => {
    const currentCoupons = getCoupons();
    const newCoupons: Coupon[] = [];

    for (let i = 0; i < count; i++) {
        let code;
        // Ensure uniqueness
        do {
            code = generateRandomCode();
        } while (currentCoupons.some(c => c.code === code) || newCoupons.some(c => c.code === code));

        newCoupons.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            code,
            durationMonths,
            isUsed: false,
            createdAt: new Date().toISOString()
        });
    }

    const updatedCoupons = [...newCoupons, ...currentCoupons];
    localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(updatedCoupons));
    return newCoupons;
};

export const redeemCoupon = async (user: User, code: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const coupons = getCoupons();
            const couponIndex = coupons.findIndex(c => c.code === code);

            if (couponIndex === -1) {
                reject(new Error('유효하지 않은 쿠폰 코드입니다.'));
                return;
            }

            const coupon = coupons[couponIndex];

            if (coupon.isUsed) {
                reject(new Error('이미 사용된 쿠폰입니다.'));
                return;
            }

            // Update Coupon Status
            coupons[couponIndex] = {
                ...coupon,
                isUsed: true,
                usedBy: user.email,
                usedAt: new Date().toISOString(),
            };
            localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(coupons));

            // Update User Subscription
            const startDate = new Date();
            const endDate = new Date();
            
            if (coupon.durationMonths === 0.5) {
                // 2 Weeks (14 days)
                endDate.setDate(startDate.getDate() + 14);
            } else {
                endDate.setMonth(startDate.getMonth() + coupon.durationMonths);
            }

            const planMap = {
                0.5: 'trial',
                1: '1month',
                3: '3months',
                6: '6months',
                12: '12months'
            };

            const updatedUser: User = {
                ...user,
                subscription: {
                    plan: planMap[coupon.durationMonths] as any || 'trial',
                    status: 'active',
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                }
            };

            resolve(updatedUser);
        }, 1000);
    });
};