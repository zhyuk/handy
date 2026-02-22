
// 전화번호 유효성 검사
export const formatPhone = (value: string) => {
    const v = value.replace(/[^0-9]/g, "").slice(0, 11);

    if (v.length <= 3) return v;
    if (v.length <= 7) return `${v.slice(0, 3)}-${v.slice(3)}`;
    return `${v.slice(0, 3)}-${v.slice(3, 7)}-${v.slice(7)}`;
};
