import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const notices = [
  { id: 1, title: "[공지] 설날 연휴 고객센터 운영 안내", date: "2025.10.20" },
  { id: 2, title: "[공지] 서비스 이용약관 개정 안내", date: "2025.10.19" },
  { id: 3, title: "[공지] 설날 연휴 고객센터 운영 안내", date: "2025.10.18" },
  { id: 4, title: "[공지] 설날 연휴 고객센터 운영 안내", date: "2025.10.17" },
  { id: 5, title: "[공지] 설날 연휴 고객센터 운영 안내", date: "2025.10.16" },
  { id: 6, title: "[공지] 설날 연휴 고객센터 운영 안내", date: "2025.10.15" },
];

const Announcements = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen max-w-lg mx-auto" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-2 pt-4 pb-2 sticky top-0 z-10" style={{ backgroundColor: '#FFFFFF' }}>
        <button onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B' }}>공지사항</h1>
      </div>
      <div className="border-b border-border" />

      {/* List */}
      <div style={{ backgroundColor: '#F7F7F8', minHeight: '100vh' }}>
        <div className="px-5 pt-4 pb-8 flex flex-col gap-3">
          {notices.map((notice) => (
            <button key={notice.id} onClick={() => navigate(`/announcements/${notice.id}`)}
              className="w-full flex items-center justify-between rounded-2xl bg-white px-5 py-4"
              style={{ boxShadow: '2px 2px 12px rgba(0,0,0,0.06)', textAlign: 'left' }}>
              <div className="flex-1 min-w-0 pr-3">
                <p style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.02em', color: '#19191B' }} className="truncate">{notice.title}</p>
                <p style={{ fontSize: '13px', fontWeight: 400, letterSpacing: '-0.02em', color: '#AAB4BF' }} className="mt-1">{notice.date}</p>
              </div>
              <ChevronRight className="h-5 w-5 flex-shrink-0" style={{ color: '#AAB4BF' }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Announcements;
