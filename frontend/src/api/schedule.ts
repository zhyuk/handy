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
