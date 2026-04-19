
// role 컬럼의 값에 따라 직원 / 사장님 리턴하는 포맷팅 함수
export const setRoleLabel = (roleLabel: string) => {
    if (roleLabel == "employee") return "직원"
    else if (roleLabel == "owner") return "사장님"
}