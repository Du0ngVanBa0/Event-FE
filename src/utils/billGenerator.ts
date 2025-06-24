import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { BookingTicket } from '../types/BookingTypes';
import { formatDate, formatCurrency, formatFullAddress } from './helper';

const createBillElement = (booking: BookingTicket): HTMLElement => {
    const billContainer = document.createElement('div');
    billContainer.className = 'bill-generator-container';
    
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
        year: 'numeric'
    });

    const currentTime = new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const invoiceNumber = `${String(Date.now()).slice(-7)}`;

    billContainer.innerHTML = `
        <div class="bill-generator-wrapper">
            <!-- Header Section -->
            <div class="bill-generator-header">
                <div class="bill-generator-company-info">
                    <h1 class="bill-generator-company-name">CÔNG TY CỔ PHẦN UNIVERSE EVENT</h1>
                    <div class="bill-generator-company-details">
                        <p><strong>Mã số thuế:</strong> 0101245789</p>
                        <p><strong>Địa chỉ:</strong> 02 Thanh Sơn, Thanh Bình, Hải Châu, Đà Nẵng</p>
                        <p><strong>Điện thoại:</strong> 032 858 0103 | <strong>Email:</strong> info@universeevent.vn</p>
                        <p><strong>Số tài khoản:</strong> 123456789 - Ngân hàng ABC Bank</p>
                    </div>
                </div>
                <div class="bill-generator-invoice-metadata">
                    <div class="bill-generator-invoice-form">
                        <p><strong>Mẫu số:</strong> 01GTKT0/001</p>
                        <p><strong>Ký hiệu:</strong> HA/19E</p>
                    </div>
                    <div class="bill-generator-invoice-number">
                        <p><strong>Số:</strong> ${invoiceNumber}</p>
                    </div>
                </div>
            </div>

            <!-- Invoice Title -->
            <div class="bill-generator-title-section">
                <h2 class="bill-generator-invoice-title">HÓA ĐƠN GIÁ TRỊ GIA TĂNG</h2>
                <p class="bill-generator-invoice-subtitle">(Bán hàng hóa, dịch vụ)</p>
                <div class="bill-generator-date-info">
                    <p>Ngày ${currentDate.split('/')[0]} tháng ${currentDate.split('/')[1]} năm ${currentDate.split('/')[2]}</p>
                </div>
            </div>

            <!-- Buyer Information -->
            <div class="bill-generator-buyer-section">
                <h3 class="bill-generator-section-title">Thông tin người mua</h3>
                <div class="bill-generator-buyer-info">
                    <div class="bill-generator-info-row">
                        <span class="bill-generator-label">Họ tên người mua:</span>
                        <span class="bill-generator-value">${booking.khachHang?.tenHienThi || 'Khách lẻ'}</span>
                    </div>
                    <div class="bill-generator-info-row">
                        <span class="bill-generator-label">Tên đơn vị:</span>
                        <span class="bill-generator-value">---</span>
                    </div>
                    <div class="bill-generator-info-row">
                        <span class="bill-generator-label">Mã số thuế:</span>
                        <span class="bill-generator-value">---</span>
                    </div>
                    <div class="bill-generator-info-row">
                        <span class="bill-generator-label">Địa chỉ:</span>
                        <span class="bill-generator-value">---</span>
                    </div>
                    <div class="bill-generator-info-row">
                        <span class="bill-generator-label">Hình thức thanh toán:</span>
                        <span class="bill-generator-value">Online</span>
                    </div>
                </div>
            </div>

            <!-- Event Information -->
            <div class="bill-generator-event-section">
                <h3 class="bill-generator-section-title">Thông tin sự kiện</h3>
                <div class="bill-generator-event-details">
                    <div class="bill-generator-info-row">
                        <span class="bill-generator-label">Tên sự kiện:</span>
                        <span class="bill-generator-value">${booking.suKien.tieuDe}</span>
                    </div>
                    <div class="bill-generator-info-row">
                        <span class="bill-generator-label">Thời gian:</span>
                        <span class="bill-generator-value">${formatDate(booking.suKien.thoiGianBatDau)} - ${formatDate(booking.suKien.thoiGianKetThuc)}</span>
                    </div>
                    <div class="bill-generator-info-row">
                        <span class="bill-generator-label">Địa điểm:</span>
                        <span class="bill-generator-value">${formatFullAddress(booking.suKien.diaDiem)}</span>
                    </div>
                </div>
            </div>

            <!-- Purchase Table -->
            <div class="bill-generator-purchase-section">
                <table class="bill-generator-purchase-table">
                    <thead>
                        <tr>
                            <th rowspan="2">STT</th>
                            <th rowspan="2">Tên hàng hóa, dịch vụ</th>
                            <th rowspan="2">Đơn vị tính</th>
                            <th rowspan="2">Số lượng</th>
                            <th rowspan="2">Đơn giá</th>
                            <th rowspan="2">Thành tiền</th>
                            <th colspan="3">Thuế GTGT</th>
                        </tr>
                        <tr>
                            <th>Thuế suất</th>
                            <th>Tiền thuế</th>
                            <th>Tổng cộng</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(ticketSummary).map(([ticketType, details], index) => `
                            <tr>
                                <td class="bill-generator-text-center">${index + 1}</td>
                                <td>Vé ${ticketType}</td>
                                <td class="bill-generator-text-center">Vé</td>
                                <td class="bill-generator-text-center">${details.count}</td>
                                <td class="bill-generator-text-right">${formatCurrency(details.price)}</td>
                                <td class="bill-generator-text-right">${formatCurrency(details.total)}</td>
                                <td class="bill-generator-text-center">0%</td>
                                <td class="bill-generator-text-right">0đ</td>
                                <td class="bill-generator-text-right">${formatCurrency(details.total)}</td>
                            </tr>
                        `).join('')}
                        <tr class="bill-generator-total-row">
                            <td colspan="5" class="bill-generator-text-right bill-generator-total-label">
                                <strong>Cộng tiền hàng:</strong>
                            </td>
                            <td class="bill-generator-text-right">
                                <strong>${formatCurrency(booking.tongTien)}</strong>
                            </td>
                            <td class="bill-generator-text-center">---</td>
                            <td class="bill-generator-text-right">
                                <strong>0đ</strong>
                            </td>
                            <td class="bill-generator-text-right">
                                <strong>${formatCurrency(booking.tongTien)}</strong>
                            </td>
                        </tr>
                        <tr class="bill-generator-grand-total-row">
                            <td colspan="8" class="bill-generator-text-right bill-generator-grand-total-label">
                                <strong>Tổng tiền thanh toán:</strong>
                            </td>
                            <td class="bill-generator-text-right bill-generator-grand-total-amount">
                                <strong>${formatCurrency(booking.tongTien)}</strong>
                            </td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="bill-generator-amount-words">
                    <p><strong>Số tiền viết bằng chữ:</strong> <em>${convertNumberToWords(booking.tongTien)} đồng</em></p>
                </div>
            </div>

            <!-- Payment Status -->
            <div class="bill-generator-payment-status">
                <div class="bill-generator-status-info ${booking.hoatDong ? 'bill-generator-status-paid' : 'bill-generator-status-pending'}">
                    <p><strong>Trạng thái thanh toán:</strong> 
                        ${booking.hoatDong ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                    </p>
                    ${booking.hoatDong ? 
                        `<p><strong>Thời gian thanh toán:</strong> ${currentDate} ${currentTime}</p>` : 
                        `<p><strong>Hạn thanh toán:</strong> ${formatDate(booking.thoiGianHetHan)}</p>`
                    }
                </div>
            </div>

            <!-- Signature Section -->
            <div class="bill-generator-signature-section">
                <div class="bill-generator-signatures">
                    <div class="bill-generator-signature-buyer">
                        <h4>Người mua hàng</h4>
                        <p class="bill-generator-signature-instruction">(Ký, ghi rõ họ, tên)</p>
                        <div class="bill-generator-signature-line"></div>
                    </div>
                    <div class="bill-generator-signature-seller">
                        <h4>Người bán hàng</h4>
                        <p class="bill-generator-signature-instruction">(Ký, ghi rõ họ, tên)</p>
                        <div class="bill-generator-signature-line"></div>
                    </div>
                </div>
            </div>

            <!-- Footer Information -->
            <div class="bill-generator-footer">
                <div class="bill-generator-print-info">
                    <p>Hóa đơn được xuất ngày: ${currentDate} lúc ${currentTime}</p>
                    <p>Mã đặt vé: ${booking.maDatVe}</p>
                </div>
            </div>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .bill-generator-container {
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            background: #ffffff;
            color: #000000;
            font-size: 12px;
            line-height: 1.4;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            margin: 0 auto;
        }

        .bill-generator-wrapper {
            width: 100%;
            height: 100%;
        }

        /* Header Section */
        .bill-generator-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #000000;
        }

        .bill-generator-company-info {
            flex: 1;
            padding-right: 20px;
        }

        .bill-generator-company-name {
            font-size: 16px;
            font-weight: bold;
            color: #000000;
            margin: 0 0 10px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .bill-generator-company-details p {
            margin: 3px 0;
            font-size: 11px;
            line-height: 1.3;
        }

        .bill-generator-invoice-metadata {
            text-align: right;
            border: 1px solid #000000;
            padding: 10px;
            min-width: 150px;
        }

        .bill-generator-invoice-form {
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid #000000;
        }

        .bill-generator-invoice-form p,
        .bill-generator-invoice-number p {
            margin: 2px 0;
            font-size: 11px;
            font-weight: bold;
        }

        /* Title Section */
        .bill-generator-title-section {
            text-align: center;
            margin-bottom: 25px;
        }

        .bill-generator-invoice-title {
            font-size: 18px;
            font-weight: bold;
            margin: 0 0 5px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .bill-generator-invoice-subtitle {
            font-size: 12px;
            margin: 0 0 10px 0;
            font-style: italic;
        }

        .bill-generator-date-info p {
            font-size: 12px;
            margin: 0;
            font-weight: bold;
        }

        /* Section Styles */
        .bill-generator-buyer-section,
        .bill-generator-event-section {
            margin-bottom: 20px;
        }

        .bill-generator-section-title {
            font-size: 13px;
            font-weight: bold;
            margin: 0 0 8px 0;
            padding: 5px 0;
            border-bottom: 1px solid #000000;
            text-transform: uppercase;
        }

        .bill-generator-buyer-info,
        .bill-generator-event-details {
            padding-left: 10px;
        }

        .bill-generator-info-row {
            display: flex;
            margin-bottom: 5px;
            align-items: baseline;
        }

        .bill-generator-label {
            font-weight: bold;
            min-width: 140px;
            margin-right: 10px;
        }

        .bill-generator-value {
            flex: 1;
            border-bottom: 1px dotted #666666;
            padding-bottom: 1px;
            min-height: 16px;
        }

        /* Purchase Table */
        .bill-generator-purchase-section {
            margin-bottom: 20px;
        }

        .bill-generator-purchase-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 11px;
        }

        .bill-generator-purchase-table th,
        .bill-generator-purchase-table td {
            border: 1px solid #000000;
            padding: 6px 4px;
            text-align: left;
            vertical-align: middle;
        }

        .bill-generator-purchase-table th {
            background-color: #f5f5f5;
            font-weight: bold;
            text-align: center;
            font-size: 10px;
        }

        .bill-generator-text-center {
            text-align: center !important;
        }

        .bill-generator-text-right {
            text-align: right !important;
        }

        .bill-generator-total-row,
        .bill-generator-grand-total-row {
            background-color: #f9f9f9;
        }

        .bill-generator-total-label,
        .bill-generator-grand-total-label {
            font-weight: bold;
        }

        .bill-generator-grand-total-amount {
            font-size: 13px;
            color: #d63384;
        }

        .bill-generator-amount-words {
            margin-top: 10px;
            padding: 8px;
            border: 1px solid #000000;
            background-color: #f8f9fa;
        }

        .bill-generator-amount-words p {
            margin: 0;
            font-size: 12px;
        }

        /* Payment Status */
        .bill-generator-payment-status {
            margin-bottom: 25px;
        }

        .bill-generator-status-info {
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #000000;
        }

        .bill-generator-status-paid {
            background-color: #d4edda;
            border-color: #c3e6cb;
        }

        .bill-generator-status-pending {
            background-color: #fff3cd;
            border-color: #ffeaa7;
        }

        .bill-generator-status-info p {
            margin: 3px 0;
            font-weight: bold;
        }

        /* Signature Section */
        .bill-generator-signature-section {
            margin-bottom: 30px;
            margin-top: 40px;
        }

        .bill-generator-signatures {
            display: flex;
            justify-content: space-between;
            gap: 40px;
        }

        .bill-generator-signature-buyer,
        .bill-generator-signature-seller {
            flex: 1;
            text-align: center;
        }

        .bill-generator-signature-buyer h4,
        .bill-generator-signature-seller h4 {
            font-size: 13px;
            font-weight: bold;
            margin: 0 0 5px 0;
            text-transform: uppercase;
        }

        .bill-generator-signature-instruction {
            font-size: 10px;
            margin: 0 0 30px 0;
            font-style: italic;
            color: #666666;
        }

        .bill-generator-signature-line {
            height: 1px;
            border-bottom: 1px dotted #000000;
            margin-top: 50px;
            position: relative;
        }

        .bill-generator-signature-line::after {
            content: '';
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            height: 1px;
            border-bottom: 1px dotted #cccccc;
        }

        /* Footer */
        .bill-generator-footer {
            margin-top: 30px;
            border-top: 1px solid #cccccc;
            padding-top: 15px;
        }

        .bill-generator-print-info {
            text-align: center;
            margin-bottom: 15px;
        }

        .bill-generator-print-info p {
            margin: 2px 0;
            font-size: 10px;
            color: #666666;
            font-style: italic;
        }

        /* Print Styles */
        @media print {
            .bill-generator-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0;
                padding: 10mm;
                box-shadow: none;
                page-break-inside: avoid;
            }
            
            body {
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }

            .bill-generator-status-paid,
            .bill-generator-status-pending,
            .bill-generator-amount-words,
            .bill-generator-total-row,
            .bill-generator-grand-total-row {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }

            .bill-generator-signature-line,
            .bill-generator-signature-line::after {
                border-color: #000000 !important;
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

        pdf.setProperties({
            title: `Hóa đơn GTGT - ${booking.maDatVe}`,
            subject: `Hóa đơn bán vé sự kiện - ${booking.suKien.tieuDe}`,
            author: 'CÔNG TY CỔ PHẦN UNIVERSE EVENT',
            creator: 'Universe Event System'
        });

        const fileName = `hoa-don-GTGT-${booking.maDatVe}-${new Date().toISOString().split('T')[0]}.pdf`;
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
                <title>Hóa đơn GTGT - ${booking.maDatVe}</title>
                <meta charset="utf-8">
                <style>
                    body { margin: 0; padding: 0; }
                    @media print {
                        body { margin: 0; }
                        .bill-generator-container { 
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