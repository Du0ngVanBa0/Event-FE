import { CreatePaymentRequest } from '../types/RequestTypes';
import { ApiResponse, CreatePaymentResponse, PaymentResultResponse } from '../types/ResponseTypes';
import axiosInstance from './axios';

class PaymentService {
    async createPayment(data: CreatePaymentRequest): Promise<ApiResponse<CreatePaymentResponse>> {
        const response = await axiosInstance.post<ApiResponse<CreatePaymentResponse>>(
            'payment/create',
            data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    }
    async getPaymentResult(params: URLSearchParams[]): Promise<ApiResponse<PaymentResultResponse>> {
        const response = await axiosInstance.get<ApiResponse<PaymentResultResponse>>(
            `payment/process-return`, {params}
        );

        return response.data;
    }
}

export const paymentService = new PaymentService();