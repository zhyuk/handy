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