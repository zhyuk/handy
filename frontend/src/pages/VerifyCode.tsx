import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, AlertCircle, CheckCircle2, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { formatPhone } from "@/utils/valid";

const VerifyCode = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const phoneNumber = location.state?.phone || "";
    const formattedPhone = formatPhone(phoneNumber);

    const [code, setCode] = useState("");
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [verified, setVerified] = useState(false);
    const [timeLeft, setTimeLeft] = useState(179); // 2:59
    const [toastMsg, setToastMsg] = useState("인증번호를 발송했어요.");
    const [showToast, setShowToast] = useState(true);
    const [dailyLimit, setDailyLimit] = useState(false);


    useEffect(() => {
        if (verified) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [verified]);

    useEffect(() => {
        if (!showToast) return;
        const t = setTimeout(() => setShowToast(false), 3000);
        return () => clearTimeout(t);
    }, [showToast]);

    useEffect(() => {
        if (code.length !== 5 || verified) return;

        const verifyCode = async () => {
            try {
                // 실제 API 호출
                const res = await fetch("/api/auth/signup/code/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        phone: phoneNumber,
                        code: code,
                    }),
                });

                const result = await res.json();

                if (!res.ok) {
                    setVerified(false);
                    setError(true);
                    setErrorMsg(result.detail); // FastAPI 에러 메시지
                    return;
                }

                setVerified(true);
                setError(false);
                setErrorMsg("");

            } catch (err) {
                setVerified(false);
                setError(true);
                setErrorMsg("서버와 통신 중 문제가 발생했어요.");
            }
        };

        verifyCode();
    }, [code, phoneNumber, verified]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, "").slice(0, 5);
        setCode(raw);
        setError(false);
        setErrorMsg("");
    };

    const handleResend = async () => {
        setError(false);
        setErrorMsg("");
        try {
            const res = await fetch("/api/auth/signup/code/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: phoneNumber }),
            });

            const result = await res.json();

            if (!res.ok) {
                setError(true);
                setErrorMsg(result.detail);
                return;
            }

            setTimeLeft(179);
            setCode("");
            setVerified(false);
            setToastMsg("인증번호를 재발송했어요.");
            setShowToast(true);

        } catch {
            setError(true);
            setErrorMsg("재발송 중 오류가 발생했어요.");
        }
    };

    const handleSubmit = () => {
        if (!verified) return;
        navigate("/signup/setup");
    };

    const isResendActive = !verified;
    const canSubmit = verified;

    return (
        <div className="flex flex-col min-h-screen bg-background px-5 pt-14">
            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                className="mb-6 -ml-1 text-primary w-fit"
            >
                <ChevronLeft className="w-7 h-7" strokeWidth={2.5} />
            </button>

            {/* Header */}
            <h1 className="text-[26px] font-bold leading-tight text-foreground">
                회원가입을 위해
                <br />
                본인 인증을 해주세요
            </h1>
            <p className="mt-2 text-muted-foreground text-[15px]">
                휴대폰 번호를 아이디로 사용해요
            </p>

            {/* Phone number field */}
            <div className="mt-8">
                <label className="text-[15px] font-medium text-foreground">
                    휴대폰 번호 <span className="text-destructive">*</span>
                </label>

                <div className="flex gap-3 mt-2">
                    <input
                        type="tel"
                        readOnly
                        value={formattedPhone}
                        className="flex-1 h-[52px] rounded-xl border-2 border-input bg-muted/50 px-4 text-[16px] text-muted-foreground outline-none"
                    />
                    <button
                        onClick={handleResend}
                        disabled={!isResendActive}
                        className={`h-[52px] px-5 rounded-xl text-[15px] font-semibold transition-colors ${isResendActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                            }`}
                    >
                        재전송
                    </button>
                </div>

                <p className="mt-2 text-primary text-[13px]">
                    *위 휴대폰 번호로 발송된 인증 번호를 입력해주세요
                </p>
            </div>

            {/* Verification code field */}
            <div className="mt-6">
                <label className="text-[15px] font-medium text-foreground">
                    인증번호 <span className="text-destructive">*</span>
                </label>

                <div className="relative mt-2">
                    <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="인증번호 5자리 입력"
                        value={code}
                        onChange={handleCodeChange}
                        disabled={verified}
                        maxLength={5}
                        className={`w-full h-[52px] rounded-xl border-2 bg-background px-4 text-[16px] outline-none transition-colors placeholder:text-muted-foreground ${error
                            ? "border-destructive"
                            : verified
                                ? "border-input"
                                : "border-input focus:border-primary"
                            }`}
                    />
                    {!verified && timeLeft > 0 && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[15px] text-muted-foreground">
                            {formatTime(timeLeft)}
                        </span>
                    )}
                </div>

                {/* Status messages */}
                {verified && (
                    <div className="flex items-center gap-1.5 mt-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-emerald-500 text-[13px]">인증되었습니다</span>
                    </div>
                )}

                {error && (
                    <div className="flex flex-col gap-1 mt-2">
                        <div className="flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                            <span className="text-destructive text-[13px]">{errorMsg}</span>
                        </div>
                    </div>
                )}

                {!verified && !error && (
                    <button className="mt-2 text-foreground text-[13px] underline underline-offset-2">
                        인증번호가 오지 않나요?
                    </button>
                )}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Toast */}
            {showToast && (
                <div className="flex items-center justify-between w-full bg-foreground text-background rounded-xl px-5 py-4 mb-4">
                    <span className="text-[15px]">{toastMsg}</span>
                    <button onClick={() => setShowToast(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`w-full h-[54px] rounded-xl text-[16px] font-semibold transition-colors mb-8 ${verified
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
            >
                다음
            </button>
        </div>
    );
};

export default VerifyCode;
