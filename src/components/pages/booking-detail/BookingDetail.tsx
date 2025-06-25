import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Dropdown } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { formatDate, formatCurrency, getImageUrl, formatFullAddress } from '../../../utils/helper';
import { bookTicketService } from '../../../api/bookTicketService';
import { BookingTicket } from '../../../types/BookingTypes';
import { generateTicketPDF } from '../../../utils/ticketGenerator';
import { generateBillPDF, printBill } from '../../../utils/billGenerator';
import './BookingDetail.css';

const BookingDetail = () => {
    const { id } = useParams();
    const [booking, setBooking] = useState<BookingTicket | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isGeneratingBill, setIsGeneratingBill] = useState(false);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                if (id) {
                    const response = await bookTicketService.getBookingById(id);
                    setBooking(response.data);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Không thể tải thông tin đặt vé');
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [id]);

    const handleDownloadTicket = async (ticket: BookingTicket['chiTietVes'][0]) => {
        try {
            if (!booking) return;
            await generateTicketPDF(ticket, booking);
        } catch (error) {
            console.error('Error downloading ticket:', error);
        }
    };

    const handleDownloadBill = async () => {
        if (!booking) return;
        
        try {
            setIsGeneratingBill(true);
            await generateBillPDF(booking);
        } catch (error) {
            console.error('Error generating bill:', error);
            alert('Có lỗi xảy ra khi tạo hóa đơn. Vui lòng thử lại.');
        } finally {
            setIsGeneratingBill(false);
        }
    };

    const handlePrintBill = () => {
        if (!booking) return;
        printBill(booking);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <Container className="booking-detail-container">
                <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    <p>{error || 'Không tìm thấy thông tin đặt vé'}</p>
                </div>
            </Container>
        );
    }

    return (
        <div className="booking-detail-container">
            <div className="booking-detail-wrapper">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="page-title mb-0">Chi tiết đặt vé</h2>
                    <Dropdown>
                        <Dropdown.Toggle variant="outline-primary" id="export-dropdown">
                            <i className="fas fa-download me-2"></i>
                            Xuất hóa đơn
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={handleDownloadBill} disabled={isGeneratingBill}>
                                <i className="fas fa-file-pdf me-2"></i>
                                {isGeneratingBill ? 'Đang tạo PDF...' : 'Tải về PDF'}
                            </Dropdown.Item>
                            <Dropdown.Item onClick={handlePrintBill}>
                                <i className="fas fa-print me-2"></i>
                                In hóa đơn
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>

                <Row>
                    <Col lg={8}>
                        <Card className="booking-info-card">
                            <Card.Body>
                                <div className="booking-detail-event-header">
                                    <Link to={`/events/${booking.suKien.maSuKien}`} className="booking-detail-event-image">
                                        <div className="booking-detail-event-image">
                                            <img 
                                                src={getImageUrl(booking.suKien.anhBia)} 
                                                alt={booking.suKien.tieuDe} 
                                            />
                                        </div>
                                    </Link>
                                    <div className="booking-detail-event-info">
                                        <h3>{booking.suKien.tieuDe}</h3>
                                        <div className="booking-detail-event-meta">
                                            <span>
                                                <i className="fas fa-calendar"></i>
                                                {formatDate(booking.suKien.thoiGianBatDau)}
                                            </span>
                                            <span>
                                                <i className="fas fa-map-marker-alt"></i>
                                                {formatFullAddress(booking.suKien?.diaDiem)}
                                            </span>
                                            <span>
                                                <i className="fas fa-clock"></i>
                                                {formatDate(booking.suKien.thoiGianBatDau)} - {formatDate(booking.suKien.thoiGianKetThuc)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="booking-details">
                                    <div className="booking-status-section">
                                        <h4>Trạng thái đặt vé</h4>
                                        <Badge 
                                            bg={booking.hoatDong ? 'success' : 
                                                new Date(booking.thoiGianHetHan) > new Date() ? 'warning' : 'danger'}
                                        >
                                            {booking.hoatDong ? 'Đã thanh toán' : 
                                             new Date(booking.thoiGianHetHan) > new Date() ? 'Chờ thanh toán' : 'Hết hạn'}
                                        </Badge>
                                        {!booking.hoatDong && new Date(booking.thoiGianHetHan) > new Date() && booking?.url && (
                                            <Button 
                                                variant="primary"
                                                className="pay-now-btn"
                                                onClick={() => window.location.href = booking.url ?? ''}
                                            >
                                                <i className="fas fa-credit-card"></i>
                                                Thanh toán ngay
                                            </Button>
                                        )}
                                    </div>

                                    <div className="booking-detail-tickets-section">
                                        <h4>Danh sách vé</h4>
                                        <div className="booking-detail-tickets-grid">
                                            {booking.chiTietVes.map((ticket) => (
                                                <Card key={ticket.maVe} className="booking-detail-ticket-item">
                                                    <Card.Body>
                                                        <div className="booking-detail-ticket-header">
                                                            <h5>{ticket.loaiVe.tenLoaiVe}</h5>
                                                            <Badge 
                                                                bg={ticket.thoiGianKiemVe ? 'success' : 
                                                                    booking.hoatDong ? 'info' : 'warning'}
                                                            >
                                                                {ticket.thoiGianKiemVe ? 'Đã sử dụng' : 
                                                                 booking.hoatDong ? 'Chưa sử dụng' : 'Chờ thanh toán'}
                                                            </Badge>
                                                        </div>
                                                        <div className="booking-detail-ticket-info">
                                                            <div className="booking-detail-info-row">
                                                                <span className="label">Mã vé:</span>
                                                                <span className="value">{ticket.maVe}</span>
                                                            </div>
                                                            <div className="booking-detail-info-row">
                                                                <span className="label">Giá vé:</span>
                                                                <span className="value">{formatCurrency(ticket.loaiVe.giaTien)}</span>
                                                            </div>
                                                            {ticket.thoiGianKiemVe && (
                                                                <div className="booking-detail-info-row">
                                                                    <span className="label">Thời gian sử dụng:</span>
                                                                    <span className="value">{formatDate(ticket.thoiGianKiemVe)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {booking.hoatDong && !ticket.thoiGianKiemVe && (
                                                            <Button 
                                                                variant="outline-primary" 
                                                                className="download-btn"
                                                                onClick={() => handleDownloadTicket(ticket)}
                                                            >
                                                                <i className="fas fa-download"></i>
                                                                Tải vé
                                                            </Button>
                                                        )}
                                                    </Card.Body>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <Card className="booking-summary-card">
                            <Card.Body>
                                <h4>Thông tin thanh toán</h4>
                                <div className="booking-detail-summary-content">
                                    <div className="booking-detail-summary-row">
                                        <span className="label">Mã đặt vé</span>
                                        <span className="value">{booking.maDatVe}</span>
                                    </div>
                                    <div className="booking-detail-summary-row">
                                        <span className="label">Số lượng vé</span>
                                        <span className="value">{booking.chiTietVes.length}</span>
                                    </div>
                                    <div className="booking-detail-summary-row">
                                        <span className="label">Tổng tiền</span>
                                        <span className="value highlight">{formatCurrency(booking.tongTien)}</span>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                        
                        <Card className="booking-summary-card">
                            <Card.Body>
                                <h4>Thông tin khách hàng</h4>
                                <div className="booking-detail-summary-content">
                                    <div className="booking-detail-summary-row">
                                        <span className="label">Tên khách hàng</span>
                                        <span className="value">{booking?.khachHang?.tenHienThi}</span>
                                    </div>
                                    <div className="booking-detail-summary-row">
                                        <span className="label">Email</span>
                                        <span className="value">{booking?.khachHang?.email}</span>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default BookingDetail;