const BASE_URL = import.meta.env.VITE_API_URL ?? '';

// 내 정보 조회
export async function getInfo(memberId: number, storeId: number) {
    const res = await fetch(`${BASE_URL}/api/owner/mypage/${memberId}/info?store_id=${storeId}`, {
        credentials: "include"
    });
    if (!res.ok) throw new Error('정보를 불러오는데 실패했습니다.');
    return await res.json();
}

// 내 매장 정보 조회
export async function getMyStore(memberId: number) {
    try {
        const res = await fetch(`${BASE_URL}/api/owner/mypage/${memberId}/stores`, {
            credentials: "include"
        });
        if (!res.ok) throw new Error('매장 정보를 불러오는데 실패했습니다.');
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("API 호출 에러:", err);
        throw err;
    }
}

// 내 닉네임 수정
export async function updateNickname(storeId: number, nickname: string, memberId: number) {
    try {
        const res = await fetch(`${BASE_URL}/api/owner/mypage/${storeId}/nickname`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ nickname, member_id: memberId }),
        });
        if (!res.ok) throw new Error('닉네임 수정에 실패했습니다.');
        return await res.json();
    } catch (err) {
        console.error("API 호출 에러:", err);
        throw err;
    }
}

// 날짜 포매팅
export function formatDate(date: string) {
    return date.replace(/-/g, ".");
}

// 만 나이 계산기
export function calcAge(birth: string) {
    const today = new Date();
    const birthDate = new Date(birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
};

// 전화번호 포매팅
export function formatPhone(phone: string) {
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
}

// 가입날짜 계산기
export function calculateDaysSince(dateString) {
    if (!dateString) return 0;

    const joinedDate = new Date(dateString); // 가입 날짜
    const today = new Date(); // 오늘 날짜

    // 두 날짜의 시각 정보를 00:00:00으로 초기화 (순수하게 날짜 차이만 계산하기 위함)
    joinedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // 밀리초 단위 차이 계산
    const diffTime = today.getTime() - joinedDate.getTime();

    // 밀리초를 일(day) 단위로 변환 (1일 = 24시간 * 60분 * 60초 * 1000밀리초)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};