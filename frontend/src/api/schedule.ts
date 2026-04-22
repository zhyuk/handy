const BASE_URL = import.meta.env.VITE_API_URL ?? '';
const BASE = `${BASE_URL}/api/employee`;
const CREDS = { credentials: 'include' as const };

// 나의 일정 조회
export async function getMySchedule(storeId: number, year: number, month: number) {
    const res = await fetch(`${BASE}/schedule/${storeId}?year=${year}&month=${month}`, { ...CREDS });
    if (!res.ok) throw new Error("일정 조회 실패");
    return res.json();
}

// 전체 직원 일정 조회
export async function getAllSchedule(storeId: number, year: number, month: number) {
    const res = await fetch(`${BASE}/schedule/${storeId}/all?year=${year}&month=${month}`, { ...CREDS });
    if (!res.ok) throw new Error("일정 조회 실패");
    return res.json();
}

// 요일별 전체 직원 일정 조회
export async function getAllScheduleDetail(storeId: number, year: number, month: number, day: number) {
    const res = await fetch(`${BASE}/schedule/${storeId}/detail?year=${year}&month=${month}&day=${day}`, { ...CREDS });
    if (!res.ok) throw new Error("일정 조회 실패");
    return res.json();
}

// 변경 요청 조회
export async function getScheduleChange(storeId: number) {
    const res = await fetch(`${BASE}/schedule/change?store_id=${storeId}`, { ...CREDS });
    if (!res.ok) throw new Error("일정 변경 요청 조회 실패");
    return res.json();
}

// 변경 요청 내역 삭제
export async function deleteScheduleChange(id: string) {
    const res = await fetch(`${BASE}/schedule/change/${id}`, {
        method: 'DELETE',
        ...CREDS,
    });
    if (!res.ok) throw new Error("삭제 실패");
    return res.json();
}