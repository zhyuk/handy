import { useState } from "react";
import { ChevronLeft, CircleAlert, CircleCheck } from "lucide-react";

// Mock data for demonstration
const BUSINESS_DATA: Record<string, {
    name: string;
    address: string;
    industry: string;
    representative: string;
    phone: string;
}> = {
    "1231212340": {
        name: "메가커피 동작점",
        address: "서울특별시 영등포구 도신로64길 10, 2층,3층(신길동)",
        industry: "음식 / 카페",
        representative: "김준서",
        phone: "02 1234 1234",
    },
};

type VerifyState = "idle" | "error" | "not-found" | "success";

const SERVICE_KEY = import.meta.env.VITE_BUSINESS_API_KEY;

const BusinessVerify = () => {
    const [rawDigits, setRawDigits] = useState("");
    const [verifyState, setVerifyState] = useState<VerifyState>("idle");
    const [businessInfo, setBusinessInfo] = useState<typeof BUSINESS_DATA[string] | null>(null);

    // 사업자 번호 포매팅 함수
    const formatBusinessNumber = (digits: string) => {
        if (digits.length <= 3) return digits;
        if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
    };

    const handleChange = (e) => {
        const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 10);
        setRawDigits(onlyDigits);
        if (verifyState !== "idle") setVerifyState("idle");
        setBusinessInfo(null);
    };

    const isComplete = rawDigits.length === 10;
    const isValidFormat = /^\d{10}$/.test(rawDigits);

    const handleVerify = async () => {
        if (!isValidFormat) {
            setVerifyState("error");
            return;
        }

        try {
            const res = await fetch(`/api/owner/business/${rawDigits}`);

            if (!res.ok) throw new Error("Network response was not ok");

            const data = await res.json();

            console.log(data);

            // // Bizno API 응답 규격: result가 "1"일 때 정상 조회
            // if (data.result === "1" && data.items && data.items.length > 0) {
            //     const result = data.items[0];

            //     setVerifyState("success");
            //     setBusinessInfo({
            //         name: result.company || "-",
            //         // b_address가 실제 주소 필드인 경우가 많으므로 확인 필요
            //         address: result.address || "-",
            //         // Bizno 응답 필드에 맞게 매핑 (status: 영업상태 등)
            //         industry: result.kind || "-",
            //         representative: result.ceo || "-",
            //         phone: result.tel || "-"
            //     });
            // } else {
            //     // result가 "0"이거나 검색 결과가 없는 경우
            //     setVerifyState("not-found");
            // }

        } catch (e) {
            console.error("API Error:", e);
            setVerifyState("not-found");
        }
    };

    const inputBorderClass =
        verifyState === "error" || verifyState === "not-found"
            ? "border-destructive ring-1 ring-destructive"
            : verifyState === "success"
                ? "border-success ring-1 ring-success"
                : "border-input";

    return (
        <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
            {/* Header */}
            <div className="px-4 pt-4">
                <button className="p-1 -ml-1" aria-label="뒤로가기">
                    <ChevronLeft className="w-6 h-6 text-foreground" />
                </button>
            </div>

            {/* Title */}
            <div className="px-6 pt-6 pb-8">
                <h1 className="text-2xl font-bold leading-tight text-foreground">
                    등록할 매장의
                    <br />
                    사업자 인증을 진행할게요
                </h1>
            </div>

            {/* Form */}
            <div className="px-6 flex-1">
                <label className="text-sm text-muted-foreground mb-2 block">
                    사업자 번호 <span className="text-destructive">*</span>
                </label>

                <input
                    type="text"
                    inputMode="numeric"
                    value={formatBusinessNumber(rawDigits)}
                    onChange={handleChange}
                    placeholder="사업자 번호 (숫자만 입력)"
                    className={`w-full px-4 py-4 rounded-lg border bg-background text-foreground text-base outline-none transition-colors ${inputBorderClass} placeholder:text-muted-foreground/60`}
                />

                {/* Status messages */}
                {verifyState === "error" && (
                    <div className="flex items-center gap-1.5 mt-2">
                        <CircleAlert className="w-4 h-4 text-destructive" />
                        <span className="text-sm text-destructive">올바르지 않은 사업자 번호 형식이에요.</span>
                    </div>
                )}
                {verifyState === "not-found" && (
                    <div className="flex items-center gap-1.5 mt-2">
                        <CircleAlert className="w-4 h-4 text-destructive" />
                        <span className="text-sm text-destructive">조회되지 않는 사업자 번호에요.</span>
                    </div>
                )}
                {verifyState === "success" && (
                    <div className="flex items-center gap-1.5 mt-2">
                        <CircleCheck className="w-4 h-4 text-success" />
                        <span className="text-sm text-success">조회되었어요.</span>
                    </div>
                )}

                {/* Verify Button */}
                <button
                    onClick={handleVerify}
                    disabled={!isComplete}
                    className={`w-full mt-6 py-4 rounded-xl text-base font-semibold transition-colors ${isComplete
                        ? "bg-primary text-primary-foreground active:opacity-90"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                        }`}
                >
                    사업자 번호 조회하기
                </button>

                {/* Success info */}
                {verifyState === "success" && businessInfo && (
                    <>
                        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                            * 사업자 번호 조회를 성공했어요.
                            <br />
                            &nbsp;&nbsp;아래 내용을 확인 후 사업자 등록증을 업로드해 주세요.
                        </p>

                        <div className="border-t border-border mt-6 pt-6 space-y-5">
                            <InfoRow label="사업장명" value={businessInfo.name} />
                            <InfoRow label="주소" value={businessInfo.address} />
                            <InfoRow label="업종" value={businessInfo.industry} />
                            <InfoRow label="대표자명" value={businessInfo.representative} />
                            <InfoRow label="대표번호" value={businessInfo.phone} />
                        </div>

                        <button className="w-full mt-8 mb-10 py-4 rounded-xl text-base font-semibold bg-primary text-primary-foreground active:opacity-90">
                            사업자 등록증 업로드하기
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-base font-semibold text-foreground mt-0.5">{value}</p>
    </div>
);

export default BusinessVerify;
