import { createPortal } from "react-dom";
import { useState } from "react";
import { ChevronLeft, ChevronDown, Calendar as CalendarIcon, Check, X } from "lucide-react";
import { ko } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type ShiftType = "오픈" | "미들" | "마감";
type ChangeType = "근무 일정 변경" | "직원 간 근무 일정 교환" | "대타 근무자 지정";

interface StaffMember {
  id: string;
  name: string;
  avatarColor: string;
  shifts: ShiftType[];
  employmentType: string;
  startTime: string;
  endTime: string;
  workDays?: string[];
}

const MOCK_STAFF_BY_DATE: Record<string, StaffMember[]> = {
  "2025-10-21": [
    { id: "1", name: "김정민", avatarColor: "#A78BFA", shifts: ["오픈"], employmentType: "정규직", startTime: "08:00", endTime: "16:00" },
    { id: "2", name: "정수민", avatarColor: "#6BCB77", shifts: ["미들"], employmentType: "정규직", startTime: "12:00", endTime: "17:00" },
    { id: "3", name: "김수민", avatarColor: "#A78BFA", shifts: ["미들"], employmentType: "정규직", startTime: "12:00", endTime: "18:00" },
    { id: "4", name: "오야지치", avatarColor: "#A78BFA", shifts: ["마감"], employmentType: "정규직", startTime: "17:30", endTime: "22:00" },
    { id: "5", name: "미야오치", avatarColor: "#A78BFA", shifts: ["마감"], employmentType: "정규직", startTime: "18:00", endTime: "22:00" },
  ],
};

// All staff for exchange selection
const ALL_STAFF: StaffMember[] = [
  { id: "10", name: "문자영", avatarColor: "#F59E0B", shifts: ["오픈", "미들"], employmentType: "정규직", startTime: "08:00", endTime: "18:00", workDays: ["월", "화"] },
  { id: "2", name: "정수민", avatarColor: "#6BCB77", shifts: ["미들"], employmentType: "정규직", startTime: "13:00", endTime: "18:00", workDays: ["월", "화", "수"] },
  { id: "3", name: "김수민", avatarColor: "#A78BFA", shifts: ["미들"], employmentType: "정규직", startTime: "12:00", endTime: "18:00", workDays: ["화", "수"] },
  { id: "11", name: "키키치", avatarColor: "#EC4899", shifts: ["미들"], employmentType: "정규직", startTime: "12:00", endTime: "18:00", workDays: ["목"] },
  { id: "12", name: "러블리치", avatarColor: "#8B5CF6", shifts: ["미들"], employmentType: "정규직", startTime: "12:00", endTime: "18:00", workDays: ["목", "금"] },
  { id: "13", name: "마메치", avatarColor: "#14B8A6", shifts: ["미들", "마감"], employmentType: "정규직", startTime: "12:00", endTime: "22:00", workDays: ["목", "금", "토"] },
  { id: "4", name: "오야지치", avatarColor: "#A78BFA", shifts: ["마감"], employmentType: "정규직", startTime: "17:30", endTime: "22:00", workDays: ["목", "금"] },
  { id: "5", name: "미야오치", avatarColor: "#A78BFA", shifts: ["마감"], employmentType: "정규직", startTime: "18:00", endTime: "22:00", workDays: ["금", "토"] },
  { id: "14", name: "주댕치", avatarColor: "#EF4444", shifts: ["마감"], employmentType: "정규직", startTime: "18:00", endTime: "22:00", workDays: ["토", "일"] },
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

const CHANGE_TYPES: ChangeType[] = ["근무 일정 변경", "직원 간 근무 일정 교환", "대타 근무자 지정"];

function ShiftBadge({ shift }: { shift: ShiftType }) {
  return (
    <span className={`px-2 py-0.5 rounded text-[12px] font-bold border ${SHIFT_COLORS[shift]}`}>
      {shift}
    </span>
  );
}

function formatDateFull(d: Date) {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_NAMES[d.getDay()]})`;
}

function formatDateShort(d: Date) {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} (${DAY_NAMES[d.getDay()]})`;
}

function formatDateConfirm(d: Date) {
  return `${String(d.getFullYear()).slice(2)}.${d.getMonth() + 1}.${String(d.getDate()).padStart(2, "0")}(${DAY_NAMES[d.getDay()]})`;
}

function getStaffForDate(date: Date): StaffMember[] {
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return MOCK_STAFF_BY_DATE[key] || MOCK_STAFF_BY_DATE["2025-10-21"] || [];
}

// Get work dates for a staff member in a given month
function getWorkDatesForMonth(staffMember: StaffMember, year: number, month: number): Date[] {
  const dayMap: Record<string, number> = { "일": 0, "월": 1, "화": 2, "수": 3, "목": 4, "금": 5, "토": 6 };
  const workDays = staffMember.workDays || [];
  const dates: Date[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dayName = DAY_NAMES[date.getDay()];
    if (workDays.includes(dayName)) {
      dates.push(date);
    }
  }
  return dates;
}

function ScheduleCard({ member, date, label }: { member: StaffMember; date: Date; label: string }) {
  return (
    <>
      <p className="text-[16px] font-medium" style={{ color: '#70737B', marginBottom: '16px' }}>{label}</p>
      <div className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: '#F0F7FF', marginBottom: '30px' }}>
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[18px] font-bold flex-shrink-0"
          style={{ backgroundColor: member.avatarColor }}
        >
          {member.name.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-foreground">{member.name}</span>
            <ShiftBadge shift={member.shifts[0]} />
            <span className="text-[12px] text-muted-foreground">{member.employmentType}</span>
          </div>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {formatDateFull(date)}  |  {member.startTime} - {member.endTime}
          </p>
        </div>
      </div>
    </>
  );
}

// Steps: 1=date, 2=staff, 3=change type, 4=schedule change form
// Exchange flow: 5=select exchange staff, 6=select exchange date, 7=exchange summary
// Edit flow: 8=edit staff1 time, 9=edit staff2 time
// Substitute flow: 10=select substitute staff, 11=confirmation summary
type StepType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export default function DailyScheduleChange({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<StepType>(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [changeType, setChangeType] = useState<ChangeType | null>(null);
  const [showChangeTypeSheet, setShowChangeTypeSheet] = useState(false);

  // Step 4: work schedule change
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Exchange flow (steps 5-7)
  const [exchangeStaffId, setExchangeStaffId] = useState<string | null>(null);
  const [exchangeDate, setExchangeDate] = useState<Date | undefined>(undefined);
  const [exchangeCalendarMonth, setExchangeCalendarMonth] = useState(new Date(2025, 9));
  const [showExchangeConfirm, setShowExchangeConfirm] = useState(false);

  // Edit flow (steps 8-9): editable times for each staff after exchange
  const [editStaff1StartTime, setEditStaff1StartTime] = useState("");
  const [editStaff1EndTime, setEditStaff1EndTime] = useState("");
  const [editStaff2StartTime, setEditStaff2StartTime] = useState("");
  const [editStaff2EndTime, setEditStaff2EndTime] = useState("");
  const [showEditStartPicker, setShowEditStartPicker] = useState(false);
  const [showEditEndPicker, setShowEditEndPicker] = useState(false);

  // Substitute flow (steps 10-11)
  const [substituteStaffId, setSubstituteStaffId] = useState<string | null>(null);
  const [showSubstituteConfirm, setShowSubstituteConfirm] = useState(false);

  const staffList = selectedDate ? getStaffForDate(selectedDate) : [];
  const staff = staffList.find((s) => s.id === selectedStaff);
  const exchangeStaff = ALL_STAFF.find((s) => s.id === exchangeStaffId);
  const substituteStaff = ALL_STAFF.find((s) => s.id === substituteStaffId);

  const handleBack = () => {
    if (step === 11) setStep(10);
    else if (step === 10) { setSubstituteStaffId(null); setStep(3); }
    else if (step === 9) { setShowEditStartPicker(false); setShowEditEndPicker(false); setStep(8); }
    else if (step === 8) { setShowEditStartPicker(false); setShowEditEndPicker(false); setStep(7); }
    else if (step === 7) setStep(6);
    else if (step === 6) { setExchangeDate(undefined); setStep(5); }
    else if (step === 5) { setExchangeStaffId(null); setStep(3); }
    else if (step === 4) setStep(3);
    else if (step === 3) { setChangeType(null); setStep(2); }
    else if (step === 2) { setSelectedStaff(null); setStep(1); }
    else onClose();
  };

  const handleNext = () => {
    if (step === 1 && selectedDate) setStep(2);
    else if (step === 2 && selectedStaff) setStep(3);
    else if (step === 3 && changeType === "근무 일정 변경") {
      if (staff && selectedDate) {
        setNewDate(selectedDate);
        setNewStartTime(parseInt(staff.startTime) < 12 ? `오전 ${staff.startTime}` : `오후 ${staff.startTime}`);
        setNewEndTime(parseInt(staff.endTime) < 12 ? `오전 ${staff.endTime}` : `오후 ${staff.endTime}`);
      }
      setStep(4);
    } else if (step === 3 && changeType === "직원 간 근무 일정 교환") {
      setStep(5);
    } else if (step === 3 && changeType === "대타 근무자 지정") {
      setStep(10);
    } else if (step === 5 && exchangeStaffId) {
      setStep(6);
    } else if (step === 6 && exchangeDate) {
      setStep(7);
    } else if (step === 10 && substituteStaffId) {
      setStep(11);
    }
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    onClose();
  };

  const handleExchangeConfirm = () => {
    setShowExchangeConfirm(false);
    onClose();
  };

  const handleSubstituteConfirm = () => {
    setShowSubstituteConfirm(false);
    onClose();
  };

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
    cell: "flex-1 text-center p-0 relative h-11 flex items-center justify-center [&:first-child>button]:text-destructive [&:last-child>button]:text-primary [&:has([aria-selected])>button]:text-primary-foreground",
    day: cn("h-10 w-10 p-0 font-normal text-[15px] rounded-full hover:bg-accent mx-auto flex items-center justify-center transition-colors"),
    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
    day_today: "font-bold text-primary",
    day_outside: "text-muted-foreground/40 opacity-30",
    day_disabled: "text-muted-foreground opacity-50",
    day_hidden: "invisible",
  };

  // Exchange calendar: larger cells for work schedule display
  const exchangeCalendarClassNames = {
    ...calendarClassNames,
    row: "flex w-full",
    cell: "flex-1 text-center p-0 relative flex items-center justify-center [&:first-child>button]:text-destructive [&:last-child>button]:text-primary [&:has([aria-selected])>button]:text-primary-foreground",
    day: cn("h-auto min-h-[60px] w-full p-0 font-normal text-[15px] rounded-lg hover:bg-accent mx-auto flex flex-col items-center justify-start pt-1 transition-colors"),
  };

  const isStep1Valid = !!selectedDate;
  const isStep2Valid = !!selectedStaff;
  const isStep3Valid = !!changeType;
  const isStep4Valid = newDate && newStartTime && newEndTime;
  const isStep5Valid = !!exchangeStaffId;
  const isStep6Valid = !!exchangeDate;

  // Exchange/substitute staff list excluding the originally selected staff
  const exchangeStaffList = ALL_STAFF.filter((s) => s.id !== selectedStaff);
  const substituteStaffList = ALL_STAFF.filter((s) => s.id !== selectedStaff);

  // Get work dates for exchange calendar
  const exchangeWorkDates = exchangeStaff
    ? getWorkDatesForMonth(exchangeStaff, exchangeCalendarMonth.getFullYear(), exchangeCalendarMonth.getMonth())
    : [];

  const isCurrentStepValid = () => {
    switch (step) {
      case 1: return isStep1Valid;
      case 2: return isStep2Valid;
      case 3: return isStep3Valid;
      case 4: return isStep4Valid;
      case 5: return isStep5Valid;
      case 6: return isStep6Valid;
      case 8: return true;
      case 10: return !!substituteStaffId;
      default: return false;
    }
  };

  const getButtonLabel = () => {
    if (step === 4) return "변경하기";
    return "다음";
  };

  const handleBottomButton = () => {
    if (step === 4) {
      setShowConfirm(true);
    } else if (step === 8) {
      // Go to step 9 (edit staff 2's time)
      if (staff && exchangeStaff && selectedDate && exchangeDate) {
        setEditStaff2StartTime(parseInt(staff.startTime) < 12 ? `오전 ${staff.startTime}` : `오후 ${staff.startTime}`);
        setEditStaff2EndTime(parseInt(staff.endTime) < 12 ? `오전 ${staff.endTime}` : `오후 ${staff.endTime}`);
      }
      setShowEditStartPicker(false);
      setShowEditEndPicker(false);
      setStep(9);
    } else {
      handleNext();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3">
        <button onClick={handleBack}>
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-[18px] font-bold text-foreground">직원 일정 변경</h1>
      </div>

      {/* Step 1: Select date */}
      {step === 1 && (
        <div className="flex-1 overflow-auto scrollbar-hide px-5">
          <h2 className="text-[22px] font-bold text-foreground leading-tight mt-4 mb-6">
            변경할 근무 일정의<br />날짜를 선택해 주세요
          </h2>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            defaultMonth={new Date(2025, 9)}
            locale={ko}
            formatters={{ formatCaption: (date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월` }}
            className={cn("w-full p-0 pointer-events-auto")}
            classNames={calendarClassNames}
            components={{
              IconLeft: () => <ChevronLeft className="h-5 w-5" />,
              IconRight: () => (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              ),
            }}
          />
        </div>
      )}

      {/* Step 2: Select staff */}
      {step === 2 && selectedDate && (
        <div className="flex-1 overflow-auto scrollbar-hide px-5">
          <h2 className="text-[22px] font-bold text-foreground leading-tight mt-4 mb-8">
            선택한 날짜에서 일정을<br />변경할 직원을 선택해 주세요
          </h2>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] text-muted-foreground">근무직원</span>
            <span className="text-[13px] text-muted-foreground">총 {staffList.length}명</span>
          </div>
          <div className="flex flex-col">
            {staffList.map((s) => {
              const isSelected = selectedStaff === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedStaff(isSelected ? null : s.id)}
                  className={`flex items-center gap-3 py-3 px-3 -mx-3 rounded-xl transition-colors ${isSelected ? "bg-primary/5" : ""}`}
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[18px] font-bold flex-shrink-0" style={{ backgroundColor: s.avatarColor }}>
                    {s.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-bold text-foreground">{s.name}</span>
                      <ShiftBadge shift={s.shifts[0]} />
                      <span className="text-[12px] text-muted-foreground border border-border rounded px-1.5 py-0.5">{s.employmentType}</span>
                    </div>
                    <p className="text-[13px] text-muted-foreground mt-0.5">{s.startTime} - {s.endTime}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Select change type */}
      {step === 3 && staff && selectedDate && (
        <div className="flex-1 overflow-auto scrollbar-hide px-5">
          <h2 className="text-[22px] font-bold text-foreground leading-tight mt-4 mb-8">
            선택한 직원의<br />일정 변경 유형을 선택해 주세요
          </h2>
          <ScheduleCard member={staff} date={selectedDate} label="선택한 일정" />
          <p className="text-[16px] font-medium" style={{ color: '#70737B', marginBottom: '16px' }}>일정 변경 유형 <span style={{ color: '#FF3D3D' }}>*</span>
          </p>
          <button
            onClick={() => setShowChangeTypeSheet(true)}
            className="w-full flex items-center justify-between bg-background" style={{ height: '52px', padding: '0 16px', border: '1px solid #DBDCDF', borderRadius: '10px', marginBottom: '4px' }}
          >
            <span className={`text-[15px] ${changeType ? "text-foreground" : "text-muted-foreground"}`}>
              {changeType || "변경 유형 선택"}
            </span>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </button>
          <p className="text-[14px]" style={{ color: '#AAB4BF', marginTop: '4px', marginBottom: '30px' }}>*일정 변경 시 기존 일정은 새 일정으로 자동 대체돼요</p>
        </div>
      )}

      {/* Step 4: Work schedule change form */}
      {step === 4 && staff && selectedDate && (
        <div className="flex-1 overflow-auto scrollbar-hide px-5">
          <h2 className="text-[22px] font-bold text-foreground leading-tight mt-4 mb-8">
            선택한 직원의<br />일정 변경 유형을 선택해 주세요
          </h2>
          <ScheduleCard member={staff} date={selectedDate} label="선택한 일정" />
          <p className="text-[16px] font-medium" style={{ color: '#70737B', marginBottom: '16px' }}>근무일 변경</p>
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full flex items-center justify-between bg-background" style={{ height: '52px', padding: '0 16px', border: '1px solid #DBDCDF', borderRadius: '10px', marginBottom: '30px' }}>
                <span className={`text-[15px] ${newDate ? "text-foreground" : "text-muted-foreground"}`}>
                  {newDate ? formatDateShort(newDate) : "날짜 선택"}
                </span>
                <CalendarIcon className="w-5 h-5 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single" selected={newDate} onSelect={setNewDate} defaultMonth={new Date(2025, 9)} locale={ko}
                formatters={{ formatCaption: (date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월` }}
                className={cn("p-3 pointer-events-auto")} classNames={calendarClassNames}
                components={{
                  IconLeft: () => <ChevronLeft className="h-5 w-5" />,
                  IconRight: () => <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>,
                }}
              />
            </PopoverContent>
          </Popover>
          <p className="text-[16px] font-medium" style={{ color: '#70737B', marginBottom: '16px' }}>출근 시간 변경</p>
          <div className="relative" style={{ marginBottom: '30px' }}>
            <button onClick={() => { setShowStartPicker(!showStartPicker); setShowEndPicker(false); }} className="w-full flex items-center justify-between bg-background" style={{ height: '52px', padding: '0 16px', border: '1px solid #DBDCDF', borderRadius: '10px' }}>
              <span className={`text-[15px] ${newStartTime ? "text-foreground" : "text-muted-foreground"}`}>{newStartTime || "출근 시간 선택"}</span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </button>
            {showStartPicker && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-2xl shadow-lg max-h-48 overflow-auto z-10 scrollbar-hide">
                {TIME_OPTIONS.map((t) => (
                  <button key={t} onClick={() => { setNewStartTime(t); setShowStartPicker(false); }} className="w-full text-left px-4 py-3 text-[14px] text-foreground hover:bg-secondary">{t}</button>
                ))}
              </div>
            )}
          </div>
          <p className="text-[16px] font-medium" style={{ color: '#70737B', marginBottom: '16px' }}>퇴근 시간 변경</p>
          <div className="relative" style={{ marginBottom: '30px' }}>
            <button onClick={() => { setShowEndPicker(!showEndPicker); setShowStartPicker(false); }} className="w-full flex items-center justify-between bg-background" style={{ height: '52px', padding: '0 16px', border: '1px solid #DBDCDF', borderRadius: '10px' }}>
              <span className={`text-[15px] ${newEndTime ? "text-foreground" : "text-muted-foreground"}`}>{newEndTime || "퇴근 시간 선택"}</span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </button>
            {showEndPicker && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-2xl shadow-lg max-h-48 overflow-auto z-10 scrollbar-hide">
                {TIME_OPTIONS.map((t) => (
                  <button key={t} onClick={() => { setNewEndTime(t); setShowEndPicker(false); }} className="w-full text-left px-4 py-3 text-[14px] text-foreground hover:bg-secondary">{t}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 5: Select exchange staff */}
      {step === 5 && staff && selectedDate && (
        <div className="flex-1 overflow-auto scrollbar-hide px-5">
          <h2 className="text-[22px] font-bold text-foreground leading-tight mt-4 mb-8">
            일정을 교환할<br />직원을 선택해 주세요
          </h2>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] text-muted-foreground">근무직원</span>
            <span className="text-[13px] text-muted-foreground">총 {exchangeStaffList.length}명</span>
          </div>
          <div className="flex flex-col">
            {exchangeStaffList.map((s) => {
              const isSelected = exchangeStaffId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setExchangeStaffId(isSelected ? null : s.id)}
                  className={`flex items-center gap-3 py-3 px-3 -mx-3 rounded-xl transition-colors ${isSelected ? "bg-primary/5" : ""}`}
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[18px] font-bold flex-shrink-0" style={{ backgroundColor: s.avatarColor }}>
                    {s.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-bold text-foreground">{s.name}</span>
                      {s.shifts.map((shift) => (
                        <ShiftBadge key={shift} shift={shift} />
                      ))}
                      <span className="text-[12px] text-muted-foreground border border-border rounded px-1.5 py-0.5">{s.employmentType}</span>
                    </div>
                    <p className="text-[13px] text-muted-foreground mt-0.5">
                      {s.workDays?.join(", ")}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 6: Select exchange date from staff's calendar */}
      {step === 6 && exchangeStaff && staff && selectedDate && (
        <div className="flex-1 overflow-auto scrollbar-hide px-5">
          <h2 className="text-[22px] font-bold text-foreground leading-tight mt-4 mb-6">
            {exchangeStaff.name} 님의 일정에서<br />교환할 날짜를 선택해 주세요
          </h2>

          {/* Custom calendar with work schedule indicators */}
          <div className="w-full">
            {/* Calendar header */}
            <div className="flex items-center justify-between py-3 mb-2">
              <button onClick={() => setExchangeCalendarMonth(new Date(exchangeCalendarMonth.getFullYear(), exchangeCalendarMonth.getMonth() - 1))}>
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <span className="text-[17px] font-bold text-foreground">
                {exchangeCalendarMonth.getFullYear()}년 {exchangeCalendarMonth.getMonth() + 1}월 ▾
              </span>
              <button onClick={() => setExchangeCalendarMonth(new Date(exchangeCalendarMonth.getFullYear(), exchangeCalendarMonth.getMonth() + 1))}>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_NAMES.map((day, i) => (
                <div key={day} className={`text-center text-[13px] font-medium py-2 ${i === 0 ? "text-destructive" : i === 6 ? "text-primary" : "text-muted-foreground"}`}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            {(() => {
              const year = exchangeCalendarMonth.getFullYear();
              const month = exchangeCalendarMonth.getMonth();
              const firstDay = new Date(year, month, 1).getDay();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const workDates = exchangeWorkDates;
              const isWorkDate = (d: number) => workDates.some((wd) => wd.getDate() === d);
              const isSelectedDate = (d: number) => exchangeDate && exchangeDate.getDate() === d && exchangeDate.getMonth() === month && exchangeDate.getFullYear() === year;
              const today = new Date();
              const isToday = (d: number) => today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;

              const rows: number[][] = [];
              let row: number[] = [];
              for (let i = 0; i < firstDay; i++) row.push(0);
              for (let d = 1; d <= daysInMonth; d++) {
                row.push(d);
                if (row.length === 7) { rows.push(row); row = []; }
              }
              if (row.length > 0) { while (row.length < 7) row.push(0); rows.push(row); }

              return rows.map((r, ri) => (
                <div key={ri} className="grid grid-cols-7">
                  {r.map((d, ci) => {
                    if (d === 0) return <div key={ci} className="min-h-[68px]" />;
                    const work = isWorkDate(d);
                    const selected = isSelectedDate(d);
                    const dayColor = ci === 0 ? "text-destructive" : ci === 6 ? "text-primary" : "text-foreground";

                    return (
                      <button
                        key={ci}
                        onClick={() => {
                          if (work) setExchangeDate(new Date(year, month, d));
                        }}
                        className={`min-h-[68px] flex flex-col items-center pt-1.5 rounded-lg transition-colors ${selected ? "bg-primary/10" : ""}`}
                      >
                        <span className={`text-[15px] w-8 h-8 flex items-center justify-center rounded-full ${
                          isToday(d) ? "bg-primary text-primary-foreground font-bold" :
                          selected ? "text-primary font-bold" : dayColor
                        }`}>
                          {d}
                        </span>
                        {work && (
                          <div className={`text-[10px] mt-0.5 leading-tight text-center ${selected ? "text-primary font-bold" : "text-destructive"}`}>
                            {exchangeStaff.startTime}<br/>-<br/>{exchangeStaff.endTime}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Step 7: Exchange summary */}
      {step === 7 && staff && selectedDate && exchangeStaff && exchangeDate && (
        <div className="flex-1 overflow-auto scrollbar-hide px-5">
          <h2 className="text-[22px] font-bold text-foreground leading-tight mt-4 mb-2">
            해당 일정의 대타 근무자가<br />있다면 선택해 주세요
          </h2>
          <p className="text-[14px] text-muted-foreground mb-8">
            필요한 경우 근무 시간을 수정할 수 있어요
          </p>

          <ScheduleCard member={staff} date={selectedDate} label="선택한 일정" />
          
          <p className="text-[13px] text-muted-foreground mb-2">교환할 일정</p>
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: '#F0F7FF', marginBottom: '30px' }}>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[18px] font-bold flex-shrink-0"
              style={{ backgroundColor: exchangeStaff.avatarColor }}
            >
              {exchangeStaff.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-foreground">{exchangeStaff.name}</span>
                <ShiftBadge shift={exchangeStaff.shifts[0]} />
                <span className="text-[12px] text-muted-foreground">{exchangeStaff.employmentType}</span>
              </div>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                {formatDateFull(exchangeDate)}  |  {exchangeStaff.startTime} - {exchangeStaff.endTime}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 10: Select substitute staff */}
      {step === 10 && staff && selectedDate && (
        <div className="flex-1 overflow-auto scrollbar-hide px-5">
          <h2 className="text-[22px] font-bold text-foreground leading-tight mt-4 mb-8">
            {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일({DAY_NAMES[selectedDate.getDay()]}) {staff.startTime}-{staff.endTime}<br />대타 근무자를 선택해 주세요
          </h2>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] text-muted-foreground">근무직원</span>
            <span className="text-[13px] text-muted-foreground">총 {substituteStaffList.length}명</span>
          </div>
          <div className="flex flex-col">
            {substituteStaffList.map((s) => {
              const isSelected = substituteStaffId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSubstituteStaffId(isSelected ? null : s.id)}
                  className={`flex items-center gap-3 py-3 px-3 -mx-3 rounded-xl transition-colors ${isSelected ? "bg-primary/5" : ""}`}
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[18px] font-bold flex-shrink-0" style={{ backgroundColor: s.avatarColor }}>
                    {s.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-bold text-foreground">{s.name}</span>
                      {s.shifts.map((shift) => <ShiftBadge key={shift} shift={shift} />)}
                      <span className="text-[12px] text-muted-foreground border border-border rounded px-1.5 py-0.5">{s.employmentType}</span>
                    </div>
                    <p className="text-[13px] text-muted-foreground mt-0.5">{s.workDays?.join(", ")}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 11: Substitute confirmation summary */}
      {step === 11 && staff && selectedDate && substituteStaff && (
        <div className="flex-1 overflow-auto scrollbar-hide px-5">
          <h2 className="text-[22px] font-bold text-foreground leading-tight mt-4 mb-8">
            아래와 같이<br />일정을 변경할까요?
          </h2>

          <ScheduleCard member={staff} date={selectedDate} label="선택한 일정" />

          <p className="text-[13px] text-muted-foreground mb-2">대타 근무자</p>
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[18px] font-bold flex-shrink-0" style={{ backgroundColor: substituteStaff.avatarColor }}>
              {substituteStaff.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-foreground">{substituteStaff.name}</span>
                <ShiftBadge shift={substituteStaff.shifts[0]} />
                <span className="text-[12px] text-muted-foreground">{substituteStaff.employmentType}</span>
              </div>
              <p className="text-[13px] text-muted-foreground mt-0.5">{substituteStaff.workDays?.join(", ")}</p>
            </div>
          </div>

          <p className="text-[13px] text-primary font-bold mb-2">*변경될 일정</p>
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: '#F0F7FF', marginBottom: '30px' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[18px] font-bold flex-shrink-0" style={{ backgroundColor: substituteStaff.avatarColor }}>
              {substituteStaff.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-foreground">{substituteStaff.name}</span>
                <ShiftBadge shift={substituteStaff.shifts[0]} />
                <span className="text-[12px] text-muted-foreground">{substituteStaff.employmentType}</span>
              </div>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                {formatDateFull(selectedDate)}  |  {staff.startTime} - {staff.endTime}
              </p>
            </div>
          </div>
        </div>
      )}


      {step === 8 && staff && selectedDate && exchangeStaff && exchangeDate && (
        <div className="flex-1 overflow-auto scrollbar-hide px-5">
          <h2 className="text-[22px] font-bold text-foreground leading-tight mt-4 mb-8">
            {staff.name} 님의 근무<br />일정을 확인해 주세요
          </h2>
          <p className="text-[13px] text-primary font-bold mb-2">*교환된 일정</p>
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: '#F0F7FF', marginBottom: '30px' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[18px] font-bold flex-shrink-0" style={{ backgroundColor: staff.avatarColor }}>
              {staff.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-foreground">{staff.name}</span>
                <ShiftBadge shift={staff.shifts[0]} />
                <span className="text-[12px] text-muted-foreground">{staff.employmentType}</span>
              </div>
              <p className="text-[13px] text-primary mt-0.5">
                {formatDateFull(exchangeDate)}  |  {exchangeStaff.startTime} - {exchangeStaff.endTime}
              </p>
            </div>
          </div>
          <p className="text-[16px] font-medium" style={{ color: '#70737B', marginBottom: '16px' }}>근무일 변경</p>
          <div className="w-full flex items-center justify-between border border-border rounded-2xl px-4 py-4 mb-6 bg-muted/30 cursor-not-allowed">
            <span className="text-[15px] text-muted-foreground">{formatDateShort(exchangeDate)}</span>
            <CalendarIcon className="w-5 h-5 text-muted-foreground/50" />
          </div>
          <p className="text-[16px] font-medium" style={{ color: '#70737B', marginBottom: '16px' }}>출근 시간 변경</p>
          <div className="relative" style={{ marginBottom: '30px' }}>
            <button onClick={() => { setShowEditStartPicker(!showEditStartPicker); setShowEditEndPicker(false); }} className="w-full flex items-center justify-between bg-background" style={{ height: '52px', padding: '0 16px', border: '1px solid #DBDCDF', borderRadius: '10px' }}>
              <span className="text-[15px] text-foreground">{editStaff1StartTime}</span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </button>
            {showEditStartPicker && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-2xl shadow-lg max-h-48 overflow-auto z-10 scrollbar-hide">
                {TIME_OPTIONS.map((t) => (
                  <button key={t} onClick={() => { setEditStaff1StartTime(t); setShowEditStartPicker(false); }} className="w-full text-left px-4 py-3 text-[14px] text-foreground hover:bg-secondary">{t}</button>
                ))}
              </div>
            )}
          </div>
          <p className="text-[16px] font-medium" style={{ color: '#70737B', marginBottom: '16px' }}>퇴근 시간 변경</p>
          <div className="relative" style={{ marginBottom: '30px' }}>
            <button onClick={() => { setShowEditEndPicker(!showEditEndPicker); setShowEditStartPicker(false); }} className="w-full flex items-center justify-between bg-background" style={{ height: '52px', padding: '0 16px', border: '1px solid #DBDCDF', borderRadius: '10px' }}>
              <span className="text-[15px] text-foreground">{editStaff1EndTime}</span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </button>
            {showEditEndPicker && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-2xl shadow-lg max-h-48 overflow-auto z-10 scrollbar-hide">
                {TIME_OPTIONS.map((t) => (
                  <button key={t} onClick={() => { setEditStaff1EndTime(t); setShowEditEndPicker(false); }} className="w-full text-left px-4 py-3 text-[14px] text-foreground hover:bg-secondary">{t}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 9: Edit staff2 exchanged schedule */}
      {step === 9 && staff && selectedDate && exchangeStaff && exchangeDate && (
        <div className="flex-1 overflow-auto scrollbar-hide px-5">
          <h2 className="text-[22px] font-bold text-foreground leading-tight mt-4 mb-8">
            {exchangeStaff.name} 님의 근무<br />일정을 확인해 주세요
          </h2>
          <p className="text-[13px] text-primary font-bold mb-2">*교환된 일정</p>
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: '#F0F7FF', marginBottom: '30px' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[18px] font-bold flex-shrink-0" style={{ backgroundColor: exchangeStaff.avatarColor }}>
              {exchangeStaff.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-foreground">{exchangeStaff.name}</span>
                <ShiftBadge shift={exchangeStaff.shifts[0]} />
                <span className="text-[12px] text-muted-foreground">{exchangeStaff.employmentType}</span>
              </div>
              <p className="text-[13px] text-primary mt-0.5">
                {formatDateFull(selectedDate)}  |  {staff.startTime} - {staff.endTime}
              </p>
            </div>
          </div>
          <p className="text-[16px] font-medium" style={{ color: '#70737B', marginBottom: '16px' }}>근무일 변경</p>
          <div className="w-full flex items-center justify-between border border-border rounded-2xl px-4 py-4 mb-6 bg-muted/30 cursor-not-allowed">
            <span className="text-[15px] text-muted-foreground">{formatDateShort(selectedDate)}</span>
            <CalendarIcon className="w-5 h-5 text-muted-foreground/50" />
          </div>
          <p className="text-[16px] font-medium" style={{ color: '#70737B', marginBottom: '16px' }}>출근 시간 변경</p>
          <div className="relative" style={{ marginBottom: '30px' }}>
            <button onClick={() => { setShowEditStartPicker(!showEditStartPicker); setShowEditEndPicker(false); }} className="w-full flex items-center justify-between bg-background" style={{ height: '52px', padding: '0 16px', border: '1px solid #DBDCDF', borderRadius: '10px' }}>
              <span className="text-[15px] text-foreground">{editStaff2StartTime}</span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </button>
            {showEditStartPicker && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-2xl shadow-lg max-h-48 overflow-auto z-10 scrollbar-hide">
                {TIME_OPTIONS.map((t) => (
                  <button key={t} onClick={() => { setEditStaff2StartTime(t); setShowEditStartPicker(false); }} className="w-full text-left px-4 py-3 text-[14px] text-foreground hover:bg-secondary">{t}</button>
                ))}
              </div>
            )}
          </div>
          <p className="text-[16px] font-medium" style={{ color: '#70737B', marginBottom: '16px' }}>퇴근 시간 변경</p>
          <div className="relative" style={{ marginBottom: '30px' }}>
            <button onClick={() => { setShowEditEndPicker(!showEditEndPicker); setShowEditStartPicker(false); }} className="w-full flex items-center justify-between bg-background" style={{ height: '52px', padding: '0 16px', border: '1px solid #DBDCDF', borderRadius: '10px' }}>
              <span className="text-[15px] text-foreground">{editStaff2EndTime}</span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </button>
            {showEditEndPicker && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-2xl shadow-lg max-h-48 overflow-auto z-10 scrollbar-hide">
                {TIME_OPTIONS.map((t) => (
                  <button key={t} onClick={() => { setEditStaff2EndTime(t); setShowEditEndPicker(false); }} className="w-full text-left px-4 py-3 text-[14px] text-foreground hover:bg-secondary">{t}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom buttons */}
      {step === 7 ? (
        <div className="px-5 pb-8 pt-4 flex gap-3">
          <button
            onClick={() => {
              if (exchangeStaff && exchangeDate) {
                setEditStaff1StartTime(parseInt(exchangeStaff.startTime) < 12 ? `오전 ${exchangeStaff.startTime}` : `오후 ${exchangeStaff.startTime}`);
                setEditStaff1EndTime(parseInt(exchangeStaff.endTime) < 12 ? `오전 ${exchangeStaff.endTime}` : `오후 ${exchangeStaff.endTime}`);
              }
              setShowEditStartPicker(false);
              setShowEditEndPicker(false);
              setStep(8);
            }}
            className="flex-1 py-4 rounded-2xl text-[16px] font-bold border border-border text-foreground bg-background"
          >
            수정하기
          </button>
          <button
            onClick={() => setShowExchangeConfirm(true)}
            className="flex-1 py-4 rounded-2xl text-[16px] font-bold bg-primary text-primary-foreground"
          >
            교환하기
          </button>
        </div>
      ) : step === 8 ? (
        <div className="px-5 pb-8 pt-4">
          <button
            onClick={handleBottomButton}
            className="w-full py-4 rounded-2xl text-[16px] font-bold bg-primary text-primary-foreground"
          >
            다음
          </button>
        </div>
      ) : step === 9 ? (
        <div className="px-5 pb-8 pt-4 flex gap-3">
          <button
            onClick={() => { setShowEditStartPicker(false); setShowEditEndPicker(false); setStep(8); }}
            className="flex-1 py-4 rounded-2xl text-[16px] font-bold border border-border text-foreground bg-background"
          >
            이전
          </button>
          <button
            onClick={() => setShowExchangeConfirm(true)}
            className="flex-1 py-4 rounded-2xl text-[16px] font-bold bg-primary text-primary-foreground"
          >
            교환하기
          </button>
        </div>
      ) : step === 11 ? (
        <div className="px-5 pb-8 pt-4 flex gap-3">
          <button
            onClick={() => setStep(10)}
            className="flex-1 py-4 rounded-2xl text-[16px] font-bold border border-border text-foreground bg-background"
          >
            이전
          </button>
          <button
            onClick={() => setShowSubstituteConfirm(true)}
            className="flex-1 py-4 rounded-2xl text-[16px] font-bold bg-primary text-primary-foreground"
          >
            등록하기
          </button>
        </div>
      ) : (
        <div className="px-5 pb-8 pt-4">
          <button
            onClick={handleBottomButton}
            disabled={!isCurrentStepValid()}
            className={`w-full py-4 rounded-2xl text-[16px] font-bold transition-colors ${
              isCurrentStepValid() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {getButtonLabel()}
          </button>
        </div>
      )}

      {/* Change type bottom sheet */}
      {showChangeTypeSheet && (
        <div className="fixed inset-0 z-[55] flex items-end justify-center bg-black/50" onClick={() => setShowChangeTypeSheet(false)}>
          <div className="bg-card rounded-t-2xl w-full max-w-lg pb-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <h3 className="text-[17px] font-bold text-foreground">일정 변경 유형 선택</h3>
              <button onClick={() => setShowChangeTypeSheet(false)}>
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <div className="flex flex-col">
              {CHANGE_TYPES.map((type) => {
                const isSelected = changeType === type;
                return (
                  <button
                    key={type}
                    onClick={() => { setChangeType(type); setShowChangeTypeSheet(false); }}
                    className={`flex items-center justify-between px-5 py-4 text-[15px] transition-colors ${isSelected ? "bg-primary/10 text-primary font-bold" : "text-foreground"}`}
                  >
                    <span>{type}</span>
                    {isSelected && <Check className="w-5 h-5 text-primary" />}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-center pt-4">
              <div className="w-[134px] h-[5px] bg-foreground rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Work schedule change confirmation popup */}
      {showConfirm && staff && selectedDate && newDate && createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" onClick={() => setShowConfirm(false)}>
          <div className="animate-in zoom-in-95" style={{ maxWidth: '320px', width: 'calc(100% - 48px)', backgroundColor: '#FFFFFF', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px 16px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B', textAlign: 'center', marginBottom: '8px' }}>근무 일정 변경하기</h3>
            <p style={{ fontSize: '14px', fontWeight: 400, letterSpacing: '-0.02em', color: '#70737B', textAlign: 'center', marginBottom: '12px', lineHeight: '1.5' }}>
              아래와 같이 근무 일정을 변경하시겠어요?<br />변경 일정은 해당 직원에게도 안내돼요
            </p>
            <div className="text-left text-[13px] space-y-1.5 mx-5 mb-5 p-3 rounded-xl" style={{ backgroundColor: '#F7F8FA' }}>
              <div className="flex"><span className="text-muted-foreground w-20">직원</span><span className="font-bold text-foreground">{staff.name}</span></div>
              <div className="flex"><span className="text-muted-foreground w-20">선택한 일정</span><span className="text-foreground">{formatDateConfirm(selectedDate)} | {staff.startTime}-{staff.endTime}</span></div>
              <div className="flex"><span className="text-muted-foreground w-20">변경한 일정</span><span className="text-primary font-bold">{formatDateConfirm(newDate)} | {newStartTime.replace("오전 ", "").replace("오후 ", "")}-{newEndTime.replace("오전 ", "").replace("오후 ", "")}</span></div>
            </div>
            <div className="flex" style={{ gap: '8px', width: '100%' }}>
              <button onClick={() => setShowConfirm(false)} className="pressable flex-1 font-semibold" style={{ height: '52px', backgroundColor: '#EBEBEB', color: '#70737B', borderRadius: '12px', fontSize: '16px', border: 'none', cursor: 'pointer' }}>취소</button>
              <button onClick={handleConfirm} className="pressable flex-1 font-semibold" style={{ height: '52px', backgroundColor: '#4261FF', color: '#FFFFFF', borderRadius: '12px', fontSize: '16px', border: 'none', cursor: 'pointer' }}>변경하기</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Exchange confirmation popup */}
      {showExchangeConfirm && staff && selectedDate && exchangeStaff && exchangeDate && createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" onClick={() => setShowExchangeConfirm(false)}>
          <div className="animate-in zoom-in-95" style={{ maxWidth: '320px', width: 'calc(100% - 48px)', backgroundColor: '#FFFFFF', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px 16px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B', textAlign: 'center', marginBottom: '8px' }}>직원 간 근무 일정 교환하기</h3>
            <p style={{ fontSize: '14px', fontWeight: 400, letterSpacing: '-0.02em', color: '#70737B', textAlign: 'center', marginBottom: '12px', lineHeight: '1.5' }}>
              아래와 같이 근무 일정을 교환하시겠어요?<br />변경 일정은 해당 직원에게도 안내돼요
            </p>
            <div className="text-left text-[13px] space-y-1.5 mx-5 mb-5 p-3 rounded-xl" style={{ backgroundColor: '#F7F8FA' }}>
              <div className="flex"><span className="text-muted-foreground w-20">직원</span><span className="font-bold text-foreground">{staff.name} ↔ <span className="text-primary">{exchangeStaff.name}</span></span></div>
              <div className="flex"><span className="text-muted-foreground w-20">선택한 일정</span><span className="text-foreground">{formatDateConfirm(selectedDate)} | {editStaff1StartTime ? editStaff1StartTime.replace("오전 ", "").replace("오후 ", "") : staff.startTime}-{editStaff1EndTime ? editStaff1EndTime.replace("오전 ", "").replace("오후 ", "") : staff.endTime}</span></div>
              <div className="flex"><span className="text-muted-foreground w-20">교환된 일정</span><span className="text-primary font-bold">{formatDateConfirm(exchangeDate)} | {editStaff2StartTime ? editStaff2StartTime.replace("오전 ", "").replace("오후 ", "") : exchangeStaff.startTime}-{editStaff2EndTime ? editStaff2EndTime.replace("오전 ", "").replace("오후 ", "") : exchangeStaff.endTime}</span></div>
            </div>
            <div className="flex" style={{ gap: '8px', width: '100%' }}>
              <button onClick={() => setShowExchangeConfirm(false)} className="pressable flex-1 font-semibold" style={{ height: '52px', backgroundColor: '#EBEBEB', color: '#70737B', borderRadius: '12px', fontSize: '16px', border: 'none', cursor: 'pointer' }}>취소</button>
              <button onClick={handleExchangeConfirm} className="pressable flex-1 font-semibold" style={{ height: '52px', backgroundColor: '#4261FF', color: '#FFFFFF', borderRadius: '12px', fontSize: '16px', border: 'none', cursor: 'pointer' }}>교환하기</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Substitute confirmation popup */}
      {showSubstituteConfirm && staff && selectedDate && substituteStaff && createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" onClick={() => setShowSubstituteConfirm(false)}>
          <div className="animate-in zoom-in-95" style={{ maxWidth: '320px', width: 'calc(100% - 48px)', backgroundColor: '#FFFFFF', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px 16px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B', textAlign: 'center', marginBottom: '8px' }}>대타 근무자 등록하기</h3>
            <p style={{ fontSize: '14px', fontWeight: 400, letterSpacing: '-0.02em', color: '#70737B', textAlign: 'center', marginBottom: '12px', lineHeight: '1.5' }}>
              대타 근무자를 등록하시겠어요?<br />변경 일정은 해당 직원에게도 안내돼요
            </p>
            <div className="text-left text-[13px] space-y-1.5 mx-5 mb-5 p-3 rounded-xl" style={{ backgroundColor: '#F7F8FA' }}>
              <div className="flex"><span className="text-muted-foreground w-20">직원</span><span className="font-bold text-foreground">{staff.name} → <span className="text-primary">{substituteStaff.name}</span></span></div>
              <div className="flex"><span className="text-muted-foreground w-20">근무 일정</span><span className="text-foreground">{formatDateConfirm(selectedDate)} | {staff.startTime}-{staff.endTime}</span></div>
            </div>
            <div className="flex" style={{ gap: '8px', width: '100%' }}>
              <button onClick={() => setShowSubstituteConfirm(false)} className="pressable flex-1 font-semibold" style={{ height: '52px', backgroundColor: '#EBEBEB', color: '#70737B', borderRadius: '12px', fontSize: '16px', border: 'none', cursor: 'pointer' }}>취소</button>
              <button onClick={handleSubstituteConfirm} className="pressable flex-1 font-semibold" style={{ height: '52px', backgroundColor: '#4261FF', color: '#FFFFFF', borderRadius: '12px', fontSize: '16px', border: 'none', cursor: 'pointer' }}>등록하기</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
