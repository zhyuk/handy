import { createPortal } from "react-dom";
import { useState } from "react";
import { ChevronLeft, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type ShiftType = "오픈" | "미들" | "마감";

interface StaffMember {
  id: string;
  name: string;
  avatarColor: string;
  shifts: ShiftType[];
  employmentType: string;
  workDays: string;
}

const MOCK_STAFF: StaffMember[] = [
  { id: "1", name: "김정민", avatarColor: "#A78BFA", shifts: ["오픈"], employmentType: "정규직", workDays: "월, 화, 수, 목, 금" },
  { id: "2", name: "문자영", avatarColor: "#C0392B", shifts: ["오픈", "미들"], employmentType: "알바생", workDays: "월, 화" },
  { id: "3", name: "키키치", avatarColor: "#A78BFA", shifts: ["미들"], employmentType: "알바생", workDays: "목" },
  { id: "4", name: "러블리치", avatarColor: "#A78BFA", shifts: ["미들"], employmentType: "알바생", workDays: "목, 금" },
  { id: "5", name: "마메치", avatarColor: "#A78BFA", shifts: ["미들", "마감"], employmentType: "알바생", workDays: "목, 금, 토" },
  { id: "6", name: "오야지치", avatarColor: "#A78BFA", shifts: ["마감"], employmentType: "알바생", workDays: "목, 금" },
  { id: "7", name: "주댕치", avatarColor: "#A78BFA", shifts: ["마감"], employmentType: "", workDays: "토, 일" },
];

const SHIFT_COLORS: Record<ShiftType, string> = {
  "오픈": "text-shift-open border-shift-open",
  "미들": "text-shift-middle border-shift-middle",
  "마감": "text-shift-close border-shift-close",
};

const TIME_OPTIONS = [
  "오전 06:00", "오전 07:00", "오전 08:00", "오전 09:00", "오전 10:00", "오전 11:00",
  "오후 12:00", "오후 13:00", "오후 14:00", "오후 15:00", "오후 16:00", "오후 17:00",
  "오후 18:00", "오후 19:00", "오후 20:00", "오후 21:00", "오후 22:00", "오후 23:00",
];

function ShiftBadge({ shifts }: { shifts: ShiftType[] }) {
  const label = shifts.join(", ");
  // Use the first shift's color
  const colorClass = SHIFT_COLORS[shifts[0]];
  return (
    <span className={`px-2 py-0.5 rounded text-[12px] font-bold border ${colorClass}`}>
      {label}
    </span>
  );
}

export default function DailyScheduleAdd({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [calendarDates, setCalendarDates] = useState<Date[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const staff = MOCK_STAFF.find((s) => s.id === selectedStaff);
  const isStep1Valid = !!selectedStaff;
  const isStep2Valid = startTime && endTime;

  const handleNext = () => {
    if (step === 1 && isStep1Valid) {
      setStep(2);
    } else if (step === 2 && isStep2Valid) {
      setShowConfirm(true);
    }
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    onClose();
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      onClose();
    }
  };

  const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];
  const formatDateLabel = (dates: Date[]) => {
    if (dates.length === 0) return "근무일 선택";
    return dates
      .sort((a, b) => a.getTime() - b.getTime())
      .map((d) => `${format(d, "yyyy.MM.dd")} (${DAY_NAMES[d.getDay()]})`)
      .join(", ");
  };

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3">
        <button onClick={handleBack}>
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-[18px] font-bold text-foreground">일일 일정 추가</h1>
      </div>

      {step === 1 ? (
        <div className="flex-1 overflow-auto scrollbar-hide px-5">
          <h2 className="text-[22px] font-bold text-foreground leading-tight mt-4 mb-8">
            일일 일정을 등록할<br />직원을 선택해 주세요
          </h2>

          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] text-muted-foreground">근무직원</span>
            <span className="text-[13px] text-muted-foreground">총 {MOCK_STAFF.length}명</span>
          </div>

          <div className="flex flex-col">
            {MOCK_STAFF.map((s) => {
              const isSelected = selectedStaff === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedStaff(isSelected ? null : s.id)}
                  className={`flex items-center gap-3 py-3 px-3 -mx-3 rounded-xl transition-colors ${
                    isSelected ? "bg-primary/5" : ""
                  }`}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[18px] font-bold flex-shrink-0 bg-muted"
                    style={{ backgroundColor: s.avatarColor }}
                  >
                    {s.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-bold text-foreground">{s.name}</span>
                      <ShiftBadge shifts={s.shifts} />
                      {s.employmentType && (
                        <span className="text-[12px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
                          {s.employmentType}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-muted-foreground mt-0.5">{s.workDays}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto scrollbar-hide px-5">
          <h2 className="text-[22px] font-bold text-foreground leading-tight mt-4 mb-8">
            등록할 일일 일정의<br />날짜와 시간을 입력해 주세요
          </h2>

          {/* Selected staff */}
          <p className="text-[16px] font-medium" style={{ color: '#70737B', marginBottom: '16px' }}>직원선택</p>
          {staff && (
            <div className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: '#F0F7FF', marginBottom: '30px' }}>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[18px] font-bold flex-shrink-0"
                style={{ backgroundColor: staff.avatarColor }}
              >
                {staff.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold text-foreground">{staff.name}</span>
                  <ShiftBadge shifts={staff.shifts} />
                  {staff.employmentType && (
                    <span className="text-[12px] text-muted-foreground">{staff.employmentType}</span>
                  )}
                </div>
                <p className="text-[13px] text-muted-foreground mt-0.5">{staff.workDays}</p>
              </div>
            </div>
          )}

          {/* Work date */}
          <p className="text-[16px] font-medium" style={{ color: '#70737B', marginBottom: '16px' }}>근무일</p>
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full flex items-center justify-between bg-background" style={{ height: '52px', padding: '0 16px', border: '1px solid #DBDCDF', borderRadius: '10px', marginBottom: '4px' }}>
                <span className={`text-[15px] ${calendarDates.length > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                  {formatDateLabel(calendarDates)}
                </span>
                <CalendarIcon className="w-5 h-5 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="multiple"
                selected={calendarDates}
                onSelect={(dates) => setCalendarDates(dates || [])}
                defaultMonth={new Date(2025, 9)}
                locale={ko}
                formatters={{
                  formatCaption: (date) => `${date.getFullYear()} ${date.getMonth() + 1}월`,
                }}
                className={cn("p-3 pointer-events-auto")}
                classNames={{
                  months: "flex flex-col w-full",
                  month: "space-y-2 w-full",
                  caption: "flex items-center justify-center relative py-2",
                  caption_label: "text-[17px] font-bold text-foreground",
                  nav: "flex items-center",
                  nav_button: "h-9 w-9 bg-transparent p-0 opacity-70 hover:opacity-100 inline-flex items-center justify-center rounded-full hover:bg-accent",
                  nav_button_previous: "absolute left-2",
                  nav_button_next: "absolute right-2",
                  table: "w-full border-collapse",
                  head_row: "flex w-full mb-1",
                  head_cell: "flex-1 text-center text-[13px] font-medium py-2 text-muted-foreground first:text-destructive last:text-primary",
                  row: "flex w-full",
                  cell: "flex-1 text-center p-0 relative h-11 flex items-center justify-center [&:first-child>button]:text-destructive [&:last-child>button]:text-primary [&:has([aria-selected])>button]:text-primary-foreground",
                  day: cn("h-10 w-10 p-0 font-normal text-[15px] rounded-full hover:bg-accent mx-auto flex items-center justify-center transition-colors"),
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "font-bold text-primary",
                  day_outside: "text-muted-foreground/40 opacity-30",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_hidden: "invisible",
                }}
              />
            </PopoverContent>
          </Popover>
          <p className="text-[14px]" style={{ color: '#AAB4BF', marginBottom: '30px' }}>*근무일 복수 선택이 가능해요</p>

          {/* Start time */}
          <p className="text-[16px] font-medium" style={{ color: '#70737B', marginBottom: '16px' }}>출근 시간</p>
          <div className="relative" style={{ marginBottom: '30px' }}>
            <button
              onClick={() => { setShowStartPicker(!showStartPicker); setShowEndPicker(false); }}
              className="w-full flex items-center justify-between bg-background" style={{ height: '52px', padding: '0 16px', border: '1px solid #DBDCDF', borderRadius: '10px' }}
            >
              <span className={`text-[15px] ${startTime ? "text-foreground" : "text-muted-foreground"}`}>
                {startTime || "출근 시간 선택"}
              </span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </button>
            {showStartPicker && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-2xl shadow-lg max-h-48 overflow-auto z-10">
                {TIME_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setStartTime(t); setShowStartPicker(false); }}
                    className="w-full text-left px-4 py-3 text-[14px] text-foreground hover:bg-secondary"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* End time */}
          <p className="text-[16px] font-medium" style={{ color: '#70737B', marginBottom: '16px' }}>퇴근 시간</p>
          <div className="relative" style={{ marginBottom: '30px' }}>
            <button
              onClick={() => { setShowEndPicker(!showEndPicker); setShowStartPicker(false); }}
              className="w-full flex items-center justify-between bg-background" style={{ height: '52px', padding: '0 16px', border: '1px solid #DBDCDF', borderRadius: '10px' }}
            >
              <span className={`text-[15px] ${endTime ? "text-foreground" : "text-muted-foreground"}`}>
                {endTime || "퇴근 시간 선택"}
              </span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </button>
            {showEndPicker && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-2xl shadow-lg max-h-48 overflow-auto z-10">
                {TIME_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setEndTime(t); setShowEndPicker(false); }}
                    className="w-full text-left px-4 py-3 text-[14px] text-foreground hover:bg-secondary"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom button */}
      <div className="px-5 pb-8 pt-4">
        <button
          onClick={handleNext}
          disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
          className={`w-full py-4 rounded-2xl text-[16px] font-bold transition-colors ${
            (step === 1 ? isStep1Valid : isStep2Valid)
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          다음
        </button>
      </div>

      {/* Confirmation popup */}
      {showConfirm && createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" onClick={() => setShowConfirm(false)}>
          <div className="animate-in zoom-in-95" style={{ maxWidth: '320px', width: 'calc(100% - 48px)', backgroundColor: '#FFFFFF', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px 16px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B', textAlign: 'center', marginBottom: '8px' }}>일일 일정 추가하기</h3>
            <p style={{ fontSize: '14px', fontWeight: 400, letterSpacing: '-0.02em', color: '#70737B', textAlign: 'center', marginBottom: '20px', lineHeight: '1.5' }}>
              작성한 일정을 등록하시겠어요?<br />
              추가된 근무 일정은 해당 직원에게도 안내돼요
            </p>
            <div className="flex" style={{ gap: '8px', width: '100%' }}>
              <button
                onClick={() => setShowConfirm(false)}
                className="pressable flex-1 font-semibold"
                style={{ height: '52px', backgroundColor: '#EBEBEB', color: '#70737B', borderRadius: '12px', fontSize: '16px', border: 'none', cursor: 'pointer' }}
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                className="pressable flex-1 font-semibold"
                style={{ height: '52px', backgroundColor: '#4261FF', color: '#FFFFFF', borderRadius: '12px', fontSize: '16px', border: 'none', cursor: 'pointer' }}
              >
                확인
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
