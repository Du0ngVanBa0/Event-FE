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
    maKhuVuc?: string; // Add zone reference
    tenKhuVuc?: string; // Add zone name for display
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
    khuVucs?: KhuVucResponse[]; // Add zones to event response
    ngayTao?: string;
}

export interface CreateLoaiVeDTO {
    tenLoaiVe: string;
    moTa: string;
    soLuong: number;
    giaTien: number;
    soLuongToiThieu: number;
    soLuongToiDa: number;
    maKhuVuc: string;
}

export interface CreateSuKienDTO {
    tieuDe: string;
    moTa: string;
    tenDiaDiem: string;
    maPhuongXa: string;
    maDanhMucs: string[];
    loaiVes: CreateLoaiVeDTO[];
    khuVucs?: KhuVucDTO[];
    thoiGianBatDau: string;
    thoiGianKetThuc: string;
    ngayMoBanVe: string;
    ngayDongBanVe: string;
    anhBia: File | null;
}

export interface UpdateSuKienDTO extends Omit<CreateSuKienDTO, 'anhBia'> {
    anhBia?: File | null;
    khuVucs?: KhuVucDTO[]; // Add zones to update DTO
}

export interface KhuVucDTO {
  tenKhuVuc: string;
  moTa?: string;
  viTri: string;
  layoutData: string;
  tempId?: string;
}

export interface KhuVuc extends KhuVucDTO {
  maKhuVuc: string;
  maSuKien: string;
}

export interface KhuVucResponse {
    maKhuVuc: string;
    tempId?: string;
    tenKhuVuc: string;
    moTa?: string;
    viTri: string;
    layoutData: string;
}