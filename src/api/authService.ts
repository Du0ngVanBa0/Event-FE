import axiosInstance from './axios';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload, User } from '../types/UserTypes';
import { LoginRequest, RegisterRequest, VerifyOtpRequest } from '../types/RequestTypes';
import { ApiResponse, LoginResponseData, RegisterResponse } from '../types/ResponseTypes';

export const decodeToken = (token: string): User => {
    const decoded = jwtDecode<JwtPayload>(token);
    const role = decoded.vaiTro as 'ADMIN' | 'USER';
    return {
        id: decoded.maNguoiDung,
        email: decoded.sub,
        username: decoded.tenNguoiDung,
        displayName: decoded.tenHienThi,
        role: role,
        avatar: decoded.anhDaiDien || '',
    };
};

export const authService = {
    login: async (credentials: LoginRequest): Promise<{token: string; user: User}> => {
        const response = await axiosInstance.post<ApiResponse<LoginResponseData>>('auth/login', credentials);
        const loginResponse = response.data;
        
        const token = loginResponse.data.token;
        if (!token) {
            throw new Error('Token is undefined');
        }
        const user = decodeToken(token);

        return { token, user };
    },

    register: async (data: RegisterRequest): Promise<RegisterResponse> => {
        const response = await axiosInstance.post<RegisterResponse>('auth/register', data);
        return response.data;
    },

    verifyOtp: async (data: VerifyOtpRequest): Promise<ApiResponse<LoginResponseData>> => {
        const response = await axiosInstance.post<ApiResponse<LoginResponseData>>('auth/verify-register-otp', data);
        return response.data;
    },

    resendOtp: async (maOtp: string): Promise<ApiResponse<LoginResponseData>> => {
        const response = await axiosInstance.post<ApiResponse<LoginResponseData>>(`auth/resend-otp/${maOtp}`);
        return response.data;
    }
};

export default authService;