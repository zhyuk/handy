import { list } from 'postcss';
import apiClient from './axios'
import { fsync } from 'fs';

interface ClosingStatusResponse {
    data: ClosingStatusResponse | PromiseLike<ClosingStatusResponse>;
    is_completed: boolean;
}

// 마감 보고 추가
export async function addClosingReport(reportData: {
    store_id: number;
    employee_id: number;
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
    try {
        const res = await fetch('/api/employee/closing-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reportData)
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || '마감 보고 전송에 실패했습니다.');
        }

        return await res.json();
    } catch (err) {
        console.error("API 호출 에러:", err);
        throw err;
    }
}

// 오늘 마감 완료 여부 확인
export async function checkClosingStatus(storeId: number): Promise<ClosingStatusResponse> {
    try {
        // URL 뒤에 쿼리 스트링을 직접 붙여줍니다.
        const res = await fetch(`/api/employee/closing-report/check?store_id=${storeId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || '마감 상태 조회에 실패했습니다.');
        }

        const data = await res.json();
        // console.log("서버 응답 데이터:", data);
        return data;

    } catch (err) {
        console.error("마감 상태 조회 에러:", err);
        throw err;
    }
}

// 내 정보 조회 함수
export async function getMyInfo(employee_id: number, store_id: number) {
    try {
        const res = await fetch(`/api/employee/mypage?employee_id=${employee_id}&store_id=${store_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || '회원 정보 조회에 실패했습니다.');
        }

        return await res.json();

    } catch (err) {
        console.error("회원 정보 조회 에러:", err);
        throw err;
    }
}

// 출근 처리 
export async function clockIn(store_id: number) {
    try {
        const res = await fetch(`/api/employee/work/clock-in`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ store_id })
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || '회원 정보 조회에 실패했습니다.');
        }

        return await res.json();

    } catch (err) {
        console.error("회원 정보 조회 에러:", err);
        throw err;
    }
}

// 퇴근 처리
export async function clockOut(store_id: number) {
    try {
        const res = await fetch(`/api/employee/work/clock-out`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ store_id })
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || '회원 정보 조회에 실패했습니다.');
        }

        return await res.json();

    } catch (err) {
        console.error("회원 정보 조회 에러:", err);
        throw err;
    }
}

// 휴게 시작
export async function breakStart(store_id: number) {
    try {
        const res = await fetch(`/api/employee/work/break-start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ store_id })
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || '회원 정보 조회에 실패했습니다.');
        }

        return await res.json();

    } catch (err) {
        console.error("회원 정보 조회 에러:", err);
        throw err;
    }
}

// 휴게 종료
export async function breakEnd(store_id: number) {
    try {
        const res = await fetch(`/api/employee/work/break-end`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ store_id })
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || '회원 정보 조회에 실패했습니다.');
        }

        return await res.json();

    } catch (err) {
        console.error("회원 정보 조회 에러:", err);
        throw err;
    }
}

// 근무 기록 수정 
export async function requestWorkLogChange(workLogData: {
    store_id: number,
    employee_id: number,
    type: string,
    date: string,
    origin_start: string,
    origin_end: string,
    desired_start: string,
    desired_end: string,
    desired_break: string,
    reason: string
}) {

    try {
        const res = await fetch(`/api/employee/worklog/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(workLogData)
        });

        if (!res.ok) {
            if (res.status === 409) {
                const data = await res.json();
                throw new Error("409:" + data.detail);
            }
            throw new Error(String(res.status));
        }

        return await res.json();

    } catch (err) {
        console.error("회원 정보 조회 에러:", err);
        throw err;
    }
} 

// 출근 기록 수정내역 조회
export const fetchWorkLogRequests = async (employeeId: number, storeId: number) => {
  const res = await fetch(`/api/employee/worklog/request?employee_id=${employeeId}&store_id=${storeId}`);
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
};