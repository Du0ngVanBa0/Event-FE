import { SuKien, TicketType } from "./EventTypes";
import { ThanhToanResponse } from './ResponseTypes';
import { SecurityUser } from "./UserTypes";

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
    khachHang?: SecurityUser
}

export interface TicketDetailBooking {
    maVe: string,
    trangThai: string,
    thoiGianKiemVe: Date,
    loaiVe: TicketType
}

export interface BookingTicketSearchParams {
    maDatVe?: string;
    maKhachHang?: string;
    trangThai?: string;
    fromMoney?: number;
    toMoney?: number;
    fromDate?: string;
    toDate?: string;
}