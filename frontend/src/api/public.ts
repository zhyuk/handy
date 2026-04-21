
// ========== auth ========== //

// 로그아웃
export async function logout() {
    const response = await fetch(`/api/auth/logout`);
    if (!response.ok) throw new Error("로그아웃 실패");
    return response.json();
}

// 로그인 계정에 연결된 업장 조회
export async function getMyStores() {
    const res = await fetch('/api/auth/my/stores', {
        credentials: 'include',
    });
    if (!res.ok) throw new Error("업장 조회 실패");
    return res.json();
}

// 로그인 계정 정보 조회
export async function getMe() {
    const res = await fetch('/api/auth/me', {
        credentials: 'include',
    });
    if (!res.ok) throw new Error("내 정보 조회 실패");
    return res.json();
}


// ========== common ========== //

// 인증번호 검증
export async function codeVerify(phone: string, code: string) {
    const response = await fetch("/api/auth/signup/code/verify", {
        method: "POST",
        body: JSON.stringify({ phone, code })
    });
    if (!response.ok) throw new Error("인증번호 검증 실패");
    return response.json();
}

// 인증번호 재전송
export async function codeResend(phone: string) {
    const response = await fetch("/api/auth/signup/code/send", {
        method: "POST",
        body: JSON.stringify({ phone })
    });
    if (!response.ok) throw new Error("인증번호 재전송 실패");
    return response.json();
}

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
export async function getFeedback() {
    const response = await fetch(`/api/common/feedback`, { credentials: 'include' });
    if (!response.ok) throw new Error("건의 내역 조회 실패");
    return response.json();
}

// 알림 내역 조회
export async function getNotification(unread_only = false) {
    const response = await fetch(`/api/common/notification?unread_only=${unread_only}`, { credentials: 'include' });
    if (!response.ok) throw new Error("알림 내역 조회 실패");
    return response.json();
}

// 알림 읽음 처리 
export async function markNotificationRead(id: string) {
    await fetch(`/api/common/notification/${id}/read`, { method: 'PATCH' });
}