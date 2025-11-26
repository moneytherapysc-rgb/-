import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const PaywallScreen: React.FC = () => {
  const { applyCoupon, isSubscribed, isLoading } = useAuth();
  const [coupon, setCoupon] = useState('');
  const [message, setMessage] = useState('');

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return;

    const ok = await applyCoupon(coupon.trim());
    if (ok) {
      setMessage('쿠폰이 적용되었습니다! 다시 시도하세요.');
    } else {
      setMessage('쿠폰이 올바르지 않습니다.');
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 p-6">
      <div className="bg-white dark:bg-slate-800 p-10 rounded-2xl shadow-lg max-w-md w-full text-center border border-slate-200 dark:border-slate-700">
        
        <h2 className="text-3xl font-bold mb-4 text-slate-800 dark:text-white">
          🔒 프리미엄 기능 잠김
        </h2>

        <p className="text-slate-500 dark:text-slate-300 mb-8">
          이 기능은 구독 또는 쿠폰 사용 후 이용할 수 있습니다.
        </p>

        {/* 쿠폰 입력 */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            className="flex-1 px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white"
            placeholder="쿠폰 코드를 입력하세요"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
          />
          <button
            onClick={handleApplyCoupon}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            적용
          </button>
        </div>

        {message && (
          <p className="text-sm text-green-600 dark:text-green-400 mb-6">{message}</p>
        )}

        {/* 결제 버튼 */}
        <button
          onClick={() => alert('결제 기능 연결 예정')}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg mb-4"
        >
          구독하기
        </button>

        <button
          onClick={() => window.history.back()}
          className="w-full py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg"
        >
          돌아가기
        </button>
      </div>
    </div>
  );
};

export default PaywallScreen;
