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
    maKhuVuc?: string;
    tenKhuVuc?: string;
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

export interface KhuVucEventRequest {
    maKhuVucMau: string;
    tenTuyChon?: string;
    moTaTuyChon?: string;
    mauSacTuyChon?: string; 
    
    toaDoX?: number;
    toaDoY?: number;
    chieuRong?: number;
    chieuCao?: number;
    viTri?: string;
}

export interface KhuVucDTO {
    tempId?: string;
    tenKhuVuc: string;
    moTa?: string;
    viTri: string;
    layoutData: string;
}

export interface KhuVuc extends KhuVucDTO {
    maKhuVuc: string;
    maSuKien: string;
}

export interface KhuVucResponse {
    maKhuVuc: string;
    tenHienThi: string; 
    tenGoc: string;
    moTa?: string;
    viTri: string;
    mauSacHienThi: string; 
    toaDoX: number;
    toaDoY: number;
    chieuRong: number;
    chieuCao: number;
    hoatDong: boolean;
    template?: {
        maKhuVucMau: string;
        tenKhuVuc: string;
        mauSac: string;
        hinhDang: string; 
        thuTuHienThi: number;
    };
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
    
    khuVucs?: KhuVucEventRequest[];
    customKhuVucs?: KhuVucDTO[];
    
    thoiGianBatDau: string;
    thoiGianKetThuc: string;
    ngayMoBanVe: string;
    ngayDongBanVe: string;
    anhBia: File | null;
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
    khuVucs?: KhuVucResponse[];
    ngayTao?: string;
    nguoiToChuc?: NDResponse;
}

export interface NDResponse {
    maNguoiDung: string;
    tenHienThi: string;
    email: string;
}

export interface KhuVucTemplate {
    maKhuVucMau: string;
    tenKhuVuc: string;
    moTa: string;
    mauSac: string;
    hinhDang: string;
    thuTuHienThi: number;
    hoatDong: boolean;
    toaDoXMacDinh?: number;
    toaDoYMacDinh?: number;
    chieuRongMacDinh?: number;
    chieuCaoMacDinh?: number;
}