import axiosInstance from './axios';
import { ApiResponse } from '../types/ResponseTypes';
import { TinhThanh } from '../types/PlaceTypes';

export const placeService = {
    getAll: async (): Promise<TinhThanh[]> => {
        const response = await axiosInstance.get<ApiResponse<TinhThanh[]>>('places');
        return response.data.data;
    }
};

export default placeService;