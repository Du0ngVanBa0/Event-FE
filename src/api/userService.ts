import axiosInstance from './axios';
import { ApiResponse, PaginatedResponse } from '../types/ResponseTypes';
import { UserProfile } from '../types/UserTypes';

class UserService {
    async getUsers(
        page: number,
        size: number,
        filters: {
            hoatDong?: boolean;
            tenNguoiDung?: string;
            vaiTro?: string;
            tenHienThi?: string;
        } = {}
    ) {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
        });

        if (filters.hoatDong !== undefined) {
            params.append('hoatDong', filters.hoatDong.toString());
        }

        if (filters.tenNguoiDung) {
            params.append('tenNguoiDung', filters.tenNguoiDung);
        }

        if (filters.vaiTro) {
            params.append('vaiTro', filters.vaiTro);
        }

        if (filters.tenHienThi) {
            params.append('tenHienThi', filters.tenHienThi);
        }

        const response = await axiosInstance.get<PaginatedResponse<UserProfile>>(`admin/users?${params.toString()}`);
        return response.data;
    }

    async getUserById(userId: string) {
        const response = await axiosInstance.get<ApiResponse<UserProfile>>(`admin/users/${userId}`);
        return response.data;
    }

    async updateUser(userId: string, userData: Partial<UserProfile>) {
        if (userData.anhDaiDienFile && userData.anhDaiDienFile instanceof File) {
            const formData = new FormData();

            if (userData.tenNguoiDung) formData.append('tenNguoiDung', userData.tenNguoiDung);
            if (userData.tenHienThi) formData.append('tenHienThi', userData.tenHienThi);
            if (userData.email) formData.append('email', userData.email);
            if (userData.matKhau) formData.append('matKhau', userData.matKhau);
            if (userData.hoatDong !== undefined) formData.append('hoatDong', String(userData.hoatDong));

            formData.append('anhDaiDien', userData.anhDaiDienFile);

            const response = await axiosInstance.put<ApiResponse<UserProfile>>(
                `admin/users/${userId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return response.data;
        } else {
            const updateRequest = {
                tenNguoiDung: userData.tenNguoiDung,
                tenHienThi: userData.tenHienThi,
                email: userData.email,
                matKhau: userData.matKhau,
                hoatDong: userData.hoatDong
            };

            const response = await axiosInstance.put<ApiResponse<UserProfile>>(`admin/users/${userId}`, updateRequest,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            return response.data;
        }
    }

    async updateUserRole(userId: string, role: 'ADMIN' | 'USER') {
        const roleRequest = {
            vaiTro: role
        };

        const response = await axiosInstance.put<ApiResponse<UserProfile>>(`admin/users/role/${userId}`, roleRequest);
        return response.data;
    }

    async deleteUser(userId: string) {
        const response = await axiosInstance.delete<ApiResponse<null>>(`admin/users/${userId}`);
        return response.data;
    }
}

export const userService = new UserService();
export default userService;