import { useEffect, useRef, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { NavToastProvider } from "@/hooks/use-nav-toast";
import Test from "@/pages/Test";

import ScrollToTop from "@/utils/scrollToTop"

import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Signup from "@/pages/signup/Signup";
import AuthGuard from "@/components/AuthGuard";

import CodeVerifyPage from "@/pages/signup/CodeVerify";
import PasswordPage from "@/pages/signup/PasswordPage";
import ProfileInfoPage from "@/pages/signup/ProfileInfoPage";
import ProfilePhotoPage from "@/pages/signup/ProfilePhotoPage";
import SignupCompletePage from "@/pages/signup/SignupCompletePage";

import PublicIndex from "@/pages/Index";
import EmployeeHome from "@/pages/employee/Index"
import OwnerHome from "./pages/owner/Index";

import EmployeeBusinessVerify from "@/pages/employee/StoreRegistration";
import OwnerBusinessVerify from "@/pages/owner/BusinessVerify";
import OwnerBusinessVerifyUpload from "@/pages/owner/BusinessVerifyUpload";

import BoardList from "./pages/BoardList";
import BoardDetail from "./pages/BoardDetail";
import BoardWrite from "./pages/BoardWrite";

import Announcements from "./pages/Announcements";
import AnnouncementDetail from "./pages/AnnouncementDetail";
import EmployeeAttendanceManagement from "./pages/employee/AttendanceManagement";
import AttendanceRecordEdit from "./pages/AttendanceRecordEdit";
import EmployeeSalaryManagement from "./pages/employee/SalaryManagement";
import Schedule from "./pages/employee/Schedule";
import ScheduleChangeRequest from "./pages/employee/ScheduleChangeRequest";
import ClosingReport from "./pages/employee/ClosingReport";
import PayStubDetail from "./pages/employee/PayStubDetail";
import Feedback from "./pages/Feedback";
import FeedbackDetail from "./pages/FeedbackDetail";
import FAQ from "./pages/FAQ";
import Notifications from "./pages/Notifications";
import NotificationScheduleChanged from "./pages/NotificationScheduleChanged";
import NotificationScheduleAdded from "./pages/NotificationScheduleAdded";
import EmployeeProfile from "./pages/employee/Profile";
import EmployeeProfileEdit from "./pages/employee/ProfileEdit";
import PasswordChange from "./pages/PasswordChange";
import VacationRequest from "./pages/VacationRequest";
import Withdrawal from "./pages/Withdrawal";
import StoreInfo from "./pages/owner/StoreInfo";
import StoreInfoEdit from "./pages/owner/StoreInfoEdit";
import StoreHours from "./pages/owner/StoreHours";
import StoreHoursParts from "./pages/owner/StoreHoursParts";
import AttendanceStandard from "./pages/owner/AttendanceStandard";
import StoreDelete from "./pages/owner/StoreDelete";
import BottomNav from "./components/home/employee/BottomNav";
import BottomNavBar from "./components/home/owner/BottomNavBar";
import StaffManagement from "./pages/owner/StaffManagement";
import StaffDetail from "./pages/owner/StaffDetail";
import StaffEdit from "./pages/owner/StaffEdit";
import OwnerSalaryManagement from "./pages/owner/SalaryManagement";
import OwnerSalaryDetail from "./pages/owner/SalaryDetail";
import OwnerSalaryDetailEdit from "./pages/owner/SalaryDetailEdit";
import PayslipDetail from "./pages/owner/PayslipDetail";
import PayslipEdit from "./pages/owner/PayslipEdit";
import PayslipPublish from "./pages/owner/PayslipPublish";
import SalesManagement from "./pages/owner/SalesManagement";
import SalesDailyDetail from "./pages/owner/SalesDailyDetail";
import SalesMonthlyDetail from "./pages/owner/SalesMonthlyDetail";
import OwnerProfile from "./pages/owner/Profile";
import OwnerProfileEdit from "./pages/owner/ProfileEdit";
import AccountWithdrawal from "./pages/owner/AccountWithdrawal";
import OwnerAttendanceManagement from "./pages/owner/AttendanceManagement";
import OwnerAttendanceEdit from "./pages/owner/AttendanceEdit";
import OwnerAttendanceDetail from "./pages/owner/AttendanceDetail";
import OwnerScheduleManagement from "./pages/owner/ScheduleManagement";

const queryClient = new QueryClient();

const OWNER_NAV_ROOTS = ["/owner/home", "/owner/staff", "/owner/salary", "/owner/sales", "/owner/store", "/owner/board", "/owner/schedule", "/owner/attendance", "/board", "/owner/profile"];
const EMPLOYEE_NAV_ROOTS = ["/employee/home", "/attendance", "/schedule", "/board", "/employee/salary", "/employee/profile"];
const FADE_ROOTS = [...OWNER_NAV_ROOTS, ...EMPLOYEE_NAV_ROOTS];

const isFadeRoot = (path: string) => FADE_ROOTS.some((p) => path === p);
const showBottomNav = (path: string) => FADE_ROOTS.some((p) => path === p);

const getEmployeeActiveTab = (pathname: string): "home" | "salary" | "attendance" | "board" | "myinfo" => {
  if (pathname === "/employee/home") return "home";
  if (pathname === "/employee/salary") return "salary";
  if (pathname === "/attendance") return "attendance";
  if (pathname === "/board") return "board";
  if (pathname === "/employee/profile") return "myinfo";
  return "home";
};

const GlobalBottomNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(
    () => localStorage.getItem("currentRole") ?? "employee"
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setOverlayOpen(document.body.hasAttribute('data-overlay-open'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-overlay-open'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setCurrentRole(localStorage.getItem("currentRole") ?? "employee");
  }, [pathname]);

  if (!showBottomNav(pathname) || overlayOpen) return null;

  const isOwner = currentRole === "owner";
  if (isOwner) return <BottomNavBar />;

  const activeTab = getEmployeeActiveTab(pathname);
  return (
    <BottomNav
      activeTab={activeTab}
      onTabChange={(tab) => {
        if (tab === "home") navigate("/employee/home");
        else if (tab === "salary") navigate("/employee/salary");
        else if (tab === "attendance") navigate("/attendance");
        else if (tab === "board") navigate("/board");
        else if (tab === "myinfo") navigate("/employee/profile");
      }}
    />
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  const currentPath = location.pathname;
  const from = prevPath.current;

  useEffect(() => { prevPath.current = currentPath; });

  const getAnimClass = () => {
    if (isFadeRoot(currentPath) && isFadeRoot(from)) return "page-fade-enter";
    return "page-enter";
  };

  const [animDone, setAnimDone] = useState(false);
  useEffect(() => {
    setAnimDone(false);
    const t = setTimeout(() => setAnimDone(true), 290);
    return () => clearTimeout(t);
  }, [location.key]);

  return (
    <div key={location.key} className={`${getAnimClass()}${animDone ? " page-enter-done" : ""}`}>
      <Routes location={location}>
        <Route path="/test" element={<Test />} />

        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<CodeVerifyPage />} />
        <Route path="/password" element={<PasswordPage />} />
        <Route path="/profile-info" element={<ProfileInfoPage />} />
        <Route path="/profile-photo" element={<ProfilePhotoPage />} />
        <Route path="/signup-complete" element={<SignupCompletePage />} />
        <Route path="/onboarding/member-type" element={<PublicIndex />} />

        {/* ===== 공통 기능 ===== */}
        <Route path="/board" element={<AuthGuard><BoardList /></AuthGuard>} />
        <Route path="/board/write" element={<AuthGuard><BoardWrite /></AuthGuard>} />
        <Route path="/board/:id" element={<AuthGuard><BoardDetail /></AuthGuard>} />
        <Route path="/feedback" element={<AuthGuard><Feedback /></AuthGuard>} />
        <Route path="/feedback/:id" element={<AuthGuard><FeedbackDetail /></AuthGuard>} />
        <Route path="/announcements" element={<AuthGuard><Announcements /></AuthGuard>} />
        <Route path="/announcements/:id" element={<AuthGuard><AnnouncementDetail /></AuthGuard>} />
        <Route path="/withdrawal" element={<AuthGuard><Withdrawal /></AuthGuard>} />
        <Route path="/faq" element={<AuthGuard><FAQ /></AuthGuard>} />
        <Route path="/notifications" element={<AuthGuard><Notifications /></AuthGuard>} />
        <Route path="/notifications/schedule-changed/:id" element={<AuthGuard><NotificationScheduleChanged /></AuthGuard>} />
        <Route path="/notifications/schedule-added/:id" element={<AuthGuard><NotificationScheduleAdded /></AuthGuard>} />
        <Route path="/profile/edit/password" element={<AuthGuard><PasswordChange /></AuthGuard>} />
        <Route path="/schedule" element={<AuthGuard><Schedule /></AuthGuard>} />
        <Route path="/schedule/change-request" element={<ScheduleChangeRequest />} />
        <Route path="/schedule/vacation-request" element={<VacationRequest />} />
        <Route path="/closing-report" element={<AuthGuard><ClosingReport /></AuthGuard>} />

        {/* ===== 사장유형 ===== */}
        <Route path="/owner/business-verify" element={<AuthGuard><OwnerBusinessVerify /></AuthGuard>} />
        <Route path="/owner/business/upload" element={<AuthGuard><OwnerBusinessVerifyUpload /></AuthGuard>} />
        <Route path="/owner/home" element={<OwnerHome />} />
        <Route path="/owner/store" element={<StoreInfo />} />
        <Route path="/owner/store/edit" element={<StoreInfoEdit />} />
        <Route path="/owner/store/hours" element={<StoreHours />} />
        <Route path="/owner/store/hours/parts" element={<StoreHoursParts />} />
        <Route path="/owner/store/attendance-standard" element={<AttendanceStandard />} />
        <Route path="/owner/schedule" element={<OwnerScheduleManagement />} />
        <Route path="/owner/attendance" element={<OwnerAttendanceManagement />} />
        <Route path="/owner/attendance/edit" element={<OwnerAttendanceEdit />} />
        <Route path="/owner/attendance/:id" element={<OwnerAttendanceDetail />} />
        <Route path="/owner/store/delete" element={<StoreDelete />} />
        <Route path="/owner/staff" element={<StaffManagement />} />
        <Route path="/owner/staff/:id" element={<StaffDetail />} />
        <Route path="/owner/staff/:id/edit" element={<StaffEdit />} />
        <Route path="/owner/salary" element={<OwnerSalaryManagement />} />
        <Route path="/owner/salary/detail" element={<OwnerSalaryDetail />} />
        <Route path="/owner/salary/detail/edit" element={<OwnerSalaryDetailEdit />} />
        <Route path="/owner/salary/payslip" element={<PayslipDetail />} />
        <Route path="/owner/salary/payslip/edit" element={<PayslipEdit />} />
        <Route path="/owner/salary/payslip/publish" element={<PayslipPublish />} />
        <Route path="/owner/sales" element={<SalesManagement />} />
        <Route path="/owner/sales/daily" element={<SalesDailyDetail />} />
        <Route path="/owner/sales/monthly" element={<SalesMonthlyDetail />} />
        <Route path="/owner/profile" element={<OwnerProfile />} />
        <Route path="/owner/profile/edit" element={<OwnerProfileEdit />} />
        <Route path="/owner/account/withdrawal" element={<AccountWithdrawal />} />

        {/* ===== 직원유형 ===== */}
        <Route path="/employee/business-verify" element={<AuthGuard><EmployeeBusinessVerify /></AuthGuard>} />
        <Route path="/employee/home" element={<AuthGuard><EmployeeHome /></AuthGuard>} />
        <Route path="/employee/salary" element={<AuthGuard><EmployeeSalaryManagement /></AuthGuard>} />
        <Route path="/employee/salary/pay-stub/:id" element={<AuthGuard><PayStubDetail /></AuthGuard>} />
        <Route path="/attendance" element={<AuthGuard><EmployeeAttendanceManagement /></AuthGuard>} />
        <Route path="/attendance/record-edit" element={<AuthGuard><AttendanceRecordEdit /></AuthGuard>} />
        <Route path="/employee/profile" element={<AuthGuard><EmployeeProfile /></AuthGuard>} />
        <Route path="/employee/profile/edit" element={<AuthGuard><EmployeeProfileEdit /></AuthGuard>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <NavToastProvider>
          <ScrollToTop />
          <div className="max-w-lg mx-auto bg-background min-h-screen relative app-root">
            <AnimatedRoutes />
          </div>
          <GlobalBottomNav />
        </NavToastProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
