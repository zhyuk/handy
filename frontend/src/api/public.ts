
// 자주 묻는 질문 조회 
export async function getFaq() {
    const response = await fetch(`/api/common/faq`);
    if (!response.ok) throw new Error("자주 묻는 질문 조회 실패");
    return response.json();
}

// 서비스 공지사항 조회
export async function getNotice() {
    const response = await fetch(`/api/common/notice`);
    if (!response.ok) throw new Error("서비스 공지사항 조회 실패");
    return response.json();
}

// 서비스 공지사항 세부 조회 
export async function getNoticeDetail(id: number) {
    const response = await fetch(`/api/common/notice/${id}`);
    if (!response.ok) throw new Error("서비스 공지사항 세부 조회 실패");
    return response.json();
}

// 고객 건의 추가
export async function postFeedback(
    member_id: number,
    title: string,
    content: string,
    images: string[]  // base64 data URL[]
) {
    const formData = new FormData();
    formData.append("member_id", String(member_id));
    formData.append("title", title);
    formData.append("content", content);

    // base64 → Blob 변환 후 append
    images.forEach((dataUrl, idx) => {
        const [meta, base64] = dataUrl.split(",");
        const mime = meta.match(/:(.*?);/)?.[1] ?? "image/jpeg";
        const binary = atob(base64);
        const arr = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
        formData.append("images", new Blob([arr], { type: mime }), `image_${idx}.jpg`);
    });

    const response = await fetch("/api/common/feedback", {
        method: "POST",
        body: formData,
    });
    if (!response.ok) throw new Error("건의 등록 실패");
    return response.json();
}

// 고객 건의 내역 조회 
export async function getFeedback(member_id: number) {
    const response = await fetch(`/api/common/feedback/${member_id}`);
    if (!response.ok) throw new Error("건의 내역 조회 실패");
    return response.json();
}