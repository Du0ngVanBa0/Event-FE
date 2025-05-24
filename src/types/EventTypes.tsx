export interface TicketType {
    maLoaiVe?: string;
    id?: string;
    tenLoaiVe: string;
    moTa: string;
    soLuong: number;
    giaTien: number;
    veConLai?: number;
    soLuongToiThieu: number;
    soLuongToiDa: number;
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
    loaiVes: TicketType[];
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
    loaiVes: Omit<TicketType, 'maLoaiVe'>[];
}

export interface UpdateSuKienDTO extends Omit<CreateSuKienDTO, 'anhBia'> {
    anhBia?: File | null;
}