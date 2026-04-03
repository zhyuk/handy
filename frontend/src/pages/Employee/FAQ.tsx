import { useState } from "react";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const categories = ["전체", "계정", "서비스이용", "멤버십", "기타"];

type FAQItem = {
  category: string;
  question: string;
  answer: string;
};

const faqData: FAQItem[] = [
  {
    category: "멤버십",
    question: "유료 서비스는 무료 서비스와 무엇이 다른가요?",
    answer: "핸디의 유료 서비스에서는 더 편리한 매장 관리 기능을 만나보실 수 있습니다.\n\n■ 관리 가능한 직원 수 증가\n유료 서비스 이용 시 기존보다 관리 가능한 직원의 수가 n명에서 n명으로 증가합니다.\n\n■ 관리 중인 매장 추가 가능\n기존 무료 기능에서는 하나의 매장만 관리 가능하지만, 유료 기능 사용 시 여러 매장을 추가하고 손쉽게 관리 가능합니다.",
  },
  {
    category: "계정",
    question: "아이디를 여러 개 만들 수 있나요?",
    answer: "아이디는 1인당 하나만 생성 가능합니다. 여러 매장에서 근무하는 경우 하나의 계정으로 여러 매장을 관리할 수 있습니다.",
  },
  {
    category: "서비스이용",
    question: "급여명세서 금액과 실제 급여가 다른 이유가 무엇인가요?",
    answer: "급여명세서는 예상 급여를 기반으로 계산됩니다. 실제 급여는 세금, 공제 항목 등이 반영되어 차이가 발생할 수 있습니다.",
  },
  {
    category: "서비스이용",
    question: "퇴근 처리를 깜빡했어요. 어떻게 하나요?",
    answer: "사장님 또는 매니저에게 퇴근 시간 수정을 요청해주세요. 관리자가 출퇴근 기록을 수정할 수 있습니다.",
  },
  {
    category: "서비스이용",
    question: "알바생의 시급은 어떻게 변경하나요?",
    answer: "사장님 계정에서 직원 관리 > 해당 직원 선택 > 급여 설정에서 시급을 변경할 수 있습니다.",
  },
  {
    category: "서비스이용",
    question: "등록한 매장을 삭제할 수 있나요?",
    answer: "매장 설정에서 매장 삭제가 가능합니다. 단, 삭제 시 모든 데이터가 영구적으로 삭제되므로 주의해주세요.",
  },
];

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  "멤버십":   { bg: '#F0F7FF', color: '#4261FF' },
  "계정":     { bg: '#ECFFF1', color: '#1EDC83' },
  "서비스이용": { bg: '#FDF9DF', color: '#FFB300' },
  "기타":     { bg: '#F7F7F8', color: '#AAB4BF' },
};

const FAQ = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("전체");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = activeCategory === "전체" ? faqData : faqData.filter((f) => f.category === activeCategory);

  return (
    <div className="mx-auto min-h-screen max-w-lg" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-2 pt-4 pb-2 sticky top-0 z-10" style={{ backgroundColor: '#FFFFFF' }}>
        <button onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B' }}>자주 묻는 질문</h1>
      </div>
      <div className="border-b border-border" />

      {/* 배경 영역 */}
      <div style={{ backgroundColor: '#F7F7F8', minHeight: '100vh' }}>
        {/* 카테고리 필터 */}
        <div className="flex gap-2 px-5 pt-4 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button key={cat} onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
                className="flex-shrink-0 rounded-full px-3 py-1.5"
                style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '-0.02em', whiteSpace: 'nowrap', border: `1px solid ${isActive ? '#4261FF' : '#DBDCDF'}`, backgroundColor: isActive ? '#E8F3FF' : '#FFFFFF', color: isActive ? '#4261FF' : '#AAB4BF' }}>
                {cat}
              </button>
            );
          })}
        </div>

        {/* FAQ 아이템 */}
        <div className="px-5 pb-8 flex flex-col gap-3">
          {filtered.map((item, i) => {
            const isOpen = openIndex === i;
            const catStyle = CATEGORY_COLORS[item.category] || { bg: '#F7F7F8', color: '#AAB4BF' };
            return (
              <div key={i} className="rounded-2xl overflow-hidden bg-white" style={{ boxShadow: '2px 2px 12px rgba(0,0,0,0.06)' }}>
                <button className="w-full flex items-start justify-between p-4"
                  onClick={() => setOpenIndex(isOpen ? null : i)}>
                  <div className="text-left flex-1 pr-3">
                    <span className="inline-block rounded-md px-2 py-0.5 mb-2"
                      style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '-0.02em', backgroundColor: catStyle.bg, color: catStyle.color }}>
                      {item.category}
                    </span>
                    <p style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.02em', color: '#19191B', lineHeight: '1.5' }}>
                      Q. {item.question}
                    </p>
                  </div>
                  <ChevronDown className={`h-5 w-5 flex-shrink-0 mt-1 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    style={{ color: '#AAB4BF' }} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4" style={{ borderTop: '1px solid #F7F7F8' }}>
                    <p className="pt-3 whitespace-pre-line"
                      style={{ fontSize: '14px', color: '#70737B', lineHeight: '1.7', letterSpacing: '-0.02em' }}>
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <span style={{ fontSize: '14px', color: '#AAB4BF' }}>해당 카테고리의 질문이 없어요.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
