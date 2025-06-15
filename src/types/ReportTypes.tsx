export interface TopKhachHangResponse {
  maNguoiDung: string;
  tenHienThi: string;
  email: string;
  anhDaiDien: string;
  soVe: number;
  tongTien: number;
}

export interface ThongKeResponse {
  tongSuKien: number;
  tongSuKienChoDuyet: number;
  tongNguoiDung: number;
  doanhThuThang: number;
}

export interface ThongKeSuKienResponse {
  maSuKien: string;
  tieuDe: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  tongDoanhThu: number;
  soVeDaBan: number;
  soVeConLai: number;
}

export interface ReportDataState {
  totalEvents: number;
  pendingEvents: number;
  totalUsers: number;
  activeUsers?: number;
  totalRevenue?: number;
  monthlyRevenue: number;
  popularCategories: {
    name: string;
    count: number;
  }[];
  recentEvents: {
    name: string;
    tickets: number;
    revenue: number;
  }[];
}