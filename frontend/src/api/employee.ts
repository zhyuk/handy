const BASE_URL = import.meta.env.VITE_API_URL ?? '';
const BASE = `${BASE_URL}/api/employee`;
const JSON_HEADERS = { 'Content-Type': 'application/json' };
const CREDS = { credentials: 'include' as const };

async function handleResponse(res: Response) {
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || String(res.status));
    }
    return res.json();
}

// 마감 보고 추가
export async function addClosingReport(reportData: {
    store_id: number;
    card_sales: number;
    cash_sales: number;
    transfer_sales: number;
    gift_sales: number;
    discount_amount: number;
    refund_amount: number;
    cash_on_hand: number;
    cash_shortage_type: string | null;
    cash_shortage_amount: number;
    receipt_image_url?: string | null;
    manager_note: string;
    report_date: string;
}) {
    const res = await fetch(`${BASE}/closing-report`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify(reportData),
        ...CREDS,
    });
    return handleResponse(res);
}

// 오늘 마감 완료 여부 확인
export async function checkClosingStatus(storeId: number): Promise<{ is_completed: boolean }> {
    const res = await fetch(`${BASE}/closing-report/check?store_id=${storeId}`, {
        ...CREDS,
    });
    return handleResponse(res);
}

// 내 정보 조회
export async function getMyInfo(store_id: number) {
    const res = await fetch(`${BASE}/mypage?store_id=${store_id}`, {
        headers: JSON_HEADERS,
        ...CREDS,
    });
    return handleResponse(res);
}

// 출근
export async function clockIn(store_id: number) {
    const res = await fetch(`${BASE}/work/clock-in`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ store_id }),
        ...CREDS,
    });
    return handleResponse(res);
}

// 퇴근
export async function clockOut(store_id: number) {
    const res = await fetch(`${BASE}/work/clock-out`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ store_id }),
        ...CREDS,
    });
    return handleResponse(res);
}

// 휴게 시작
export async function breakStart(store_id: number) {
    const res = await fetch(`${BASE}/work/break-start`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ store_id }),
        ...CREDS,
    });
    return handleResponse(res);
}

// 휴게 종료
export async function breakEnd(store_id: number) {
    const res = await fetch(`${BASE}/work/break-end`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ store_id }),
        ...CREDS,
    });
    return handleResponse(res);
}

// 근무 기록 수정 요청
export async function requestWorkLogChange(workLogData: {
    store_id: number;
    type: string;
    date: string;
    origin_start?: string;
    origin_end?: string;
    desired_start?: string;
    desired_end?: string;
    desired_break?: string;
    reason: string;
}) {
    const res = await fetch(`${BASE}/worklog/request`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify(workLogData),
        ...CREDS,
    });
    if (res.status === 409) {
        const data = await res.json();
        throw new Error("409:" + data.detail);
    }
    return handleResponse(res);
}

// 출근 기록 수정내역 조회
export async function fetchWorkLogRequests(storeId: number) {
    const res = await fetch(`${BASE}/worklog/request?store_id=${storeId}`, {
        ...CREDS,
    });
    return handleResponse(res);
}

// 변경된 스케줄 조회
export async function getScheduleChange(id: number) {
    const res = await fetch(`${BASE}/schedule-change/${id}`, { ...CREDS });
    return handleResponse(res);
}

// 추가된 스케줄 조회
export async function getScheduleWork(id: number) {
    const res = await fetch(`${BASE}/schedule-work/${id}`, { ...CREDS });
    return handleResponse(res);
}

// 오늘 근무일정 조회
export async function getTodayWork(store_id: number) {
    const res = await fetch(`${BASE}/work/today`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ store_id }),
        ...CREDS,
    });
    if (res.status === 404) return null;  // 오늘 일정 없음
    return handleResponse(res);
}

// 근무 상태 조회
export async function getWorkStatus(store_id: number) {
    const res = await fetch(`${BASE}/work/status`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ store_id }),
        ...CREDS,
    });
    return handleResponse(res);
}

// 이번주 근무일정 조회
export async function getWeeklyWork(store_id: number) {
    const res = await fetch(`${BASE}/work`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ store_id }),
        ...CREDS,
    });
    return handleResponse(res);
}

// 공지사항 조회
export async function getStoreNotice(store_id: number) {
    const res = await fetch(`${BASE}/notice`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ store_id }),
        ...CREDS,
    });
    return handleResponse(res);
}