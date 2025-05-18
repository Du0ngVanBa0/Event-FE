export interface PhuongXa {
    ngayTao: string;
    maPhuongXa: string;
    tenPhuongXa: string;
}

export interface QuanHuyen {
    ngayTao: string;
    maQuanHuyen: string;
    tenQuanHuyen: string;
    phuongXas: PhuongXa[];
}

export interface TinhThanh {
    ngayTao: string;
    maTinhThanh: string;
    tenTinhThanh: string;
    quanHuyens: QuanHuyen[];
}