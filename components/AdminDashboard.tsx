import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getCoupons, generateCoupons } from "../services/subscriptionService";
import type { Coupon, User } from "../types";

import { CopyIcon, UsersIcon, KeyIcon, BeakerIcon } from "./icons";

interface AdminDashboardProps {
  onTriggerAlert?: (type: "expired" | "warning") => void;
  onTriggerCancelTest?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onTriggerAlert,
  onTriggerCancelTest,
}) => {
  // ===========================================
  //  TAB STATE
  // ===========================================
  const [activeTab, setActiveTab] = useState<
    "coupons" | "members" | "system"
  >("coupons");

  // ===========================================
  //  COUPONS
  // ===========================================
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [duration, setDuration] = useState<0.5 | 1 | 3 | 6 | 12>(1);
  const [count, setCount] = useState(1);
  const [generatedCoupons, setGeneratedCoupons] = useState<Coupon[]>([]);

  const loadCoupons = useCallback(async () => {
    try {
      const result = await getCoupons();
      setCoupons(
        result.sort(
          (a, b) =>
            new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime()
        )
      );
    } catch (err) {
      console.error("Failed to load coupons:", err);
    }
  }, []);

  // ===========================================
  //  USER MANAGEMENT
  // ===========================================
  const { getAllUsers, deleteUser } = useAuth();
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

  const loadMembers = useCallback(async () => {
    try {
      const users = await getAllUsers();
      setRegisteredUsers(
        users.sort(
          (a, b) =>
            new Date(b.joinedAt).getTime() -
            new Date(a.joinedAt).getTime()
        )
      );
    } catch (err) {
      console.error("Failed to load members:", err);
    }
  }, [getAllUsers]);

  // ===========================================
  //  TAB SWITCH EFFECT
  // ===========================================
  useEffect(() => {
    if (activeTab === "coupons") loadCoupons();
    if (activeTab === "members") loadMembers();
  }, [activeTab, loadCoupons, loadMembers]);

  // ===========================================
  //  COUPON GENERATION
  // ===========================================
  const handleGenerate = () => {
    const batch = generateCoupons(duration, count);
    setGeneratedCoupons(batch);
    loadCoupons();
  };

  const formatDuration = (months: number) =>
    months === 0.5 ? "2주(체험)" : `${months}개월`;

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    console.log("Copied:", code);
  };

  // ===========================================
  //  MEMBER DELETE
  // ===========================================
  const handleForceDeleteMember = (email: string) => {
    if (email === "admin@test.com") {
      console.warn("ADMIN 계정은 삭제 불가");
      return;
    }
    deleteUser(email).then(loadMembers);
  };

  const formatPlan = (info?: User["subscription"]) => {
    if (!info) return "무료 회원";

    if (info.status === "expired") return "만료됨";

    switch (info.plan) {
      case "pro":
        return "PRO 멤버십";
      case "premium":
        return "PREMIUM 멤버십";
      default:
        return "FREE";
    }
  };

  // ===========================================
  //  COUPON TAB UI
  // ===========================================
  const renderCouponTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow min-h-0 animate-fade-in-up">
      {/* Generator Panel */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 flex flex-col border">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <i className="fas fa-magic text-blue-500"></i> 쿠폰 생성기
        </h3>

        <div className="space-y-6 overflow-y-auto pr-2 flex-grow">
          <div>
            <label className="text-sm font-semibold mb-2 block">이용권 기간</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDuration(0.5)}
                className={`py-2 px-4 rounded-lg border text-sm ${
                  duration === 0.5
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-slate-700"
                }`}
              >
                2주(체험)
              </button>
              {[1, 3, 6, 12].map((m) => (
                <button
                  key={m}
                  onClick={() => setDuration(m as any)}
                  className={`py-2 px-4 rounded-lg border text-sm ${
                    duration === m
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-slate-700"
                  }`}
                >
                  {m}개월
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">생성 개수</label>
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full px-4 py-2 bg-white dark:bg-slate-700 border rounded-lg"
            />
          </div>

          <button
            onClick={handleGenerate}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md"
          >
            코드 생성하기
          </button>

          {generatedCoupons.length > 0 && (
            <div className="pt-6 border-t">
              <h4 className="text-sm font-bold uppercase mb-3">생성된 쿠폰</h4>
              <div className="p-4 border rounded-lg max-h-40 overflow-y-auto space-y-2">
                {generatedCoupons.map((c) => (
                  <div className="flex justify-between" key={c.id}>
                    <code>{c.code}</code>
                    <button onClick={() => copyToClipboard(c.code)}>
                      <CopyIcon />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Coupon List */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 flex flex-col border">
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-bold">전체 쿠폰 ({coupons.length})</h3>
          <button onClick={loadCoupons} className="text-blue-600 text-sm">
            새로고침
          </button>
        </div>

        <div className="overflow-auto flex-grow h-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0">
              <tr>
                <th className="px-4 py-2">코드</th>
                <th className="px-4 py-2 text-center">할인율</th>
                <th className="px-4 py-2 text-center">만료일</th>
                <th className="px-4 py-2 text-center">사용자</th>
              </tr>
            </thead>

            <tbody>
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2 flex gap-2 items-center">
                    {c.code}
                    <button onClick={() => copyToClipboard(c.code)}>
                      <CopyIcon />
                    </button>
                  </td>
                  <td className="px-4 py-2 text-center">{c.discountPercent}%</td>
                  <td className="px-4 py-2 text-center">
                    {new Date(c.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {c.usedBy.length > 0 ? c.usedBy.join(", ") : "-"}
                  </td>
                </tr>
              ))}

              {coupons.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-400">
                    생성된 쿠폰이 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ===========================================
  //  MEMBERS TAB
  // ===========================================
  const renderMembersTab = () => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <UsersIcon className="w-6 h-6 text-blue-500" />
          회원 목록 ({registeredUsers.length})
        </h3>
        <button onClick={loadMembers} className="text-sm text-blue-600">
          새로고침
        </button>
      </div>

      <div className="overflow-auto custom-scrollbar">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0">
            <tr>
              <th className="px-6 py-3">회원명</th>
              <th className="px-6 py-3">이메일</th>
              <th className="px-6 py-3 text-center">가입일</th>
              <th className="px-6 py-3 text-center">구독 상태</th>
              <th className="px-6 py-3 text-center">관리</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {registeredUsers.map((u) => (
              <tr key={u.id}>
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                    {u.name.charAt(0)}
                  </div>
                  {u.name}
                  {u.isAdmin && (
                    <span className="text-xs bg-slate-200 px-2 py-0.5 rounded ml-2">
                      ADMIN
                    </span>
                  )}
                </td>

                <td className="px-6 py-4">{u.email}</td>

                <td className="px-6 py-4 text-center">
                  {new Date(u.joinedAt).toLocaleDateString()}
                </td>

                <td className="px-6 py-4 text-center">
                  {formatPlan(u.subscription)}
                </td>

                <td className="px-6 py-4 text-center">
                  {!u.isAdmin && (
                    <button
                      onClick={() => handleForceDeleteMember(u.email)}
                      className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded"
                    >
                      강제 탈퇴
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {registeredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-400">
                  등록된 회원이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ===========================================
  //  SYSTEM TEST TAB
  // ===========================================
  const renderSystemTab = () => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border flex flex-col">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <BeakerIcon className="w-6 h-6 text-purple-500" />
        시스템 알림 테스트
      </h3>

      <div className="flex gap-4">
        <button
          onClick={() => onTriggerAlert?.("expired")}
          className="px-6 py-4 bg-red-100 text-red-700 rounded-xl border"
        >
          만료 알림 테스트
        </button>

        <button
          onClick={() => onTriggerAlert?.("warning")}
          className="px-6 py-4 bg-yellow-100 text-yellow-700 rounded-xl border"
        >
          임박 알림 테스트
        </button>

        <button
          onClick={onTriggerCancelTest}
          className="px-6 py-4 bg-slate-100 rounded-xl border"
        >
          구독 취소 방어 테스트
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 h-full flex flex-col p-6 bg-gray-50 dark:bg-slate-900">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <KeyIcon className="w-7 h-7 text-blue-500" />
          관리자 대시보드
        </h2>

        <div className="flex space-x-4 border-b mt-6">
          <button
            onClick={() => setActiveTab("coupons")}
            className={`pb-3 px-2 font-semibold ${
              activeTab === "coupons"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500"
            }`}
          >
            쿠폰 관리
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`pb-3 px-2 font-semibold ${
              activeTab === "members"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500"
            }`}
          >
            회원 관리
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`pb-3 px-2 font-semibold ${
              activeTab === "system"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500"
            }`}
          >
            시스템 테스트
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="flex-grow">
        {activeTab === "coupons" && renderCouponTab()}
        {activeTab === "members" && renderMembersTab()}
        {activeTab === "system" && renderSystemTab()}
      </div>
    </div>
  );
};

export default AdminDashboard;
