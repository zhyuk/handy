import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { BottomSheet } from '@/components/BottomSheet';
import { StatusBadge } from '@/components/StatusBadge';
import { mockEmployees, PayCycle, WorkDay } from '@/types/employee';
import { Camera, ChevronDown, Check } from 'lucide-react';

const EmployeeEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const employee = mockEmployees.find(e => e.id === id);
  
  const [payCycleSheet, setPayCycleSheet] = useState(false);
  const [workDaySheet, setWorkDaySheet] = useState(false);
  
  const [formData, setFormData] = useState({
    employmentType: employee?.employmentType || '아르바이트',
    hasInsurance: true,
    workDays: employee?.workDays || [],
    hourlyRate: employee?.hourlyRate || 0,
    payCycle: employee?.payCycle || '월급' as PayCycle,
    payDay: employee?.payDay || 15,
    phone: employee?.phone || '',
    bank: employee?.bank || '신한은행',
    accountNumber: employee?.accountNumber || '',
    memo: employee?.note || '',
  });

  const payCycleOptions: PayCycle[] = ['월급', '연봉', '월 2회', '주급'];

  const handleSelectPayCycle = (cycle: PayCycle) => {
    setFormData(prev => ({ ...prev, payCycle: cycle }));
  };

  if (!employee) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">직원을 찾을 수 없습니다</p>
      </div>
    );
  }

  const workDayDisplay = formData.workDays.length > 0
    ? formData.workDays.map(w => w.day).join(', ')
    : '미선택';

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="" showBack />

      {/* Profile Section */}
      <div className="flex flex-col items-center py-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-muted-foreground/30 flex items-center justify-center">
            <Camera className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-foreground mt-3">{employee.name}</h2>
      </div>

      {/* Contract Info Form */}
      <section className="px-4 py-4 border-t border-border">
        <h3 className="text-base font-semibold text-foreground mb-4">계약 정보</h3>
        
        <div className="space-y-4">
          {/* Employment Type */}
          <div className="flex items-center gap-3">
            <label className="w-20 text-sm text-muted-foreground flex-shrink-0">고용형태</label>
            <div className="flex items-center gap-2 flex-1">
              <button className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg text-sm">
                {formData.employmentType}
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
              <button 
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm border ${
                  formData.hasInsurance ? 'border-primary bg-primary/5 text-primary' : 'border-border'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, hasInsurance: !prev.hasInsurance }))}
              >
                {formData.hasInsurance && <Check className="w-4 h-4" />}
                4대 보험 적용
              </button>
            </div>
          </div>

          {/* Hire Date */}
          <div className="flex items-center gap-3">
            <label className="w-20 text-sm text-muted-foreground flex-shrink-0">입사일</label>
            <span className="text-sm text-foreground">{employee.hireDate} ({employee.hireDays}일)</span>
          </div>

          {/* Part */}
          <div className="flex items-center gap-3">
            <label className="w-20 text-sm text-muted-foreground flex-shrink-0">파트</label>
            <button className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg text-sm flex-1">
              <span className="flex gap-1">
                {employee.status.map((s, idx) => (
                  <StatusBadge key={idx} status={s} size="sm" />
                ))}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
            </button>
          </div>

          {/* Work Days */}
          <div className="flex items-center gap-3">
            <label className="w-20 text-sm text-muted-foreground flex-shrink-0">근무일</label>
            <button 
              onClick={() => setWorkDaySheet(true)}
              className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg text-sm flex-1"
            >
              <span className="text-primary">{workDayDisplay}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground pl-[92px]">*계약상 근무일을 선택해주세요.</p>

          {/* Hourly Rate */}
          <div className="flex items-center gap-3">
            <label className="w-20 text-sm text-muted-foreground flex-shrink-0">시급</label>
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={formData.hourlyRate === 0 ? '' : formData.hourlyRate.toLocaleString()}
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, '');
                  setFormData(prev => ({ ...prev, hourlyRate: parseInt(value) || 0 }));
                }}
                placeholder="미입력"
                className="flex-1 px-3 py-2 bg-secondary rounded-lg text-sm text-primary placeholder:text-destructive/70"
              />
              <span className="text-sm text-muted-foreground">원</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground pl-[92px]">*입력한 시급 기준으로 급여가 계산되요.</p>

          {/* Pay Cycle */}
          <div className="flex items-center gap-3">
            <label className="w-20 text-sm text-muted-foreground flex-shrink-0">급여 주기</label>
            <button 
              onClick={() => setPayCycleSheet(true)}
              className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg text-sm flex-1"
            >
              <span className="text-primary">{formData.payCycle}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
            </button>
          </div>

          {/* Pay Day */}
          <div className="flex items-center gap-3">
            <label className="w-20 text-sm text-muted-foreground flex-shrink-0">급여일</label>
            <button className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg text-sm flex-1">
              <span className="text-primary">미선택 (급여 주기를 먼저 선택해주세요)</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
            </button>
          </div>
        </div>
      </section>

      {/* Personal Info */}
      <section className="px-4 py-4 border-t border-border">
        <h3 className="text-base font-semibold text-foreground mb-4">인적 사항</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="w-24 text-sm text-muted-foreground flex-shrink-0">생년월일</label>
            <span className="text-sm text-foreground">{employee.birthDate} ({employee.age}세)</span>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="w-24 text-sm text-muted-foreground flex-shrink-0">성별</label>
            <span className="text-sm text-foreground">{employee.gender}</span>
          </div>

          <div className="flex items-center gap-3">
            <label className="w-24 text-sm text-muted-foreground flex-shrink-0">휴대폰 번호</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="flex-1 px-3 py-2 border border-border rounded-lg text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="w-24 text-sm text-muted-foreground flex-shrink-0">은행</label>
            <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm flex-1">
              {formData.bank}
              <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="w-24 text-sm text-muted-foreground flex-shrink-0">계좌번호</label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
              className="flex-1 px-3 py-2 border border-border rounded-lg text-sm"
            />
          </div>
        </div>
      </section>

      {/* Memo */}
      <section className="px-4 py-4 border-t border-border">
        <h3 className="text-base font-semibold text-foreground mb-4">메모</h3>
        
        <div className="flex gap-3">
          <label className="w-20 text-sm text-muted-foreground flex-shrink-0">메모 내용</label>
          <textarea
            value={formData.memo}
            onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
            placeholder="메모 사항이 있을 시 입력해주세요"
            className="flex-1 px-3 py-2 border border-border rounded-lg text-sm min-h-[80px] resize-none"
          />
        </div>
      </section>

      {/* Documents */}
      <section className="px-4 py-4 border-t border-border">
        <h3 className="text-base font-semibold text-foreground mb-4">계약서</h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="w-20 text-sm text-muted-foreground flex-shrink-0">이력서</label>
            <button className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg">
              이력서 업로드하기
            </button>
          </div>
          <div className="flex items-center gap-3">
            <label className="w-20 text-sm text-muted-foreground flex-shrink-0">근로계약서</label>
            <button className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg">
              근로계약서 업로드하기
            </button>
          </div>
          <div className="flex items-center gap-3">
            <label className="w-20 text-sm text-muted-foreground flex-shrink-0">보건증</label>
            <button className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg">
              보건증 업로드하기
            </button>
          </div>
        </div>
      </section>

      {/* Work Status */}
      <section className="px-4 py-4 border-t border-border">
        <h3 className="text-base font-semibold text-foreground mb-4">근무 상태</h3>
        
        <div className="flex items-center gap-3">
          <label className="w-20 text-sm text-muted-foreground flex-shrink-0">근무 상태</label>
          <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm flex-1">
            근무
            <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
          </button>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-40">
        <div className="flex gap-3 max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3.5 bg-foreground text-background font-semibold rounded-xl"
          >
            취소
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex-[2] py-3.5 bg-muted text-muted-foreground font-semibold rounded-xl"
          >
            저장하기
          </button>
        </div>
      </div>

      {/* Pay Cycle Bottom Sheet */}
      <BottomSheet
        isOpen={payCycleSheet}
        onClose={() => setPayCycleSheet(false)}
        title="급여 주기"
      >
        <div className="space-y-1">
          {payCycleOptions.map((option) => (
            <button
              key={option}
              onClick={() => {
                handleSelectPayCycle(option);
                setPayCycleSheet(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                formData.payCycle === option
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <button
            onClick={() => setPayCycleSheet(false)}
            className="w-full py-3.5 bg-muted text-muted-foreground font-semibold rounded-xl"
          >
            선택 완료
          </button>
        </div>
      </BottomSheet>

      {/* Work Day Bottom Sheet */}
      <BottomSheet
        isOpen={workDaySheet}
        onClose={() => setWorkDaySheet(false)}
        title="근무일 선택하기"
      >
        <div className="space-y-2">
          {formData.workDays.map((wd, idx) => (
            <div key={idx} className="flex items-center gap-3 py-2">
              <StatusBadge status={wd.status} size="sm" />
              <span className="text-foreground font-medium">{wd.day}</span>
              <span className="text-muted-foreground">({wd.startTime}~{wd.endTime})</span>
            </div>
          ))}
          {formData.workDays.length === 0 && (
            <p className="text-muted-foreground text-sm py-4 text-center">등록된 근무일이 없습니다</p>
          )}
        </div>
        <div className="flex gap-3 mt-4">
          <button className="flex-1 py-3 border border-border font-medium rounded-xl text-foreground">
            근무일 추가하기
          </button>
          <button
            onClick={() => setWorkDaySheet(false)}
            className="flex-1 py-3 bg-muted text-muted-foreground font-medium rounded-xl"
          >
            삭제하기
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};

export default EmployeeEdit;
