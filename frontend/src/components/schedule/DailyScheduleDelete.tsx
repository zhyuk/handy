import { createPortal } from "react-dom";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

type ShiftType = "오픈" | "미들" | "마감";

interface StaffSchedule {
  id: string;
  name: string;
  avatarColor: string;
  shift: ShiftType;
  employmentType: string;
  startTime: string;
  endTime: string;
  breakNote?: string;
}

const MOCK_SCHEDULE: StaffSchedule[] = [
  { id: "1", name: "김정민", avatarColor: "#A78BFA", shift: "오픈", employmentType: "정규직", startTime: "08:00", endTime: "16:00", breakNote: "휴게 30분" },
  { id: "2", name: "정수민", avatarColor: "#A78BFA", shift: "미들", employmentType: "정규직", startTime: "12:00", endTime: "17:00" },
  { id: "3", name: "김수민", avatarColor: "#A78BFA", shift: "미들", employmentType: "정규직", startTime: "12:00", endTime: "18:00" },
  { id: "4", name: "오야지치", avatarColor: "#A78BFA", shift: "마감", employmentType: "정규직", startTime: "17:30", endTime: "22:00" },
  { id: "5", name: "미야오치", avatarColor: "#A78BFA", shift: "마감", employmentType: "정규직", startTime: "18:00", endTime: "22:00" },
];

const SHIFT_COLORS: Record<ShiftType, string> = {
  "오픈": "text-shift-open border-shift-open",
  "미들": "text-shift-middle border-shift-middle",
  "마감": "text-shift-close border-shift-close",
};

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

export default function DailyScheduleDelete({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const isStep1Valid = !!selectedDate;
  const isStep2Valid = selectedStaff.length > 0;

  const toggleStaff = (id: string) => {
    setSelectedStaff((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step === 1 && isStep1Valid) setStep(2);
    else if (step === 2 && isStep2Valid) setStep(3);
  };

  const handleBack = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
    else onClose();
  };

  const handleDelete = () => {
    setShowConfirm(false);
    onClose();
  };

  const selectedStaffData = MOCK_SCHEDULE.filter((s) => selectedStaff.includes(s.id));

  const formatSelectedDate = (d: Date) =>
    `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_NAMES[d.getDay()]})`;

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3">
        <button onClick={handleBack}>
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-[18px] font-bold text-foreground">직원 일정 삭제</h1>
      </div>

      {step === 1 && (
        <div className="flex-1 overflow-auto scrollbar-hide px-5">
          <h2 className="text-[22px] font-bold text-foreground leading-tight mt-4 mb-8">
            삭제할 근무 날짜를<br />선택해 주세요
          </h2>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            defaultMonth={new Date(2025, 9)}
            locale={ko}
            formatters={{
              formatCaption: (date) => `${date.getFullYear()} ${date.getMonth() + 1}월`,
            }}
            className={cn("w-full p-0 pointer-events-auto")}
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
              day_range_end: "day-range-end",
              day_range_middle: "",
              day_hidden: "invisible",
            }}
          />
        </div>
      )}

      {step === 2 && selectedDate && (
        <div className="flex-1 overflow-auto scrollbar-hide px-5">
          <h2 className="text-[22px] font-bold text-foreground leading-tight mt-4 mb-8">
            삭제할 근무 일정의<br />직원을 선택해 주세요
          </h2>

          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] text-muted-foreground">
              {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 근무직원
            </span>
            <span className="text-[13px] text-muted-foreground">총 {MOCK_SCHEDULE.length}명</span>
          </div>

          <div className="flex flex-col">
            {MOCK_SCHEDULE.map((s) => {
              const isSelected = selectedStaff.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleStaff(s.id)}
                  className={`flex items-center gap-3 py-3 px-3 -mx-3 rounded-xl transition-colors ${
                    isSelected ? "bg-primary/5" : ""
                  }`}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[18px] font-bold flex-shrink-0"
                    style={{ backgroundColor: s.avatarColor }}
                  >
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-bold text-foreground">{s.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[12px] font-bold border ${SHIFT_COLORS[s.shift]}`}>
                        {s.shift}
                      </span>
                      <span className="text-[12px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
                        {s.employmentType}
                      </span>
                    </div>
                    <p className="text-[13px] text-muted-foreground mt-0.5">
                      {s.startTime} - {s.endTime}
                      {s.breakNote && ` (${s.breakNote})`}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded bg-primary flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 3 && selectedDate && (
        <div className="flex-1 overflow-auto scrollbar-hide px-5">
          <h2 className="text-[22px] font-bold text-foreground leading-tight mt-4 mb-8">
            해당 직원의 근무 일정을<br />삭제하시겠어요?
          </h2>

          <p className="text-[13px] text-muted-foreground mb-3">선택한 일정</p>
          <div className="flex flex-col gap-3">
            {selectedStaffData.map((s) => (
              <div key={s.id} className="bg-secondary/50 rounded-2xl p-4 flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[18px] font-bold flex-shrink-0"
                  style={{ backgroundColor: s.avatarColor }}
                >
                  {s.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-foreground">{s.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[12px] font-bold border ${SHIFT_COLORS[s.shift]}`}>
                      {s.shift}
                    </span>
                    <span className="text-[12px] text-muted-foreground">{s.employmentType}</span>
                  </div>
                  <p className="text-[13px] text-muted-foreground mt-0.5">
                    {formatSelectedDate(selectedDate)}  |  {s.startTime} - {s.endTime}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom buttons */}
      <div className="px-5 pb-8 pt-4">
        {step === 3 ? (
          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="flex-1 py-4 rounded-2xl text-[16px] font-bold bg-secondary text-foreground"
            >
              이전
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="flex-[1.5] py-4 rounded-2xl text-[16px] font-bold bg-primary text-primary-foreground"
            >
              삭제하기
            </button>
          </div>
        ) : (
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
        )}
      </div>

      {/* Confirmation popup */}
      {showConfirm && selectedDate && createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" onClick={() => setShowConfirm(false)}>
          <div className="animate-in zoom-in-95" style={{ maxWidth: '320px', width: 'calc(100% - 48px)', backgroundColor: '#FFFFFF', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px 16px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B', textAlign: 'center', marginBottom: '8px' }}>직원 일정 삭제하기</h3>
            <p style={{ fontSize: '14px', fontWeight: 400, letterSpacing: '-0.02em', color: '#70737B', textAlign: 'center', marginBottom: '20px', lineHeight: '1.5' }}>
              직원 일정을 삭제하시겠어요?<br />
              {formatSelectedDate(selectedDate)}  {selectedStaffData[0]?.startTime} - {selectedStaffData[0]?.endTime}<br />
              삭제하면 복구할 수 없어요
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
                onClick={handleDelete}
                className="pressable flex-1 font-semibold"
                style={{ height: '52px', backgroundColor: '#4261FF', color: '#FFFFFF', borderRadius: '12px', fontSize: '16px', border: 'none', cursor: 'pointer' }}
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
