import { DanhMucSuKien } from "./EventTypeTypes";

export interface LoginRequest {
    email: string;
    matKhau: string;
}

export type CreateEventCategory = Omit<DanhMucSuKien, 'maDanhMuc' | 'hoatDong'>;

export interface PaginationParams {
    page?: number;
    size?: number;
    sort?: string | string[];
}

export interface RegisterRequest {
    tenNguoiDung: string;
    email: string;
    matKhau: string;
    tenHienThi: string;
}

export interface BookTicketRequest {
    maLoaiVe: string,
    soLuong: number
}

export interface CreatePaymentRequest {
  maDatVe: string;
  bankCode?: string;
}

export interface VerifyOtpRequest {
    maOtp: string;
    maXacThuc: string;
}

export interface ChangeInfoRequest {
  hoVaTen: string;
  matKhauHienTai: string;
  matKhauMoi: string;
  anhDaiDien: File | null;
}