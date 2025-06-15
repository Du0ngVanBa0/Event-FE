import { SuKien, CreateSuKienDTO } from '../types/EventTypes';
import { BaseService } from './baseService';
import { ApiResponse, PaginatedResponse } from '../types/ResponseTypes';
import axiosInstance from './axios';

class EventService extends BaseService<SuKien, CreateSuKienDTO> {
    constructor() {
        super('events');
    }

    async getPaginatedFiler(page: number, size: number, maDanhMuc?: string, hoatDong?: boolean, name?: string) {
        const response = await axiosInstance.get<PaginatedResponse<SuKien>>(
            `${this.endpoint}/page-filter?page=${page}&size=${size}&sort=ngayTao,desc`
            + `${maDanhMuc ? `&maDanhMuc=${maDanhMuc}` : ''}`
            + `${hoatDong != null ? `&hoatDong=${hoatDong}` : ''}`
            + `${name ? `&name=${encodeURIComponent(name)}` : ''}`
        );
        return response.data;
    }

    async getEventById(eventId: string) {
        const response = await axiosInstance.get<ApiResponse<SuKien>>(
            `${this.endpoint}/${eventId}`
        )
        return response.data
    }

    async approveEvent(eventId: string) {
        const response = await axiosInstance.put<ApiResponse<SuKien>>(
            `${this.endpoint}/${eventId}/approve`
        );
        return response.data;
    }

    override async create(data: CreateSuKienDTO): Promise<SuKien> {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (key !== 'anhBia' && key !== 'loaiVes' &&
                key !== 'khuVucs' && key !== 'maDanhMucs' && value !== null) {
                formData.append(key, String(value));
            }
        });

        data.maDanhMucs.forEach((maDanhMuc: string) => {
            formData.append('maDanhMucs', maDanhMuc);
        });

        formData.append('loaiVes', JSON.stringify(data.loaiVes));

        if (data.khuVucs && data.khuVucs.length > 0) {
            formData.append('khuVucs', JSON.stringify(data.khuVucs));
        } else if (data.customKhuVucs && data.customKhuVucs.length > 0) {
            formData.append('khuVucs', JSON.stringify(data.customKhuVucs));
        } else {
            formData.append('khuVucs', JSON.stringify([]));
        }

        if (data.anhBia instanceof File) {
            formData.append('anhBia', data.anhBia);
        }

        const response = await axiosInstance.post<ApiResponse<SuKien>>(
            this.endpoint,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        return response.data.data;
    }

    override async update(id: string, data: Partial<CreateSuKienDTO>): Promise<SuKien> {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (key !== 'anhBia' && key !== 'loaiVes' &&
                key !== 'khuVucs' && key !== 'maDanhMucs' && value !== null) {
                formData.append(key, String(value));
            }
        });

        if (data.maDanhMucs?.length) {
            data.maDanhMucs.forEach((maDanhMuc: string) => {
                formData.append('maDanhMucs', maDanhMuc);
            });
        }

        if (data.khuVucs && data.khuVucs.length > 0) {
            formData.append('khuVucs', JSON.stringify(data.khuVucs));
        } else {
            formData.append('khuVucs', JSON.stringify([]));
        }

        if (data.loaiVes?.length) {
            formData.append('loaiVes', JSON.stringify(data.loaiVes));
        }

        if (data.anhBia instanceof File) {
            formData.append('anhBia', data.anhBia);
        }

        const response = await axiosInstance.put<ApiResponse<SuKien>>(
            `${this.endpoint}/${id}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        return response.data.data;
    }

    async getMyEvents(page: number, size: number, approved?: boolean) {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort: "ngayTao,desc"
        });

        if (approved !== undefined) {
            params.append('approved', approved.toString());
        }

        const response = await axiosInstance.get<PaginatedResponse<SuKien>>(
            `${this.endpoint}/mine?${params.toString()}`
        );
        return response.data;
    }

    async deleteEvent(eventId: string) {
        const response = await axiosInstance.delete<ApiResponse<void>>(
            `${this.endpoint}/${eventId}`
        );
        return response.data;
    }
}

export const eventService = new EventService();
export default eventService;