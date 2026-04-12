import { list } from 'postcss';
import apiClient from './axios'

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