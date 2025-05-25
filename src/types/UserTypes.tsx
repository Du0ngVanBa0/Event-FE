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

export interface UserProfile {
    maNguoiDung: string;
    tenNguoiDung: string;
    tenHienThi: string;
    email: string;
    vaiTro: 'ADMIN' | 'USER';
    anhDaiDien?: string;
    anhDaiDienFile?: File;
    hoatDong?: boolean;
    ngayTao?: string;
    matKhau?: string;
}

export interface SecurityUser {
    maNguoiDung?: string;
    tenHienThi?: string;
    email?: string;
}