import { DiaDiem } from '../types/EventTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const formatDate = (date: string | Date | undefined) => {
    if (!date) return '';
    
    const dateObject = typeof date === 'string' ? new Date(date) : date;
    
    return dateObject.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const getImageUrl = (path: string | null, fallback = '/placeholder-event.jpg'): string => {
    if (!path) return fallback;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
};

export const getDefaulImagetUrl = () => {
    return './src/assets/default-avatar.png'
}

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

export const formatDateTime = (date: string | Date | undefined) => {
    if (!date) return '';
    
    const dateObject = typeof date === 'string' ? new Date(date) : date;
    
    return dateObject.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

export const formatFullAddress = (diaDiem: DiaDiem | undefined | null): string => {
    if (!diaDiem) return '';
    
    const parts = [
        diaDiem.tenDiaDiem,
        diaDiem.tenPhuongXa,
        diaDiem.tenQuanHuyen,
        diaDiem.tenTinhThanh
    ];
    
    return parts.filter(Boolean).join(', ');
};