import { useState, useRef } from "react";
import { ChevronLeft, ChevronDown, ChevronRight, X, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const allBanks = [
  "국민은행", "신한은행", "농협", "우리은행", "기업은행", "하나은행",
  "토스뱅크", "카카오뱅크", "새마을금고", "케이뱅크", "우체국", "SC제일은행",
  "IM뱅크", "부산은행", "광주은행", "경남은행", "신협", "산업은행",
  "수협은행", "한국씨티은행", "SBI저축은행", "제주은행", "전북은행", "산림조합중앙회",
];

const ProfileEdit = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("정수민");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [birthDate] = useState("2001.02.03");
  const [age] = useState(24);
  const [gender] = useState("여자");
  const [phone] = useState("010-5050-5050");
  const [bank, setBank] = useState("신한은행");
  const [accountNumber, setAccountNumber] = useState("333333333333");

  const contract = {
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
  };

  const tax = {
    incomeTax: [
      { label: "소득세", rate: "(3%)" },
      { label: "지방소득세", rate: "(0.3%)" },
    ],
    insurance: [
      { label: "국민연금", rate: "(4.75%)" },
      { label: "건강보험", rate: "(3.595%)" },
      { label: "장기기요양보험", rate: "(건강보험의 13.14%)" },
      { label: "고용보험", rate: "(건강보험의 1.8%)" },
      { label: "산재보험", rate: "(건강보험의 1.47%)" },
    ],
  };

  const [documentItems, setDocumentItems] = useState([
    { label: "이력서", fileName: "정수민_이력서.png", uploaded: true },
    { label: "근로계약서", fileName: "정수민_근로계약서.png", uploaded: true },
    { label: "보건증", fileName: null as string | null, uploaded: false },
  ]);

  const [nameSheetOpen, setNameSheetOpen] = useState(false);
  const [nameInput, setNameInput] = useState(name);
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const [accountInput, setAccountInput] = useState(accountNumber);
  const [bankSheetOpen, setBankSheetOpen] = useState(false);
  const [docUploadSheetOpen, setDocUploadSheetOpen] = useState(false);
  const [docUploadIndex, setDocUploadIndex] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(null);
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);

  const isFormValid = name.trim() !== "" && bank.trim() !== "" && accountNumber.trim() !== "";

  const handleNameSubmit = () => {
    if (nameInput.trim()) { setName(nameInput.trim()); setNameSheetOpen(false); }
  };

  const handleAccountSubmit = () => {
    if (accountInput.trim()) { setAccountNumber(accountInput.trim()); setAccountSheetOpen(false); }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => { setProfileImage(ev.target?.result as string); setPhotoSheetOpen(false); };
      reader.readAsDataURL(file);
    }
  };

  const handleDocFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && docUploadIndex !== null) {
      setDocumentItems(prev => prev.map((item, i) => i === docUploadIndex ? { ...item, fileName: file.name, uploaded: true } : item));
      setDocUploadSheetOpen(false);
      setDocUploadIndex(null);
    }
  };

  const handleDeleteDocument = () => {
    if (deleteTargetIndex !== null) {
      setDocumentItems(prev => prev.map((item, i) => i === deleteTargetIndex ? { ...item, fileName: null, uploaded: false } : item));
      setDeleteDialogOpen(false);
      setDeleteTargetIndex(null);
    }
  };

  const handleEditConfirm = () => { setEditConfirmOpen(false); navigate("/profile"); };
  const getDocUploadTitle = () => { if (docUploadIndex === null) return ""; return `${documentItems[docUploadIndex]?.label} 업로드하기`; };
  const allSubmitted = documentItems.every(d => d.uploaded);

  return (
    <div className="min-h-screen max-w-[430px] mx-auto relative font-[Pretendard]" style={{ backgroundColor: '#FFFFFF' }}>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
      <input ref={docFileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleDocFileSelect} />

      {/* Header */}
      <div className="flex items-center gap-2 px-2 pt-4 pb-2 sticky top-0 z-10" style={{ backgroundColor: '#FFFFFF' }}>
        <button onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B' }}>내 정보 수정</h1>
      </div>
      <div className="border-b border-border" />

      <div className="pb-8">
        {/* Profile Card */}
        <div className="flex items-center gap-4 py-4 px-[20px]">
          <button onClick={() => setPhotoSheetOpen(true)} className="relative flex-shrink-0">
            <div className="w-[80px] h-[80px] rounded-full p-[3px] bg-[hsl(260,60%,80%)]">
              <div className="w-full h-full rounded-full overflow-hidden bg-[hsl(260,40%,85%)]">
                {profileImage ? (
                  <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[hsl(260,40%,80%)] to-[hsl(260,30%,88%)]" />
                )}
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-[24px] h-[24px] rounded-full bg-primary flex items-center justify-center shadow-md">
              <span className="text-white text-[14px] font-bold leading-none">+</span>
            </div>
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-[10px]">
              <span className="text-[20px] tracking-[-0.02em] font-bold text-[hsl(240,7%,10%)]">{name}</span>
              <span className="text-[16px] tracking-[-0.02em] font-normal text-[hsl(223,5%,46%)]">{contract.employmentType}</span>
            </div>
            <div className="mt-1">
              <span className="inline-flex items-center justify-center w-[199px] h-[28px] rounded-[4px] bg-primary/10 text-primary text-[14px] tracking-[-0.02em] font-medium">
                컴포즈커피 노량진점 입사 +{contract.joinDays}일
              </span>
            </div>
          </div>
        </div>

        <div className="w-full h-[12px] bg-[#F7F7F8]" />

        {/* 인적 사항 */}
        <section className="py-5 px-[20px]">
          <h2 className="text-[20px] tracking-[-0.02em] font-bold text-[hsl(210,5%,16%)] mb-4">인적 사항</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(223,5%,46%)] w-[100px] flex-shrink-0">이름</span>
              <button onClick={() => { setNameInput(name); setNameSheetOpen(true); }} className="flex-1 h-[44px] rounded-lg border border-border px-3 text-left text-[16px] tracking-[-0.02em] font-medium text-[hsl(210,5%,16%)]">{name}</button>
            </div>
            <InfoRow label="생년월일" value={`${birthDate} (${age}세)`} />
            <InfoRow label="성별" value={gender} />
            <InfoRow label="전화번호" value={phone} />
            <div className="flex items-center">
              <span className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(223,5%,46%)] w-[100px] flex-shrink-0">은행</span>
              <button onClick={() => setBankSheetOpen(true)} className={`flex-1 h-[44px] rounded-lg border px-3 flex items-center justify-between text-[16px] tracking-[-0.02em] font-medium ${!bank ? "border-destructive text-destructive" : "border-border text-[hsl(210,5%,16%)]"}`}>
                <span>{bank || "미선택"}</span>
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex items-center">
              <span className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(223,5%,46%)] w-[100px] flex-shrink-0">계좌번호</span>
              <button onClick={() => { setAccountInput(accountNumber); setAccountSheetOpen(true); }} className={`flex-1 h-[44px] rounded-lg border px-3 text-left text-[16px] tracking-[-0.02em] font-medium ${!accountNumber ? "border-destructive text-destructive" : "border-border text-[hsl(210,5%,16%)]"}`}>
                {accountNumber || "미입력"}
              </button>
            </div>
            <button onClick={() => navigate("/profile/edit/password")} className="flex items-center justify-between w-full pt-1">
              <span className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(223,5%,46%)]">비밀번호 변경</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </section>

        <div className="w-full h-[12px] bg-[hsl(0,0%,97%)]" />

        {/* 계약 정보 */}
        <section className="py-5 px-[20px]">
          <h2 className="text-[20px] tracking-[-0.02em] font-bold text-[hsl(210,5%,16%)] mb-4">계약 정보</h2>
          <div className="space-y-3">
            <InfoRow label="고용형태" value={contract.employmentType} />
            <InfoRow label="입사일" value={`${contract.joinDate} (+${contract.joinDays}일)`} />
            <InfoRow label="수습" value={contract.probation} />
            <InfoRow label="급여주기" value={contract.salaryType} />
            <InfoRow label="시급" value={contract.hourlyWage} />
            <InfoRow label="급여일" value={contract.salaryDay} />
            <div className="flex items-start">
              <span className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(223,5%,46%)] w-[100px] flex-shrink-0 pt-0.5">근무일</span>
              <div className="flex-1 space-y-2">
                {contract.schedule.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 flex-wrap">
                    <span className="text-[16px] tracking-[-0.02em] font-semibold text-[hsl(210,5%,16%)] w-6">{s.day}</span>
                    <span className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(210,5%,16%)]">{s.time}</span>
                    <div className="flex gap-1">
                      {s.tags.map((tag) => (
                        <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="w-full h-[12px] bg-[hsl(0,0%,97%)]" />

        {/* 세금 */}
        <section className="py-5 px-[20px]">
          <h2 className="text-[20px] tracking-[-0.02em] font-bold text-[hsl(210,5%,16%)] mb-4">세금</h2>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(223,5%,46%)] w-[100px] flex-shrink-0 pt-0.5">소득세</span>
              <div className="flex-1 space-y-1">
                {tax.incomeTax.map((item, i) => (
                  <p key={i} className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(210,5%,16%)]">
                    {item.label} <span className="font-normal text-[hsl(223,5%,46%)]">{item.rate}</span>
                  </p>
                ))}
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(223,5%,46%)] w-[100px] flex-shrink-0 pt-0.5">4대 보험</span>
              <div className="flex-1 space-y-1">
                {tax.insurance.map((item, i) => (
                  <p key={i} className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(210,5%,16%)]">
                    {item.label} <span className="font-normal text-[hsl(223,5%,46%)]">{item.rate}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="w-full h-[12px] bg-[hsl(0,0%,97%)]" />

        {/* 계약서 */}
        <section className="py-5 px-[20px]">
          <div className="flex items-center mb-4">
            <h2 className="text-[20px] tracking-[-0.02em] font-bold text-[hsl(210,5%,16%)] w-[100px] flex-shrink-0">계약서</h2>
            <span className={`inline-flex items-center gap-1.5 text-[14px] tracking-[-0.02em] font-medium ${allSubmitted ? "text-[hsl(145,63%,42%)]" : "text-destructive"}`}>
              {allSubmitted ? "✓" : "⚠"} {allSubmitted ? "필수 계약서 제출 완료" : "필수 계약서 제출 미완료"}
            </span>
          </div>
          <div className="space-y-3">
            {documentItems.map((doc, idx) => (
              <div key={doc.label} className="flex items-center">
                <span className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(223,5%,46%)] w-[100px] flex-shrink-0">{doc.label}</span>
                {doc.uploaded && doc.fileName ? (
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-[16px] tracking-[-0.02em] text-primary font-medium">{doc.fileName}</span>
                    <button onClick={() => { setDeleteTargetIndex(idx); setDeleteDialogOpen(true); }} className="text-muted-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setDocUploadIndex(idx); setDocUploadSheetOpen(true); }} className="flex-1 h-[44px] rounded-lg border border-border flex items-center justify-center text-[14px] text-[hsl(210,5%,16%)] font-medium">
                    {doc.label} 업로드하기
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="w-full h-[12px] bg-[hsl(0,0%,97%)]" />

        <div className="py-6 flex justify-center">
          <button onClick={() => navigate("/withdrawal")} className="text-sm text-muted-foreground underline underline-offset-2">회원탈퇴</button>
        </div>

        <div className="px-[20px] pb-8">
          <button onClick={() => { if (isFormValid) setEditConfirmOpen(true); }} disabled={!isFormValid} className={`w-full py-4 rounded-xl text-[16px] font-semibold ${isFormValid ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            수정하기
          </button>
        </div>
      </div>

      {/* 이름 입력 바텀시트 */}
      <Drawer open={nameSheetOpen} onOpenChange={setNameSheetOpen}>
        <DrawerContent className="[&>div:first-child]:hidden max-w-[430px] mx-auto" style={{ borderRadius: '20px 20px 0 0', backgroundColor: '#FFFFFF', padding: '0' }}>
          <div style={{ padding: '30px 20px 20px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B' }}>이름 입력하기</h2>
              <button onClick={() => setNameSheetOpen(false)} style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: '20px', height: '20px', color: '#19191B' }} strokeWidth={2.5} />
              </button>
            </div>
            <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="이름 입력" className="w-full h-[52px] rounded-xl border border-border px-4 text-[16px] focus:outline-none focus:border-primary" style={{ color: '#19191B' }} />
            <p className="mt-2 text-[13px] leading-relaxed" style={{ color: '#4261FF' }}>닉네임을 사용할 경우 '닉네임(이름)' 형식으로 작성해주세요</p>
            <p className="text-[13px]" style={{ color: '#19191B' }}>예) 핸디(홍길동)</p>
            <button onClick={handleNameSubmit} disabled={!nameInput.trim()} className="mt-6 w-full py-4 rounded-xl text-[16px] font-semibold" style={{ backgroundColor: nameInput.trim() ? '#4261FF' : '#E5E7EB', color: nameInput.trim() ? '#FFFFFF' : '#9CA3AF' }}>입력 완료</button>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={photoSheetOpen} onOpenChange={setPhotoSheetOpen}>
        <DrawerContent className="[&>div:first-child]:hidden max-w-[430px] mx-auto" style={{ height: '212px', borderRadius: '20px 20px 0 0', backgroundColor: '#FFFFFF', padding: '0' }}>
          <div style={{ paddingLeft: '16px', paddingRight: '16px' }}>
            <div className="flex items-center justify-between" style={{ paddingTop: '30px', paddingBottom: '20px', paddingLeft: '4px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B' }}>프로필 사진 변경</h2>
              <button onClick={() => setPhotoSheetOpen(false)} style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}>
                <X style={{ width: '20px', height: '20px', color: '#19191B' }} strokeWidth={2.5} />
              </button>
            </div>
            <div className="flex flex-col" style={{ gap: '4px', paddingBottom: '16px' }}>
              {[
                { label: '앨범에서 선택하기', onClick: () => fileInputRef.current?.click() },
                { label: '기본 프로필로 변경하기', onClick: () => { setProfileImage(null); setPhotoSheetOpen(false); } },
              ].map(({ label, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  onMouseDown={e => { e.currentTarget.style.backgroundColor = '#E8F3FF'; e.currentTarget.style.color = '#4261FF'; }}
                  onMouseUp={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#19191B'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#19191B'; }}
                  onTouchStart={e => { e.currentTarget.style.backgroundColor = '#E8F3FF'; e.currentTarget.style.color = '#4261FF'; }}
                  onTouchEnd={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#19191B'; }}
                  style={{ width: '100%', height: '48px', borderRadius: '10px', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: '16px', fontSize: '16px', fontWeight: 500, letterSpacing: '-0.02em', color: '#19191B', transition: 'background-color 0.1s' }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* 계좌번호 입력 바텀시트 */}
      <Drawer open={accountSheetOpen} onOpenChange={setAccountSheetOpen}>
        <DrawerContent className="[&>div:first-child]:hidden max-w-[430px] mx-auto" style={{ borderRadius: '20px 20px 0 0', backgroundColor: '#FFFFFF', padding: '0' }}>
          <div style={{ padding: '30px 20px 20px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B' }}>계좌번호 입력하기</h2>
              <button onClick={() => setAccountSheetOpen(false)} style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: '20px', height: '20px', color: '#19191B' }} strokeWidth={2.5} />
              </button>
            </div>
            <input type="text" inputMode="numeric" value={accountInput} onChange={(e) => setAccountInput(e.target.value.replace(/\D/g, ""))} placeholder="숫자만 입력" className="w-full h-[52px] rounded-xl border border-border px-4 text-[16px] focus:outline-none focus:border-primary" style={{ color: '#19191B' }} />
            <button onClick={handleAccountSubmit} disabled={!accountInput.trim()} className="mt-6 w-full py-4 rounded-xl text-[16px] font-semibold" style={{ backgroundColor: accountInput.trim() ? '#4261FF' : '#E5E7EB', color: accountInput.trim() ? '#FFFFFF' : '#9CA3AF' }}>입력 완료</button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* 은행 선택 바텀시트 */}
      <Drawer open={bankSheetOpen} onOpenChange={setBankSheetOpen}>
        <DrawerContent className="[&>div:first-child]:hidden max-w-[430px] mx-auto max-h-[85vh]" style={{ borderRadius: '20px 20px 0 0', backgroundColor: '#FFFFFF', padding: '0' }}>
          <div style={{ padding: '30px 20px 20px' }} className="overflow-y-auto">
            <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B' }}>은행을 선택해주세요</h2>
              <button onClick={() => setBankSheetOpen(false)} style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: '20px', height: '20px', color: '#19191B' }} strokeWidth={2.5} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {allBanks.map((b) => (
                <button key={b} onClick={() => { setBank(b); setBankSheetOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 8px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, letterSpacing: '-0.02em', backgroundColor: bank === b ? '#E8F3FF' : '#F7F7F8', color: bank === b ? '#4261FF' : '#19191B', border: bank === b ? '1px solid #4261FF' : '1px solid transparent' }}>
                  {b}
                </button>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* 계약서 업로드 바텀시트 */}
      <Drawer open={docUploadSheetOpen} onOpenChange={setDocUploadSheetOpen}>
        <DrawerContent className="[&>div:first-child]:hidden max-w-[430px] mx-auto" style={{ height: '212px', borderRadius: '20px 20px 0 0', backgroundColor: '#FFFFFF', padding: '0' }}>
          <div style={{ paddingLeft: '16px', paddingRight: '16px' }}>
            <div className="flex items-center justify-between" style={{ paddingTop: '30px', paddingBottom: '20px', paddingLeft: '4px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B' }}>{getDocUploadTitle()}</h2>
              <button onClick={() => setDocUploadSheetOpen(false)} style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}>
                <X style={{ width: '20px', height: '20px', color: '#19191B' }} strokeWidth={2.5} />
              </button>
            </div>
            <div className="flex flex-col" style={{ gap: '4px', paddingBottom: '16px' }}>
              {[
                { label: '앨범에서 선택하기', onClick: () => docFileInputRef.current?.click() },
                { label: '카메라 촬영하기', onClick: () => docFileInputRef.current?.click() },
              ].map(({ label, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  onMouseDown={e => { e.currentTarget.style.backgroundColor = '#E8F3FF'; e.currentTarget.style.color = '#4261FF'; }}
                  onMouseUp={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#19191B'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#19191B'; }}
                  onTouchStart={e => { e.currentTarget.style.backgroundColor = '#E8F3FF'; e.currentTarget.style.color = '#4261FF'; }}
                  onTouchEnd={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#19191B'; }}
                  style={{ width: '100%', height: '48px', borderRadius: '10px', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: '16px', fontSize: '16px', fontWeight: 500, letterSpacing: '-0.02em', color: '#19191B', transition: 'background-color 0.1s' }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <ConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title="계약서 삭제"
        description={<>계약서를 삭제하시겠어요?<br />해당 계약서는 필수 계약서로<br />삭제 시 사장님이 열람할 수 없어요</>}
        buttons={[{ label: "취소", onClick: () => setDeleteDialogOpen(false), variant: "cancel" }, { label: "삭제하기", onClick: handleDeleteDocument }]} />

      <ConfirmDialog open={editConfirmOpen} onOpenChange={setEditConfirmOpen} title="회원정보 수정"
        description="회원정보를 수정하시겠어요?"
        buttons={[{ label: "취소", onClick: () => setEditConfirmOpen(false), variant: "cancel" }, { label: "수정하기", onClick: handleEditConfirm }]} />
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start">
    <span className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(223,5%,46%)] w-[100px] flex-shrink-0 pt-0.5">{label}</span>
    <span className="text-[16px] tracking-[-0.02em] font-medium text-[hsl(210,5%,16%)] flex-1 min-w-0">{value}</span>
  </div>
);

export default ProfileEdit;