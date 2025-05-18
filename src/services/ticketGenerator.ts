import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { BookingTicket } from '../types/BookingTypes';
import { formatDate, formatCurrency, formatFullAddress } from '../utils/helper';

const generateQRCode = async (text: string): Promise<string> => {
    try {
        return await QRCode.toDataURL(text);
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
                <h1>Universe Events</h1>
                <h2>${booking.suKien.tieuDe}</h2>
                <div class="ticket-meta">
                    <p><i class="fas fa-calendar"></i> ${formatDate(booking.suKien.thoiGianBatDau)}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${formatFullAddress(booking.suKien.diaDiem)}</p>
                </div>
            </div>
            
            <div class="ticket-body">
                <div class="ticket-info">
                    <div class="ticket-type">
                        <h3>${ticket.loaiVe.tenLoaiVe}</h3>
                        <p class="price">${formatCurrency(ticket.loaiVe.giaTien)}</p>
                    </div>
                    <div class="ticket-details">
                        <p><strong>Mã vé:</strong> ${ticket.maVe}</p>
                    </div>
                </div>
                <div class="qr-code">
                    <img src="${qrCodeData}" alt="QR Code" />
                </div>
            </div>
            
            <div class="ticket-footer">
                <p class="disclaimer">Vui lòng xuất trình mã QR này tại quầy để vào sự kiện</p>
            </div>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .ticket-container {
            width: 800px;
            padding: 20px;
            background: linear-gradient(135deg, #1a1f35 0%, #2a3149 100%);
            color: white;
            font-family: 'Arial', sans-serif;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
        }
        
        .ticket-wrapper {
            padding: 30px;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
        }

        .ticket-header {
            text-align: center;
        }
        
        .ticket-header h1 {
            font-size: 32px;
            margin: 0 0 10px;
            color: #4a9eff;
            text-shadow: 0 0 10px rgba(74, 158, 255, 0.5);
        }

        .ticket-header h2 {
            font-size: 28px;
            margin: 0 0 20px;
            color: #fff;
        }
        
        .ticket-meta {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 30px;
        }
        
        .ticket-meta p {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0;
            color: #a8b3cf;
        }
        
        .ticket-body {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 30px 0;
            padding: 20px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
        }
        
        .ticket-info {
            flex: 1;
        }
        
        .ticket-type h3 {
            font-size: 24px;
            margin: 0;
            color: #fff;
        }
        
        .price {
            font-size: 20px;
            color: #4a9eff;
            margin: 10px 0;
        }
        
        .qr-code {
            padding: 15px;
            background: white;
            border-radius: 10px;
        }
        
        .qr-code img {
            width: 150px;
            height: 150px;
        }
        
        .ticket-footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .disclaimer {
            color: #a8b3cf;
            font-size: 14px;
            margin: 0;
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

        hiddenContainer.appendChild(ticketElement);
        document.body.appendChild(hiddenContainer);

        const canvas = await html2canvas(ticketElement, {
            scale: 2,
            logging: false,
            useCORS: true
        });

        document.body.removeChild(hiddenContainer);

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        
        pdf.save(`ticket-${ticket.maVe}.pdf`);
    } catch (error) {
        console.error('Error generating ticket:', error);
        throw error;
    }
}; 