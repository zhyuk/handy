import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { BottomNav } from '@/components/BottomNav';
import { mockEmployees } from '@/types/employee';
import { ChevronRight } from 'lucide-react';

const EmployeeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const employee = mockEmployees.find(e => e.id === id);

  if (!employee) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">직원을 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <PageHeader title="" showBack />

      {/* Profile Section */}
      <div className="flex flex-col items-center py-6 border-b border-border">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-3">
          {employee.profileImage ? (
            <img
              src={employee.profileImage}
              alt={employee.name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted-foreground/30 to-muted-foreground/50 rounded-full flex items-center justify-center text-2xl font-medium text-muted-foreground">
              {employee.name[0]}
            </div>
          )}
        </div>
        <h2 className="text-xl font-semibold text-foreground">{employee.name}</h2>
      </div>

      {/* Contract Info */}
      <section className="px-4 py-4 border-b border-border">
        <h3 className="text-base font-semibold text-foreground mb-3">계약 정보</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex">
            <span className="w-20 text-muted-foreground flex-shrink-0">고용형태</span>
            <span className="text-foreground font-medium">{employee.employmentType}</span>
          </div>
          <div className="flex">
            <span className="w-20 text-muted-foreground flex-shrink-0">입사일</span>
            <span className="text-foreground font-medium">{employee.hireDate} ({employee.hireDays}일)</span>
          </div>
          <div className="flex">
            <span className="w-20 text-muted-foreground flex-shrink-0">파트</span>
            <span className="flex gap-1">
              {employee.status.map((s, idx) => (
                <StatusBadge key={idx} status={s} size="sm" />
              ))}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="w-20 text-muted-foreground flex-shrink-0 mb-1">근무일</span>
            <div className="space-y-1">
              {employee.workDays.map((wd, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <StatusBadge status={wd.status} size="sm" />
                  <span className="text-foreground">{wd.day}</span>
                  <span className="text-foreground font-medium">{wd.startTime}~{wd.endTime}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex">
            <span className="w-20 text-muted-foreground flex-shrink-0">시급</span>
            <span className="text-foreground font-medium">{employee.hourlyRate.toLocaleString()}원</span>
          </div>
          <div className="flex">
            <span className="w-20 text-muted-foreground flex-shrink-0">급여 주기</span>
            <span className="text-foreground font-medium">{employee.payCycle}</span>
          </div>
          <div className="flex">
            <span className="w-20 text-muted-foreground flex-shrink-0">급여일</span>
            <span className="text-foreground font-medium">{employee.payDay}일</span>
          </div>
        </div>
      </section>

      {/* Personal Info */}
      <section className="px-4 py-4 border-b border-border">
        <h3 className="text-base font-semibold text-foreground mb-3">인적 사항</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex">
            <span className="w-24 text-muted-foreground flex-shrink-0">생년월일</span>
            <span className="text-foreground font-medium">{employee.birthDate} ({employee.age}세)</span>
          </div>
          <div className="flex">
            <span className="w-24 text-muted-foreground flex-shrink-0">성별</span>
            <span className="text-foreground font-medium">{employee.gender}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-muted-foreground flex-shrink-0">휴대폰 번호</span>
            <span className="text-foreground font-medium">{employee.phone}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-muted-foreground flex-shrink-0">은행</span>
            <span className="text-foreground font-medium">{employee.bank}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-muted-foreground flex-shrink-0">계좌번호</span>
            <span className="text-primary font-medium">{employee.accountNumber}</span>
          </div>
        </div>
      </section>

      {/* Memo */}
      <section className="px-4 py-4 border-b border-border">
        <h3 className="text-base font-semibold text-foreground mb-3">메모</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex">
            <span className="w-20 text-muted-foreground flex-shrink-0">메모 내용</span>
            <span className="text-foreground">{employee.note || '-'}</span>
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="px-4 py-4 border-b border-border">
        <h3 className="text-base font-semibold text-foreground mb-3">계약서</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex">
            <span className="w-20 text-muted-foreground flex-shrink-0">이력서</span>
            {employee.resume ? (
              <span className="text-primary font-medium flex items-center gap-1">
                {employee.resume} <ChevronRight className="w-4 h-4" />
              </span>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
          <div className="flex">
            <span className="w-20 text-muted-foreground flex-shrink-0">근로계약서</span>
            {employee.contract ? (
              <span className="text-primary font-medium flex items-center gap-1">
                {employee.contract} <ChevronRight className="w-4 h-4" />
              </span>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
          <div className="flex">
            <span className="w-20 text-muted-foreground flex-shrink-0">보건증</span>
            {employee.healthCert ? (
              <span className="text-primary font-medium flex items-center gap-1">
                {employee.healthCert} <ChevronRight className="w-4 h-4" />
              </span>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        </div>
      </section>

      {/* Edit Button */}
      <div className="px-4 py-4">
        <button
          onClick={() => navigate(`/employee/${id}/edit`)}
          className="w-full py-3.5 bg-foreground text-background font-semibold rounded-xl hover:bg-foreground/90 transition-colors"
        >
          직원 정보 수정하기
        </button>
      </div>

      <BottomNav currentPath="/employees" />
    </div>
  );
};

export default EmployeeDetail;
