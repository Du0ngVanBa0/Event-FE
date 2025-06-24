import { DanhGia, CreateReviewRequest } from '../types/ReviewTypes';
import { ApiResponse, PaginatedResponse } from '../types/ResponseTypes';
import { PaginationParams } from '../types/RequestTypes';
import axiosInstance from './axios';

export const reviewService = {
    getReviewsByEvent: async (
        maSuKien: string, 
        params?: PaginationParams
    ): Promise<PaginatedResponse<DanhGia>> => {
        const queryParams = new URLSearchParams();
        
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());
        if (params?.sort) {
            if (Array.isArray(params.sort)) {
                params.sort.forEach(s => queryParams.append('sort', s));
            } else {
                queryParams.append('sort', params.sort);
            }
        }

        const response = await axiosInstance.get<PaginatedResponse<DanhGia>>(
            `events/${maSuKien}/reviews?${queryParams.toString()}`
        );
        return response.data;
    },

    createReview: async (
        maSuKien: string, 
        request: CreateReviewRequest
    ): Promise<ApiResponse<DanhGia>> => {
        const response = await axiosInstance.post<ApiResponse<DanhGia>>(
            `events/${maSuKien}/reviews`,
            request
        );
        return response.data;
    }
}