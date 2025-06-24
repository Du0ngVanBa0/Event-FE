export interface DanhGia {
    maDanhGia: string;
    noiDung: string;
    diemDanhGia: number;
    ngayTao: string;
    hoTenNguoiDung: string;
    anhDaiDienNguoiDung: string | null;
}

export interface CreateReviewRequest {
    noiDung: string;
    diemDanhGia: number;
}

export interface ReviewSocketMessage {
    type: string;
    data: DanhGia;
}
