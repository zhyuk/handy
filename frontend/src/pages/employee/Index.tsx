import { useState, useCallback, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import HomeHeader from "@/components/home/HomeHeader";
import NoticeCards from "@/components/home/NoticeCards";
import AttendanceCard, { type AttendanceStatus } from "@/components/home/employee/AttendanceCard";
import ChecklistSection from "@/components/home/employee/ChecklistSection";
import PromoBanner from "@/components/home/PromoBanner";
import StoreNotices from "@/components/home/StoreNotices";
import WeeklySchedule from "@/components/home/WeeklySchedule";
import SalaryPreview from "@/components/home/SalaryPreview";
import BottomNav from "@/components/home/employee/BottomNav";
import AttendanceMapDialog from "@/components/home/employee/AttendanceMapDialog";
import BreakConfirmDialog from "@/components/home/BreakConfirmDialog";
import UnscheduledClockInDialog from "@/components/home/UnscheduledClockInDialog";
import SideMenu from "@/components/home/SideMenu";
import { useToast } from "@/hooks/use-toast";
import AccountSelector, { type AccountType } from "@/components/home/AccountSelector";
import { breakEnd, breakStart, clockIn, clockOut, getTodayWork, getWorkStatus, getWeeklyWork, getStoreNotice } from "@/api/employee";
import { getNotification, markNotificationRead } from "@/api/public";
import { getMe, getMyStores } from "@/api/public";


const MOCK_BANNERS = [
  { id: "1", title: "전국 스키장\n리프트권 특가 모음", subtitle: "25/26 NOL 스키시즌", bgColor: "#3B82F6" },
];

const getMonthData = () => {
  const now = new Date();
  const month = `${now.getMonth() + 1}월`;
  const firstDay = `${String(now.getMonth() + 1).padStart(2, "0")}.01`;
  const today = `${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
  return {
    userName: "",
    month,
    totalAmount: 0,
    stores: [{ name: "", dateRange: `${firstDay}~${today}`, amount: 0, hours: "" }],
  };
};

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
  const [accountSelectorOpen, setAccountSelectorOpen] = useState(false);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  const [accounts, setAccounts] = useState<AccountType[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountType | null>(null);
  const [memberName, setMemberName] = useState<string>("");
  const [authLoaded, setAuthLoaded] = useState(false);

  const [notices, setNotices] = useState<any[]>([]);

  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [mapDialogType, setMapDialogType] = useState<"clock_in" | "clock_out">("clock_in");
  const [breakDialogOpen, setBreakDialogOpen] = useState(false);
  const [breakDialogType, setBreakDialogType] = useState<"start" | "end">("start");
  const [unscheduledDialogOpen, setUnscheduledDialogOpen] = useState(false);
  const [, setTick] = useState(0);

  const [workSchedule, setWorkSchedule] = useState<{ work_start: string, work_end: string } | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  const [storeNotices, setStoreNotices] = useState<any[]>([]);
  const [weeklyWork, setWeeklyWork] = useState<any[]>([]);
  const [storeLocation, setStoreLocation] = useState<{ lat: number; lng: number; radius: number } | null>(null);

  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>("before_work");
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | undefined>();
  const [breakStartTime, setBreakStartTime] = useState<string | undefined>();
  const [breakEndTime, setBreakEndTime] = useState<string | undefined>();
  const [wasLate, setWasLate] = useState(false);
  const [wasAbsent, setWasAbsent] = useState(false);

  // auth 먼저 로드 후 나머지 API 호출
  useEffect(() => {
    const initAuth = async () => {
      try {
        const [me, stores] = await Promise.all([getMe(), getMyStores()]);
        setMemberName(me.name);
        const mapped: AccountType[] = stores.map((s: any) => ({
          id: String(s.store_member_id),
          storeId: s.store_id,
          storeName: s.store_name,
          role: s.role,
          employeeType: s.employee_type ?? "",
        }));
        setAccounts(mapped); // 여기 추가
        const employeeAccount = mapped.find(a => a.role === "employee");
        const firstAccount = employeeAccount ?? mapped[0] ?? null;
        setSelectedAccount(firstAccount);
        localStorage.setItem("currentRole", firstAccount?.role ?? "employee");
        localStorage.setItem("currentStoreId", String(firstAccount?.storeId ?? ""));
      } catch (err) {
        navigate("/");
      } finally {
        setAuthLoaded(true);
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (!authLoaded || !selectedAccount) return;

    const storeId = selectedAccount.storeId;

    const fetchAll = async () => {
      const [todayWork, workStatus, weeklyWork, storeNotice, storeLocation, notifications] =
        await Promise.allSettled([
          getTodayWork(storeId),
          getWorkStatus(storeId),
          getWeeklyWork(storeId),
          getStoreNotice(storeId),
          fetch('/api/common/store/map', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ store_id: storeId }),
            credentials: 'include',
          }).then(r => r.json()),
          getNotification(true, storeId),
        ]);

      // 오늘 근무일정
      if (todayWork.status === 'fulfilled') setWorkSchedule(todayWork.value);
      setScheduleLoading(false);

      // 근무 상태
      if (workStatus.status === 'fulfilled' && workStatus.value?.status) {
        const s = workStatus.value.status;
        if (s === "working") setAttendanceStatus("working");
        else if (s === "off_work") setAttendanceStatus("off_work");
        else if (s === "on_break") setAttendanceStatus("on_break");
      }
      setStatusLoaded(true);

      // 주간 근무
      if (weeklyWork.status === 'fulfilled') setWeeklyWork(weeklyWork.value);

      // 공지사항
      if (storeNotice.status === 'fulfilled') setStoreNotices(storeNotice.value);

      // 매장 위치
      if (storeLocation.status === 'fulfilled') setStoreLocation(storeLocation.value);

      // 알림
      if (notifications.status === 'fulfilled') setNotices(notifications.value);

    };

    fetchAll();
  }, [authLoaded, selectedAccount]);

  const parseTimeToSec = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 3600 + m * 60;
  };

  const getNowTime = () => {
    const n = new Date();
    return `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
  };

  const employeeId = Number(selectedAccount?.id ?? 0);

  const handleAccountSelect = (account: AccountType) => {
    localStorage.setItem("currentRole", account.role);
    localStorage.setItem("currentStoreId", String(account.storeId));
    if (account.role === "owner") {
      navigate("/owner/home", { state: { storeMemberId: account.id } });
    } else {
      setSelectedAccount(account);
      setAccountSelectorOpen(false);
    }
  };

  const handleClockIn = useCallback(async () => {
    await clockIn(employeeId);
    setClockInTime(getNowTime());
    setAttendanceStatus("working");
    setMapDialogOpen(false);
    toast({ description: "출근을 완료 했어요. 오늘 근무도 파이팅!", duration: 2000 });
  }, [toast, employeeId]);

  const handleClockOut = useCallback(async () => {
    await clockOut(employeeId);
    setAttendanceStatus("off_work");
    setMapDialogOpen(false);
    toast({ description: "퇴근을 완료 했어요. 오늘도 수고하셨어요!", duration: 2000 });
  }, [toast, employeeId]);

  const handleBreakStart = useCallback(async () => {
    await breakStart(employeeId);
    setBreakStartTime(getNowTime());
    setAttendanceStatus("on_break");
    setBreakDialogOpen(false);
  }, [employeeId]);

  const handleBreakEnd = useCallback(async () => {
    await breakEnd(employeeId);
    setBreakEndTime(getNowTime());
    setAttendanceStatus("break_done");
    setBreakDialogOpen(false);
  }, [employeeId]);

  const handleSubstituteClockIn = useCallback(() => {
    setUnscheduledDialogOpen(true);
  }, []);

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

  const handleDismissNotice = useCallback(async (id: string) => {
    await markNotificationRead(id);
    setNotices((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const buildWeeklyDays = () => {
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const today = new Date();
    const todayDow = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - todayDow);

    return dayNames.map((dayName, i) => {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      const work = weeklyWork.find(w => w.day_of_week === i);
      const startTime = work?.work_start?.slice(0, 5);
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

  // auth 로드 전 로딩
  if (!authLoaded || !selectedAccount) {
    return (
      <div className="min-h-screen max-w-lg mx-auto flex items-center justify-center">
        <p className="text-muted-foreground text-sm">불러오는 중...</p>
      </div>
    );
  }

  const scheduleStart = workSchedule?.work_start ?? null;
  const scheduleEnd = workSchedule?.work_end ?? null;

  // console.log(selectedAccount);

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background pb-20">
      <HomeHeader
        storeName={selectedAccount.storeName}
        roleLabel={selectedAccount.role}
        hasNotifications={notices.length > 0}
        onStoreClick={() => setAccountSelectorOpen(true)}
        onMenuClick={() => setSideMenuOpen(true)}
      />

      <NoticeCards notices={notices} onDismiss={handleDismissNotice} />

      <p className="px-5 py-3" style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.02em', color: '#292B2E' }}>{formatDate()}</p>

      {(() => {
        const now = new Date();
        const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        const hasSchedule = !scheduleLoading && workSchedule !== null;
        const schedStart = hasSchedule ? workSchedule!.work_start.slice(0, 5) : null;
        const schedEnd = hasSchedule ? workSchedule!.work_end.slice(0, 5) : null;
        const schedStartSec = schedStart ? parseTimeToSec(schedStart) : null;
        const schedEndSec = schedEnd ? parseTimeToSec(schedEnd) : null;
        const isCurrentlyLate = hasSchedule && attendanceStatus === "before_work" && nowSec > schedStartSec! && nowSec < schedEndSec!;
        const isCurrentlyAbsent = hasSchedule && attendanceStatus === "before_work" && nowSec >= schedEndSec!;
        const isOvertime = hasSchedule && (attendanceStatus === "working" || attendanceStatus === "break_done") && nowSec >= schedEndSec! && !wasAbsent;

        const effectiveStatus: AttendanceStatus = !hasSchedule && attendanceStatus === "before_work"
          ? "holiday"
          : isCurrentlyAbsent ? "absent"
            : isCurrentlyLate ? "late"
              : isOvertime ? "overtime"
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

      <div className="mt-8">
        <ChecklistSection userName={memberName} storeId={selectedAccount.storeId} />
      </div>

      <div className="mt-8">
        <PromoBanner banners={MOCK_BANNERS} />
      </div>

      <div className="mt-8">
        <StoreNotices notices={storeNotices} />
      </div>

      <div className="mt-8">
        <WeeklySchedule dateRange={buildDateRange()} days={buildWeeklyDays()} />
      </div>

      <div className="mt-8 mb-8">
        <SalaryPreview
          userName={memberName}
          month={MOCK_SALARY.month}
          totalAmount={MOCK_SALARY.totalAmount}
          stores={MOCK_SALARY.stores}
        />
      </div>

      <div className="px-5 mb-8">
        <button onClick={() => navigate("/closing-report")} className="flex w-full items-center justify-between rounded-2xl bg-card p-5" style={{ boxShadow: '2px 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="text-left">
            <p className="text-xl font-bold text-foreground">마감보고</p>
            <p className="mt-1 text-sm text-muted-foreground">마감 직원은 오늘의 마감보고를 해주세요</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </button>
      </div>

      {/* <BottomNav activeTab={activeTab} onTabChange={setActiveTab} /> */}

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
        accounts={accounts}
        selectedId={selectedAccount.id}
        onSelect={handleAccountSelect}
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
      <SideMenu
        open={sideMenuOpen}
        onClose={() => setSideMenuOpen(false)}
        memberName={memberName}
        employeeType={selectedAccount?.employeeType ?? ""}
      />
    </div>
  );
};

export default Index;