import { list } from 'postcss';
import apiClient from './axios'

export interface Post {
    id: number;
    category: string;
    title: string;
    content: string;
    writer: string;
    role: string;
    created_at: string;
    comments: number;
}


// 게시글 목록 조회
export async function fetchBoardList(storeId: number): Promise<Post[]> {
    try {
        const res = await fetch('/api/common/board', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "store_id": storeId })
        });

        if (!res.ok) {
            throw new Error('게시판 데이터를 불러오는데 실패했습니다.');
        }

        const data = await res.json();
        return data;

    } catch (err) {
        console.error("API 호출 에러:", err);
        throw err;
    }
}

// 직원 개인의 일정 조회 
export async function getMySchedule(storeId: number, employeeId: number, year: number, month: number) {
    const response = await fetch(`/api/employee/schedule/${storeId}/${employeeId}?year=${year}&month=${month}`);
    if (!response.ok) throw new Error("일정 조회 실패");
    return response.json();
}

// 전체 직원 일정 조회 
export async function getAllSchedule(storeId: number, year: number, month: number) {
    const response = await fetch(`/api/employee/schedule/${storeId}?year=${year}&month=${month}`);
    if (!response.ok) throw new Error("일정 조회 실패");
    return response.json();
}

// 요일별 전체 직원 일정 조회
export async function getAllScheduleDetail(storeId: number, year: number, month: number, day: number) {
    const response = await fetch(`/api/employee/schedule/${storeId}/detail?year=${year}&month=${month}&day=${day}`);
    if (!response.ok) throw new Error("일정 조회 실패");
    return response.json();
}

// 변경 요청 조회
export async function getScheduleChange(storeId: number, employeeId: number) {
    const response = await fetch(`/api/employee/schedule/change?store_id=${storeId}&employee_id=${employeeId}`);
    if (!response.ok) throw new Error("일정 변경 요청 조회 실패");
    return response.json();
}