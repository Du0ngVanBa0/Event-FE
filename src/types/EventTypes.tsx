export interface TicketType {
    id: string;
    tenLoaiVe: string;
    moTa: string;
    soLuong: number;
    giaTien: number;
    soVeConLai?: number;
}

export interface DiaDiem {
    maDiaDiem: string;
    tenDiaDiem: string;
    maPhuongXa: string;
    tenPhuongXa: string;
    maQuanHuyen: string;
    tenQuanHuyen: string;
    maTinhThanh: string;
    tenTinhThanh: string;
}

export interface DanhMucSuKienRef {
    maDanhMuc: string;
    tenDanhMuc: string;
}

export interface LoaiVe {
    maLoaiVe?: string;
    tenLoaiVe: string;
    moTa: string;
    soLuong: number;
    veConLai?: number;
    giaTien: number;
}

export interface SuKien {
    maSuKien: string;
    tieuDe: string;
    moTa: string;
    thoiGianBatDau: string;
    thoiGianKetThuc: string;
    ngayMoBanVe: string;
    ngayDongBanVe: string;
    anhBia: string;
    hoatDong: boolean;
    diaDiem: DiaDiem;
    danhMucs: DanhMucSuKienRef[];
    loaiVes: LoaiVe[];
    ngayTao?: string;
}

export interface CreateSuKienDTO {
    tieuDe: string;
    moTa: string;
    thoiGianBatDau: string;
    thoiGianKetThuc: string;
    ngayMoBanVe: string;
    ngayDongBanVe: string;
    anhBia: File | null;
    tenDiaDiem: string;
    maPhuongXa: string;
    maDanhMucs: string[];
    loaiVes: Omit<LoaiVe, 'maLoaiVe'>[];
}

export interface UpdateSuKienDTO extends Omit<CreateSuKienDTO, 'anhBia'> {
    anhBia?: File | null;
}