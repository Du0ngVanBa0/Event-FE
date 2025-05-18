import axiosInstance from './axios';
import { ApiResponse } from '../types/ResponseTypes';
import { ThongKeResponse } from '../types/ReportTypes';

export const reportService = {
    getAll: async (thang?: number, nam?: number): Promise<ApiResponse<ThongKeResponse>> => {
        const params: Record<string, number> = {};
        
        if (thang !== undefined) params.thang = thang;
        if (nam !== undefined) params.nam = nam;
        const response = await axiosInstance.get<ApiResponse<ThongKeResponse>>('thong-ke', {params});
        return response.data;
    }
};

export default reportService;