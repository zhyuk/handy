const BASE_URL = import.meta.env.VITE_API_URL ?? '';

// 직원목록 조회
export async function getStaffList(storeId: number) {
    try {
        const res = await fetch(`${BASE_URL}/api/owner/store/${storeId}/staffs`, {
            credentials: "include"
        });
        if (!res.ok) throw new Error('직원 데이터를 불러오는데 실패했습니다.');
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("API 호출 에러:", err);
        throw err;
    }
}