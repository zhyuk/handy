import { useState } from "react";
import { Store, HardHat } from "lucide-react";
import { useNavigate } from "react-router-dom";

const memberTypes = [
  {
    id: "owner",
    title: "사장 회원",
    description: "핸디에 매장을 등록하실\n사장님이라면 선택해 주세요.",
    icon: Store,
    iconBg: "bg-accent",
    navigation: "/owner/business-verify"
  },
  {
    id: "staff",
    title: "직원 회원",
    description: "핸디를 사용중인 매장의\n직원이라면 선택해 주세요.",
    icon: HardHat,
    iconBg: "bg-accent",
    navigation: "/employee/business-verify"
  },
] as const;

const Index = () => {
  const navigate = useNavigate();

  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background px-6 pt-16 pb-8">
      <div className="mb-2">
        <h1 className="text-2xl font-bold leading-tight text-foreground">
          회원 유형을
          <br />
          선택해 주세요
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          서비스 이용을 위해 회원 유형을 선택해 주세요
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {memberTypes.map((type) => {
          const isSelected = selected === type.id;
          return (
            <button
              key={type.id}
              onClick={() => navigate(type.navigation)}
              className={`flex items-center gap-5 rounded-2xl border-2 p-5 text-left transition-all ${isSelected
                ? "border-primary bg-primary/5"
                : "border-border bg-card"
                }`}
            >
              <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full ${type.iconBg}`}>
                <type.icon className="h-9 w-9 text-accent-foreground" />
              </div>
              <div>
                <h2
                  className={`text-lg font-bold ${isSelected ? "text-primary" : "text-foreground"
                    }`}
                >
                  {type.title}
                </h2>
                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                  {type.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Index;
