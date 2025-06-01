import axiosInstance from './axios';
import { ApiResponse } from '../types/ResponseTypes';
import { KhuVucTemplate } from '../types/ZoneTypes';

export const DefaultZoneService = {
    getAll: async (): Promise<KhuVucTemplate[]> => {
        const response = await axiosInstance.get<ApiResponse<KhuVucTemplate[]>>('khu-vuc-mau');
        return response.data.data;
    }
};

export default DefaultZoneService;