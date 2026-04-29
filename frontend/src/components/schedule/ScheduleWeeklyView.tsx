import { ChevronRight } from "lucide-react";
import { useDragScroll } from "@/hooks/useDragScroll";

interface Props {
  currentDate: Date;
  onSelectStaff: (day: Date) => void;
  onSelectDay?: (day: Date) => void;
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

interface StaffSchedule {
  name: string;
  shifts: string[];
  startHour: number;
  endHour: number;
  barColor: string;
}

const mockStaff: StaffSchedule[] = [
  { name: "문자영", shifts: ["오픈"], startHour: 9, endHour: 10, barColor: "bg-shift-open-bg" },
  { name: "정수민", shifts: ["오픈", "미들"], startHour: 9, endHour: 13, barColor: "bg-shift-open-bg" },
  { name: "김정민", shifts: ["오픈", "미들", "마감"], startHour: 9, endHour: 23, barColor: "bg-shift-open-bg" },
  { name: "키키치", shifts: ["미들"], startHour: 12, endHour: 16, barColor: "bg-shift-middle-bg" },
  { name: "감자숭이", shifts: ["미들", "마감"], startHour: 13, endHour: 17, barColor: "bg-shift-middle-bg" },
  { name: "쿠숭이", shifts: ["마감"], startHour: 8, endHour: 14, barColor: "bg-shift-close-bg" },
];

const HOURS = Array.from({ length: 17 }, (_, i) => i + 8); // 08:00 ~ 24:00
const HOUR_WIDTH = 60;
const LEFT_COLUMN = 120;

function getShiftTextColor(shifts: string[]) {
  if (shifts.includes("마감") && !shifts.includes("오픈")) {
    if (shifts.includes("미들")) return "text-shift-middle";
    return "text-shift-close";
  }
  if (shifts.includes("미들") && !shifts.includes("오픈")) return "text-shift-middle";
  return "text-shift-open";
}

function getShiftBgClass(shifts: string[]) {
  if (shifts.includes("마감") && !shifts.includes("오픈")) {
    if (shifts.includes("미들")) return "bg-shift-middle-bg";
    return "bg-shift-close-bg";
  }
  if (shifts.includes("미들") && !shifts.includes("오픈")) return "bg-shift-middle-bg";
  return "bg-shift-open-bg";
}

export default function ScheduleWeeklyView({ currentDate, onSelectStaff, onSelectDay }: Props) {
  const scrollRef = useDragScroll<HTMLDivElement>();

  // Get week days (Mon-Sun)
  const dayOfWeek = currentDate.getDay();
  const sunday = new Date(currentDate);
  sunday.setDate(currentDate.getDate() - dayOfWeek);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });

  const isSelectedDay = (d: Date) =>
    d.getFullYear() === currentDate.getFullYear() &&
    d.getMonth() === currentDate.getMonth() &&
    d.getDate() === currentDate.getDate();

  const today = new Date();
  const isTodayDate = (d: Date) =>
    d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();


  return (
    <div>
      {/* Week day selector */}
      <div className="flex items-center justify-around px-5 pb-3">
        {weekDays.map((d, i) => {
          const isToday = isTodayDate(d);
          const selected = isSelectedDay(d);
          const isSun = i === 0;
          const isSat = i === 6;
          const dayColor = isSun ? "text-destructive" : isSat ? "text-primary" : "text-muted-foreground";
          const dateColor = isSun ? "text-destructive" : isSat ? "text-primary" : "text-foreground";
          return (
            <button key={i} className="flex flex-col items-center gap-1" onClick={() => onSelectDay?.(d)}>
              <span className={`text-[13px] ${dayColor}`}>
                {DAY_LABELS[i]}
              </span>
              <div
                className={`flex items-center justify-center rounded-2xl ${
                  isToday ? "bg-primary" : selected ? "bg-primary/15" : ""
                }`}
                style={{ width: 50, height: 54 }}
              >
                <span className={`text-[15px] font-medium ${isToday ? "text-primary-foreground" : selected ? "text-primary" : dateColor}`}>
                  {d.getDate()}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="relative flex">
        {/* Left fixed column */}
        <div className="flex-shrink-0" style={{ width: LEFT_COLUMN }}>
          {/* Time header placeholder */}
          <div className="h-8" />
          {/* Staff rows */}
          {mockStaff.map((staff, i) => (
            <button
              key={i}
              onClick={() => onSelectStaff(currentDate)}
              className="h-16 flex flex-col justify-center px-4 text-left"
            >
              <span className={`text-[12px] font-medium ${getShiftTextColor(staff.shifts)}`}>
                {staff.shifts.join(", ")}
              </span>
              <span className="text-[14px] font-medium text-foreground flex items-center gap-0.5">
                {staff.name} <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </span>
            </button>
          ))}
        </div>

        {/* Scrollable timeline */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto scrollbar-hide"
        >
          <div style={{ width: HOURS.length * HOUR_WIDTH }}>
            {/* Hour headers */}
            <div className="flex h-8 items-end border-b border-border">
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="text-[12px] text-muted-foreground"
                  style={{ width: HOUR_WIDTH }}
                >
                  {h.toString().padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {/* Staff bars */}
            {mockStaff.map((staff, i) => (
              <div key={i} className="h-16 relative flex items-center">
                {/* Grid lines */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="absolute top-0 bottom-0 border-l border-border/50"
                    style={{ left: (h - 8) * HOUR_WIDTH }}
                  />
                ))}
                {/* Bar */}
                <div
                  className={`absolute h-8 rounded-md ${getShiftBgClass(staff.shifts)}`}
                  style={{
                    left: (staff.startHour - 8) * HOUR_WIDTH,
                    width: (staff.endHour - staff.startHour) * HOUR_WIDTH,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
