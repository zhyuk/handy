const BASE_URL = import.meta.env.VITE_API_URL ?? '';

interface StoreInfo {
    id: number;
    name: string;
    address: string;
    addressDetail: string | null;
    industry: string;
    owner: string;
    number: string;
}

interface StoreHour {
    id: number;
    open_time: string;
    close_time: string;
    is_holiday: string;
    holiday_cycle: string;
    holiday_day: string[];
}

// 매장정보 조회
export async function getStoreInfo(storeId: number) {
    try {
        const res = await fetch(`${BASE_URL}/api/owner/store/${storeId}`);
        if (!res.ok) throw new Error('매장 데이터를 불러오는데 실패했습니다.');
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("API 호출 에러:", err);
        throw err;
    }
}

// 매장정보 수정
export async function updateStoreInfo(stroeData: StoreInfo) {
    try {
        const res = await fetch(`${BASE_URL}/api/owner/store/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stroeData),
            credentials: 'include',
        });
        if (!res.ok) throw new Error('매장 정보를 수정하는데 실패했습니다.');
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("API 호출 에러:", err);
        throw err;
    }
}

// 운영 시간 (영업 시간/휴무일) 설정
export const updateStoreSetting = async (storeId: number, data: {
    open_time: string;
    close_time: string;
    is_holiday: boolean;
    holiday_cycle: string | null;
    holiday_day: string[];
}) => {
    const res = await fetch(`/api/owner/store/${storeId}/setting`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("설정 저장 실패");
    return res.json();
};

// 운영 시간 (영업 파트) 설정 수정
export const updateStoreParts = async (storeId: number, parts: { name: string; start_time: string; end_time: string }[]) => {
    const res = await fetch(`/api/owner/store/${storeId}/parts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ parts }),
    });
    if (!res.ok) throw new Error("파트 저장 실패");
    return res.json();
};

export const updateAttendanceStandard = async (storeId: number, data: {
    radius: number;
    late_minutes: number;
    has_overtime_pay: boolean;
    overtime_after_8h: boolean;
    overtime_after_40h: boolean;
    overtime_multiplier: number | null;
    overtime_minutes: number | null;
    has_night_pay: boolean;
    night_multiplier: number | null;
    night_minutes: number | null;
    has_holiday_pay: boolean;
    holiday_multiplier_under_8h: number | null;
    holiday_multiplier_over_8h: number | null;
    holiday_minutes: number | null;
}) => {
    const res = await fetch(`/api/owner/store/${storeId}/attendance-standard`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("저장 실패");
    return res.json();
};