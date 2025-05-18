import { useState, useEffect } from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { SuKien } from '../../../types/EventTypes';
import eventService from '../../../api/eventService';
import { formatDate, getImageUrl, getDefaulImagetUrl } from '../../../utils/helper';
import './EventDetail.css';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState<SuKien | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadEvent = async () => {
            try {
                setLoading(true);
                const response = await eventService.getEventById(id!);
                setEvent(response.data);
                setError(null);
            } catch (err) {
                setError('Không thể tải thông tin sự kiện. Vui lòng thử lại sau.');
                console.error('Error loading event:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadEvent();
        }
    }, [id]);

    const handleBookingClick = () => {
        navigate(`/booking/${id}`);
    };

    const handleTicketTypeClick = (ticketId: string) => {
        navigate(`/booking/${id}?ticketId=${ticketId}`);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <Container className="event-detail-container">
                <Alert variant="danger">{error || 'Không tìm thấy sự kiện'}</Alert>
            </Container>
        );
    }

    return (
        <Container className="event-detail-container">
            <div className="event-detail-wrapper">
                <div className="detail-event-header">
                    <h1 className="detail-event-title">{event.tieuDe}</h1>
                    <div className="detail-event-categories">
                        {event.danhMucs.map((category) => (
                            <span key={category.maDanhMuc} className="category-badge">
                                {category.tenDanhMuc}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="detail-event-image-container">
                    <img
                        src={getImageUrl(event.anhBia)}
                        alt={event.tieuDe}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = getDefaulImagetUrl();
                        }}
                    />
                </div>

                <div className="detail-event-info-grid">
                    <div className="detail-info-item">
                        <label>Thời gian bắt đầu</label>
                        <div className="detail-info-value">
                            <i className="fas fa-calendar-alt"></i>
                            <span>{formatDate(event.thoiGianBatDau)}</span>
                        </div>
                    </div>
                    <div className="detail-info-item">
                        <label>Thời gian kết thúc</label>
                        <div className="detail-info-value">
                            <i className="fas fa-calendar-alt"></i>
                            <span>{formatDate(event.thoiGianKetThuc)}</span>
                        </div>
                    </div>
                    <div className="detail-info-item">
                        <label>Địa chỉ chi tiết</label>
                        <div className="detail-info-value">
                            <i className="fas fa-location-arrow"></i>
                            <span>
                                {event.diaDiem.tenDiaDiem}, {event.diaDiem.tenPhuongXa}, {event.diaDiem.tenQuanHuyen}, {event.diaDiem.tenTinhThanh}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="ticket-info-section">
                    <div className="ticket-section-header">
                        <h3 className="section-title">Thông tin vé</h3>
                        <Button 
                            className="booking-btn"
                            onClick={handleBookingClick}
                        >
                            <i className="fas fa-ticket-alt"></i>
                            Đặt vé ngay
                        </Button>
                    </div>
                    <div className="ticket-sale-period">
                        <div className="ticket-sale-date">
                            <i className="fas fa-ticket-alt"></i>
                            <div className="ticket-sale-dates">
                                <span className="sale-start">
                                    Bán từ: {formatDate(event.ngayMoBanVe)}
                                </span>
                                <span className="sale-end">
                                    Đến: {formatDate(event.ngayDongBanVe)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="ticket-types-grid">
                        {event.loaiVes.map((ticket) => (
                            <div 
                                key={ticket.maLoaiVe} 
                                className={`ticket-type-card ${ticket.veConLai !== undefined && ticket.veConLai <= 0 ? 'sold-out' : ''}`}
                                onClick={() => {
                                    if (ticket.veConLai === undefined || ticket.veConLai > 0) {
                                        handleTicketTypeClick(ticket.maLoaiVe!);
                                    }
                                }}
                            >
                                <h4 className="ticket-type-name">{ticket.tenLoaiVe}</h4>
                                <p className="ticket-type-price">{ticket.giaTien.toLocaleString('vi-VN')} VNĐ</p>
                                <p className="ticket-type-quantity">
                                    Số lượng: {ticket.soLuong} {ticket.veConLai !== undefined && `(Còn lại: ${ticket.veConLai})`}
                                </p>
                                <p className="ticket-type-description">{ticket.moTa}</p>
                                <div className="ticket-type-hover-effect">
                                    {ticket.veConLai !== undefined && ticket.veConLai <= 0 ? (
                                        <>
                                            <i className="fas fa-times-circle"></i>
                                            <span>Xin lỗi, vé này đã hết</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-ticket-alt"></i>
                                            <span>Đặt vé ngay</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="detail-event-description-section">
                    <h3 className="section-title">Mô tả sự kiện</h3>
                    <div 
                        className="detail-event-description"
                        dangerouslySetInnerHTML={{ __html: event.moTa }}
                    />
                </div>
            </div>
        </Container>
    );
};

export default EventDetail; 