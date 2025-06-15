import axiosInstance from './axios';
import { ApiResponse } from '../types/ResponseTypes';
import { ThongKeResponse, TopKhachHangResponse } from '../types/ReportTypes';
import { ThongKeRangeParams, TopKhachHangParams } from '../types/RequestTypes';

export const reportService = {
    getAll: async (): Promise<ApiResponse<ThongKeResponse>> => {
        const response = await axiosInstance.get<ApiResponse<ThongKeResponse>>('thong-ke');
        return response.data;
    },
    
    getThongKeByRange: async (params: ThongKeRangeParams): Promise<ApiResponse<ThongKeResponse>> => {
        const startDate = new Date(params.tuNgay);
        const endDate = new Date(params.denNgay);
        
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];
        
        const response = await axiosInstance.get<ApiResponse<ThongKeResponse>>('/thong-ke/range', {
            params: {
                tuNgay: formattedStartDate,
                denNgay: formattedEndDate
            }
        });
        return response.data;
    },

    getTopKhachHangByRange: async (params: TopKhachHangParams): Promise<ApiResponse<TopKhachHangResponse[]>> => {
        const startDate = new Date(params.tuNgay);
        const endDate = new Date(params.denNgay);
        
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];
        
        const response = await axiosInstance.get<ApiResponse<TopKhachHangResponse[]>>('/thong-ke/top-khach-hang', {
            params: {
                tuNgay: formattedStartDate,
                denNgay: formattedEndDate,
                limit: params.limit || 5
            }
        });
        return response.data;
    },

    getTopKhachHangByEvent: async (maSuKien: string, limit: number = 5): Promise<ApiResponse<TopKhachHangResponse[]>> => {
        const response = await axiosInstance.get<ApiResponse<TopKhachHangResponse[]>>(`/thong-ke/top-khach-hang/${maSuKien}`, {
            params: {
                limit
            }
        });
        return response.data;
    }
};

export default reportService;