import React from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
const { isSubscribed, isCouponUsed } = useAuth();

interface LockCardProps {
  children: React.ReactNode;
  requireSubscription?: boolean; // true = 구독 필요 기능
  requireCoupon?: boolean; // true = 쿠폰 사용 필요 기능
}

const LockCard: React.FC<LockCardProps> = ({
  children,
  requireSubscription = false,
  requireCoupon = false,
}) => {
  const router = useRouter();
  const { user, isSubscribed, isCouponUsed, isAdmin } = useAuth();

  const isLocked = () => {
    if (!user) return true; // 비로그인 → 잠금
    if (isAdmin) return false; // 관리자 → 모두 가능
    if (requireSubscription && !isSubscribed) return true;
    if (requireCoupon && !isCouponUsed) return true;
    return false;
  };

  const handleClick = () => {
    if (isLocked()) {
      router.push("/paywall"); // Paywall 페이지 이동
      return;
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: "relative",
        cursor: isLocked() ? "not-allowed" : "pointer",
      }}
    >
      {children}

      {/* 잠금 오버레이 */}
      {isLocked() && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "10px",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "1.1rem",
          }}
        >
          🔒 LOCKED
        </div>
      )}
    </div>
  );
};

export default LockCard;
