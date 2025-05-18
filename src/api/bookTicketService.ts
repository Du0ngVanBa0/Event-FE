import { BookingTicket, BookingTicketSearchParams } from '../types/BookingTypes';
import { BookTicketRequest } from '../types/RequestTypes';
import { ApiResponse, PaginatedData } from '../types/ResponseTypes';
import axiosInstance from './axios';

class BookTicketService {
    async book(data: BookTicketRequest[]): Promise<ApiResponse<BookingTicket>> {
        const response = await axiosInstance.post<ApiResponse<BookingTicket>>(
            'ticket-holder',
            { chiTietDatVe: data },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    }

    async getMyTickets(page: number, size: number, status?: string): Promise<ApiResponse<PaginatedData<BookingTicket>>> {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort: 'ngayTao,desc'
        });

        if (status) {
            params.append('trangThai', status);
        }

        const response = await axiosInstance.get<ApiResponse<PaginatedData<BookingTicket>>>(
            `ticket-holder/mine?${params.toString()}`
        );

        return response.data;
    }

    async getBookingById(id: string): Promise<ApiResponse<BookingTicket>> {
        const response = await axiosInstance.get<ApiResponse<BookingTicket>>(
            `/ticket-holder/${id}`
        );

        return response.data;
    }

    async getBookManage(page: number, size: number, requestBody?: BookingTicketSearchParams): Promise<ApiResponse<PaginatedData<BookingTicket>>> {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort: 'ngayTao,desc'
        });
        const response = await axiosInstance.post<ApiResponse<PaginatedData<BookingTicket>>>(
            `/ticket-holder/search?${params.toString()}`, requestBody
        )

        return response.data;
    }

    async deleteById(maDatVe?: string): Promise<void> {
        const response = await axiosInstance.delete(
            `/ticket-holder/${maDatVe}`
        )

        return response.data;
    }
}

export const bookTicketService = new BookTicketService();