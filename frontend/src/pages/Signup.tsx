import { useState } from "react";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { formatPhone } from "@/utils/valid";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const navigate = useNavigate();
    const [phone, setPhone] = useState("");
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const digits = phone.replace(/\s/g, "");
    const isValidPhone = /^010\d{8}$/.test(digits);
    const hasInput = digits.length > 0;

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, "").slice(0, 11);
        setPhone(formatPhone(raw));
        setError(false);
        setErrorMsg("");
    };

    const handleSubmit = () => {
        if (!hasInput) return;

        if (!isValidPhone) {
            setError(true);
            setErrorMsg("올바르지 않은 휴대폰 번호 형식이에요.");
            return;
        }

        // Valid phone - navigate to verification page
        navigate("/verify-code", { state: { phone: digits } });
    };

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

            {/* Form */}
            <div className="mt-8">
                <label className="text-[15px] font-medium text-foreground">
                    휴대폰 번호 <span className="text-destructive">*</span>
                </label>

                <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="숫자만 입력"
                    value={phone}
                    onChange={handlePhoneChange}
                    className={`mt-2 w-full h-[52px] rounded-xl border-2 bg-background px-4 text-[16px] outline-none transition-colors placeholder:text-muted-foreground ${error ? "border-destructive" : "border-input focus:border-primary"
                        }`}
                />

                {error && (
                    <div className="flex items-center gap-1.5 mt-2">
                        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                        <span className="text-destructive text-[13px]">{errorMsg}</span>
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={!hasInput}
                className={`mt-6 w-full h-[54px] rounded-xl text-[16px] font-semibold transition-colors ${isValidPhone && hasInput
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
            >
                인증번호 문자 보내기
            </button>
        </div>
    );
};

export default Signup;
