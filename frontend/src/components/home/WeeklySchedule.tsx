import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DaySchedule {
  day: string;
  date: number;
  isToday: boolean;
  isWeekend: boolean;
  startTime?: string;
  endTime?: string;
}

interface WeeklyScheduleProps {
  dateRange: string;
  days: DaySchedule[];
}

const getShiftLabel = (start?: string): string | null => {
  if (!start) return null;
  const hour = parseInt(start.split(":")[0], 10);
  if (hour < 12) return "오픈";
  if (hour < 17) return "미들";
  return "마감";
};

const WeeklySchedule = ({ dateRange, days }: WeeklyScheduleProps) => {
  const navigate = useNavigate();
  return (
    <div className="px-5">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p style={{ fontSize: 'clamp(17px, 4.5vw, 22px)', fontWeight: 700, letterSpacing: '-0.01em', color: '#1E1E1E' }}>이번주</p>
          <p style={{ fontSize: 'clamp(17px, 4.5vw, 22px)', fontWeight: 700, letterSpacing: '-0.01em', color: '#1E1E1E' }}>
            <span style={{ color: '#4261FF' }}>근무 일정</span>이에요{" "}
            <span className="text-sm font-normal text-[hsl(var(--schedule-date-range))]">({dateRange})</span>
          </p>
        </div>
        <button onClick={() => navigate("/schedule")} className="flex items-center text-xs text-muted-foreground mb-0.5">
          더보기 <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="rounded-2xl bg-card overflow-hidden" style={{ boxShadow: '2px 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}>
          <div style={{ minWidth: 490 }}>
            {/* Day + Date row */}
            <div className="flex pt-4 pb-3 px-1">
              {days.map((d) => {
                const isSat = d.day === "토";
                const isSun = d.day === "일";
                const color = d.isToday
                  ? "text-white"
                  : isSat
                    ? "text-[hsl(var(--schedule-sat))]"
                    : isSun
                      ? "text-[hsl(var(--schedule-sun))]"
                      : "text-[hsl(var(--schedule-day))]";

                return (
                  <div key={d.day} className="flex flex-1 flex-col items-center">
                    {d.isToday ? (
                      <div className="flex flex-col items-center justify-center bg-[hsl(var(--role-badge))]" style={{ width: 40, height: 54, borderRadius: 10 }}>
                        <span className="text-base font-medium text-white">{d.day}</span>
                        <span className="text-base font-semibold text-white mt-0.5">{d.date}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center" style={{ width: 40, height: 54 }}>
                        <span className={`text-base font-medium ${color}`}>{d.day}</span>
                        <span className={`text-base font-semibold ${color} mt-0.5`}>{d.date}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Full-width divider */}
            <div className="h-px bg-[hsl(var(--checklist-divider))] mx-4" />

            {/* Shift labels row */}
            <div className="flex pt-3 pb-2 px-1">
              {days.map((d) => {
                const shiftLabel = getShiftLabel(d.startTime);
                return (
                  <div key={d.day + "shift"} className="flex flex-1 justify-center">
                    <span className="rounded bg-[hsl(var(--schedule-shift-bg))] px-2.5 py-1 text-xs font-medium text-[hsl(var(--schedule-shift-text))]">
                      {shiftLabel || "무일정"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Times row */}
            <div className="flex pb-4 px-1">
              {days.map((d) => (
                <div key={d.day + "time"} className="flex flex-1 flex-col items-center justify-center" style={{ minHeight: 36 }}>
                  {d.startTime ? (
                    <>
                      <span className="text-sm font-medium text-[hsl(var(--schedule-time))] leading-relaxed">{d.startTime}</span>
                      <span className="text-sm font-medium text-[hsl(var(--schedule-time))] leading-relaxed">{d.endTime}</span>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-[hsl(var(--schedule-time))] leading-relaxed">-</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;
