import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, X, CalendarClock, Palmtree, Trash2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import BottomNav from "@/components/home/BottomNav";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MY_SCHEDULE, VACATION_DAYS, HOLIDAY_DAYS } from "@/lib/scheduleData";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type TabType = "my" | "all" | "requests";
type RequestStatus = "대기중" | "승인" | "거절";
type ScheduleRequestType = "일정 변경 요청" | "휴가 요청";

interface ScheduleRequest {
  id: string;
  requestStatus: RequestStatus;
  requestType: ScheduleRequestType;
  requestedAt: number;
  date: string;
  original?: { date: string; startTime?: string; endTime?: string };
  desired?: { date: string; startTime?: string; endTime?: string };
  reason: string;
}

const CURRENT_USER_NAME = "정수민";

// 각 유형 내에서 시간대가 다른 케이스를 지원하는 구조
interface StaffTimeSlot { time: string; names: string[]; }
interface StaffShiftGroup { label: "오픈" | "미들" | "마감"; slots: StaffTimeSlot[]; }

const ALL_STAFF_SCHEDULE: Record<string, StaffShiftGroup[]> = (() => {
  const DAILY_PATTERNS: StaffShiftGroup[][] = [
    [
      { label: "오픈", slots: [{ time: "08:00 - 12:00", names: ["문자영", "문자일"] }] },
      { label: "미들", slots: [{ time: "12:00 - 16:00", names: ["문자이", "문자삼"] }, { time: "13:00 - 17:00", names: ["문자민", "문자통"] }] },
      { label: "마감", slots: [{ time: "18:00 - 22:00", names: ["문자사", "문자오"] }] },
    ],
    [
      { label: "오픈", slots: [{ time: "08:00 - 13:00", names: ["문자영", "문자삼"] }] },
      { label: "미들", slots: [{ time: "13:00 - 18:00", names: ["문자이", "문자통"] }] },
      { label: "마감", slots: [{ time: "17:00 - 22:00", names: ["문자일", "문자민", "문자오"] }] },
    ],
    [
      { label: "오픈", slots: [{ time: "08:00 - 12:00", names: ["문자영"] }] },
      { label: "미들", slots: [{ time: "12:00 - 17:00", names: ["문자이", "문자삼", "문자민"] }] },
      { label: "마감", slots: [{ time: "18:00 - 22:00", names: ["문자일", "문자오"] }] },
    ],
  ];

  const result: Record<string, StaffShiftGroup[]> = {};
  const now = new Date();

  for (let mOffset = -1; mOffset <= 1; mOffset++) {
    const target = new Date(now.getFullYear(), now.getMonth() + mOffset, 1);
    const y = target.getFullYear();
    const m = target.getMonth() + 1;
    const daysInMonth = new Date(y, m, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${y}-${m}-${d}`;
      result[key] = DAILY_PATTERNS[d % 3].map(group => ({
        ...group,
        slots: group.slots.map(slot => ({ ...slot, names: [...slot.names] })),
      }));
    }
  }

  const SHIFT_LABEL_MAP: Record<string, "오픈" | "미들" | "마감"> = {
    open: "오픈", middle: "미들", close: "마감",
  };
  Object.entries(MY_SCHEDULE).forEach(([dateKey, schedule]) => {
    if (!result[dateKey]) return;
    const label = SHIFT_LABEL_MAP[schedule.type];
    const group = result[dateKey].find(g => g.label === label);
    const timeStr = `${schedule.start} - ${schedule.end}`;
    if (group) {
      const slot = group.slots.find(s => s.time === timeStr);
      if (slot) { if (!slot.names.includes(CURRENT_USER_NAME)) slot.names.push(CURRENT_USER_NAME); }
      else group.slots.push({ time: timeStr, names: [CURRENT_USER_NAME] });
    } else {
      result[dateKey].push({ label, slots: [{ time: timeStr, names: [CURRENT_USER_NAME] }] });
    }
  });

  return result;
})();

const ALL_STAFF_SUMMARY: Record<string, { open: number; middle: number; close: number }> = (() => {
  const result: Record<string, { open: number; middle: number; close: number }> = {};
  Object.entries(ALL_STAFF_SCHEDULE).forEach(([key, schedule]) => {
    const countNames = (label: string) =>
      schedule.find(g => g.label === label)?.slots.reduce((acc, s) => acc + s.names.length, 0) ?? 0;
    result[key] = { open: countNames("오픈"), middle: countNames("미들"), close: countNames("마감") };
  });
  return result;
})();

const DAYS_KR = ["일", "월", "화", "수", "목", "금", "토"];

const typeStyle = {
  open:     { bg: '#FDF9DF', text: '#FFB300' },
  middle:   { bg: '#ECFFF1', text: '#1EDC83' },
  close:    { bg: '#E8F9FF', text: '#14C1FA' },
  vacation: { bg: '#F7F7F8', text: '#AAB4BF' },
};

const shiftTagStyle = {
  open:   { bg: typeStyle.open.bg,   text: typeStyle.open.text },
  middle: { bg: typeStyle.middle.bg, text: typeStyle.middle.text },
  close:  { bg: typeStyle.close.bg,  text: typeStyle.close.text },
};

const REQUEST_STATUS_STYLE: Record<RequestStatus, { bg: string; color: string }> = {
  "대기중": { bg: '#FDF9DF', color: '#FFB300' },
  "승인":   { bg: '#ECFFF1', color: '#1EDC83' },
  "거절":   { bg: '#FFEAE6', color: '#FF3D3D' },
};
const REQUEST_TYPE_STYLE = { bg: '#E8F3FF', color: '#4261FF' };

const MOCK_SCHEDULE_REQUESTS: ScheduleRequest[] = [
  {
    id: "1", requestStatus: "대기중", requestType: "일정 변경 요청", requestedAt: 3,
    date: "2026년 4월 8일 (수)",
    original: { date: "2026년 4월 8일 (수)", startTime: "08:00", endTime: "14:00" },
    desired:  { date: "2026년 4월 9일 (목)", startTime: "13:00", endTime: "18:00" },
    reason: "개인 사정으로 변경 요청드립니다.",
  },
  {
    id: "2", requestStatus: "승인", requestType: "휴가 요청", requestedAt: 2,
    date: "2026년 4월 3일 (금)",
    desired: { date: "2026년 4월 3일 (금)" },
    reason: "병원 방문 예정입니다.",
  },
  {
    id: "3", requestStatus: "거절", requestType: "일정 변경 요청", requestedAt: 1,
    date: "2026년 3월 28일 (토)",
    original: { date: "2026년 3월 28일 (토)", startTime: "14:00", endTime: "18:00" },
    desired:  { date: "2026년 3월 29일 (일)", startTime: "08:00", endTime: "13:00" },
    reason: "가족 행사가 있어서 요청합니다.",
  },
];

const IconOpen = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="4" stroke="#FFB300" strokeWidth="2" />
    <line x1="12" y1="2" x2="12" y2="5" stroke="#FFB300" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="19" x2="12" y2="22" stroke="#FFB300" strokeWidth="2" strokeLinecap="round" />
    <line x1="2" y1="12" x2="5" y2="12" stroke="#FFB300" strokeWidth="2" strokeLinecap="round" />
    <line x1="19" y1="12" x2="22" y2="12" stroke="#FFB300" strokeWidth="2" strokeLinecap="round" />
    <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke="#FFB300" strokeWidth="2" strokeLinecap="round" />
    <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="#FFB300" strokeWidth="2" strokeLinecap="round" />
    <line x1="19.78" y1="4.22" x2="17.66" y2="6.34" stroke="#FFB300" strokeWidth="2" strokeLinecap="round" />
    <line x1="6.34" y1="17.66" x2="4.22" y2="19.78" stroke="#FFB300" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconMiddle = () => (
  <svg width="11" height="11" viewBox="0 0 22 14" fill="none" style={{ flexShrink: 0 }}>
    <path d="M1 13h20M11 1C6.03 1 2 5.03 2 10h18C20 5.03 15.97 1 11 1Z" stroke="#1EDC83" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="11" y1="1" x2="11" y2="0" stroke="#1EDC83" strokeWidth="2" strokeLinecap="round" />
    <line x1="3.5" y1="3.5" x2="2.5" y2="2.5" stroke="#1EDC83" strokeWidth="2" strokeLinecap="round" />
    <line x1="18.5" y1="3.5" x2="19.5" y2="2.5" stroke="#1EDC83" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconClose = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="#14C1FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDaysInMonth = new Date(year, month, 0).getDate();
  const days: { date: number; month: number; year: number; isOutside: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) days.push({ date: prevDaysInMonth - i, month: month - 1, year, isOutside: true });
  for (let i = 1; i <= daysInMonth; i++) days.push({ date: i, month, year, isOutside: false });
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) for (let i = 1; i <= remaining; i++) days.push({ date: i, month: month + 1, year, isOutside: true });
  return days;
}

function getDateKey(year: number, month: number, date: number) {
  return `${year}-${month + 1}-${date}`;
}

const badgeStyle = (bg: string, color: string) => ({
  display: 'inline-flex' as const, alignItems: 'center', justifyContent: 'center',
  height: '20px', borderRadius: '4px', padding: '0 8px',
  fontSize: '11px', fontWeight: 500, backgroundColor: bg, color,
});

const Schedule = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>("my");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [scheduleRequests, setScheduleRequests] = useState<ScheduleRequest[]>(() => {
    const newRequest = location.state?.newScheduleRequest;
    if (newRequest) return [newRequest, ...MOCK_SCHEDULE_REQUESTS];
    return MOCK_SCHEDULE_REQUESTS;
  });
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<"전체" | "일정 변경" | "휴가">("전체");

  const today = new Date();
  const isToday = (year: number, month: number, date: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === date;

  const calendarDays = getCalendarDays(currentYear, currentMonth);
  const weeks: typeof calendarDays[] = [];
  for (let i = 0; i < calendarDays.length; i += 7) weeks.push(calendarDays.slice(i, i + 7));

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentYear(currentYear - 1); setCurrentMonth(11); }
    else setCurrentMonth(currentMonth - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentYear(currentYear + 1); setCurrentMonth(0); }
    else setCurrentMonth(currentMonth + 1);
  };

  const handleDateClick = (year: number, month: number, date: number, isOutside: boolean) => {
    if (isOutside) return;
    setSelectedDate(getDateKey(year, month, date));
    setBottomSheetOpen(true);
  };

  const selectedSchedule = selectedDate ? MY_SCHEDULE[selectedDate] : null;
  const selectedVacation = selectedDate ? VACATION_DAYS.includes(selectedDate) : false;
  const selectedHoliday = selectedDate ? HOLIDAY_DAYS.includes(selectedDate) : false;
  const selectedStaff = selectedDate ? ALL_STAFF_SCHEDULE[selectedDate] : null;
  const selectedSummary = selectedDate ? ALL_STAFF_SUMMARY[selectedDate] : null;

  const formatSelectedDate = () => {
    if (!selectedDate) return "";
    const parts = selectedDate.split("-").map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return `${parts[0]}년 ${parts[1]}월 ${parts[2]}일 (${DAYS_KR[d.getDay()]})`;
  };

  const calcHours = (start: string, end: string) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return (eh * 60 + em - sh * 60 - sm) / 60;
  };

  const staffRows = (summary: { open: number; middle: number; close: number }) => [
    { icon: <IconOpen />, count: summary.open, bg: typeStyle.open.bg, text: typeStyle.open.text },
    { icon: <IconMiddle />, count: summary.middle, bg: typeStyle.middle.bg, text: typeStyle.middle.text },
    { icon: <IconClose />, count: summary.close, bg: typeStyle.close.bg, text: typeStyle.close.text },
  ];

  const sheetGroups = [
    { label: "오픈" as const, style: shiftTagStyle.open },
    { label: "미들" as const, style: shiftTagStyle.middle },
    { label: "마감" as const, style: shiftTagStyle.close },
  ];

  const filteredRequests = scheduleRequests
    .filter(r => {
      if (filterTab === "전체") return true;
      if (filterTab === "일정 변경") return r.requestType === "일정 변경 요청";
      if (filterTab === "휴가") return r.requestType === "휴가 요청";
      return true;
    })
    .sort((a, b) => {
      if (a.requestStatus === "대기중" && b.requestStatus !== "대기중") return -1;
      if (a.requestStatus !== "대기중" && b.requestStatus === "대기중") return 1;
      return b.requestedAt - a.requestedAt;
    });

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      setScheduleRequests(prev => prev.filter(r => r.id !== deleteTargetId));
      setDeleteTargetId(null);
    }
  };

  const TAB_LABELS: Record<TabType, string> = {
    my: "나의 일정",
    all: "전체 직원 일정",
    requests: "변경 요청 내역",
  };

  const showCalendar = activeTab === "my" || activeTab === "all";

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-white pb-20">
      {/* Header + Tabs */}
      <div className="sticky top-0 z-10" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="flex items-center gap-2 px-2 pt-4 pb-2">
          <button onClick={() => navigate("/")} className="p-1">
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B' }}>일정 확인</h1>
        </div>
        <div className="flex border-b border-border px-5 overflow-x-auto" style={{ gap: '24px' }}>
          {(["my", "all", "requests"] as TabType[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="py-3 relative whitespace-nowrap flex-shrink-0"
              style={{ fontSize: '16px', fontWeight: activeTab === tab ? 700 : 500, letterSpacing: '-0.02em', color: activeTab === tab ? '#4261FF' : '#AAB4BF' }}>
              {TAB_LABELS[tab]}
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[3px] rounded-full" style={{ backgroundColor: '#4261FF' }} />}
            </button>
          ))}
        </div>
      </div>

      {/* 캘린더 (나의 일정 / 전체 직원) */}
      {showCalendar && (
        <>
          <div className="flex items-center justify-between px-5 py-4">
            <button onClick={prevMonth} className="p-1"><ChevronLeft className="h-5 w-5 text-foreground" /></button>
            <button className="flex items-center gap-1">
              <span className="text-[17px] font-bold text-foreground">{currentYear}년 {currentMonth + 1}월</span>
              <ChevronDown className="h-4 w-4 text-foreground" />
            </button>
            <button onClick={nextMonth} className="p-1"><ChevronRight className="h-5 w-5 text-foreground" /></button>
          </div>

          <div className="grid grid-cols-7 px-3">
            {DAYS_KR.map((day, i) => (
              <div key={day} className="text-center pb-3" style={{ fontSize: '14px', fontWeight: 500, letterSpacing: '-0.02em', color: i === 0 ? '#FF5959' : i === 6 ? '#5DB1FF' : '#70737B' }}>
                {day}
              </div>
            ))}
          </div>

          <div className="px-3">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 mb-1">
                {week.map((d, di) => {
                  const key = getDateKey(d.year, d.month, d.date);
                  const schedule = !d.isOutside ? MY_SCHEDULE[key] : null;
                  const isVacation = !d.isOutside && VACATION_DAYS.includes(key);
                  const isHoliday = !d.isOutside && HOLIDAY_DAYS.includes(key);
                  const isTodayDate = !d.isOutside && isToday(d.year, d.month, d.date);
                  const isSun = di === 0;
                  const isSat = di === 6;
                  const staffSummary = !d.isOutside ? ALL_STAFF_SUMMARY[key] : null;
                  const dateColor = d.isOutside ? '#AAB4BF' : isTodayDate ? '#FFFFFF' : isSun ? '#FF5959' : isSat ? '#5DB1FF' : '#70737B';

                  return (
                    <button key={di} onClick={() => handleDateClick(d.year, d.month, d.date, d.isOutside)}
                      className="flex flex-col items-center py-1.5 w-full" style={{ minHeight: '90px' }} disabled={d.isOutside}>
                      <div style={{ height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500, letterSpacing: '-0.02em', color: dateColor, ...(isTodayDate ? { backgroundColor: '#4261FF', borderRadius: '10px', minWidth: '40px', width: '40px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}) }}>
                          {d.date}
                        </span>
                      </div>
                      {activeTab === "my" && !d.isOutside && (
                        <div className="flex flex-col items-center w-full px-0.5">
                          {schedule && (
                            <div className="flex flex-col items-center justify-center w-full" style={{ backgroundColor: typeStyle[schedule.type].bg, borderRadius: '4px', minHeight: '36px', padding: '2px 0' }}>
                              <span style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '-0.02em', color: typeStyle[schedule.type].text, lineHeight: '1.3' }}>{schedule.start}</span>
                              <span style={{ fontSize: '10px', color: typeStyle[schedule.type].text, lineHeight: '1' }}>-</span>
                              <span style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '-0.02em', color: typeStyle[schedule.type].text, lineHeight: '1.3' }}>{schedule.end}</span>
                            </div>
                          )}
                          {isVacation && (
                            <div className="flex items-center justify-center w-full" style={{ backgroundColor: typeStyle.vacation.bg, borderRadius: '4px', minHeight: '17px', height: '17px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '-0.02em', color: typeStyle.vacation.text }}>휴가</span>
                            </div>
                          )}
                          {isHoliday && (
                            <div className="flex items-center justify-center w-full" style={{ backgroundColor: '#FFE8E8', borderRadius: '4px', minHeight: '17px', height: '17px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '-0.02em', color: '#FF5959' }}>휴무</span>
                            </div>
                          )}
                        </div>
                      )}
                      {activeTab === "all" && !d.isOutside && staffSummary && (
                        <div className="flex flex-col w-full px-0.5" style={{ gap: '2px' }}>
                          {staffRows(staffSummary).map(({ icon, count, bg, text }, idx) => (
                            <div key={idx} style={{ backgroundColor: bg, borderRadius: '4px', padding: '0 4px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                              <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: text, lineHeight: 1 }}>{count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}

      {/* 변경 요청 내역 탭 */}
      {activeTab === "requests" && (
        <div className="pb-8" style={{ backgroundColor: '#F7F7F8', minHeight: '100vh' }}>
          <div className="flex px-5 py-3 overflow-x-auto" style={{ gap: '8px' }}>
            {(["전체", "일정 변경", "휴가"] as const).map((f) => {
              const isActive = filterTab === f;
              const label = f === "전체" ? `전체 ${scheduleRequests.length}` : f;
              return (
                <button key={f} onClick={() => setFilterTab(f)}
                  style={{ height: '28px', borderRadius: '9999px', padding: '0 14px', whiteSpace: 'nowrap', flexShrink: 0, fontSize: '14px', fontWeight: 600, letterSpacing: '-0.02em', backgroundColor: isActive ? '#E8F3FF' : '#FFFFFF', color: isActive ? '#4261FF' : '#AAB4BF', border: `1px solid ${isActive ? '#4261FF' : '#DBDCDF'}` }}>
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-4 px-5">
            {filteredRequests.map((req) => {
              const statusStyle = REQUEST_STATUS_STYLE[req.requestStatus];
              const canDelete = req.requestStatus === "승인" || req.requestStatus === "거절";
              const isVacation = req.requestType === "휴가 요청";
              return (
                <div key={req.id} className="rounded-2xl bg-white p-5" style={{ boxShadow: '2px 2px 12px rgba(0,0,0,0.06)' }}>
                  {/* 카드 헤더 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span style={badgeStyle(statusStyle.bg, statusStyle.color)}>{req.requestStatus}</span>
                      <span style={badgeStyle(REQUEST_TYPE_STYLE.bg, REQUEST_TYPE_STYLE.color)}>{req.requestType}</span>
                    </div>
                    {canDelete && (
                      <button onClick={() => setDeleteTargetId(req.id)} className="p-1">
                        <Trash2 className="h-[18px] w-[18px]" style={{ color: '#AAB4BF' }} />
                      </button>
                    )}
                  </div>

                  {/* 기존 일정 */}
                  {!isVacation && req.original && (
                    <>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: '#AAB4BF', letterSpacing: '-0.02em', marginBottom: '6px' }}>기존 일정</p>
                      <div className="rounded-xl px-4 py-3 mb-3" style={{ backgroundColor: '#F7F7F8' }}>
                        <p style={{ fontSize: '13px', color: '#70737B', letterSpacing: '-0.02em' }}>
                          {req.original.date}{req.original.startTime && ` | ${req.original.startTime} - ${req.original.endTime}`}
                        </p>
                      </div>
                    </>
                  )}

                  {/* 변경/희망 일정 */}
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#AAB4BF', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                    {isVacation ? "휴가 요청 일정" : "변경 일정"}
                  </p>
                  <div className="rounded-xl px-4 py-3 mb-3" style={{ backgroundColor: '#F0F7FF' }}>
                    <p style={{ fontSize: '13px', color: '#4261FF', letterSpacing: '-0.02em' }}>
                      {req.desired?.date}{req.desired?.startTime && ` | ${req.desired.startTime} - ${req.desired.endTime}`}
                    </p>
                  </div>

                  {/* 요청 사유 */}
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#AAB4BF', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                    {isVacation ? "휴가 요청 사유" : "변경 요청 사유"}
                  </p>
                  <p style={{ fontSize: '13px', fontWeight: 400, color: '#70737B', letterSpacing: '-0.02em' }}>{req.reason}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Sheet */}
      <Sheet open={bottomSheetOpen} onOpenChange={setBottomSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-6 pb-8 pt-6 border-0 bg-white [&>button]:hidden">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-[22px] font-bold text-foreground">{formatSelectedDate()}</h2>
            <button onClick={() => setBottomSheetOpen(false)} className="mt-1">
              <X className="h-6 w-6 text-foreground" />
            </button>
          </div>

          {activeTab === "my" ? (
            <div>
              <div className="flex items-center gap-3">
                {selectedSchedule ? (
                  <>
                    <span className="rounded-full px-3 py-1 text-[13px] font-medium whitespace-nowrap" style={{ backgroundColor: shiftTagStyle[selectedSchedule.type].bg, color: shiftTagStyle[selectedSchedule.type].text }}>
                      {selectedSchedule.type === 'open' ? '오픈' : selectedSchedule.type === 'middle' ? '미들' : '마감'}
                    </span>
                    <span className="text-[15px] text-foreground">
                      {selectedSchedule.start} - {selectedSchedule.end} (총 {calcHours(selectedSchedule.start, selectedSchedule.end)}시간)
                    </span>
                  </>
                ) : selectedVacation ? (
                  <span className="rounded-full px-3 py-1 text-[13px] font-medium" style={{ backgroundColor: '#F7F7F8', color: '#AAB4BF' }}>휴가</span>
                ) : selectedHoliday ? (
                  <span className="rounded-full px-3 py-1 text-[13px] font-medium" style={{ backgroundColor: '#FFE8E8', color: '#FF5959' }}>휴무</span>
                ) : (
                  <>
                    <span className="rounded-full px-3 py-1 text-[13px] font-medium" style={{ backgroundColor: typeStyle.open.bg, color: typeStyle.open.text }}>근무 일정</span>
                    <span className="text-[15px] text-muted-foreground">없음</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {selectedStaff && selectedSummary && sheetGroups.map(({ label, style }) => {
                const group = selectedStaff.find(g => g.label === label);
                if (!group) return null;
                const totalCount = group.slots.reduce((acc, s) => acc + s.names.length, 0);
                return (
                  <div key={label}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="rounded-full px-3 py-1 text-[13px] font-medium" style={{ backgroundColor: style.bg, color: style.text }}>{label}</span>
                      <span className="text-[13px] text-muted-foreground">{totalCount}명</span>
                    </div>
                    <div className="space-y-1 pl-2">
                      {group.slots.map((slot, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="text-[14px] text-muted-foreground whitespace-nowrap">{slot.time}</span>
                          <span className="text-[14px] font-medium text-foreground">{slot.names.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div>
            <button onClick={() => setBottomSheetOpen(false)} className="mt-8 w-full rounded-2xl py-4 text-[16px] font-semibold text-white" style={{ backgroundColor: '#4261FF' }}>확인</button>
          </div>
        </SheetContent>
      </Sheet>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog open={!!deleteTargetId} onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }} title="변경 요청 내역 삭제"
        description={<>변경 요청 내역을 삭제 하시겠어요?<br />삭제 시 복구가 불가해요</>}
        buttons={[{ label: "취소", onClick: () => setDeleteTargetId(null), variant: "cancel" }, { label: "삭제하기", onClick: handleDeleteConfirm }]} />

      {/* FAB */}
      {fabOpen && <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setFabOpen(false)} />}
      <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">
        {fabOpen && (
          <>
            <div className="flex items-center gap-3">
              <span className="text-[14px] font-medium text-foreground rounded-lg px-3 py-1.5" style={{ backgroundColor: '#FFFFFF' }}>일정 변경 요청</span>
              <button onClick={() => { setFabOpen(false); navigate("/schedule/change-request"); }} className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
                <CalendarClock className="h-5 w-5 text-foreground" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[14px] font-medium text-foreground rounded-lg px-3 py-1.5" style={{ backgroundColor: '#FFFFFF' }}>휴가 요청</span>
              <button onClick={() => { setFabOpen(false); navigate("/schedule/vacation-request"); }} className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
                <Palmtree className="h-5 w-5 text-foreground" />
              </button>
            </div>
          </>
        )}
        <button onClick={() => setFabOpen(!fabOpen)} className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center" style={{ backgroundColor: '#4261FF' }}>
          <X className={`h-6 w-6 text-white transition-transform ${fabOpen ? "rotate-0" : "rotate-45"}`} />
        </button>
      </div>

      <BottomNav activeTab="home" onTabChange={() => { }} />
    </div>
  );
};

export default Schedule;
