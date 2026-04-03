import { useState } from "react";
import { ChevronLeft, CheckCircle2, Copy, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/home/BottomNav";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";

// Mock data
const profileData = {
  name: "정수민",
  employmentType: "정규직" as const,
  profileImage: null as string | null,
  joinDate: "2025.02.12",
  joinDays: 261,
  personal: {
    birthDate: "2001.02.03",
    age: 24,
    gender: "여자",
    phone: "010-5050-5050",
    bank: "신한은행",
    accountNumber: "333333333333",
  },
  contract: {
    employmentType: "정규직",
    joinDate: "2025.02.12",
    joinDays: 261,
    probation: "수습 적용",
    salaryType: "월급",
    salaryDay: "15일",
    schedule: [
      { day: "월", time: "08:00 ~ 16:00", tags: ["오픈", "미들"] },
      { day: "화", time: "08:00 ~ 22:00", tags: ["오픈", "미들", "마감"] },
      { day: "수", time: "08:00 ~ 16:00", tags: ["오픈", "미들"] },
      { day: "목", time: "08:00 ~ 16:00", tags: ["오픈", "미들"] },
    ],
    hourlyWage: "11,000원",
  },
  tax: {
    incomeTax: [
      { label: "소득세", rate: "(3%)", bold: true },
      { label: "지방소득세", rate: "(0.3%)", bold: false },
    ],
    insurance: [
      { label: "국민연금", rate: "(4.75%)", bold: true },
      { label: "건강보험", rate: "(3.595%)", bold: true },
      { label: "장기기요양보험", rate: "(건강보험의 13.14%)", bold: true },
      { label: "고용보험", rate: "(건강보험의 1.8%)", bold: true },
      { label: "산재보험", rate: "(건강보험의 1.47%)", bold: true },
    ],
  },
  documents: {
    allSubmitted: true,
    items: [
      { label: "이력서", fileName: "정수민_이력서.png" },
      { label: "근로계약서", fileName: "정수민_근로계약서.png" },
      { label: "보건증", fileName: "정수민_보건증.png" },
    ],
  },
};

const adBanners = [
  { id: 1, bgColor: "bg-[hsl(200,60%,50%)]", title: "전국 스키장\n리프트권 특가 모음", subtitle: "25/26 NOL 스키 시즌" },
  { id: 2, bgColor: "bg-[hsl(340,60%,50%)]", title: "겨울 특가\n이벤트 진행중", subtitle: "지금 바로 확인하세요" },
  { id: 3, bgColor: "bg-[hsl(160,50%,45%)]", title: "신규 회원\n특별 혜택", subtitle: "가입만 해도 쿠폰 지급" },
  { id: 4, bgColor: "bg-[hsl(40,70%,50%)]", title: "봄맞이\n할인 이벤트", subtitle: "최대 50% 할인" },
];

const Divider = () => <div className="w-full h-[12px]" style={{ backgroundColor: '#F7F7F8' }} />;

const Profile = () => {
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);
  const [currentAd, setCurrentAd] = useState(0);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(profileData.personal.accountNumber.replace(/-/g, ""));
    setAccountSheetOpen(true);
  };

  const handleLogout = () => {
    setLogoutOpen(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen max-w-[430px] mx-auto relative font-[Pretendard]" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-2 pt-4 pb-2 sticky top-0 z-10" style={{ backgroundColor: '#FFFFFF' }}>
        <button onClick={() => navigate("/")} className="p-1">
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B' }}>내 정보</h1>
      </div>

      <div className="border-b border-border" />

      <div className="pb-24">
        {/* Profile Card */}
        <div className="flex items-center gap-4 py-4 px-[20px]">
          <div className="w-[80px] h-[80px] rounded-full bg-muted overflow-hidden flex-shrink-0">
            {profileData.profileImage ? (
              <img src={profileData.profileImage} alt="프로필" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-[10px]">
              <span className="text-[20px] tracking-[-0.02em] font-bold text-[hsl(240,7%,10%)]">{profileData.name}</span>
              <span className="text-[16px] tracking-[-0.02em] font-normal text-[hsl(223,5%,46%)]">{profileData.employmentType}</span>
            </div>
            <div className="mt-1">
              <span className="inline-flex items-center justify-center w-[199px] h-[28px] rounded-[4px] bg-primary/10 text-primary text-[14px] tracking-[-0.02em] font-medium">
                컴포즈커피 노량진점 입사 +{profileData.joinDays}일
              </span>
            </div>
          </div>
          <button className="p-2 self-start mt-1" onClick={() => navigate("/profile/edit")}>
            <Pencil className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        <Divider />
        {/* 인적 사항 */}
        <section className="py-5 px-[20px]">
          <h2 className="text-[20px] tracking-[-0.02em] font-bold text-[hsl(210,5%,16%)] mb-4">인적 사항</h2>
          <div className="space-y-3">
            <InfoRow label="생년월일" value={`${profileData.personal.birthDate} (${profileData.personal.age}세)`} />
            <InfoRow label="성별" value={profileData.personal.gender} />
            <InfoRow label="전화번호" value={profileData.personal.phone} />
            <InfoRow label="은행" value={profileData.personal.bank} />
            <div className="flex items-start">
              <span className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(223,5%,46%)] w-[100px] flex-shrink-0 pt-0.5">계좌번호</span>
              <button
                onClick={handleCopyAccount}
                className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(210,5%,16%)] underline underline-offset-2 decoration-foreground/30"
              >
                {profileData.personal.accountNumber}
              </button>
            </div>
          </div>
        </section>

        <Divider />
        {/* 계약 정보 */}
        <section className="py-5 px-[20px]">
          <h2 className="text-[20px] tracking-[-0.02em] font-bold text-[hsl(210,5%,16%)] mb-4">계약 정보</h2>
          <div className="space-y-3">
            <InfoRow label="고용형태" value={profileData.contract.employmentType} />
            <InfoRow label="입사일" value={`${profileData.contract.joinDate} (+${profileData.contract.joinDays}일)`} />
            {profileData.contract.probation && (
              <InfoRow label="수습" value={profileData.contract.probation} />
            )}
            <InfoRow label="급여주기" value={profileData.contract.salaryType} />
            <InfoRow label="시급" value={profileData.contract.hourlyWage} />
            <InfoRow label="급여일" value={profileData.contract.salaryDay} />
            {/* 근무일 */}
            <div className="flex items-start">
              <span className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(223,5%,46%)] w-[100px] flex-shrink-0 pt-0.5">근무일</span>
              <div className="flex-1 space-y-2">
                {profileData.contract.schedule.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 flex-wrap">
                    <span className="text-[16px] tracking-[-0.02em] font-semibold text-[hsl(210,5%,16%)] w-6">{s.day}</span>
                    <span className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(210,5%,16%)]">{s.time}</span>
                    <div className="flex gap-1">
                      {s.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Divider />
        {/* 광고 배너 */}
        <section className="py-4 px-[20px]">
          <div className="relative rounded-2xl overflow-hidden">
            <div
              className="flex transition-transform duration-300"
              style={{ transform: `translateX(-${currentAd * 100}%)` }}
            >
              {adBanners.map((ad) => (
                <div
                  key={ad.id}
                  className={`${ad.bgColor} w-full flex-shrink-0 p-5 h-[140px] flex flex-col justify-end text-white`}
                >
                  <p className="text-lg font-bold whitespace-pre-line leading-tight">{ad.title}</p>
                  <p className="text-xs mt-1 opacity-80">{ad.subtitle}</p>
                </div>
              ))}
            </div>
            {/* Dots */}
            <div className="absolute bottom-3 right-4 flex gap-1.5">
              {adBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentAd(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentAd ? "bg-white" : "bg-white/40"
                    }`}
                />
              ))}
            </div>
          </div>
        </section>

        <Divider />
        {/* 세금 */}
        <section className="py-5 px-[20px]">
          <h2 className="text-[20px] tracking-[-0.02em] font-bold text-[hsl(210,5%,16%)] mb-4">세금</h2>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(223,5%,46%)] w-[100px] flex-shrink-0 pt-0.5">소득세</span>
              <div className="flex-1 space-y-1">
                {profileData.tax.incomeTax.map((item, i) => (
                  <p key={i} className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(210,5%,16%)]">
                    {item.label} <span className="font-normal text-[hsl(223,5%,46%)]">{item.rate}</span>
                  </p>
                ))}
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(223,5%,46%)] w-[100px] flex-shrink-0 pt-0.5">4대 보험</span>
              <div className="flex-1 space-y-1">
                {profileData.tax.insurance.map((item, i) => (
                  <p key={i} className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(210,5%,16%)]">
                    {item.label} <span className="font-normal text-[hsl(223,5%,46%)]">{item.rate}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Divider />
        {/* 계약서 */}
        <section className="py-5 px-[20px]">
          <div className="flex items-center mb-4">
            <h2 className="text-[20px] tracking-[-0.02em] font-bold text-[hsl(210,5%,16%)] w-[100px] flex-shrink-0">계약서</h2>
            <span className={`inline-flex items-center gap-1.5 text-[14px] tracking-[-0.02em] font-medium ${profileData.documents.allSubmitted ? "text-[hsl(145,63%,42%)]" : "text-destructive"
              }`}>
              <CheckCircle2 className="w-5 h-5" />
              {profileData.documents.allSubmitted ? "필수 계약서 제출 완료" : "필수 계약서 제출 미완료"}
            </span>
          </div>
          <div className="space-y-3">
            {profileData.documents.items.map((doc) => (
              <div key={doc.label} className="flex items-center">
                <span className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(223,5%,46%)] w-[100px] flex-shrink-0">{doc.label}</span>
                <button
                  onClick={() => setViewingDoc(doc.fileName)}
                  className="text-[16px] tracking-[-0.02em] text-primary font-medium underline underline-offset-2"
                >
                  {doc.fileName}
                </button>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* 로그아웃 */}
        <div className="py-8 flex justify-center px-[20px]">
          <button
            onClick={() => setLogoutOpen(true)}
            className="text-sm text-muted-foreground underline underline-offset-2"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 계좌번호 복사 바텀시트 */}
      <Drawer open={accountSheetOpen} onOpenChange={setAccountSheetOpen}>
        <DrawerContent className="max-w-[430px] mx-auto">
          <div className="px-6 py-8 flex flex-col items-center gap-3">
            <Copy className="w-8 h-8 text-primary" />
            <p className="text-[16px] font-semibold text-[hsl(210,5%,16%)]">계좌번호가 복사되었습니다</p>
            <p className="text-[14px] text-[hsl(223,5%,46%)]">{profileData.personal.bank} {profileData.personal.accountNumber}</p>
            <button
              onClick={() => setAccountSheetOpen(false)}
              className="mt-3 w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-[15px] font-semibold"
            >
              확인
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      <ConfirmDialog open={logoutOpen} onOpenChange={setLogoutOpen} title="로그아웃"
        description="로그아웃 하시겠어요?"
        buttons={[{ label: "취소", onClick: () => setLogoutOpen(false), variant: "cancel" }, { label: "확인", onClick: handleLogout }]} />

      {/* 계약서 보기 팝업 */}
      <Dialog open={!!viewingDoc} onOpenChange={() => setViewingDoc(null)}>
        <DialogContent className="max-w-[380px] rounded-2xl">
          <DialogTitle className="text-lg font-bold text-foreground">{viewingDoc}</DialogTitle>
          <DialogDescription className="sr-only">계약서 이미지</DialogDescription>
          <div className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center">
            <p className="text-sm text-muted-foreground">계약서 이미지 영역</p>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav activeTab="myinfo" onTabChange={() => { }} />
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start">
    <span className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(223,5%,46%)] w-[100px] flex-shrink-0 pt-0.5">{label}</span>
    <span className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(210,5%,16%)] flex-1 min-w-0">{value}</span>
  </div>
);

export default Profile;