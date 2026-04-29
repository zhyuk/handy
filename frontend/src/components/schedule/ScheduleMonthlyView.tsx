import { Sun, Sunset, Moon } from "lucide-react";

interface Props {
  currentDate: Date;
  selectedDay?: Date | null;
  onSelectDay: (day: Date) => void;
}

// Mock schedule data: day -> {open, middle, close}
const mockSchedule: Record<number, { open: number; middle: number; close: number }> = {};
for (let d = 1; d <= 31; d++) {
  mockSchedule[d] = { open: 1, middle: 1, close: 1 };
}
mockSchedule[1] = { open: 2, middle: 4, close: 2 };
mockSchedule[2] = { open: 1, middle: 1, close: 1 };
mockSchedule[3] = { open: 1, middle: 1, close: 1 };
mockSchedule[4] = { open: 1, middle: 1, close: 1 };

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export default function ScheduleMonthlyView({ currentDate, selectedDay, onSelectDay }: Props) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const isToday = (d: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
  const isSelected = (d: number) =>
    selectedDay && selectedDay.getFullYear() === year && selectedDay.getMonth() === month && selectedDay.getDate() === d;

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: { day: number; isOutside: boolean }[] = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, isOutside: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isOutside: false });
  }
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      cells.push({ day: i, isOutside: true });
    }
  }

  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="px-2">
      {/* Day headers */}
      <div className="grid grid-cols-7 text-center mb-1">
        {DAY_LABELS.map((label, i) => (
          <span
            key={label}
            className={`text-[13px] font-medium ${
              i === 0 ? "text-destructive" : i === 6 ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Calendar grid */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 text-center">
          {week.map((cell, ci) => {
            const schedule = !cell.isOutside ? mockSchedule[cell.day] : null;
            const dayColor = ci === 0 ? "text-destructive" : ci === 6 ? "text-primary" : "text-foreground";

            return (
              <button
                key={ci}
                onClick={() => {
                  if (!cell.isOutside && schedule) {
                    onSelectDay(new Date(year, month, cell.day));
                  }
                }}
                className={`flex flex-col items-center py-1 rounded-lg ${cell.isOutside ? "opacity-30" : ""} ${
                  !cell.isOutside && isSelected(cell.day) && !isToday(cell.day) ? "bg-primary/10" : ""
                }`}
              >
                <span
                  className={`text-[14px] flex items-center justify-center ${
                    !cell.isOutside && isToday(cell.day)
                      ? "bg-primary text-primary-foreground font-bold rounded-2xl"
                      : !cell.isOutside && isSelected(cell.day)
                        ? "text-primary font-bold"
                        : dayColor
                  }`}
                  style={!cell.isOutside && isToday(cell.day) ? { width: 42, height: 32 } : { width: 32, height: 32 }}
                >
                  {cell.day}
                </span>
                {schedule && !cell.isOutside && (
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <div className="flex items-center gap-0.5 justify-center">
                      <Sun className="w-3 h-3 text-shift-open" />
                      <span className="text-[10px] text-shift-open font-medium">{schedule.open}</span>
                    </div>
                    <div className="flex items-center gap-0.5 justify-center">
                      <Sunset className="w-3 h-3 text-shift-middle" />
                      <span className="text-[10px] text-shift-middle font-medium">{schedule.middle}</span>
                    </div>
                    <div className="flex items-center gap-0.5 justify-center">
                      <Moon className="w-3 h-3 text-shift-close" />
                      <span className="text-[10px] text-shift-close font-medium">{schedule.close}</span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
