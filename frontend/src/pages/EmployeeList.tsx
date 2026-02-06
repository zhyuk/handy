import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { FilterTabs } from '@/components/FilterTabs';
import { EmployeeCard } from '@/components/EmployeeCard';
import { BottomNav } from '@/components/BottomNav';
import { mockEmployees } from '@/types/employee';

const EmployeeList = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('전체');

  const filterTabs = [
    { label: '전체', count: mockEmployees.length },
    { label: '오픈', count: mockEmployees.filter(e => e.status.includes('오픈')).length },
    { label: '미들', count: mockEmployees.filter(e => e.status.includes('미들')).length },
    { label: '마감', count: mockEmployees.filter(e => e.status.includes('마감')).length },
  ];

  const filteredEmployees = activeFilter === '전체'
    ? mockEmployees
    : mockEmployees.filter(e => e.status.includes(activeFilter as any));

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="직원 관리" showBack />

      {/* Tab Navigation */}
      <div className="px-4 pt-2">
        <div className="flex gap-4 border-b border-border">
          <button className="pb-2 px-1 text-sm font-semibold text-foreground border-b-2 border-foreground">
            직원 관리
          </button>
          <button className="pb-2 px-1 text-sm font-medium text-muted-foreground relative">
            가입요청 2건
            <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 bg-destructive rounded-full" />
          </button>
          <button className="pb-2 px-1 text-sm font-medium text-muted-foreground">
            직원 초대하기
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-3">
        <FilterTabs
          tabs={filterTabs}
          activeTab={activeFilter}
          onTabChange={setActiveFilter}
        />
      </div>

      {/* Employee List */}
      <div className="px-4 space-y-3">
        {filteredEmployees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onClick={() => navigate(`/employee/${employee.id}`)}
          />
        ))}
      </div>

      <BottomNav currentPath="/employees" />
    </div>
  );
};

export default EmployeeList;
