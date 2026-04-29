import { useState } from "react";
import { createPortal } from "react-dom";

type RequestType = "휴가 요청" | "일정 변경 요청";
type FilterType = "전체" | "휴가 요청" | "일정 변경 요청";
type ShiftType = "오픈" | "미들" | "마감";

interface ScheduleEntry {
  shift: ShiftType;
  date: string;
  dayLabel: string;
  time: string;
}

interface VacationRequest {
  type: "휴가 요청";
  id: string;
  staffName: string;
  staffGender: string;
  staffAge: number;
  staffEmploymentType: string;
  staffAvatarColor: string;
  dateRange: string;
  totalDays: number;
  entries: ScheduleEntry[];
  reason: string;
}

interface ChangeRequest {
  type: "일정 변경 요청";
  id: string;
  staffName: string;
  staffGender: string;
  staffAge: number;
  staffEmploymentType: string;
  staffAvatarColor: string;
  originalEntries: ScheduleEntry[];
  newEntries: ScheduleEntry[];
}

type ScheduleRequest = VacationRequest | ChangeRequest;

const SHIFT_ICON: Record<ShiftType, string> = {
  "오픈": "☀️",
  "미들": "🌤",
  "마감": "🌙",
};

const SHIFT_BADGE_STYLES: Record<ShiftType, string> = {
  "오픈": "text-shift-open",
  "미들": "text-shift-middle",
  "마감": "text-shift-close",
};

const MOCK_REQUESTS: ScheduleRequest[] = [
  {
    type: "휴가 요청",
    id: "vr1",
    staffName: "문자영",
    staffGender: "여",
    staffAge: 22,
    staffEmploymentType: "알바생",
    staffAvatarColor: "#C0392B",
    dateRange: "2026년 11월 15~18일",
    totalDays: 4,
    entries: [
      { shift: "오픈", date: "26.11.15", dayLabel: "일", time: "8:00 - 13:00" },
      { shift: "오픈", date: "26.11.16", dayLabel: "월", time: "8:00 - 13:00" },
      { shift: "미들", date: "26.11.29", dayLabel: "화", time: "8:00 - 13:00" },
      { shift: "마감", date: "26.11.29", dayLabel: "수", time: "17:00 - 22:00" },
    ],
    reason: "호주로 가족여행 가용..\n수민언니랑 일정 바꿨어용 승인해주세용",
  },
  {
    type: "일정 변경 요청",
    id: "cr1",
    staffName: "문자영",
    staffGender: "여",
    staffAge: 22,
    staffEmploymentType: "알바생",
    staffAvatarColor: "#C0392B",
    originalEntries: [
      { shift: "오픈", date: "26.11.15", dayLabel: "일", time: "8:00 - 13:00" },
    ],
    newEntries: [
      { shift: "오픈", date: "26.11.12", dayLabel: "목", time: "8:00 - 13:00" },
    ],
  },
];

function ShiftEntryRow({ entry }: { entry: ScheduleEntry }) {
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <span className={`font-medium ${SHIFT_BADGE_STYLES[entry.shift]}`}>
        {SHIFT_ICON[entry.shift]} {entry.shift}
      </span>
      <span className="text-foreground">
        {entry.date} ({entry.dayLabel})
      </span>
      <span className="text-muted-foreground">|</span>
      <span className="text-foreground">{entry.time}</span>
    </div>
  );
}

export default function ScheduleChangeRequestTab() {
  const [requests, setRequests] = useState<ScheduleRequest[]>(MOCK_REQUESTS);
  const [activeFilter, setActiveFilter] = useState<FilterType>("전체");
  const [confirmPopup, setConfirmPopup] = useState<{
    open: boolean;
    type: "approve" | "reject";
    requestId: string;
  }>({ open: false, type: "approve", requestId: "" });

  const filteredRequests = activeFilter === "전체"
    ? requests
    : requests.filter((r) => r.type === activeFilter);

  const filterCounts = {
    "전체": requests.length,
    "휴가 요청": requests.filter((r) => r.type === "휴가 요청").length,
    "일정 변경 요청": requests.filter((r) => r.type === "일정 변경 요청").length,
  };

  const handleConfirm = () => {
    setRequests((prev) => prev.filter((r) => r.id !== confirmPopup.requestId));
    setConfirmPopup({ open: false, type: "approve", requestId: "" });
  };

  const targetRequest = requests.find((r) => r.id === confirmPopup.requestId);
  const popupTypeLabel = targetRequest?.type === "휴가 요청" ? "휴가 요청" : "일정 변경 요청";

  if (requests.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        일정 변경 요청 내역이 없습니다.
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-auto pb-4" style={{ backgroundColor: '#F7F7F8', minHeight: '100vh' }}>
        {/* Filter chips */}
        <div className="flex gap-2 px-5 py-3 overflow-x-auto scrollbar-hide">
          {(["전체", "휴가 요청", "일정 변경 요청"] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-[14px] font-bold border transition-colors flex-shrink-0 whitespace-nowrap ${
                activeFilter === filter
                  ? "border-[#4261FF] text-[#4261FF] bg-[#E8F3FF]"
                  : "border-[#DBDCDF] text-[#AAB4BF] bg-white"
              }`}
            >
              {filter} {filterCounts[filter]}
            </button>
          ))}
        </div>

        {/* Request cards */}
        <div className="flex flex-col gap-4 px-4">
          {filteredRequests.map((req) => (
            <div key={req.id} className="bg-card rounded-2xl p-5">
              {/* Type badge */}
              <span className="inline-block px-3 py-1 rounded-md bg-primary text-primary-foreground text-[12px] font-bold mb-4">
                {req.type}
              </span>

              {/* Staff info */}
              <div className="mb-4">
                <p className="text-[13px] text-muted-foreground mb-2">요청 직원</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[15px] font-bold flex-shrink-0"
                    style={{ backgroundColor: req.staffAvatarColor }}
                  >
                    {req.staffName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-foreground">{req.staffName}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {req.staffGender} · {req.staffAge}세 · {req.staffEmploymentType}
                    </p>
                  </div>
                </div>
              </div>

              {req.type === "휴가 요청" && (
                <>
                  {/* Vacation schedule */}
                  <div className="mb-4">
                    <p className="text-[13px] text-muted-foreground mb-2">휴가 요청 일정</p>
                    <div className="bg-background rounded-xl p-4">
                      <p className="text-[14px] font-bold text-foreground mb-2">
                        {req.dateRange} <span className="text-primary">(총 {req.totalDays}일)</span>
                      </p>
                      <div className="space-y-1.5">
                        {req.entries.map((entry, i) => (
                          <ShiftEntryRow key={i} entry={entry} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="mb-4">
                    <p className="text-[13px] text-muted-foreground mb-2">휴가 요청 사유</p>
                    <div className="bg-background rounded-xl p-4">
                      <p className="text-[13px] text-foreground whitespace-pre-line">{req.reason}</p>
                    </div>
                  </div>
                </>
              )}

              {req.type === "일정 변경 요청" && (
                <>
                  {/* Original schedule */}
                  <div className="mb-4">
                    <p className="text-[13px] text-muted-foreground mb-2">기존 일정</p>
                    <div className="bg-background rounded-xl p-4">
                      <p className="text-[14px] font-bold text-foreground mb-2">
                        2026년 11월 15일 (일)
                      </p>
                      <div className="space-y-1.5">
                        {req.originalEntries.map((entry, i) => (
                          <ShiftEntryRow key={i} entry={entry} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* New schedule */}
                  <div className="mb-4">
                    <p className="text-[13px] text-muted-foreground mb-2">변경 요청 일정</p>
                    <div className="bg-background rounded-xl p-4">
                      <p className="text-[14px] font-bold text-foreground mb-2">
                        2026년 11월 12일 (목)
                      </p>
                      <div className="space-y-1.5">
                        {req.newEntries.map((entry, i) => (
                          <ShiftEntryRow key={i} entry={entry} />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmPopup({ open: true, type: "reject", requestId: req.id })}
                  className="flex-1 py-3.5 rounded-2xl border border-primary text-primary text-[15px] font-bold active:scale-[0.98] transition-transform"
                >
                  거절하기
                </button>
                <button
                  onClick={() => setConfirmPopup({ open: true, type: "approve", requestId: req.id })}
                  className="flex-1 py-3.5 rounded-2xl bg-primary text-primary-foreground text-[15px] font-bold active:scale-[0.98] transition-transform"
                >
                  승인하기
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm popup */}
      {confirmPopup.open && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80" onClick={() => setConfirmPopup({ open: false, type: "approve", requestId: "" })}>
          <div className="animate-in zoom-in-95" style={{ maxWidth: '320px', width: 'calc(100% - 48px)', backgroundColor: '#FFFFFF', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px 16px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B', textAlign: 'center', marginBottom: '8px' }}>
              {confirmPopup.type === "approve"
                ? `${popupTypeLabel} 승인하기`
                : `${popupTypeLabel} 거절하기`}
            </h3>
            <p style={{ fontSize: '14px', fontWeight: 400, letterSpacing: '-0.02em', color: '#70737B', textAlign: 'center', marginBottom: '20px', lineHeight: '1.5' }}>
              {confirmPopup.type === "approve"
                ? `${popupTypeLabel}을 승인하시겠어요?`
                : `${popupTypeLabel}을 거절하시겠어요?`}
            </p>
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button
                onClick={() => setConfirmPopup({ open: false, type: "approve", requestId: "" })}
                className="flex-1 font-semibold pressable"
                style={{ height: '52px', backgroundColor: '#EBEBEB', color: '#70737B', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '16px' }}
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 font-semibold pressable"
                style={{ height: '52px', backgroundColor: '#4261FF', color: '#FFFFFF', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '16px' }}
              >
                {confirmPopup.type === "approve" ? "승인하기" : "거절하기"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
