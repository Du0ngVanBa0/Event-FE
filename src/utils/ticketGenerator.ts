import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { BookingTicket } from '../types/BookingTypes';
import { formatDate, formatCurrency, formatFullAddress } from './helper';

const generateQRCode = async (text: string): Promise<string> => {
    try {
        return await QRCode.toDataURL(text, {
            color: {
                dark: '#1f2937',
                light: '#ffffff'
            },
            width: 150,
            margin: 2
        });
    } catch (err) {
        console.error('Error generating QR code:', err);
        throw err;
    }
};

const createTicketElement = async (ticket: BookingTicket['chiTietVes'][0], booking: BookingTicket): Promise<HTMLElement> => {
    const ticketContainer = document.createElement('div');
    ticketContainer.className = 'ticket-container';
    
    const qrCodeData = await generateQRCode(ticket.maVe);
    
    ticketContainer.innerHTML = `
        <div class="ticket-wrapper">
            <div class="ticket-header">
                <div class="ticket-brand">
                    <h1>Universe Events</h1>
                    <div class="brand-line"></div>
                </div>
                <h2>${booking.suKien.tieuDe}</h2>
                <div class="ticket-meta">
                    <div class="meta-row">
                        <div class="meta-item">
                            <i class="fas fa-user"></i>
                            <span class="meta-label">Khách hàng:</span>
                            <span class="meta-value">${booking?.khachHang?.tenHienThi}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-envelope"></i>
                            <span class="meta-label">Email:</span>
                            <span class="meta-value">${booking?.khachHang?.email}</span>
                        </div>
                    </div>
                    <div class="meta-row">
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span class="meta-label">Thời gian:</span>
                            <span class="meta-value">${formatDate(booking.suKien.thoiGianBatDau)}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span class="meta-label">Địa điểm:</span>
                            <span class="meta-value">${formatFullAddress(booking.suKien.diaDiem)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="ticket-divider">
                <div class="divider-line"></div>
                <div class="divider-circles">
                    <div class="circle left"></div>
                    <div class="circle right"></div>
                </div>
            </div>
            
            <div class="ticket-body">
                <div class="ticket-info">
                    <div class="ticket-type">
                        <h3>${ticket.loaiVe.tenLoaiVe}</h3>
                        <div class="price-tag">
                            <span class="price">${formatCurrency(ticket.loaiVe.giaTien)}</span>
                        </div>
                    </div>
                    <div class="ticket-details">
                        <div class="detail-item">
                            <span class="detail-label">Mã vé:</span>
                            <span class="detail-value">${ticket.maVe}</span>
                        </div>
                    </div>
                </div>
                <div class="qr-section">
                    <div class="qr-code">
                        <img src="${qrCodeData}" alt="QR Code" />
                    </div>
                    <p class="qr-instruction">Quét mã QR để vào sự kiện</p>
                </div>
            </div>
            
            <div class="ticket-footer">
                <div class="footer-content">
                    <div class="footer-left">
                        <p class="disclaimer">
                            <i class="fas fa-info-circle"></i>
                            Vui lòng xuất trình mã QR này tại quầy để vào sự kiện
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .ticket-container {
            width: 850px;
            padding: 25px;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            color: #1f2937;
            font-family: 'Segoe UI', 'Arial', sans-serif;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            border: 2px solid #e5e7eb;
            position: relative;
        }
        
        .ticket-wrapper {
            padding: 35px;
            background: #ffffff;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            border: 1px solid #f3f4f6;
            position: relative;
        }

        .ticket-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .ticket-brand {
            margin-bottom: 20px;
        }
        
        .ticket-brand h1 {
            font-size: 36px;
            margin: 0 0 10px;
            color: #6366f1;
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(99, 102, 241, 0.1);
        }
        
        .brand-line {
            width: 100px;
            height: 3px;
            background: linear-gradient(90deg, #6366f1, #0ea5e9);
            margin: 0 auto;
            border-radius: 2px;
        }

        .ticket-header h2 {
            font-size: 32px;
            margin: 0 0 25px;
            color: #1f2937;
            font-weight: 600;
            line-height: 1.2;
        }
        
        .ticket-meta {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .meta-row {
            display: flex;
            justify-content: space-between;
            gap: 20px;
        }
        
        .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
            padding: 12px 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        
        .meta-item i {
            color: #6366f1;
            font-size: 16px;
            width: 20px;
            text-align: center;
        }
        
        .meta-label {
            font-weight: 600;
            color: #374151;
            min-width: 80px;
        }
        
        .meta-value {
            color: #1f2937;
            font-weight: 500;
        }
        
        .ticket-divider {
            position: relative;
            margin: 30px 0;
            height: 20px;
        }
        
        .divider-line {
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 2px;
            background: repeating-linear-gradient(
                to right,
                #d1d5db 0px,
                #d1d5db 8px,
                transparent 8px,
                transparent 16px
            );
        }
        
        .divider-circles {
            position: absolute;
            top: 50%;
            width: 100%;
            height: 20px;
            transform: translateY(-50%);
        }
        
        .circle {
            position: absolute;
            width: 20px;
            height: 20px;
            background: #f8f9fa;
            border: 2px solid #e5e7eb;
            border-radius: 50%;
            top: 50%;
            transform: translateY(-50%);
        }
        
        .circle.left {
            left: -10px;
        }
        
        .circle.right {
            right: -10px;
        }
        
        .ticket-body {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 30px;
            margin: 30px 0;
            padding: 25px;
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
            border-radius: 12px;
            border: 1px solid #e5e7eb;
        }
        
        .ticket-info {
            flex: 1;
        }
        
        .ticket-type {
            margin-bottom: 20px;
        }
        
        .ticket-type h3 {
            font-size: 28px;
            margin: 0 0 10px;
            color: #1f2937;
            font-weight: 600;
        }
        
        .price-tag {
            display: inline-block;
            padding: 8px 16px;
            color: #1f2937;
        }
        
        .price {
            font-size: 22px;
            font-weight: 700;
            margin: 0;
        }
        
        .ticket-details {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .detail-item {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .detail-label {
            font-weight: 600;
            color: #6b7280;
            min-width: 80px;
        }
        
        .detail-value {
            color: #1f2937;
            font-weight: 500;
            font-family: 'Courier New', monospace;
            background: #ffffff;
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
        }
        
        .status-active {
            color: #10b981 !important;
            font-weight: 600 !important;
            background: #ecfdf5 !important;
            border-color: #10b981 !important;
        }
        
        .qr-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        
        .qr-code {
            padding: 15px;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            border: 2px solid #e5e7eb;
        }
        
        .qr-code img {
            width: 150px;
            height: 150px;
            display: block;
        }
        
        .qr-instruction {
            font-size: 12px;
            color: #6b7280;
            font-weight: 500;
            text-align: center;
            margin: 0;
        }
        
        .ticket-footer {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 2px solid #f3f4f6;
        }
        
        .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .footer-left {
            flex: 1;
        }
        
        .disclaimer {
            color: #6b7280;
            font-size: 14px;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .disclaimer i {
            color: #6366f1;
        }
        
        .footer-right {
            text-align: right;
        }
        
        .website {
            color: #6366f1;
            font-size: 14px;
            font-weight: 600;
            margin: 0;
        }
        
        /* Print-specific styles */
        @media print {
            .ticket-container {
                box-shadow: none;
                border: 2px solid #000;
            }
            
            .ticket-wrapper {
                box-shadow: none;
            }
            
            .brand-line {
                background: #6366f1 !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            
            .meta-item i,
            .disclaimer i {
                color: #000 !important;
            }
        }
    `;

    ticketContainer.appendChild(style);
    return ticketContainer;
};

export const generateTicketPDF = async (ticket: BookingTicket['chiTietVes'][0], booking: BookingTicket): Promise<void> => {
    try {
        const ticketElement = await createTicketElement(ticket, booking);
        const hiddenContainer = document.createElement('div');
        hiddenContainer.style.position = 'fixed';
        hiddenContainer.style.top = '-10000px';
        hiddenContainer.style.left = '-10000px';
        hiddenContainer.style.opacity = '0';
        hiddenContainer.style.pointerEvents = 'none';
        hiddenContainer.style.zIndex = '-1000';

        hiddenContainer.appendChild(ticketElement);
        document.body.appendChild(hiddenContainer);

        // Wait for fonts and images to load
        await new Promise(resolve => setTimeout(resolve, 500));

        const canvas = await html2canvas(ticketElement, {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });

        document.body.removeChild(hiddenContainer);

        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        
        // Add metadata
        pdf.setProperties({
            title: `Vé sự kiện - ${booking.suKien.tieuDe}`,
            subject: `Vé cho ${ticket.loaiVe.tenLoaiVe}`,
            author: 'Universe Events',
            creator: 'Universe Events System'
        });
        
        pdf.save(`ticket-${ticket.maVe}-${booking.suKien.tieuDe.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } catch (error) {
        console.error('Error generating ticket:', error);
        throw error;
    }
};

// Optional: Generate multiple tickets at once
export const generateAllTicketsPDF = async (booking: BookingTicket): Promise<void> => {
    try {
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        let isFirstPage = true;

        for (const ticket of booking.chiTietVes) {
            if (!isFirstPage) {
                pdf.addPage();
            }

            const ticketElement = await createTicketElement(ticket, booking);
            const hiddenContainer = document.createElement('div');
            hiddenContainer.style.position = 'fixed';
            hiddenContainer.style.top = '-10000px';
            hiddenContainer.style.left = '-10000px';
            hiddenContainer.style.opacity = '0';
            hiddenContainer.style.pointerEvents = 'none';
            hiddenContainer.style.zIndex = '-1000';

            hiddenContainer.appendChild(ticketElement);
            document.body.appendChild(hiddenContainer);

            await new Promise(resolve => setTimeout(resolve, 300));

            const canvas = await html2canvas(ticketElement, {
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            document.body.removeChild(hiddenContainer);

            const imgData = canvas.toDataURL('image/png', 1.0);
            
            // Calculate dimensions to fit A4 landscape
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth - 20; // 10mm margin on each side
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            const x = 10; // 10mm margin
            const y = (pageHeight - imgHeight) / 2; // Center vertically

            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
            isFirstPage = false;
        }

        pdf.setProperties({
            title: `Tất cả vé - ${booking.suKien.tieuDe}`,
            subject: `${booking.chiTietVes.length} vé cho sự kiện`,
            author: 'Universe Events',
            creator: 'Universe Events System'
        });

        pdf.save(`all-tickets-${booking.maDatVe}-${booking.suKien.tieuDe.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } catch (error) {
        console.error('Error generating all tickets:', error);
        throw error;
    }
};