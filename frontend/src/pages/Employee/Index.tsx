import { useState, useCallback, useMemo, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import HomeHeader from "@/components/home/HomeHeader";
import NoticeCards from "@/components/home/NoticeCards";
import AttendanceCard, { type AttendanceStatus } from "@/components/home/AttendanceCard";
import ChecklistSection from "@/components/home/ChecklistSection";
import PromoBanner from "@/components/home/PromoBanner";
import StoreNotices from "@/components/home/StoreNotices";
import WeeklySchedule from "@/components/home/WeeklySchedule";
import SalaryPreview from "@/components/home/SalaryPreview";
import BottomNav from "@/components/home/BottomNav";
import AttendanceMapDialog from "@/components/home/AttendanceMapDialog";
import BreakConfirmDialog from "@/components/home/BreakConfirmDialog";
import UnscheduledClockInDialog from "@/components/home/UnscheduledClockInDialog";
import SideMenu from "@/components/home/SideMenu";
import { useToast } from "@/hooks/use-toast";
import AccountSelector, { type AccountType } from "@/components/home/AccountSelector";
import { getStoreNotices, DUMMY_POSTS } from "@/lib/boardData";
import { getWeeklyHomeData } from "@/lib/scheduleData";

const MOCK_ACCOUNTS: AccountType[] = [
  { id: "1", storeName: "메가커피 동작점", role: "직원" },
  { id: "2", storeName: "컴포즈커피 노량진역점", role: "사장님" },
  { id: "3", storeName: "빽다방 노량진역점", role: "직원" },
  { id: "4", storeName: "샤브올데이 노량진역점", role: "직원" },
];

// Mock data
const latestNotice = DUMMY_POSTS.filter(p => p.category === "공지사항")[0];
const MOCK_NOTICES = [
  { id: String(latestNotice?.id ?? 1), type: "board" as const, title: "게시판", description: latestNotice?.title ?? "새 공지가 있어요!", extraCount: 2 },
  { id: "pay-1", type: "salary" as const, title: "급여", description: `${new Date().getMonth() + 1}월 급여 명세서가 발급됐어요!`, extraCount: 2 },
];

const MOCK_CHECKLIST = [
  { id: "1", text: "오픈 전 시재 확인", checked: true },
  { id: "2", text: "발주 정리하고 13:40까지 발주 넣기", checked: true },
  { id: "3", text: "우유 날짜 보이게 정리하기", checked: false },
  { id: "4", text: "매장 청소 완료하기", checked: false },
];

const MOCK_BANNERS = [
  { id: "1", title: "전국 스키장\n리프트권 특가 모음", subtitle: "25/26 NOL 스키시즌", bgColor: "#3B82F6" },
];

const MOCK_STORE_NOTICES = getStoreNotices();

const getMonthData = () => {
  const now = new Date();
  const month = `${now.getMonth() + 1}월`;
  const firstDay = `${String(now.getMonth() + 1).padStart(2, "0")}.01`;
  const today = `${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
  return {
    userName: "정수민",
    month,
    totalAmount: 180000,
    stores: [{ name: "메가커피 동작점", dateRange: `${firstDay}~${today}`, amount: 180000, hours: "17h 30m" }],
  };
};

const MOCK_WEEKLY = getWeeklyHomeData();
const MOCK_SALARY = getMonthData();

const formatDate = () => {
  const now = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${days[now.getDay()]})`;
};

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"home" | "salary" | "attendance" | "board" | "myinfo">("home");
  const [notices, setNotices] = useState(MOCK_NOTICES);
  const [selectedAccount, setSelectedAccount] = useState<AccountType>(MOCK_ACCOUNTS[0]);
  const [accountSelectorOpen, setAccountSelectorOpen] = useState(false);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  // Dialog states
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [mapDialogType, setMapDialogType] = useState<"clock_in" | "clock_out">("clock_in");
  const [breakDialogOpen, setBreakDialogOpen] = useState(false);
  const [breakDialogType, setBreakDialogType] = useState<"start" | "end">("start");
  const [unscheduledDialogOpen, setUnscheduledDialogOpen] = useState(false);
  const [, setTick] = useState(0);

  const [workSchedule, setWorkSchedule] = useState<{ work_start: string, work_end: string } | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  const [storeNotices, setStoreNotices] = useState<any[]>([]);

  useEffect(() => {
    const getTodayWork = async () => {
      try {
        const res = await fetch('/api/employee/work', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ "employee_id": 1 })
        });

        const data = await res.json();

        if (res.ok) {
          setWorkSchedule(data);
        }


      } catch (err) {
      } finally {
        setScheduleLoading(false); // 성공/실패 모두 로딩 종료
      }
    }

    const getNotice = async () => {
      try {
        const res = await fetch('/api/employee/notice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ "store_id": 1 })
        });
        const data = await res.json();
        if (res.ok) {
          // console.log(data);
          setStoreNotices(data);
        }
      } catch (err) { }
    }

    getTodayWork();
    getNotice();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Attendance state management
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>("before_work");
  const [clockInTime, setClockInTime] = useState<string | undefined>();
  const [breakStartTime, setBreakStartTime] = useState<string | undefined>();
  const [breakEndTime, setBreakEndTime] = useState<string | undefined>();
  const [wasLate, setWasLate] = useState(false);
  const [wasAbsent, setWasAbsent] = useState(false);
  const scheduleStart = workSchedule?.work_start ?? null;
  const scheduleEnd = workSchedule?.work_end ?? null;

  const parseTimeToSec = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 3600 + m * 60;
  };

  const getNowTime = () => {
    const n = new Date();
    return `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
  };

  const handleClockIn = useCallback(() => {
    setClockInTime(getNowTime());
    setAttendanceStatus("working");
    setMapDialogOpen(false);
    toast({ description: "출근을 완료 했어요. 오늘 근무도 파이팅!", duration: 2000 });
  }, [toast]);

  const handleClockOut = useCallback(() => {
    setAttendanceStatus("off_work");
    setMapDialogOpen(false);
    toast({ description: "퇴근을 완료 했어요. 오늘도 수고하셨어요!", duration: 2000 });
  }, [toast]);

  const handleBreakStart = useCallback(() => {
    setBreakStartTime(getNowTime());
    setAttendanceStatus("on_break");
    setBreakDialogOpen(false);
  }, []);

  const handleBreakEnd = useCallback(() => {
    setBreakEndTime(getNowTime());
    setAttendanceStatus("break_done");
    setBreakDialogOpen(false);
  }, []);

  const handleSubstituteClockIn = useCallback(() => {
    // holiday: show unscheduled dialog first
    setUnscheduledDialogOpen(true);
  }, []);

  // Dialog openers
  const openClockInDialog = useCallback(() => {
    setMapDialogType("clock_in");
    setMapDialogOpen(true);
  }, []);

  const openClockOutDialog = useCallback(() => {
    setMapDialogType("clock_out");
    setMapDialogOpen(true);
  }, []);

  const openBreakStartDialog = useCallback(() => {
    setBreakDialogType("start");
    setBreakDialogOpen(true);
  }, []);

  const openBreakEndDialog = useCallback(() => {
    setBreakDialogType("end");
    setBreakDialogOpen(true);
  }, []);

  const handleDismissNotice = useCallback((id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background pb-20">
      {/* Header */}
      <HomeHeader
        storeName={selectedAccount.storeName}
        roleLabel={selectedAccount.role}
        hasNotifications={true}
        onStoreClick={() => setAccountSelectorOpen(true)}
        onMenuClick={() => setSideMenuOpen(true)}
      />

      {/* Notice cards */}
      <NoticeCards notices={notices} onDismiss={handleDismissNotice} />

      {/* Date */}
      <p className="px-5 py-3" style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.02em', color: '#292B2E' }}>{formatDate()}</p>

      {(() => {

        if (scheduleLoading) {
          return (
            <div className="mx-5 h-[180px] rounded-2xl bg-muted animate-pulse" />
          );
        }
        // 휴무 처리
        if (!scheduleStart || !scheduleEnd) {
          return (
            <AttendanceCard
              status={"day_off" as AttendanceStatus}
              scheduleStart="--:--"
              scheduleEnd="--:--"
              onClockIn={() => {
                if (isCurrentlyLate) setWasLate(true);
                openClockInDialog();
              }}
              onClockOut={() => { }}
              onBreakStart={() => { }}
              onBreakEnd={() => { }}
              onSubstituteClockIn={handleSubstituteClockIn}
            />
          );
        }

        const now = new Date();
        const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        const schedStartSec = parseTimeToSec(scheduleStart);
        const schedEndSec = parseTimeToSec(scheduleEnd);

        const isCurrentlyLate =
          attendanceStatus === "before_work" && nowSec > schedStartSec && nowSec < schedEndSec;
        const isCurrentlyAbsent =
          attendanceStatus === "before_work" &&
          nowSec >= schedEndSec &&
          !wasAbsent;
        const isOvertime =
          (attendanceStatus === "working" || attendanceStatus === "break_done") &&
          nowSec >= schedEndSec &&
          !wasAbsent;

        const effectiveStatus: AttendanceStatus = isCurrentlyAbsent
          ? "absent"
          : isCurrentlyLate
            ? "late"
            : isOvertime
              ? "overtime"
              : attendanceStatus;

        return (
          <AttendanceCard
            status={effectiveStatus}
            scheduleStart={scheduleStart}
            scheduleEnd={scheduleEnd}
            clockInTime={clockInTime}
            breakStartTime={breakStartTime}
            breakEndTime={breakEndTime}
            wasLate={wasLate || isCurrentlyLate}
            wasAbsent={wasAbsent}
            onClockIn={() => {
              if (isCurrentlyAbsent) {
                setWasAbsent(true);
                setUnscheduledDialogOpen(true);
              } else {
                if (isCurrentlyLate) setWasLate(true);
                openClockInDialog();
              }
            }}
            onClockOut={openClockOutDialog}
            onBreakStart={openBreakStartDialog}
            onBreakEnd={openBreakEndDialog}
            onSubstituteClockIn={handleSubstituteClockIn}
          />
        );
      })()}

      {/* Checklist */}
      <div className="mt-8">
        <ChecklistSection
          userName="정수민"
          items={MOCK_CHECKLIST}
          completedCount={2}
          totalCount={4}
        />
      </div>

      {/* Promo banner */}
      <div className="mt-8">
        <PromoBanner banners={MOCK_BANNERS} />
      </div>

      {/* 매장 공지사항 */}
      <div className="mt-8">
        <StoreNotices notices={storeNotices} />
      </div>

      {/* Weekly schedule */}
      <div className="mt-8">
        <WeeklySchedule dateRange={MOCK_WEEKLY.dateRange} days={MOCK_WEEKLY.days} />
      </div>

      {/* Salary preview */}
      <div className="mt-8 mb-8">
        <SalaryPreview
          userName={MOCK_SALARY.userName}
          month={MOCK_SALARY.month}
          totalAmount={MOCK_SALARY.totalAmount}
          stores={MOCK_SALARY.stores}
        />
      </div>

      {/* 마감보고 */}
      <div className="px-5 mb-8">
        <button onClick={() => navigate("/closing-report")} className="flex w-full items-center justify-between rounded-2xl bg-card p-5" style={{ boxShadow: '2px 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="text-left">
            <p className="text-xl font-bold text-foreground">마감보고</p>
            <p className="mt-1 text-sm text-muted-foreground">마감 직원은 오늘의 마감보고를 해주세요</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </button>
      </div>

      {/* Bottom nav */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Dialogs */}
      <AttendanceMapDialog
        open={mapDialogOpen}
        type={mapDialogType}
        onConfirm={mapDialogType === "clock_in" ? handleClockIn : handleClockOut}
        onCancel={() => setMapDialogOpen(false)}
      />
      <BreakConfirmDialog
        open={breakDialogOpen}
        type={breakDialogType}
        onConfirm={breakDialogType === "start" ? handleBreakStart : handleBreakEnd}
        onCancel={() => setBreakDialogOpen(false)}
      />
      <AccountSelector
        open={accountSelectorOpen}
        accounts={MOCK_ACCOUNTS}
        selectedId={selectedAccount.id}
        onSelect={(account) => {
          setSelectedAccount(account);
          setAccountSelectorOpen(false);
        }}
        onClose={() => setAccountSelectorOpen(false)}
      />
      <UnscheduledClockInDialog
        open={unscheduledDialogOpen}
        onConfirm={() => {
          setUnscheduledDialogOpen(false);
          openClockInDialog();
        }}
        onCancel={() => setUnscheduledDialogOpen(false)}
      />
      <SideMenu open={sideMenuOpen} onClose={() => setSideMenuOpen(false)} />
    </div>
  );
};

export default Index;
