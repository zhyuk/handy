import { createPortal } from "react-dom";
import { useState } from "react";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { ko } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

type ShiftType = "오픈" | "미들" | "마감";

interface StaffMember {
  id: string;
  name: string;
  avatarColor: string;
  shifts: ShiftType[];
  employmentType: string;
  workDays: string;
  // Work schedule dates with times (for calendar display)
  scheduleDates: { date: Date; startTime: string; endTime: string }[];
}

const MOCK_STAFF: StaffMember[] = [
  {
    id: "1", name: "김정민", avatarColor: "#A78BFA", shifts: ["오픈"], employmentType: "정규직", workDays: "월, 화, 수, 목, 금",
    scheduleDates: [
      { date: new Date(2025, 9, 6), startTime: "13:00", endTime: "18:00" },
      { date: new Date(2025, 9, 7), startTime: "13:00", endTime: "18:00" },
      { date: new Date(2025, 9, 8), startTime: "13:00", endTime: "18:00" },
      { date: new Date(2025, 9, 13), startTime: "13:00", endTime: "18:00" },
      { date: new Date(2025, 9, 14), startTime: "13:00", endTime: "18:00" },
      { date: new Date(2025, 9, 15), startTime: "13:00", endTime: "18:00" },
      { date: new Date(2025, 9, 20), startTime: "13:00", endTime: "18:00" },
      { date: new Date(2025, 9, 21), startTime: "13:00", endTime: "18:00" },
      { date: new Date(2025, 9, 22), startTime: "13:00", endTime: "18:00" },
      { date: new Date(2025, 9, 27), startTime: "13:00", endTime: "18:00" },
      { date: new Date(2025, 9, 28), startTime: "13:00", endTime: "18:00" },
      { date: new Date(2025, 9, 29), startTime: "13:00", endTime: "18:00" },
    ],
  },
  {
    id: "2", name: "문자영", avatarColor: "#C0392B", shifts: ["오픈", "미들"], employmentType: "알바생", workDays: "월, 화",
    scheduleDates: [
      { date: new Date(2025, 9, 6), startTime: "08:00", endTime: "16:00" },
      { date: new Date(2025, 9, 7), startTime: "08:00", endTime: "16:00" },
      { date: new Date(2025, 9, 13), startTime: "08:00", endTime: "16:00" },
      { date: new Date(2025, 9, 14), startTime: "08:00", endTime: "16:00" },
      { date: new Date(2025, 9, 20), startTime: "08:00", endTime: "16:00" },
      { date: new Date(2025, 9, 21), startTime: "08:00", endTime: "16:00" },
      { date: new Date(2025, 9, 27), startTime: "08:00", endTime: "16:00" },
      { date: new Date(2025, 9, 28), startTime: "08:00", endTime: "16:00" },
    ],
  },
  {
    id: "3", name: "러블리치", avatarColor: "#A78BFA", shifts: ["미들"], employmentType: "알바생", workDays: "목, 금",
    scheduleDates: [
      { date: new Date(2025, 9, 2), startTime: "12:00", endTime: "18:00" },
      { date: new Date(2025, 9, 3), startTime: "12:00", endTime: "18:00" },
      { date: new Date(2025, 9, 9), startTime: "12:00", endTime: "18:00" },
      { date: new Date(2025, 9, 10), startTime: "12:00", endTime: "18:00" },
      { date: new Date(2025, 9, 16), startTime: "12:00", endTime: "18:00" },
      { date: new Date(2025, 9, 17), startTime: "12:00", endTime: "18:00" },
      { date: new Date(2025, 9, 23), startTime: "12:00", endTime: "18:00" },
      { date: new Date(2025, 9, 24), startTime: "12:00", endTime: "18:00" },
      { date: new Date(2025, 9, 30), startTime: "12:00", endTime: "18:00" },
      { date: new Date(2025, 9, 31), startTime: "12:00", endTime: "18:00" },
    ],
  },
  {
    id: "4", name: "마메치", avatarColor: "#A78BFA", shifts: ["미들", "마감"], employmentType: "알바생", workDays: "목, 금, 토",
    scheduleDates: [
      { date: new Date(2025, 9, 2), startTime: "12:00", endTime: "22:00" },
      { date: new Date(2025, 9, 3), startTime: "12:00", endTime: "22:00" },
      { date: new Date(2025, 9, 4), startTime: "12:00", endTime: "22:00" },
      { date: new Date(2025, 9, 9), startTime: "12:00", endTime: "22:00" },
      { date: new Date(2025, 9, 10), startTime: "12:00", endTime: "22:00" },
      { date: new Date(2025, 9, 11), startTime: "12:00", endTime: "22:00" },
      { date: new Date(2025, 9, 16), startTime: "12:00", endTime: "22:00" },
      { date: new Date(2025, 9, 17), startTime: "12:00", endTime: "22:00" },
      { date: new Date(2025, 9, 18), startTime: "12:00", endTime: "22:00" },
      { date: new Date(2025, 9, 23), startTime: "12:00", endTime: "22:00" },
      { date: new Date(2025, 9, 24), startTime: "12:00", endTime: "22:00" },
      { date: new Date(2025, 9, 25), startTime: "12:00", endTime: "22:00" },
      { date: new Date(2025, 9, 30), startTime: "12:00", endTime: "22:00" },
      { date: new Date(2025, 9, 31), startTime: "12:00", endTime: "22:00" },
    ],
  },
  {
    id: "5", name: "오야지치", avatarColor: "#A78BFA", shifts: ["마감"], employmentType: "알바생", workDays: "목, 금",
    scheduleDates: [
      { date: new Date(2025, 9, 2), startTime: "17:00", endTime: "22:00" },
      { date: new Date(2025, 9, 3), startTime: "17:00", endTime: "22:00" },
      { date: new Date(2025, 9, 9), startTime: "17:00", endTime: "22:00" },
      { date: new Date(2025, 9, 10), startTime: "17:00", endTime: "22:00" },
      { date: new Date(2025, 9, 16), startTime: "17:00", endTime: "22:00" },
      { date: new Date(2025, 9, 17), startTime: "17:00", endTime: "22:00" },
      { date: new Date(2025, 9, 23), startTime: "17:00", endTime: "22:00" },
      { date: new Date(2025, 9, 24), startTime: "17:00", endTime: "22:00" },
      { date: new Date(2025, 9, 30), startTime: "17:00", endTime: "22:00" },
      { date: new Date(2025, 9, 31), startTime: "17:00", endTime: "22:00" },
    ],
  },
  {
    id: "6", name: "미야오치", avatarColor: "#A78BFA", shifts: ["마감"], employmentType: "알바생", workDays: "금, 토",
    scheduleDates: [
      { date: new Date(2025, 9, 3), startTime: "18:00", endTime: "22:00" },
      { date: new Date(2025, 9, 4), startTime: "18:00", endTime: "22:00" },
      { date: new Date(2025, 9, 10), startTime: "18:00", endTime: "22:00" },
      { date: new Date(2025, 9, 11), startTime: "18:00", endTime: "22:00" },
      { date: new Date(2025, 9, 17), startTime: "18:00", endTime: "22:00" },
      { date: new Date(2025, 9, 18), startTime: "18:00", endTime: "22:00" },
      { date: new Date(2025, 9, 24), startTime: "18:00", endTime: "22:00" },
      { date: new Date(2025, 9, 25), startTime: "18:00", endTime: "22:00" },
      { date: new Date(2025, 9, 31), startTime: "18:00", endTime: "22:00" },
    ],
  },
  {
    id: "7", name: "주댕치", avatarColor: "#A78BFA", shifts: ["마감"], employmentType: "", workDays: "토, 일",
    scheduleDates: [
      { date: new Date(2025, 9, 4), startTime: "18:00", endTime: "22:00" },
      { date: new Date(2025, 9, 5), startTime: "18:00", endTime: "22:00" },
      { date: new Date(2025, 9, 11), startTime: "18:00", endTime: "22:00" },
      { date: new Date(2025, 9, 12), startTime: "18:00", endTime: "22:00" },
      { date: new Date(2025, 9, 18), startTime: "18:00", endTime: "22:00" },
      { date: new Date(2025, 9, 19), startTime: "18:00", endTime: "22:00" },
      { date: new Date(2025, 9, 25), startTime: "18:00", endTime: "22:00" },
      { date: new Date(2025, 9, 26), startTime: "18:00", endTime: "22:00" },
    ],
  },
  {
    id: "8", name: "정수민", avatarColor: "#6BCB77", shifts: ["미들"], employmentType: "정규직", workDays: "월, 화, 수",
    scheduleDates: [
      { date: new Date(2025, 9, 6), startTime: "13:00", endTime: "18:00" },
      { date: new Date(2025, 9, 7), startTime: "13:00", endTime: "18:00" },
      { date: new Date(2025, 9, 8), startTime: "13:00", endTime: "18:00" },
      { date: new Date(2025, 9, 13), startTime: "13:00", endTime: "18:00" },
      { date: new Date(2025, 9, 14), startTime: "13:00", endTime: "18:00" },
      { date: new Date(2025, 9, 15), startTime: "13:00", endTime: "18:00" },
      { date: new Date(2025, 9, 20), startTime: "13:00", endTime: "18:00" },
      { date: new Date(2025, 9, 21), startTime: "13:00", endTime: "18:00" },
      { date: new Date(2025, 9, 22), startTime: "13:00", endTime: "18:00" },
      { date: new Date(2025, 9, 27), startTime: "13:00", endTime: "18:00" },
      { date: new Date(2025, 9, 28), startTime: "13:00", endTime: "18:00" },
      { date: new Date(2025, 9, 29), startTime: "13:00", endTime: "18:00" },
    ],
  },
];

const SHIFT_COLORS: Record<ShiftType, string> = {
  "오픈": "text-shift-open border-shift-open",
  "미들": "text-shift-middle border-shift-middle",
  "마감": "text-shift-close border-shift-close",
};

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

const TIME_OPTIONS = [
  "오전 06:00", "오전 07:00", "오전 08:00", "오전 09:00", "오전 10:00", "오전 11:00",
  "오후 12:00", "오후 13:00", "오후 14:00", "오후 15:00", "오후 16:00", "오후 17:00",
  "오후 18:00", "오후 19:00", "오후 20:00", "오후 21:00", "오후 22:00", "오후 23:00",
];

function ShiftBadge({ shifts }: { shifts: ShiftType[] }) {
  const label = shifts.join(", ");
  const colorClass = SHIFT_COLORS[shifts[0]];
  return (
    <span className={`px-2 py-0.5 rounded text-[12px] font-bold border ${colorClass}`}>
      {label}
    </span>
  );
}

export default function DailyVacationSetting({ onClose }: { onClose: () => void }) {
  // Steps: 1=select staff, 2=select date, 3=select substitute, 4=confirm (no sub), 5=confirm (with sub schedule)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [subStartTime, setSubStartTime] = useState("");
  const [subEndTime, setSubEndTime] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const staff = MOCK_STAFF.find((s) => s.id === selectedStaff);
  const subStaff = MOCK_STAFF.find((s) => s.id === selectedSub);

  // Get scheduled dates for selected staff
  const staffScheduleDates = staff?.scheduleDates.map((sd) => sd.date) || [];

  // Get schedule info for selected date
  const selectedSchedule = staff?.scheduleDates.find(
    (sd) => selectedDate && sd.date.toDateString() === selectedDate.toDateString()
  );

  // Available substitutes (everyone except selected staff)
  const availableSubs = MOCK_STAFF.filter((s) => s.id !== selectedStaff);

  const formatSelectedDate = (d: Date) =>
    `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_NAMES[d.getDay()]})`;

  const formatShortDate = (d: Date) =>
    `${String(d.getFullYear()).slice(2)}.${d.getMonth() + 1}.${String(d.getDate()).padStart(2, "0")}(${DAY_NAMES[d.getDay()]})`;

  const handleBack = () => {
    if (step === 5) setStep(3);
    else if (step === 4) setStep(3);
    else if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
    else onClose();
  };

  const handleNext = () => {
    if (step === 1 && selectedStaff) setStep(2);
    else if (step === 2 && selectedDate) setStep(3);
  };

  const handleSkip = () => {
    // Skip substitute selection → go to confirm without sub
    setSelectedSub(null);
    setStep(4);
  };

  const handleSubNext = () => {
    if (selectedSub) {
      // Pre-fill sub times from selected schedule
      if (selectedSchedule) {
        setSubStartTime(`오후 ${selectedSchedule.startTime}`);
        setSubEndTime(`오후 ${selectedSchedule.endTime}`);
      }
      setStep(5);
    }
  };

  const handleConfirmVacation = () => {
    setShowConfirm(false);
    onClose();
  };

  // Custom day content for step 2 calendar - show work times under scheduled dates
  const calendarClassNames = {
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
    cell: "flex-1 text-center p-0 relative h-[72px] flex items-start justify-center [&:first-child>button]:text-destructive [&:last-child>button]:text-primary [&:has([aria-selected])]:bg-transparent",
    day: cn("w-full h-full p-0 font-normal text-[15px] rounded-lg hover:bg-accent/50 mx-auto flex items-start justify-center pt-1 transition-colors"),
    day_selected: "bg-primary/10 text-foreground hover:bg-primary/10 focus:bg-primary/10",
    day_today: "font-bold",
    day_outside: "text-muted-foreground/40 opacity-30",
    day_disabled: "text-muted-foreground opacity-50",
    day_hidden: "invisible",
  };

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3">
        <button onClick={handleBack}>
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-[18px] font-bold text-foreground">직원 휴가 설정</h1>
      </div>

      {/* Step 1: Select staff */}
      {step === 1 && (
        <div className="flex-1 overflow-auto scrollbar-hide px-5">
          <h2 className="text-[22px] font-bold text-foreground leading-tight mt-4 mb-8">
            휴가로 설정할 직원을<br />선택해 주세요
          </h2>

          <div className="flex items-center justify-between mb-4">
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
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[18px] font-bold flex-shrink-0"
                    style={{ backgroundColor: s.avatarColor }}
                  >
                    {s.name.charAt(0)}
                  </div>
                  <div className="text-left flex-1">
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
      )}

      {/* Step 2: Select vacation date from staff's schedule */}
      {step === 2 && staff && (
        <div className="flex-1 overflow-auto scrollbar-hide px-5">
          <h2 className="text-[22px] font-bold text-foreground leading-tight mt-4 mb-6">
            {staff.name} 님의 일정에서<br />휴가로 설정할 일정을 선택해 주세요
          </h2>

          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            defaultMonth={new Date(2025, 9)}
            locale={ko}
            disabled={(date) => !staffScheduleDates.some((sd) => sd.toDateString() === date.toDateString())}
            formatters={{
              formatCaption: (date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월`,
            }}
            className={cn("w-full p-0 pointer-events-auto")}
            classNames={calendarClassNames}
            components={{
              DayContent: ({ date }) => {
                const schedule = staff.scheduleDates.find(
                  (sd) => sd.date.toDateString() === date.toDateString()
                );
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                return (
                  <div className="flex flex-col items-center w-full">
                    <span className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-full text-[15px]",
                      isSelected && "bg-primary text-primary-foreground"
                    )}>
                      {date.getDate()}
                    </span>
                    {schedule && (
                      <div className={cn(
                        "text-[9px] leading-[1.2] mt-0.5 font-medium",
                        isSelected ? "text-primary" : "text-primary"
                      )}>
                        <div>{schedule.startTime}</div>
                        <div className="text-center">-</div>
                        <div>{schedule.endTime}</div>
                      </div>
                    )}
                  </div>
                );
              },
              IconLeft: () => <ChevronLeft className="h-5 w-5" />,
              IconRight: () => <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
            }}
          />
        </div>
      )}

      {/* Step 3: Select substitute */}
      {step === 3 && staff && selectedDate && (
        <div className="flex-1 overflow-auto scrollbar-hide px-5">
          <h2 className="text-[22px] font-bold text-foreground leading-tight mt-4 mb-2">
            해당 일정의 대타 근무자가<br />있다면 선택해 주세요
          </h2>
          <p className="text-[13px] text-muted-foreground mb-6">
            *대타 근무자가 없다면 선택하지 않아도 돼요
          </p>

          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] text-muted-foreground">근무직원</span>
            <span className="text-[13px] text-muted-foreground">총 {availableSubs.length}명</span>
          </div>

          <div className="flex flex-col">
            {availableSubs.map((s) => {
              const isSelected = selectedSub === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSub(isSelected ? null : s.id)}
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
                  <div className="text-left flex-1">
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
      )}

      {/* Step 4: Confirm without substitute */}
      {step === 4 && staff && selectedDate && selectedSchedule && (
        <div className="flex-1 overflow-auto scrollbar-hide px-5">
          <h2 className="text-[22px] font-bold text-foreground leading-tight mt-4 mb-8">
            {staff.name} 님의 근무 일정을<br />휴가로 설정할까요?
          </h2>

          <p className="text-[16px] font-medium" style={{ color: '#70737B', marginBottom: '16px' }}>선택한 일정</p>
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: '#F0F7FF' }}>
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
                <span className="text-[12px] text-muted-foreground">{staff.employmentType}</span>
              </div>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                {formatSelectedDate(selectedDate)}  |  {selectedSchedule.startTime} - {selectedSchedule.endTime}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Confirm with substitute schedule */}
      {step === 5 && staff && subStaff && selectedDate && selectedSchedule && (
        <div className="flex-1 overflow-auto scrollbar-hide px-5">
          <h2 className="text-[22px] font-bold text-foreground leading-tight mt-4 mb-8">
            대타 근무자의<br />일정을 확인해 주세요
          </h2>

          {/* Original schedule */}
          <p className="text-[16px] font-medium" style={{ color: '#70737B', marginBottom: '16px' }}>선택한 일정</p>
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: '#F0F7FF' }}>
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
                <span className="text-[12px] text-muted-foreground">{staff.employmentType}</span>
              </div>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                {formatSelectedDate(selectedDate)}  |  {selectedSchedule.startTime} - {selectedSchedule.endTime}
              </p>
            </div>
          </div>

          <div className="border-b border-border my-6" />

          {/* Substitute schedule */}
          <p className="text-[16px] font-medium" style={{ color: '#70737B', marginBottom: '16px' }}>*변경될 일정</p>
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: '#F0F7FF', marginBottom: '30px' }}>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[18px] font-bold flex-shrink-0"
              style={{ backgroundColor: subStaff.avatarColor }}
            >
              {subStaff.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-foreground">{subStaff.name}</span>
                <ShiftBadge shifts={subStaff.shifts} />
                <span className="text-[12px] text-muted-foreground">{subStaff.employmentType}</span>
              </div>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                {formatSelectedDate(selectedDate)}  |  {selectedSchedule.startTime} - {selectedSchedule.endTime}
              </p>
            </div>
          </div>

          {/* Start time */}
          <p className="text-[16px] font-medium" style={{ color: '#70737B', marginBottom: '16px' }}>출근 시간 변경</p>
          <div className="relative" style={{ marginBottom: '30px' }}>
            <button
              onClick={() => { setShowStartPicker(!showStartPicker); setShowEndPicker(false); }}
              className="w-full flex items-center justify-between bg-background" style={{ height: '52px', padding: '0 16px', border: '1px solid #DBDCDF', borderRadius: '10px' }}
            >
              <span className="text-[15px] text-foreground">
                {subStartTime || `오후 ${selectedSchedule.startTime}`}
              </span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </button>
            {showStartPicker && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-2xl shadow-lg max-h-48 overflow-auto z-10">
                {TIME_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setSubStartTime(t); setShowStartPicker(false); }}
                    className="w-full text-left px-4 py-3 text-[14px] text-foreground hover:bg-secondary"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* End time */}
          <p className="text-[16px] font-medium" style={{ color: '#70737B', marginBottom: '16px' }}>퇴근 시간 변경</p>
          <div className="relative" style={{ marginBottom: '30px' }}>
            <button
              onClick={() => { setShowEndPicker(!showEndPicker); setShowStartPicker(false); }}
              className="w-full flex items-center justify-between bg-background" style={{ height: '52px', padding: '0 16px', border: '1px solid #DBDCDF', borderRadius: '10px' }}
            >
              <span className="text-[15px] text-foreground">
                {subEndTime || `오후 ${selectedSchedule.endTime}`}
              </span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </button>
            {showEndPicker && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-2xl shadow-lg max-h-48 overflow-auto z-10">
                {TIME_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setSubEndTime(t); setShowEndPicker(false); }}
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

      {/* Bottom buttons */}
      <div className="px-5 pb-8 pt-4">
        {step === 1 && (
          <button
            onClick={handleNext}
            disabled={!selectedStaff}
            className={`w-full py-4 rounded-2xl text-[16px] font-bold transition-colors ${
              selectedStaff ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            다음
          </button>
        )}
        {step === 2 && (
          <button
            onClick={handleNext}
            disabled={!selectedDate}
            className={`w-full py-4 rounded-2xl text-[16px] font-bold transition-colors ${
              selectedDate ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            다음
          </button>
        )}
        {step === 3 && (
          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="flex-1 py-4 rounded-2xl text-[16px] font-bold bg-secondary text-foreground"
            >
              이전
            </button>
            <button
              onClick={selectedSub ? handleSubNext : handleSkip}
              className="flex-[1.5] py-4 rounded-2xl text-[16px] font-bold bg-primary text-primary-foreground"
            >
              {selectedSub ? "다음" : "건너뛰기"}
            </button>
          </div>
        )}
        {step === 4 && (
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
              설정하기
            </button>
          </div>
        )}
        {step === 5 && (
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
              교환하기
            </button>
          </div>
        )}
      </div>

      {/* Confirmation popup - No substitute (step 4) */}
      {showConfirm && step === 4 && selectedDate && selectedSchedule && staff && createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" onClick={() => setShowConfirm(false)}>
          <div className="animate-in zoom-in-95" style={{ maxWidth: '320px', width: 'calc(100% - 48px)', backgroundColor: '#FFFFFF', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px 16px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B', textAlign: 'center', marginBottom: '8px' }}>휴가 설정하기</h3>
            <p style={{ fontSize: '14px', fontWeight: 400, letterSpacing: '-0.02em', color: '#70737B', textAlign: 'center', marginBottom: '20px', lineHeight: '1.5' }}>
              해당 일정을 휴가로 설정하시겠어요?<br />
              설정된 일정은 해당 직원에게도 안내돼요
            </p>
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button
                onClick={() => setShowConfirm(false)}
                className="pressable flex-1 font-semibold"
                style={{ height: '52px', backgroundColor: '#EBEBEB', color: '#70737B', borderRadius: '12px', fontSize: '16px', border: 'none', cursor: 'pointer' }}
              >
                취소
              </button>
              <button
                onClick={handleConfirmVacation}
                className="pressable flex-1 font-semibold"
                style={{ height: '52px', backgroundColor: '#4261FF', color: '#FFFFFF', borderRadius: '12px', fontSize: '16px', border: 'none', cursor: 'pointer' }}
              >
                설정하기
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation popup - With substitute (step 5) */}
      {showConfirm && step === 5 && selectedDate && selectedSchedule && staff && subStaff && createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" onClick={() => setShowConfirm(false)}>
          <div className="animate-in zoom-in-95" style={{ maxWidth: '320px', width: 'calc(100% - 48px)', backgroundColor: '#FFFFFF', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px 16px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B', textAlign: 'center', marginBottom: '8px' }}>휴가 설정 및 대타 등록하기</h3>
            <p style={{ fontSize: '14px', fontWeight: 400, letterSpacing: '-0.02em', color: '#70737B', textAlign: 'center', marginBottom: '12px', lineHeight: '1.5' }}>
              휴가 설정 후 대타 근무자를 등록하시겠어요?<br />
              근무 변경 내용은 해당 직원에게도 전달돼요
            </p>
            <div className="text-left text-[14px] space-y-1 p-3 rounded-xl w-full mb-5" style={{ backgroundColor: '#F7F8FA' }}>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-10">직원</span>
                <span className="text-foreground font-medium">
                  {staff.name} → <span className="text-primary">{subStaff.name}</span>
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-10">일정</span>
                <span className="text-foreground font-medium">
                  {formatShortDate(selectedDate)} | {selectedSchedule.startTime}-{selectedSchedule.endTime}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button
                onClick={() => setShowConfirm(false)}
                className="pressable flex-1 font-semibold"
                style={{ height: '52px', backgroundColor: '#EBEBEB', color: '#70737B', borderRadius: '12px', fontSize: '16px', border: 'none', cursor: 'pointer' }}
              >
                취소
              </button>
              <button
                onClick={handleConfirmVacation}
                className="pressable flex-1 font-semibold"
                style={{ height: '52px', backgroundColor: '#4261FF', color: '#FFFFFF', borderRadius: '12px', fontSize: '16px', border: 'none', cursor: 'pointer' }}
              >
                등록하기
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
