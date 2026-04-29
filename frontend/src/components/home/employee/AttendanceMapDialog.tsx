import { useState, useRef, useCallback, useEffect } from "react";

interface AttendanceMapDialogProps {
  open: boolean;
  type: "clock_in" | "clock_out";
  onConfirm: () => void;
  onCancel: () => void;
}

const STORE_CENTER = { x: 50, y: 50 };
const STORE_RADIUS = 18;

const AttendanceMapDialog = ({ open, type, onConfirm, onCancel }: AttendanceMapDialogProps) => {
  const [userPos, setUserPos] = useState({ x: 65, y: 65 });
  const [isDragging, setIsDragging] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const distance = Math.sqrt(
    Math.pow(userPos.x - STORE_CENTER.x, 2) + Math.pow(userPos.y - STORE_CENTER.y, 2)
  );
  const isInRange = distance <= STORE_RADIUS;

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setUserPos({ x, y });
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX, e.clientY);
  }, [updatePosition]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX, e.clientY);
  }, [isDragging, updatePosition]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (open) setUserPos({ x: 65, y: 65 });
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div
        className="w-full animate-in zoom-in-95"
        style={{ maxWidth: '335px', width: 'calc(100% - 40px)', backgroundColor: '#FFFFFF', borderRadius: '20px', overflow: 'hidden', padding: '0' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B', textAlign: 'center', padding: '30px 20px 20px' }}>
          {type === "clock_in" ? "출근하기" : "퇴근하기"}
        </h2>

        {/* Map area */}
        <div style={{ padding: '0 20px' }}>
          <div
            ref={mapRef}
            className="relative h-72 w-full overflow-hidden rounded-2xl bg-muted"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{ touchAction: "none", cursor: isDragging ? "grabbing" : "grab" }}
          >
            <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
              {[20, 40, 60, 80].map((y) => (
                <line key={`h-${y}`} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="hsl(var(--border))" strokeWidth="1" />
              ))}
              {[20, 40, 60, 80].map((x) => (
                <line key={`v-${x}`} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="hsl(var(--border))" strokeWidth="1" />
              ))}
            </svg>

            <div
              className="absolute rounded-full border-2 border-muted-foreground/20 bg-muted-foreground/10"
              style={{ left: `${STORE_CENTER.x}%`, top: `${STORE_CENTER.y}%`, width: `${STORE_RADIUS * 2}%`, height: `${STORE_RADIUS * 2}%`, transform: "translate(-50%, -50%)" }}
            />

            <div
              className="absolute flex flex-col items-center"
              style={{ left: `${STORE_CENTER.x}%`, top: `${STORE_CENTER.y}%`, transform: "translate(-50%, -100%)" }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground shadow-md">
                <div className="h-3 w-3 rounded-full bg-card" />
              </div>
              <div className="h-2 w-0.5 bg-foreground" />
            </div>

            <div
              className="absolute"
              style={{ left: `${userPos.x}%`, top: `${userPos.y}%`, transform: "translate(-50%, -50%)" }}
            >
              <div className="relative flex h-6 w-6 items-center justify-center">
                <div className="absolute h-6 w-6 animate-ping rounded-full bg-primary/30" />
                <div className="relative h-4 w-4 rounded-full border-2 border-card bg-primary shadow-md" />
              </div>
            </div>

            <div className="absolute bottom-3 left-3 rounded-lg bg-card/90 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              드래그하여 위치를 이동하세요
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ height: '0.5px', backgroundColor: '#AAB4BF', margin: '20px 20px 0' }} />
        <div className="flex" style={{ gap: '10px', padding: '20px 20px 20px' }}>
          <button
            onClick={onCancel}
            className="flex-1 font-semibold text-sm"
            style={{ height: '56px', backgroundColor: '#DEEBFF', color: '#4261FF', borderRadius: '10px' }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={!isInRange}
            className="flex-1 font-semibold text-sm"
            style={{ height: '56px', backgroundColor: isInRange ? '#4261FF' : '#E5E7EB', color: isInRange ? '#FFFFFF' : '#9CA3AF', borderRadius: '10px' }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceMapDialog;