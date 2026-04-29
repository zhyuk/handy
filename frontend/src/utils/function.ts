
// role 컬럼의 값에 따라 직원 / 사장님 리턴하는 포맷팅 함수
export const setRoleLabel = (roleLabel: string) => {
    if (roleLabel == "employee") return "직원"
    else if (roleLabel == "owner") return "사장님"
}

// 이미지 조회 함수
const API_BASE = import.meta.env.VITE_API_URL ?? '';
export const getPhotoUrl = (photo: string): string => {
    // console.log('API_BASE:', import.meta.env.VITE_API_URL);
    // console.log('photo url:', getPhotoUrl(photo));
    return photo.startsWith('/uploads') ? `${API_BASE}${photo}` : photo;
}
