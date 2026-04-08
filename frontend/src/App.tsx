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

            {/* 공통 기능 */}
            <Route path="/board" element={<BoardList />} />
            <Route path="/board/write" element={<BoardWrite />} />
            <Route path="/board/:id" element={<BoardDetail />} />


            {/* 사장유형 라우터 */}
            <Route path="/owner/business-verify" element={<BusinessVerify />} />
            <Route path="/owner/business/upload" element={<BusinessVerifyUpload />} />

            {/* 직원유형 라우터 */}
            <Route path="/employee/business-verify" element={<StoreRegistration />} />
            <Route path="/employee/home" element={<EmployeeHome />} />
            <Route path="/schedule" element={<Schedule />} />


            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employee/:id" element={<EmployeeDetail />} />
            <Route path="/employee/:id/edit" element={<EmployeeEdit />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
