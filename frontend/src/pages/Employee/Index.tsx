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
import { breakEnd, breakStart, clockIn, clockOut } from "@/api/employee";
import { getCurrentLocation } from "@/utils/gps";
import { getDistanceMeters } from "@/utils/distance";

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

  // 당일 근무일정 조회
  const [workSchedule, setWorkSchedule] = useState<{ work_start: string, work_end: string } | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  // 공지사항
  const [storeNotices, setStoreNotices] = useState<any[]>([]);

  const [weeklyWork, setWeeklyWork] = useState<any[]>([]);

  // 매장 위치 정보
  const [storeLocation, setStoreLocation] = useState<{ lat: number; lng: number; radius: number } | null>(null);


  useEffect(() => {
    const getTodayWork = async () => {
      try {
        const res = await fetch('/api/employee/work/today', {
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

    const getWeeklyWork = async () => {
      try {
        const res = await fetch('/api/employee/work', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employee_id: 1, store_id: 1 })
        });
        const data = await res.json();
        if (res.ok) setWeeklyWork(data);
      } catch (err) { }
    };

    const getWorkStatus = async () => {
      try {
        const res = await fetch('/api/employee/work/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employee_id: 1 })
        });
        const data = await res.json();

        if (res.ok && data.status) {
          if (data.status === "working") setAttendanceStatus("working");
          else if (data.status === "off_work") setAttendanceStatus("off_work");
          else if (data.status === "on_break") setAttendanceStatus("on_break");
        }
      } catch (err) {
      } finally {
        setStatusLoaded(true);
      }
    };

    const getStoreLocation = async () => {
      try {
        const res = await fetch('/api/common/store/map', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ store_id: 1 })
        });
        const data = await res.json();
        if (res.ok) setStoreLocation(data);
      } catch (err) { }
    };

    getTodayWork();
    getNotice();
    getWeeklyWork();
    getWorkStatus();
    getStoreLocation();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Attendance state management
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>("before_work");
  const [statusLoaded, setStatusLoaded] = useState(false);
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

  const handleClockIn = useCallback(async () => {
    await clockIn(1);
    setClockInTime(getNowTime());
    setAttendanceStatus("working");
    setMapDialogOpen(false);
    toast({ description: "출근을 완료 했어요. 오늘 근무도 파이팅!", duration: 2000 });
  }, [toast]);

  const handleClockOut = useCallback(async () => {
    await clockOut(1);
    setAttendanceStatus("off_work");
    setMapDialogOpen(false);
    toast({ description: "퇴근을 완료 했어요. 오늘도 수고하셨어요!", duration: 2000 });
  }, [toast]);

  const handleBreakStart = useCallback(async () => {
    await breakStart(1);
    setBreakStartTime(getNowTime());
    setAttendanceStatus("on_break");
    setBreakDialogOpen(false);
  }, []);

  const handleBreakEnd = useCallback(async () => {
    await breakEnd(1);
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

  // MOCK_WEEKLY 대신 실데이터로 변환하는 함수
  const buildWeeklyDays = () => {
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const today = new Date();
    const todayDow = today.getDay(); // 0=일요일

    // 이번주 일요일 기준으로 날짜 계산
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - todayDow);

    return dayNames.map((dayName, i) => {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);

      const work = weeklyWork.find(w => w.day_of_week === i);
      const startTime = work?.work_start?.slice(0, 5); // "10:00:00" → "10:00"
      const endTime = work?.work_end?.slice(0, 5);

      return {
        day: dayName,
        date: date.getDate(),
        isToday: i === todayDow,
        isWeekend: i === 0 || i === 6,
        startTime,
        endTime,
      };
    });
  };

  const buildDateRange = () => {
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay());
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);

    const fmt = (d: Date) =>
      `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
    return `${fmt(sunday)}~${fmt(saturday)}`;
  };

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
        const now = new Date();
        const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

        // 오늘 근무 일정 있는지 확인
        const hasSchedule = !scheduleLoading && workSchedule !== null;

        // 스케줄 있으면 파싱, 없으면 null
        const schedStart = hasSchedule ? workSchedule!.work_start.slice(0, 5) : null; // "10:00"
        const schedEnd = hasSchedule ? workSchedule!.work_end.slice(0, 5) : null;

        const schedStartSec = schedStart ? parseTimeToSec(schedStart) : null;
        const schedEndSec = schedEnd ? parseTimeToSec(schedEnd) : null;

        const isCurrentlyLate = hasSchedule && attendanceStatus === "before_work" && nowSec > schedStartSec! && nowSec < schedEndSec!;
        const isCurrentlyAbsent = hasSchedule && attendanceStatus === "before_work" && nowSec >= schedEndSec!;
        const isOvertime = hasSchedule && (attendanceStatus === "working" || attendanceStatus === "break_done") && nowSec >= schedEndSec! && !wasAbsent;

        const effectiveStatus: AttendanceStatus = !hasSchedule && attendanceStatus === "before_work"
          ? "holiday"
          : isCurrentlyAbsent
            ? "absent"
            : isCurrentlyLate
              ? "late"
              : isOvertime
                ? "overtime"
                : attendanceStatus;

        return (
          <AttendanceCard
            status={effectiveStatus}
            scheduleStart={schedStart ?? undefined}
            scheduleEnd={schedEnd ?? undefined}
            clockInTime={clockInTime}
            breakStartTime={breakStartTime}
            breakEndTime={breakEndTime}
            wasLate={wasLate || isCurrentlyLate}
            wasAbsent={wasAbsent}
            onClockIn={() => {
              if (!hasSchedule) {
                // 무일정 출근
                setUnscheduledDialogOpen(true);
              } else if (isCurrentlyAbsent) {
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
        <WeeklySchedule dateRange={buildDateRange()} days={buildWeeklyDays()} />
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
        storeLat={storeLocation?.lat ?? 0}
        storeLng={storeLocation?.lng ?? 0}
        storeRadius={storeLocation?.radius ?? 100}
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
