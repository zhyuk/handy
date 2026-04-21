import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Test from "@/pages/Test";
import Login from "@/pages/Login";
import EmployeeList from "@/pages/EmployeeList";
import EmployeeDetail from "@/pages/EmployeeDetail";
import EmployeeEdit from "@/pages/EmployeeEdit";
import NotFound from "@/pages/NotFound";
import Signup from "@/pages/Signup";
import ScrollToTop from "@/utils/scrollToTop"
import CodeVerifyPage from "@/pages/CodeVerify";
import PasswordPage from "@/pages/PasswordPage";
import ProfileInfoPage from "@/pages/ProfileInfoPage";
import ProfilePhotoPage from "@/pages/ProfilePhotoPage";
import SignupCompletePage from "@/pages/SignupCompletePage";
import Index from "@/pages/Index";
import BusinessVerify from "@/pages/Owner/BusinessVerify";
import BusinessVerifyUpload from "@/pages/Owner/BusinessVerifyUpload";
import StoreRegistration from "@/pages/Employee/StoreRegistration";
import EmployeeHome from "@/pages/Employee/Index"
import BoardList from "./pages/Employee/BoardList";
import BoardDetail from "./pages/Employee/BoardDetail";
import Schedule from "./pages/Employee/Schedule";
import BoardWrite from "./pages/Employee/BoardWrite";
import ClosingReport from "./pages/Employee/ClosingReport";
import SalaryManagement from "./pages/Employee/SalaryManagement";
import PayStubDetail from "./pages/Employee/PayStubDetail";
import AttendanceManagement from "./pages/Employee/AttendanceManagement";
import AttendanceRecordEdit from "./pages/Employee/AttendanceRecordEdit";
import Feedback from "./pages/Employee/Feedback";
import FeedbackDetail from "./pages/Employee/FeedbackDetail";
import Profile from "./pages/Employee/Profile";
import ProfileEdit from "./pages/Employee/ProfileEdit";
import PasswordChange from "./pages/Employee/PasswordChange";
import Withdrawal from "./pages/Employee/Withdrawal";
import Announcements from "./pages/Employee/Announcements";
import AnnouncementDetail from "./pages/Employee/AnnouncementDetail";
import FAQ from "./pages/Employee/FAQ";
import Notifications from "./pages/Employee/Notifications";
import NotificationScheduleChanged from "./pages/Employee/NotificationScheduleChanged";
import NotificationScheduleAdded from "./pages/Employee/NotificationScheduleAdded";
import AuthGuard from "@/components/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <ScrollToTop />
        <div className="max-w-lg mx-auto bg-background min-h-screen relative app-root">
          <Routes>
            <Route path="/test" element={<Test />} />
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify" element={<CodeVerifyPage />} />
            <Route path="/password" element={<PasswordPage />} />
            <Route path="/profile-info" element={<ProfileInfoPage />} />
            <Route path="/profile-photo" element={<ProfilePhotoPage />} />
            <Route path="/signup-complete" element={<SignupCompletePage />} />
            <Route path="/onboarding/member-type" element={<Index />} />

            {/* ===== 공통 기능 ===== */}
            <Route path="/board" element={<AuthGuard><BoardList /></AuthGuard>} />
            <Route path="/board/write" element={<AuthGuard><BoardWrite /></AuthGuard>} />
            <Route path="/board/:id" element={<AuthGuard><BoardDetail /></AuthGuard>} />
            {/* 건의함 */}
            <Route path="/feedback" element={<AuthGuard><Feedback /></AuthGuard>} />
            <Route path="/feedback/:id" element={<AuthGuard><FeedbackDetail /></AuthGuard>} />
            {/* 서비스 공지사항 */}
            <Route path="/announcements" element={<AuthGuard><Announcements /></AuthGuard>} />
            <Route path="/announcements/:id" element={<AuthGuard><AnnouncementDetail /></AuthGuard>} />
            {/* 회원 탈퇴 */}
            <Route path="/withdrawal" element={<AuthGuard><Withdrawal /></AuthGuard>} />
            {/* FAQ */}
            <Route path="/faq" element={<AuthGuard><FAQ /></AuthGuard>} />
            {/* ===== 공통 기능 끝 ===== */}


            {/* ===== 사장유형 ===== */}
            <Route path="/owner/business-verify" element={<AuthGuard><BusinessVerify /></AuthGuard>} />
            <Route path="/owner/business/upload" element={<AuthGuard><BusinessVerifyUpload /></AuthGuard>} />
            {/* ===== 사장유형 끝 ===== */}

            {/* ===== 직원유형 ===== */}
            <Route path="/employee/business-verify" element={<AuthGuard><StoreRegistration /></AuthGuard>} />
            <Route path="/employee/home" element={<AuthGuard><EmployeeHome /></AuthGuard>} />
            <Route path="/schedule" element={<AuthGuard><Schedule /></AuthGuard>} />
            <Route path="/closing-report" element={<AuthGuard><ClosingReport /></AuthGuard>} />

            {/* 급여 관리 */}
            <Route path="/employee/salary" element={<AuthGuard><SalaryManagement /></AuthGuard>} />
            <Route path="/employee/salary/pay-stub/:id" element={<AuthGuard><PayStubDetail /></AuthGuard>} />

            {/* 출근 관리 */}
            <Route path="/attendance" element={<AuthGuard><AttendanceManagement /></AuthGuard>} />
            <Route path="/attendance/record-edit" element={<AuthGuard><AttendanceRecordEdit /></AuthGuard>} />

            {/* 내 정보 */}
            <Route path="/employee/profile" element={<AuthGuard><Profile /></AuthGuard>} />
            <Route path="/employee/profile/edit" element={<AuthGuard><ProfileEdit /></AuthGuard>} />
            <Route path="/employee/profile/edit/password" element={<AuthGuard><PasswordChange /></AuthGuard>} />

            <Route path="/notifications" element={<AuthGuard><Notifications /></AuthGuard>} />
            <Route path="/notifications/schedule-changed/:id" element={<AuthGuard><NotificationScheduleChanged /></AuthGuard>} />
            <Route path="/notifications/schedule-added/:id" element={<AuthGuard><NotificationScheduleAdded /></AuthGuard>} />
            {/* ===== 직원유형 끝 ===== */}


            <Route path="/employees" element={<AuthGuard><EmployeeList /></AuthGuard>} />
            <Route path="/employee/:id" element={<AuthGuard><EmployeeDetail /></AuthGuard>} />
            <Route path="/employee/:id/edit" element={<AuthGuard><EmployeeEdit /></AuthGuard>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
