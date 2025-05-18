export interface DanhMucPhoBien {
    tenDanhMuc: string;
    soSuKien: number;
  }
  
  export interface SuKienHot {
    tenSuKien: string;
    maSuKien: string;
    soVeBan: number;
    doanhThu: number;
  }
  
  export interface ThongKeResponse {
    tongSuKien: number;
    tongSuKienChoDuyet: number;
    tongNguoiDung: number;
    doanhThuThang: number;
    danhMucPhoBien: DanhMucPhoBien[];
    suKienHot: SuKienHot[];
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