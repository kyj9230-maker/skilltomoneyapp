"use client";

import { useState } from "react";
import { courses as initialCourses } from "@/data/courses";

interface Course {
  id: number | string;
  name: string;
  price: number;
  seat: number;
  booked: number;
  date: string;
  tags: string[];
}

const COURSE_ICONS: Record<string, string> = {
  "AI 자동화": "⚡",
  "숏폼 편집": "🎬",
  "엑셀 실무": "📊",
  "스마트스토어": "🛍️",
};

export default function Home() {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userCount, setUserCount] = useState<number | string>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const displayedCourses = onlyAvailable
    ? courses.filter((course) => course.seat - course.booked > 0)
    : courses;

  const handleOpenReservation = (course: Course) => {
    setSelectedCourse(course);
    setUserName("");
    setUserPhone("");
    setUserCount(1);
    setIsSubmitting(false);
    setIsSuccess(false);
    setErrorMessage("");
  };

  const handleCloseModal = () => {
    setSelectedCourse(null);
    setIsSubmitting(false);
    setIsSuccess(false);
    setErrorMessage("");
  };

  const handleReserveSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedCourse) return;

    setErrorMessage("");

    // 1. 이름이 비어 있는지 검사
    if (!userName.trim()) {
      const msg = "이름을 입력해 주세요.";
      setErrorMessage(msg);
      alert(msg);
      return;
    }

    // 2. 인원이 남은 자리보다 많은지 검사
    const remainingSeats = selectedCourse.seat - selectedCourse.booked;
    const people = Number(userCount);

    if (!userCount || isNaN(people) || people < 1) {
      const msg = "신청 인원을 1명 이상 입력해 주세요.";
      setErrorMessage(msg);
      alert(msg);
      return;
    }

    if (people > remainingSeats) {
      const msg = `신청 인원이 남은 자리(${remainingSeats}석)보다 많습니다.`;
      setErrorMessage(msg);
      alert(msg);
      return;
    }

    // 3. 연락처 검사
    if (!userPhone.trim()) {
      const msg = "연락처를 입력해 주세요.";
      setErrorMessage(msg);
      alert(msg);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        courseId: selectedCourse.id,
        course: selectedCourse.name,
        date: selectedCourse.date,
        name: userName.trim(),
        phone: userPhone.trim(),
        people,
      };

      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.result === "ok" || res.ok) {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === selectedCourse.id
              ? { ...c, booked: Math.min(c.seat, c.booked + people) }
              : c
          )
        );
        setIsSuccess(true);
      } else {
        const errorMsg = result.message || "예약 중 오류가 발생했습니다. 다시 시도해 주세요.";
        setErrorMessage(errorMsg);
        alert(errorMsg);
      }
    } catch (err) {
      console.error("Reservation submit error:", err);
      const errorMsg = "예약 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
      setErrorMessage(errorMsg);
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080E26] text-white flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      {/* 배경 은은한 남색 & 금색 글로우 효과 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 -right-24 w-[36rem] h-[36rem] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-32 left-1/3 w-[30rem] h-[30rem] bg-amber-400/10 rounded-full blur-[120px]" />
      </div>

      {/* 상단 네비게이션 헤더 */}
      <header className="relative z-10 w-full border-b border-white/10 backdrop-blur-md bg-[#080E26]/80">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-sm shadow-amber-400" />
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
              스킬투머니
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs sm:text-sm font-semibold px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
              실전 원데이 클래스
            </span>
          </div>
        </div>
      </header>

      {/* 메인 섹션 */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-5 py-12 sm:py-20 max-w-6xl mx-auto w-full">
        {/* 상단 뱃지 & 헤딩 */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-medium mb-5 backdrop-blur-sm shadow-sm">
            <span>✨</span>
            <span>배운 기술이 바로 수익이 되는 실전 강좌</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.2] text-white mb-4">
            「스킬투머니」{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
              강좌 목록
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto">
            단 하루 만에 실무 역량을 갖추고 부수입으로 연결하는
            <br className="hidden sm:inline" /> 맞춤형 원데이 클래스를 지금 바로 예약해 보세요.
          </p>
        </div>

        {/* 강좌 목록 상단 필터 바: 예약 가능한 강좌만 보기 */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 px-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
            <span>
              총 <span className="font-bold text-amber-300">{displayedCourses.length}</span>개 강좌
            </span>
            {onlyAvailable && (
              <span className="text-[11px] font-semibold text-amber-300 px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30">
                예약 가능 강좌만 필터링됨
              </span>
            )}
          </div>
          <label
            htmlFor="available-only-filter"
            className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all cursor-pointer select-none text-xs sm:text-sm ${
              onlyAvailable
                ? "bg-amber-400/15 border border-amber-400/40 text-amber-300 shadow-sm shadow-amber-400/20"
                : "bg-white/[0.04] border border-white/10 hover:border-amber-400/30 text-slate-300"
            }`}
          >
            <input
              id="available-only-filter"
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="w-4 h-4 rounded text-amber-400 bg-black/40 border-white/20 focus:ring-amber-400 accent-amber-400 cursor-pointer"
            />
            <span className="font-semibold">예약 가능한 강좌만 보기</span>
          </label>
        </div>

        {/* 강좌 카드 그리드 (반응형: 모바일 1열, 태블릿 2열, PC 4열) */}
        {displayedCourses.length === 0 ? (
          <div className="w-full py-16 text-center rounded-2xl bg-white/[0.03] border border-white/10 mb-16">
            <span className="text-3xl block mb-2">🔍</span>
            <p className="text-base font-semibold text-slate-300 mb-1">
              현재 예약 가능한 강좌가 없습니다.
            </p>
            <p className="text-xs text-slate-500">
              [예약 가능한 강좌만 보기] 체크를 해제하시면 전체 강좌 목록을 확인하실 수 있습니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full mb-16">
            {displayedCourses.map((course) => {
            const remainingSeats = course.seat - course.booked;
            const isSoldOut = remainingSeats === 0;
            const isAlmostSoldOut = remainingSeats >= 1 && remainingSeats <= 2;
            const icon = COURSE_ICONS[course.name] || "💡";

            return (
              <div
                key={course.id}
                className={`relative flex flex-col justify-between rounded-2xl p-5 sm:p-6 backdrop-blur-md transition-all duration-300 ${
                  isSoldOut
                    ? "bg-[#070c20]/90 border border-white/10 opacity-90"
                    : isAlmostSoldOut
                    ? "bg-[#0c1538]/90 border-2 border-red-500/50 shadow-xl shadow-red-500/10 hover:border-red-400 hover:shadow-red-500/20 hover:-translate-y-1"
                    : "bg-[#09102b]/80 border border-white/10 hover:border-amber-400/40 hover:bg-[#0c1538]/80 hover:-translate-y-1"
                }`}
              >
                {/* 상단 뱃지 및 아이콘 */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl sm:text-3xl p-2 rounded-xl bg-white/[0.04] border border-white/10">
                      {icon}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isSoldOut ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-600">
                          마감
                        </span>
                      ) : isAlmostSoldOut ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                          마감 임박
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                          모집중
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 강좌 이름 */}
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
                    {course.name}
                  </h2>

                  {/* 강좌 이름 바로 아래 작은 배지 목록 */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
                    {course.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] sm:text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/25 shadow-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 강의 일정 */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-5 bg-white/[0.04] border border-white/10 px-2.5 py-1.5 rounded-lg">
                    <span>🗓️</span>
                    <span>개강: {course.date}</span>
                  </div>
                </div>

                {/* 수강료 & 좌석 현황 & 예약하기 버튼 */}
                <div>
                  {/* 수강료 */}
                  <div className="mb-3.5 flex items-baseline justify-between">
                    <span className="text-xs text-slate-400 font-medium">수강료</span>
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-black tracking-tight text-amber-300">
                        {course.price.toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  {/* 남은 좌석 / 정원 현황 (정원 - 예약 계산) */}
                  <div className="mb-4 py-2.5 px-3 rounded-xl bg-white/[0.04] border border-white/10">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400">좌석 현황</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-semibold ${
                            isSoldOut
                              ? "text-slate-400"
                              : isAlmostSoldOut
                              ? "text-red-400 font-bold"
                              : "text-amber-300"
                          }`}
                        >
                          남은 좌석 {remainingSeats}석 / 정원 {course.seat}명
                        </span>
                        {isSoldOut && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-600">
                            마감
                          </span>
                        )}
                        {isAlmostSoldOut && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-500 border border-red-500/40">
                            마감 임박
                          </span>
                        )}
                      </div>
                    </div>
                    {/* 정원 대비 예약률 게이지 */}
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isSoldOut
                            ? "bg-slate-600"
                            : isAlmostSoldOut
                            ? "bg-red-500"
                            : "bg-gradient-to-r from-amber-400 to-yellow-500"
                        }`}
                        style={{
                          width: `${Math.min(100, Math.round((course.booked / course.seat) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* 예약하기 / 예약 마감 버튼 */}
                  <button
                    id={`reserve-btn-${course.id}`}
                    onClick={() => !isSoldOut && handleOpenReservation(course)}
                    disabled={isSoldOut}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all duration-200 ${
                      isSoldOut
                        ? "bg-slate-800/80 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60 select-none"
                        : isAlmostSoldOut
                        ? "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 hover:from-amber-300 hover:to-yellow-400 shadow-lg shadow-amber-500/25 active:scale-95 cursor-pointer"
                        : "bg-gradient-to-r from-amber-500/90 to-yellow-600 text-slate-950 hover:from-amber-400 hover:to-yellow-500 shadow-md shadow-amber-500/15 active:scale-95 cursor-pointer"
                    }`}
                  >
                    <span>{isSoldOut ? "예약 마감" : "예약하기"}</span>
                    {!isSoldOut && <span className="text-xs">→</span>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

        {/* 혜택 안내 가이드 */}
        <div className="w-full rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-400/20 p-6 sm:p-8 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <span className="text-amber-400">👑</span>
              스킬투머니 수강생 전원 특별 혜택
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              실무 템플릿 무제한 제공 + 강사 1:1 질의응답 피드백 + 수익화 전자책 무료 증정
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-semibold text-amber-300 px-3.5 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/30">
              선착순 30명 마감 임박
            </span>
          </div>
        </div>
      </main>

      {/* 예약 신청 모달 */}
      {selectedCourse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div className="relative w-full max-w-md bg-[#0c1538] border-2 border-amber-400/40 rounded-2xl p-6 sm:p-7 text-white shadow-2xl shadow-amber-500/20">
            {/* 상단 헤더 & 닫기(X) 버튼 */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  강좌 예약 신청
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors cursor-pointer text-sm"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            {!isSuccess ? (
              /* 입력 폼 */
              <form onSubmit={handleReserveSubmit} className="space-y-4">
                {/* 강좌 이름 (자동 채움) */}
                <div>
                  <label
                    htmlFor="reservation-course-name"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    강좌 이름
                  </label>
                  <input
                    id="reservation-course-name"
                    type="text"
                    value={selectedCourse.name}
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-amber-300 font-bold text-sm cursor-not-allowed select-none focus:outline-none"
                  />
                </div>

                {/* 날짜 (자동 채움) */}
                <div>
                  <label
                    htmlFor="reservation-course-date"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    날짜
                  </label>
                  <input
                    id="reservation-course-date"
                    type="text"
                    value={selectedCourse.date}
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-slate-200 font-medium text-sm cursor-not-allowed select-none focus:outline-none"
                  />
                </div>

                {/* 이름 */}
                <div>
                  <label
                    htmlFor="reservation-user-name"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    이름 <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="reservation-user-name"
                    type="text"
                    placeholder="이름을 입력하세요"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 focus:border-amber-400 focus:outline-none text-white text-sm transition-colors placeholder:text-slate-500"
                  />
                </div>

                {/* 연락처 */}
                <div>
                  <label
                    htmlFor="reservation-user-phone"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    연락처 <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="reservation-user-phone"
                    type="tel"
                    placeholder="010-1234-5678"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 focus:border-amber-400 focus:outline-none text-white text-sm transition-colors placeholder:text-slate-500"
                  />
                </div>

                {/* 인원(숫자) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="reservation-user-count"
                      className="block text-xs font-semibold text-slate-300"
                    >
                      인원(숫자) <span className="text-amber-400">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      결제 예정:{" "}
                      <span className="text-amber-300 font-bold">
                        {(
                          selectedCourse.price *
                          Math.max(1, Number(userCount) || 1)
                        ).toLocaleString()}
                        원
                      </span>
                    </span>
                  </div>
                  <input
                    id="reservation-user-count"
                    type="number"
                    min={1}
                    placeholder="인원 수를 입력하세요"
                    value={userCount}
                    onChange={(e) => setUserCount(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 focus:border-amber-400 focus:outline-none text-white text-sm transition-colors placeholder:text-slate-500"
                  />
                </div>

                {/* 유효성 검사 에러 안내 문구 */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/35 text-red-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                    <span>⚠️</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* 하단 버튼: [신청], [닫기] */}
                <div className="pt-3 grid grid-cols-2 gap-3">
                  <button
                    type="submit"
                    id="reservation-submit-btn"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 transition-all active:scale-95 shadow-md shadow-amber-500/20 cursor-pointer text-sm sm:text-base text-center disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>저장 중...</span>
                      </>
                    ) : (
                      <span>신청</span>
                    )}
                  </button>
                  <button
                    type="button"
                    id="reservation-close-btn"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl font-bold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/15 transition-all active:scale-95 cursor-pointer text-sm sm:text-base text-center disabled:opacity-50"
                  >
                    닫기
                  </button>
                </div>
              </form>
            ) : (
              /* 예약 완료 화면 */
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
                  ✓
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">
                  예약 신청이 완료되었습니다
                </h4>
                <p className="text-sm text-slate-300 mb-4">
                  <span className="font-semibold text-amber-300">{userName}</span>님의{" "}
                  <span className="font-semibold text-white">[{selectedCourse.name}]</span> 예약이 구글 시트에 정상 접수되었습니다.
                </p>
                <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300 space-y-2 mb-6 text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-400">강의 일정</span>
                    <span className="font-medium text-white">{selectedCourse.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">신청 인원</span>
                    <span className="font-medium text-white">{userCount}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">총 결제 금액</span>
                    <span className="text-amber-300 font-bold">
                      {(selectedCourse.price * Math.max(1, Number(userCount) || 1)).toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">연락처</span>
                    <span className="font-medium text-white">{userPhone}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 transition-all cursor-pointer text-sm shadow-md shadow-amber-500/20"
                >
                  확인 및 닫기
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 하단 푸터 */}
      <footer className="relative z-10 w-full border-t border-white/10 bg-[#080E26]/90 py-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 스킬투머니. All rights reserved.</p>
          <p className="text-slate-400">
            배운 기술이 돈이 되는 실전 원데이 클래스
          </p>
        </div>
      </footer>
    </div>
  );
}
