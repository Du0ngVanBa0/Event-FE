import { LoaiVe, SuKien } from "./EventTypes";
import { ThanhToanResponse } from './ResponseTypes';

export interface BookingTicket {
    maDatVe: string;
    tongTien: number;
    trangThai: string;
    thoiGianHetHan: Date;
    hoatDong: boolean;
    url?: string;
    chiTietVes: TicketDetailBooking[];
    thanhToans: ThanhToanResponse[];
    suKien: SuKien;
}

export interface TicketDetailBooking {
    maVe: string,
    trangThai: string,
    thoiGianKiemVe: Date,
    loaiVe: LoaiVe
}