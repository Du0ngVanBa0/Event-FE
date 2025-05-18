export interface JwtPayload {
    vaiTro: string;
    tenNguoiDung: string;
    tenHienThi: string;
    maNguoiDung: string;
    anhDaiDien: string;
    sub: string;
    iat: number;
    exp: number;
}

export interface User {
    id: string;
    email: string;
    username: string;
    displayName: string;
    role: 'ADMIN' | 'USER';
    avatar?: string;
}