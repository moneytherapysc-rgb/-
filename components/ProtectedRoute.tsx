// 🚀 ProtectedRoute.tsx — 최종 정상 버전
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: JSX.Element;
  requireAdmin?: boolean;
  requireSubscription?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireSubscription = false,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isSubscribed, isAdmin, isLoading } = useAuth();

  // 로딩 중 → 화면 잠시 비움
  if (isLoading) return <div>Loading...</div>;

  // 로그인 안했으면
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 관리자 전용 페이지인데 관리자가 아니면
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/not-allowed" replace />;
  }

  // 구독 필요한 페이지인데 구독 상태가 아니라면
  if (requireSubscription && !isSubscribed) {
    return <Navigate to="/pricing" replace />;
  }

  // 통과
  return children;
}
