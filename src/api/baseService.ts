import axiosInstance from './axios';
import { ApiResponse, PaginatedResponse } from '../types/ResponseTypes';
import { PaginationParams } from '../types/RequestTypes';

export abstract class BaseService<T, CreateDTO = Omit<T, 'id'>> {
    protected constructor(protected endpoint: string) {}

    async getAll(): Promise<T[]> {
        const response = await axiosInstance.get<ApiResponse<T[]>>(this.endpoint);
        return response.data.data;
    }

    async getAllPaginated(params: PaginationParams = {}): Promise<PaginatedResponse<T>> {
        const { page = 0, size = 10, sort } = params;
        let url = `${this.endpoint}/page?page=${page}&size=${size}`;
        
        if (sort) {
            const sortParams = Array.isArray(sort) ? sort : [sort];
            sortParams.forEach(sortItem => {
                url += `&sort=${sortItem}`;
            });
        }

        const response = await axiosInstance.get<PaginatedResponse<T>>(url);
        return response.data;
    }

    async getById(id: string): Promise<T> {
        const response = await axiosInstance.get<ApiResponse<T>>(`${this.endpoint}/${id}`);
        return response.data.data;
    }

    async create(data: CreateDTO): Promise<T> {
        const response = await axiosInstance.post<ApiResponse<T>>(this.endpoint, data);
        return response.data.data;
    }

    async update(id: string, data: Partial<CreateDTO>): Promise<T> {
        const response = await axiosInstance.put<ApiResponse<T>>(`${this.endpoint}/${id}`, data);
        return response.data.data;
    }

    async delete(id: string): Promise<void> {
        await axiosInstance.delete(`${this.endpoint}/${id}`);
    }
}