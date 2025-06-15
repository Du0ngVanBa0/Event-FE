import axiosInstance from './axios';
import { ApiResponse } from '../types/ResponseTypes';
import { ThongKeResponse } from '../types/ReportTypes';
import { ThongKeRangeParams } from '../types/RequestTypes';

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
};

export default reportService;