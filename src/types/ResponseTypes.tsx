export interface ApiResponse<T> {
    success: boolean;
    message: string | null;
    data: T;
    error?: string | null;
}

export interface LoginResponseData {
    token?: string;
    maOtp?: string;
}

interface PageInfo {
    pageNumber: number;
    pageSize: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
}

interface SortInfo {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
}

export interface CreatePaymentResponse {
    paymentUrl: string;
    maThanhToan: string;
    maDatVe: string;
}
  
export interface PaymentResultResponse {
    success: boolean;
    message: string;
    maDatVe: string;
    maThanhToan: string;
    maGiaoDich: string;
    ngayThanhToan: Date;
    tongTien: number;
}
export interface LoaiVeInfo {
    maLoaiVe: string;
    tenLoaiVe: string;
    giaTien: number;
}

export interface ThanhToanResponse {
    maThanhToan: string;
    soTien: number;
    phuongThuc: string;
    trangThai: string;
    thoiGianThanhToan: Date;
}

export type LoginResponse = ApiResponse<LoginResponseData>;

export interface RegisterResponse extends ApiResponse<LoginResponseData> {
    errors?: {
        tenNguoiDung?: string;
        email?: string;
        matKhau?: string;
        tenHienThi?: string;
    };
}
export interface PaginatedData<T> {
    content: T[];
    pageable: PageInfo;
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: SortInfo;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;