import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  date: Date | null;
}

interface ShiftEntry {
  shift: "오픈" | "미들" | "마감";
  time: string;
  names: string[];
}

const mockEntries: ShiftEntry[] = [
  { shift: "오픈", time: "08:00 - 12:00", names: ["문자영", "문자일"] },
  { shift: "미들", time: "12:00 - 16:00", names: ["문자이", "문자삼"] },
  { shift: "미들", time: "15:00 - 19:00", names: ["문자민", "문자통"] },
  { shift: "마감", time: "18:00 - 22:00", names: ["문자사", "문자오"] },
];

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

const SHIFT_STYLE: Record<string, { bg: string; color: string }> = {
  "오픈": { bg: "#FDF9DF", color: "#FFB300" },
  "미들": { bg: "#ECFFF1", color: "#1EDC83" },
  "마감": { bg: "#E8F9FF", color: "#14C1FA" },
};

export default function ScheduleDaySheet({ open, onClose, date }: Props) {
  if (!open || !date) return null;

  const dayStr = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${DAY_NAMES[date.getDay()]})`;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-card shadow-xl animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-[16px] font-bold text-foreground">{dayStr}</h3>
          <button onClick={onClose} className="pressable p-1">
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Shift entries */}
        <div className="px-5 pb-4 space-y-4">
          {mockEntries.map((entry, i) => {
            const style = SHIFT_STYLE[entry.shift] ?? { bg: "#F7F7F8", color: "#AAB4BF" };
            return (
              <div key={i} className="flex items-start gap-3">
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: "22px",
                    borderRadius: "4px",
                    padding: "0 8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    backgroundColor: style.bg,
                    color: style.color,
                    flexShrink: 0,
                  }}
                >
                  {entry.shift}
                </span>
                <span className="text-[14px] text-muted-foreground min-w-[100px]">{entry.time}</span>
                <span className="text-[14px] text-foreground">{entry.names.join("  ")}</span>
              </div>
            );
          })}
        </div>

        {/* Confirm button */}
        <div className="px-5 pb-8 pt-2">
          <button
            onClick={onClose}
            className="pressable w-full h-14 rounded-2xl text-[16px] font-semibold"
            style={{ backgroundColor: "#4261FF", color: "#FFFFFF" }}
          >
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
