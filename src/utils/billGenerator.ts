import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { BookingTicket } from '../types/BookingTypes';
import { formatDate, formatCurrency, formatFullAddress } from './helper';

const createBillElement = (booking: BookingTicket): HTMLElement => {
    const billContainer = document.createElement('div');
    billContainer.className = 'bill-container';
    
    // Calculate subtotals for each ticket type
    const ticketSummary = booking.chiTietVes.reduce((acc, ticket) => {
        const key = ticket.loaiVe.tenLoaiVe;
        if (!acc[key]) {
            acc[key] = {
                count: 0,
                price: ticket.loaiVe.giaTien,
                total: 0
            };
        }
        acc[key].count++;
        acc[key].total += ticket.loaiVe.giaTien;
        return acc;
    }, {} as Record<string, { count: number; price: number; total: number }>);

    const currentDate = new Date().toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    billContainer.innerHTML = `
        <div class="bill-wrapper">
            <!-- Header -->
            <div class="bill-header">
                <div class="company-info">
                    <h1>UNIVERSE EVENT</h1>
                    <p>Nền tảng bán vé sự kiện hàng đầu Việt Nam</p>
                    <p>Địa chỉ: 02 Thanh Sơn, Thanh Bình, Hải Châu, Đà Nẵng</p>
                    <p>Điện thoại: 032 858 0103 | Email: info@universeevent.vn</p>
                </div>
                <div class="bill-number">
                    <h2>HÓA ĐƠN BÁN VÉ</h2>
                    <p>Số: ${booking.maDatVe}</p>
                    <p>Ngày: ${currentDate}</p>
                </div>
            </div>

            <div class="customer-section">
                <h3>THÔNG TIN KHÁCH HÀNG</h3>
                <div class="customer-details">
                    <p><strong>Họ tên:</strong> ${booking.khachHang?.tenHienThi || 'N/A'}</p>
                    <p><strong>Email:</strong> ${booking.khachHang?.email || 'N/A'}</p>
                </div>
            </div>

            <!-- Event Info -->
            <div class="event-section">
                <h3>THÔNG TIN SỰ KIỆN</h3>
                <div class="event-details">
                    <p><strong>Tên sự kiện:</strong> ${booking.suKien.tieuDe}</p>
                    <p><strong>Thời gian:</strong> ${formatDate(booking.suKien.thoiGianBatDau)} đến ${formatDate(booking.suKien.thoiGianKetThuc)}</p>
                    <p><strong>Địa điểm:</strong> ${formatFullAddress(booking.suKien.diaDiem)}</p>
                </div>
            </div>

            <div class="bill-items">
                <h3>CHI TIẾT VÉ</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Loại vé</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(ticketSummary).map(([ticketType, details], index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${ticketType}</td>
                                <td>${details.count}</td>
                                <td class="text-right">${formatCurrency(details.price)}</td>
                                <td class="text-right">${formatCurrency(details.total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="total-section">
                <div class="total-row">
                    <span class="label">Tạm tính:</span>
                    <span class="value">${formatCurrency(booking.tongTien)}</span>
                </div>
                <div class="total-row">
                    <span class="label">Thuế VAT (0%):</span>
                    <span class="value">0đ</span>
                </div>
                <div class="total-row final-total">
                    <span class="label">TỔNG CỘNG:</span>
                    <span class="value">${formatCurrency(booking.tongTien)}</span>
                </div>
                <div class="total-words">
                    <p><strong>Bằng chữ:</strong> ${convertNumberToWords(booking.tongTien)} đồng</p>
                </div>
            </div>

            <div class="payment-section">
                <div class="payment-status ${booking.hoatDong ? 'paid' : 'pending'}">
                    <p><strong>Trạng thái:</strong> ${booking.hoatDong ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}</p>
                    ${booking.hoatDong ? 
                        `<p><strong>Phương thức:</strong> Chuyển khoản/Thẻ tín dụng</p>` : 
                        `<p><strong>Hạn thanh toán:</strong> ${formatDate(booking.thoiGianHetHan)}</p>`
                    }
                </div>
            </div>

            <!-- Footer -->
            <div class="bill-footer">
                <div class="terms">
                    <h4>ĐIỀU KHOẢN & LưU Ý:</h4>
                    <ul>
                        <li>Vui lòng xuất trình vé (điện tử hoặc in) khi tham dự sự kiện</li>
                        <li>Vé chỉ có giá trị cho sự kiện được ghi trên vé</li>
                    </ul>
                </div>
                <div class="print-info">
                    <p>Hóa đơn được in ngày: ${currentDate}</p>
                </div>
            </div>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .bill-container {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            background: white;
            color: #000;
            font-family: 'Times New Roman', serif;
            font-size: 12px;
            line-height: 1.4;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        .bill-wrapper {
            width: 100%;
            height: 100%;
        }

        .bill-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #000;
        }

        .company-info h1 {
            font-size: 24px;
            font-weight: bold;
            color: #1a365d;
            margin: 0 0 5px 0;
            text-transform: uppercase;
        }

        .company-info p {
            margin: 2px 0;
            font-size: 11px;
            color: #555;
        }

        .bill-number {
            text-align: right;
        }

        .bill-number h2 {
            font-size: 20px;
            font-weight: bold;
            margin: 0 0 10px 0;
            color: #1a365d;
            text-transform: uppercase;
        }

        .bill-number p {
            margin: 2px 0;
            font-size: 12px;
            font-weight: bold;
        }

        .customer-section,
        .event-section,
        .payment-section {
            margin-bottom: 20px;
        }

        .customer-section h3,
        .event-section h3,
        .payment-section h3 {
            font-size: 14px;
            font-weight: bold;
            margin: 0 0 5px 0;
            padding: 5px 0;
            border-bottom: 1px solid #ccc;
            text-transform: uppercase;
        }

        .customer-details p,
        .event-details p {
            margin: 5px 0;
            padding-left: 20px;
        }

        .bill-items {
            margin-bottom: 25px;
        }

        .bill-items h3 {
            font-size: 14px;
            font-weight: bold;
            margin: 0 0 10px 0;
            padding: 5px 0;
            border-bottom: 1px solid #ccc;
            text-transform: uppercase;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .items-table th,
        .items-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
        }

        .items-table th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
        }

        .items-table .text-right {
            text-align: right;
        }

        .total-section {
            margin-bottom: 15px;
            border-top: 2px solid #000;
            padding-top: 15px;
        }

        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 0 20px;
        }

        .total-row.final-total {
            font-weight: bold;
            font-size: 14px;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            padding: 10px 20px;
            margin: 10px 0;
        }

        .total-words {
            padding: 10px 20px;
            font-style: italic;
        }

        .payment-status {
            padding: 10px 20px;
            border-radius: 5px;
            margin-top: 10px;
        }

        .payment-status.paid {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
        }

        .payment-status.pending {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
        }

        .ticket-codes {
            padding-left: 20px;
        }

        .ticket-code-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 5px 0;
            border-bottom: 1px dotted #ccc;
        }

        .ticket-code-item:last-child {
            border-bottom: none;
        }

        .ticket-status.used {
            color: #28a745;
            font-weight: bold;
        }

        .ticket-status.unused {
            color: #6c757d;
        }

        .bill-footer {
            margin-top: 40px;
            border-top: 1px solid #ccc;
            padding-top: 20px;
        }

        .terms h4 {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
            text-transform: uppercase;
        }

        .terms ul {
            margin: 0;
            padding-left: 20px;
        }

        .terms li {
            margin-bottom: 3px;
            font-size: 11px;
        }

        .print-info {
            text-align: center;
            margin-top: 30px;
            font-size: 10px;
            color: #666;
        }

        .print-info p {
            margin: 2px 0;
        }

        @media print {
            .bill-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0;
                padding: 15mm;
                box-shadow: none;
            }
            
            body {
                margin: 0;
                padding: 0;
            }
        }
    `;

    billContainer.appendChild(style);
    return billContainer;
};

const convertNumberToWords = (num: number): string => {
    if (num === 0) return 'không';
    
    const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    const tens = ['', '', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
    const scales = ['', 'nghìn', 'triệu', 'tỷ'];
    
    const convertGroup = (n: number): string => {
        let result = '';
        const hundreds = Math.floor(n / 100);
        const remainder = n % 100;
        const tensDigit = Math.floor(remainder / 10);
        const onesDigit = remainder % 10;
        
        if (hundreds > 0) {
            result += ones[hundreds] + ' trăm';
        }
        
        if (tensDigit >= 2) {
            result += (result ? ' ' : '') + tens[tensDigit];
            if (onesDigit > 0) {
                result += ' ' + ones[onesDigit];
            }
        } else if (tensDigit === 1) {
            result += (result ? ' ' : '') + 'mười';
            if (onesDigit > 0) {
                result += ' ' + ones[onesDigit];
            }
        } else if (onesDigit > 0) {
            result += (result ? ' lẻ ' : '') + ones[onesDigit];
        }
        
        return result;
    };
    
    const groups = [];
    let tempNum = num;
    
    while (tempNum > 0) {
        groups.push(tempNum % 1000);
        tempNum = Math.floor(tempNum / 1000);
    }
    
    let result = '';
    for (let i = groups.length - 1; i >= 0; i--) {
        if (groups[i] > 0) {
            result += (result ? ' ' : '') + convertGroup(groups[i]);
            if (i > 0) {
                result += ' ' + scales[i];
            }
        }
    }
    
    return result;
};

export const generateBillPDF = async (booking: BookingTicket): Promise<void> => {
    try {
        const billElement = createBillElement(booking);
        const hiddenContainer = document.createElement('div');
        hiddenContainer.style.position = 'fixed';
        hiddenContainer.style.top = '-10000px';
        hiddenContainer.style.left = '-10000px';
        hiddenContainer.style.opacity = '0';
        hiddenContainer.style.pointerEvents = 'none';
        hiddenContainer.style.width = '210mm';
        hiddenContainer.style.height = 'auto';

        hiddenContainer.appendChild(billElement);
        document.body.appendChild(hiddenContainer);

        await new Promise(resolve => setTimeout(resolve, 1000));

        const canvas = await html2canvas(billElement, {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: billElement.offsetWidth,
            height: billElement.offsetHeight
        });

        document.body.removeChild(hiddenContainer);

        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

       pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
            heightLeft -= pageHeight;
        }

        const fileName = `hoa-don-${booking.maDatVe}-${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
    } catch (error) {
        console.error('Error generating bill:', error);
        throw error;
    }
};

export const printBill = (booking: BookingTicket): void => {
    const billElement = createBillElement(booking);
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Hóa đơn - ${booking.maDatVe}</title>
                <meta charset="utf-8">
                <style>
                    body { margin: 0; padding: 0; }
                    @media print {
                        body { margin: 0; }
                        .bill-container { 
                            box-shadow: none !important; 
                            margin: 0 !important;
                        }
                    }
                </style>
            </head>
            <body>
                ${billElement.outerHTML}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 1000);
    }
};