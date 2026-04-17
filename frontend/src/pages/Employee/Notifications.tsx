import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DUMMY_POSTS } from "@/lib/boardData";
import { getNotice } from "@/api/public";

type NotificationCategory = "전체" | "급여" | "일정" | "게시판" | "공지";

interface NotificationItem {
  id: string;
  category: "급여" | "게시판" | "일정" | "공지";
  date: string;
  message: string;
  link?: string;
}

// 최신 공지사항 게시글
const latestBoardNotice = DUMMY_POSTS.filter(p => p.category === "공지사항")[0];

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: "1", category: "급여", date: "03.01(일) 오전 09:01", message: "11월 급여 명세서가 발급됐어요", link: "/salary/pay-stub/1" },
  { id: "2", category: "게시판", date: "03.01(일) 오전 09:01", message: `사장님이 새로운 공지를 작성했어요`, link: `/board/${latestBoardNotice?.id ?? 1}` },
  { id: "3", category: "일정", date: "03.01(일) 오전 09:01", message: "기존 일정이 변경 되었어요", link: "/notifications/schedule-changed" },
  { id: "4", category: "일정", date: "03.01(일) 오전 09:01", message: "새로운 일정이 추가 되었어요", link: "/notifications/schedule-added" },
  { id: "5", category: "공지", date: "03.01(일) 오전 09:01", message: "(광고) GS25 제휴 기념 특별 이벤트", link: "/announcements/1" },
];

const filters: NotificationCategory[] = ["전체", "급여", "일정", "게시판", "공지"];

const getFilterWidth = (label: string) => label.length <= 2 ? '48px' : '60px';
const getTagWidth = (label: string) => label.length <= 2 ? '32px' : '44px';

const Notifications = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<NotificationCategory>("전체");

  const filteredNotifications = activeFilter === "전체"
    ? MOCK_NOTIFICATIONS
    : MOCK_NOTIFICATIONS.filter((n) => n.category === activeFilter);

  const handleNotificationClick = (notification: NotificationItem) => {
    if (notification.link) navigate(notification.link);
  };

  return (
    <div className="mx-auto min-h-screen max-w-[430px]" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="flex items-center gap-2 px-2 pt-4 pb-2 sticky top-0 z-10" style={{ backgroundColor: '#FFFFFF' }}>
        <button onClick={() => navigate(-1)} className="p-1 flex-shrink-0">
          <ChevronLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B' }}>알림</h1>
      </div>
      <div className="border-b border-border" />

      <div style={{ backgroundColor: '#F7F7F8', minHeight: '100vh' }}>
        <div className="flex px-5 py-3 overflow-x-auto" style={{ gap: '8px' }}>
          {filters.map((filter) => (
            <button key={filter} onClick={() => setActiveFilter(filter)}
              style={{
                width: getFilterWidth(filter), height: '28px', flexShrink: 0,
                borderRadius: '9999px', border: `1px solid ${activeFilter === filter ? '#4261FF' : '#DBDCDF'}`,
                backgroundColor: activeFilter === filter ? '#E8F3FF' : '#FFFFFF',
                fontSize: '14px', fontWeight: 600, letterSpacing: '-0.02em',
                color: activeFilter === filter ? '#4261FF' : '#AAB4BF',
              }}>
              {filter}
            </button>
          ))}
        </div>

        <p className="px-5 pb-2" style={{ fontSize: '12px', fontWeight: 400, letterSpacing: '-0.02em', color: '#93989E' }}>
          *알림은 30일 후 자동으로 삭제돼요
        </p>

        {filteredNotifications.length === 0 ? (
          <div className="flex flex-1 items-center justify-center pt-48">
            <p className="text-base text-muted-foreground">등록된 알림이 없어요</p>
          </div>
        ) : (
          <div className="flex flex-col px-5 pb-8" style={{ gap: '12px' }}>
            {filteredNotifications.map((notification) => (
              <button key={notification.id} onClick={() => handleNotificationClick(notification)}
                style={{
                  width: '100%', minHeight: '74px', backgroundColor: '#FFFFFF',
                  borderRadius: '12px', boxShadow: '2px 2px 12px rgba(0,0,0,0.06)',
                  padding: '16px', textAlign: 'left', display: 'flex',
                  flexDirection: 'column', justifyContent: 'center', gap: '4px',
                  cursor: notification.link ? 'pointer' : 'default',
                }}>
                <div className="flex items-center" style={{ gap: '8px' }}>
                  <span style={{
                    width: getTagWidth(notification.category), height: '24px',
                    backgroundColor: '#E8F3FF', borderRadius: '4px',
                    fontSize: '14px', fontWeight: 500, letterSpacing: '-0.02em', color: '#4261FF',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {notification.category}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 400, letterSpacing: '-0.02em', color: '#93989E' }}>
                    {notification.date}
                  </span>
                </div>
                <p style={{
                  fontSize: '16px', fontWeight: 500, letterSpacing: '-0.02em', color: '#292B2E',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%',
                }}>
                  {notification.message}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
