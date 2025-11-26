// components/CouponModal.tsx

import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext'; 

interface CouponModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CouponModal: React.FC<CouponModalProps> = ({ isOpen, onClose }) => {
    // 💡 [핵심] AuthContext에서 구독 상태 변경 로직과 로딩 상태를 가져옵니다.
    const { applyCoupon, isLoading } = useAuth(); 
    
    const [couponCode, setCouponCode] = useState('');
    const [message, setMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // 쿠폰 등록 처리 함수
    const handleApply = useCallback(async () => {
        if (couponCode.length === 0) {
            setMessage('쿠폰 코드를 입력해 주세요.');
            return;
        }

        setIsProcessing(true);
        setMessage('');

        try {
            // 💡 [핵심 로직] AuthContext의 applyCoupon 호출
            const success = await applyCoupon(couponCode.trim());

            if (success) {
                setMessage('🎉 2주 무료 체험이 성공적으로 시작되었습니다! 지금 프로 기능을 사용해 보세요.');
                // 성공 시 2초 후 모달 자동 닫기
                setTimeout(() => {
                    onClose();
                }, 2000); 
            } else {
                // NOTE: 실제 구현 시 이 메시지는 서버 응답에 따라 달라져야 합니다.
                setMessage('❌ 유효하지 않은 쿠폰 코드이거나 이미 사용된 코드입니다.'); 
            }
        } catch (error) {
            setMessage('처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
            console.error("Coupon application error:", error);
        } finally {
            setIsProcessing(false);
        }
    }, [couponCode, applyCoupon, onClose]);

    if (!isOpen) return null;
    
    // UI (Tailwind CSS 클래스 기반)
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full relative">
                
                {/* 닫기 버튼 */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
                >
                    &times;
                </button>

                {/* 제목 및 유도 문구 */}
                <div className="text-center mb-6 p-4 bg-purple-900 bg-opacity-30 rounded-lg">
                    <h2 className="text-2xl font-bold text-yellow-300 mb-2">
                        아직 망설이시나요?
                    </h2>
                    <p className="text-sm text-gray-200">
                        2주 무료 체험권으로 먼저 써보고 결정하세요!
                    </p>
                </div>

                {/* 쿠폰 입력 필드 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        쿠폰 코드를 입력하세요
                    </label>
                    <input
                        type="text"
                        placeholder="XXXX-XXXX-XXXX"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        disabled={isProcessing || isLoading}
                        className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                </div>
                
                {/* 메시지 피드백 */}
                {message && (
                    <p className={`text-center text-sm mb-4 ${message.startsWith('❌') ? 'text-red-400' : 'text-green-400'}`}>
                        {message}
                    </p>
                )}

                {/* 쿠폰 등록 버튼 */}
                <button 
                    onClick={handleApply} 
                    disabled={isProcessing || isLoading}
                    className="w-full py-3 rounded-lg font-semibold transition-colors 
                               bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                    {isProcessing ? '처리 중...' : '쿠폰 등록하고 시작하기'}
                </button>
            </div>
        </div>
    );
};

export default CouponModal;