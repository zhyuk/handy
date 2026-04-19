import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { markNotificationRead } from "@/api/public";

interface NoticeCard {
  id: string;
  type: string;
  title: string;
  description: string;
  reference_id?: number;
}

interface NoticeCardsProps {
  notices: NoticeCard[];
  onDismiss: (id: string) => void;
}

const getLink = (type: string, message: string, referenceId?: number) => {
  if (type === "게시판") return `/board/${referenceId}`;
  if (type === "급여") return `/employee/salary/pay-stub/${referenceId}`;
  if (type === "공지") return `/announcements/${referenceId}`;
  if (type === "일정") {
    if (message.includes("변경")) return `/notifications/schedule-changed/${referenceId}`;
    if (message.includes("추가")) return `/notifications/schedule-added/${referenceId}`;
  }
  return undefined;
};

const NoticeCards = ({ notices, onDismiss }: NoticeCardsProps) => {
  const navigate = useNavigate();
  if (notices.length === 0) return null;

  const handleRead = async (notice: NoticeCard) => {
    await markNotificationRead(notice.id);
    onDismiss(notice.id);
  };

  const handleClick = async (notice: NoticeCard) => {
    await markNotificationRead(notice.id);
    onDismiss(notice.id);
    const link = getLink(notice.type, notice.description, notice.reference_id);
    if (link) navigate(link);
  };

  return (
    <div className="flex gap-2 overflow-x-auto px-5 pb-2 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}>
      {notices.map((notice) => (
        <div
          key={notice.id}
          onClick={() => handleClick(notice)}
          className="relative flex shrink-0 flex-col justify-between rounded-xl bg-[hsl(var(--notice-card-bg))] p-3 cursor-pointer"
          style={{ width: 155, height: 104 }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); handleRead(notice); }}
            className="absolute right-2.5 top-2.5"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <div className="pr-5">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs">{notice.type === "급여" ? "📁" : "📌"}</span>
              <span className="text-sm font-semibold text-[hsl(var(--role-badge))]">{notice.title}</span>
            </div>
            <p className="text-sm font-medium text-foreground leading-snug">{notice.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NoticeCards;