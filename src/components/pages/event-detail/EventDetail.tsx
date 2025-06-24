import { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { SuKien } from '../../../types/EventTypes';
import eventService from '../../../api/eventService';
import { formatDate, getImageUrl, getDefaulImagetUrl } from '../../../utils/helper';
import './EventDetail.css';
import ReviewSection from './ReviewSection';
import ReviewForm from './ReviewForm';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState<SuKien | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sectionsVisible, setSectionsVisible] = useState(false);
    const [reviewsKey, setReviewsKey] = useState(0);

    useEffect(() => {
        const loadEvent = async () => {
            try {
                setLoading(true);
                const response = await eventService.getEventById(id!);
                setEvent(response.data);
                setError(null);
                
                setTimeout(() => {
                    setSectionsVisible(true);
                }, 100);
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

    const scrollToBooking = () => {
        const ticketSection = document.querySelector('.event-detail-page-ticket-section');
        if (ticketSection) {
            ticketSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const handleReviewSubmitted = () => {
        // Force refresh reviews when new review is submitted
        setReviewsKey(prev => prev + 1);
    };

    if (loading) {
        return (
            <div className="event-detail-page-loading">
                <div className="event-detail-page-spinner">
                    <div className="event-detail-page-spinner-ring"></div>
                    <span>Đang tải thông tin sự kiện...</span>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <Container className="event-detail-page-container">
                <div className="event-detail-page-error">
                    <i className="fas fa-exclamation-triangle"></i>
                    <h3>{error || 'Không tìm thấy sự kiện'}</h3>
                    <Button 
                        className="event-detail-page-button-back"
                        onClick={() => navigate('/events')}
                    >
                        <i className="fas fa-arrow-left"></i>
                        Quay lại danh sách sự kiện
                    </Button>
                </div>
            </Container>
        );
    }

    return (
        <div className="event-detail-page-container">
            <div className="event-detail-page-bg-elements">
                <div className="event-detail-page-bg-circle event-detail-page-bg-circle-1"></div>
                <div className="event-detail-page-bg-circle event-detail-page-bg-circle-2"></div>
                <div className="event-detail-page-bg-wave"></div>
            </div>

            <Container className="event-detail-page-wrapper">
                <button 
                    className="event-detail-page-floating-btn"
                    onClick={scrollToBooking}
                    title="Đặt vé ngay"
                >
                    <i className="fas fa-ticket-alt"></i>
                    <div className="event-detail-page-floating-btn-glow"></div>
                </button>

                <div className={`event-detail-page-hero ${sectionsVisible ? 'event-detail-page-section-visible' : ''}`}>
                    <div className="event-detail-page-header">
                        <div className="event-detail-page-breadcrumb">
                            <Button 
                                variant="link" 
                                className="event-detail-page-back-btn"
                                onClick={() => navigate('/events')}
                            >
                                <i className="fas fa-arrow-left"></i>
                                <span>Danh sách sự kiện</span>
                            </Button>
                        </div>
                        
                        <h1 className="event-detail-page-title">{event.tieuDe}</h1>
                        
                        <div className="event-detail-page-categories">
                            {event.danhMucs.map((category, index) => (
                                <span 
                                    key={category.maDanhMuc} 
                                    className="event-detail-page-category-badge"
                                    style={{ '--delay': `${index * 0.1}s` } as React.CSSProperties}
                                >
                                    <i className="fas fa-tag"></i>
                                    {category.tenDanhMuc}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="event-detail-page-image-container">
                        <div className="event-detail-page-image-wrapper">
                            <img
                                src={getImageUrl(event.anhBia)}
                                alt={event.tieuDe}
                                className="event-detail-page-image"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = getDefaulImagetUrl();
                                }}
                            />
                            <div className="event-detail-page-image-overlay"></div>
                        </div>
                        <div className="event-detail-page-image-shine"></div>
                    </div>
                </div>

                <div className={`event-detail-page-section event-detail-page-info-section ${sectionsVisible ? 'event-detail-page-section-visible' : ''}`}>
                    <h2 className="event-detail-page-section-title">
                        <i className="fas fa-info-circle"></i>
                        <span>Thông tin sự kiện</span>
                        <div className="event-detail-page-title-underline"></div>
                    </h2>
                    
                    <div className="event-detail-page-info-grid">
                        <div className="event-detail-page-info-card">
                            <div className="event-detail-page-info-icon">
                                <i className="fas fa-calendar-alt"></i>
                            </div>
                            <div className="event-detail-page-info-content">
                                <label>Thời gian bắt đầu</label>
                                <span>{formatDate(event.thoiGianBatDau)}</span>
                            </div>
                        </div>

                        <div className="event-detail-page-info-card">
                            <div className="event-detail-page-info-icon">
                                <i className="fas fa-calendar-check"></i>
                            </div>
                            <div className="event-detail-page-info-content">
                                <label>Thời gian kết thúc</label>
                                <span>{formatDate(event.thoiGianKetThuc)}</span>
                            </div>
                        </div>

                        <div className="event-detail-page-info-card event-detail-page-info-card-wide">
                            <div className="event-detail-page-info-icon">
                                <i className="fas fa-map-marker-alt"></i>
                            </div>
                            <div className="event-detail-page-info-content">
                                <label>Địa điểm tổ chức</label>
                                <span>
                                    {event.diaDiem.tenDiaDiem}, {event.diaDiem.tenPhuongXa}, {event.diaDiem.tenQuanHuyen}, {event.diaDiem.tenTinhThanh}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`event-detail-page-section event-detail-page-ticket-section ${sectionsVisible ? 'event-detail-page-section-visible' : ''}`}>
                    <div className="event-detail-page-section-header">
                        <h2 className="event-detail-page-section-title">
                            <i className="fas fa-ticket-alt"></i>
                            <span>Thông tin vé</span>
                            <div className="event-detail-page-title-underline"></div>
                        </h2>
                        
                        <Button 
                            className="event-detail-page-button-book"
                            onClick={handleBookingClick}
                        >
                            <i className="fas fa-shopping-cart"></i>
                            <span>Đặt vé ngay</span>
                            <div className="event-detail-page-button-shine"></div>
                        </Button>
                    </div>

                    <div className="event-detail-page-ticket-sale-info">
                        <div className="event-detail-page-sale-period">
                            <div className="event-detail-page-sale-date">
                                <i className="fas fa-clock"></i>
                                <div className="event-detail-page-sale-details">
                                    <span className="event-detail-page-sale-start">
                                        Bán từ: {formatDate(event.ngayMoBanVe)}
                                    </span>
                                    <span className="event-detail-page-sale-end">
                                        Đến: {formatDate(event.ngayDongBanVe)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="event-detail-page-ticket-grid">
                        {event.loaiVes.map((ticket, index) => (
                            <div 
                                key={ticket.maLoaiVe} 
                                className={`event-detail-page-ticket-card ${
                                    ticket.veConLai !== undefined && ticket.veConLai <= 0 
                                        ? 'event-detail-page-ticket-sold-out' 
                                        : ''
                                }`}
                                style={{ '--animation-delay': `${index * 0.1}s` } as React.CSSProperties}
                                onClick={() => {
                                    if (ticket.veConLai === undefined || ticket.veConLai > 0) {
                                        handleTicketTypeClick(ticket.maLoaiVe!);
                                    }
                                }}
                            >
                                <div className="event-detail-page-ticket-header">
                                    <h4 className="event-detail-page-ticket-name">{ticket.tenLoaiVe}</h4>
                                    <div className="event-detail-page-ticket-price">
                                        {ticket.giaTien.toLocaleString('vi-VN')} VNĐ
                                    </div>
                                </div>

                                <div className="event-detail-page-ticket-info">
                                    <div className="event-detail-page-ticket-quantity">
                                        <i className="fas fa-users"></i>
                                        <span>
                                            Số lượng: {ticket.soLuong}
                                            {ticket.veConLai !== undefined && ` (Còn lại: ${ticket.veConLai})`}
                                        </span>
                                    </div>
                                    <p className="event-detail-page-ticket-description">{ticket.moTa}</p>
                                </div>

                                <div className="event-detail-page-ticket-overlay">
                                    {ticket.veConLai !== undefined && ticket.veConLai <= 0 ? (
                                        <div className="event-detail-page-ticket-status event-detail-page-ticket-unavailable">
                                            <i className="fas fa-times-circle"></i>
                                            <span>Đã hết vé</span>
                                        </div>
                                    ) : (
                                        <div className="event-detail-page-ticket-status event-detail-page-ticket-available">
                                            <i className="fas fa-shopping-cart"></i>
                                            <span>Chọn vé này</span>
                                        </div>
                                    )}
                                </div>

                                <div className="event-detail-page-ticket-glow"></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`event-detail-page-section event-detail-page-description-section ${sectionsVisible ? 'event-detail-page-section-visible' : ''}`}>
                    <h2 className="event-detail-page-section-title">
                        <i className="fas fa-file-alt"></i>
                        <span>Mô tả chi tiết</span>
                        <div className="event-detail-page-title-underline"></div>
                    </h2>
                    
                    <div className="event-detail-page-description">
                        <div 
                            className="event-detail-page-description-content"
                            dangerouslySetInnerHTML={{ __html: event.moTa }}
                        />
                    </div>
                </div>

                <div className={`event-detail-page-section ${sectionsVisible ? 'event-detail-page-section-visible' : ''}`}>
                    <h2 className="event-detail-page-section-title">
                        <i className="fas fa-comments"></i>
                        <span>Đánh giá & Nhận xét</span>
                        <div className="event-detail-page-title-underline"></div>
                    </h2>
                    
                    <ReviewForm 
                        maSuKien={id!} 
                        onReviewSubmitted={handleReviewSubmitted}
                    />
                    
                    <ReviewSection 
                        key={reviewsKey} 
                        maSuKien={id!} 
                    />
                </div>

                <div className={`event-detail-page-section event-detail-page-cta-section ${sectionsVisible ? 'event-detail-page-section-visible' : ''}`}>
                    <div className="event-detail-page-cta-content">
                        <h3>Sẵn sàng tham gia sự kiện?</h3>
                        <p>Đừng bỏ lỡ cơ hội tham gia sự kiện tuyệt vời này!</p>
                        <div className="event-detail-page-cta-buttons">
                            <Button 
                                className="event-detail-page-button-book event-detail-page-button-primary"
                                onClick={handleBookingClick}
                            >
                                <i className="fas fa-ticket-alt"></i>
                                <span>Đặt vé ngay</span>
                                <div className="event-detail-page-button-shine"></div>
                            </Button>
                            <Button 
                                className="event-detail-page-button-secondary"
                                onClick={() => navigate('/events')}
                            >
                                <i className="fas fa-search"></i>
                                <span>Xem sự kiện khác</span>
                            </Button>
                        </div>
                    </div>
                    <div className="event-detail-page-cta-decoration">
                        <div className="event-detail-page-cta-circle"></div>
                        <div className="event-detail-page-cta-dots"></div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default EventDetail;