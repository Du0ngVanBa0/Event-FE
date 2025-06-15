import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Alert, Form, Card, Badge } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { SuKien, TicketType } from '../../../types/EventTypes';
import './BookTicket.css';
import eventService from '../../../api/eventService';
import { bookTicketService } from '../../../api/bookTicketService';
import ZoneMapViewer from '../../common/zone-design/ZoneListViewer';

interface TicketSelection {
    id: string;
    quantity: number;
}

const BookTicket = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [event, setEvent] = useState<SuKien | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedTickets, setSelectedTickets] = useState<TicketSelection[]>([]);
    const [isBooking, setIsBooking] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

    const ticketRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const formatAddress = (event: SuKien) => {
        return `${event.diaDiem.tenDiaDiem}, ${event.diaDiem.tenPhuongXa}, ${event.diaDiem.tenQuanHuyen}, ${event.diaDiem.tenTinhThanh}`;
    };

    // Helper: Find current selected quantity for a ticket
    const getSelectedQuantity = (ticketId: string) =>
        selectedTickets.find(t => t.id === ticketId)?.quantity || 0;

    const handleQuantityChange = (ticketId: string, change: number) => {
        const ticket = event?.loaiVes.find(t => t.maLoaiVe === ticketId);
        if (!ticket) return;

        const min = ticket.soLuongToiThieu || 0;
        const max = Math.min(ticket.soLuongToiDa || ticket.veConLai || 0, ticket.veConLai || 0);

        setSelectedTickets(prev => {
            const existing = prev.find(t => t.id === ticketId);
            const current = existing?.quantity || 0;
            let newQuantity = current + change;

            // Clamp to min/max and never below 0
            if (newQuantity < min && newQuantity !== 0) newQuantity = min;
            if (newQuantity > max) newQuantity = max;
            if (newQuantity < 0) newQuantity = 0;

            if (!existing) {
                if (change > 0 && newQuantity >= min) {
                    return [...prev, { id: ticketId, quantity: newQuantity }];
                }
                return prev;
            }

            if (newQuantity === 0) {
                // Remove selection if quantity is zero
                return prev.filter(t => t.id !== ticketId);
            }

            return prev.map(t =>
                t.id === ticketId ? { ...t, quantity: newQuantity } : t
            );
        });
    };

    const handleQuantityInput = (ticketId: string, value: string) => {
        const ticket = event?.loaiVes.find(t => t.maLoaiVe === ticketId);
        if (!ticket) return;

        let quantity = parseInt(value) || 0;
        const min = ticket.soLuongToiThieu || 0;
        const max = Math.min(ticket.soLuongToiDa || ticket.veConLai || 0, ticket.veConLai || 0);

        if (quantity > max) quantity = max;
        if (quantity < min && quantity !== 0) quantity = min;
        if (quantity < 0) quantity = 0;

        setSelectedTickets(prev => {
            if (quantity === 0) {
                return prev.filter(t => t.id !== ticketId);
            }

            const existing = prev.find(t => t.id === ticketId);

            if (!existing) {
                return [...prev, { id: ticketId, quantity }];
            }

            return prev.map(t =>
                t.id === ticketId ? { ...t, quantity } : t
            );
        });
    };

    // Handle zone click - auto increment ticket quantity or focus
    const handleZoneClick = (zoneId: string, ticketType?: TicketType) => {
        setSelectedZoneId(zoneId);

        if (ticketType && ticketType.maLoaiVe) {
            // Try to increment quantity by 1
            const currentQuantity = getSelectedQuantity(ticketType.maLoaiVe);
            const min = ticketType.soLuongToiThieu || 0;
            const max = Math.min(ticketType.soLuongToiDa || ticketType.veConLai || 0, ticketType.veConLai || 0);

            if (currentQuantity < max) {
                // If current quantity is 0 and minimum is > 1, set to minimum
                const newQuantity = currentQuantity === 0 ? Math.max(1, min) : currentQuantity + 1;
                if (newQuantity <= max) {
                    handleQuantityChange(ticketType.maLoaiVe, newQuantity - currentQuantity);
                }
            }

            // Scroll to the corresponding ticket section
            const ticketElement = ticketRefs.current[ticketType.maLoaiVe];
            if (ticketElement) {
                ticketElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });

                // Add highlight effect
                ticketElement.classList.add('book-ticket-highlight');
                setTimeout(() => {
                    ticketElement.classList.remove('book-ticket-highlight');
                }, 2000);
            }
        }
    };

    const handleZoneHover = (zoneId: string | null) => {
        // Optional: Add hover effects here
        console.log('Hovering zone:', zoneId);
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    const calculateTotal = () => {
        return selectedTickets.reduce((total, selection) => {
            const ticket = event?.loaiVes.find(t => t.maLoaiVe === selection.id);
            return total + (ticket?.giaTien || 0) * selection.quantity;
        }, 0);
    };

    const validateBooking = () => {
        // Check all selected tickets satisfy min/max
        for (const selection of selectedTickets) {
            const ticket = event?.loaiVes.find(t => t.maLoaiVe === selection.id);
            if (!ticket) continue;
            const min = ticket.soLuongToiThieu || 0;
            const max = Math.min(ticket.soLuongToiDa || ticket.veConLai || 0, ticket.veConLai || 0);
            if (selection.quantity < min || selection.quantity > max) {
                return `Số lượng mua cho loại vé "${ticket.tenLoaiVe}" phải từ ${min} đến ${max}`;
            }
        }
        return '';
    };

    const handlePayment = async () => {
        // Validate min/max before booking
        const bookingValidationError = validateBooking();
        if (bookingValidationError) {
            setBookingError(bookingValidationError);
            return;
        }
        try {
            setIsBooking(true);
            setBookingError(null);

            const chiTietDatVe = selectedTickets.map(ticket => ({
                maLoaiVe: ticket.id,
                soLuong: ticket.quantity
            }));

            const response = await bookTicketService.book(chiTietDatVe);

            if (response.data) {
                navigate('/payment', { state: { bookingData: response.data } });
            } else {
                throw new Error('Không nhận được dữ liệu từ server');
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            let errorMessage = 'Có lỗi xảy ra khi đặt vé. Vui lòng thử lại sau.';

            if (err.message) {
                errorMessage = err?.message || errorMessage;
            }

            setBookingError(errorMessage);
            console.error('Error booking tickets:', err);
        } finally {
            setIsBooking(false);
        }
    };

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

    useEffect(() => {
        if (event) {
            console.log('Event data:', event);
            console.log('Event khuVucs:', event.khuVucs);
            console.log('Event loaiVes:', event.loaiVes);
        }
    }, [event]);

    if (loading) {
        return (
            <div className="book-ticket-container">
                <div className="book-ticket-loading">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-3">Đang tải thông tin sự kiện...</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="book-ticket-container">
                <Alert variant="danger" className="book-ticket-error">
                    <i className="fas fa-exclamation-triangle"></i>
                    {error || 'Không tìm thấy sự kiện'}
                </Alert>
            </div>
        );
    }

    return (
        <div className="book-ticket-container">
            <Container fluid className="book-ticket-wrapper">
                <div className="book-ticket-header">
                    <Button
                        variant="link"
                        className="book-ticket-back-button"
                        onClick={() => navigate(-1)}
                    >
                        <i className="fas fa-arrow-left"></i> Quay lại
                    </Button>
                    <h1 className="book-ticket-title">Đặt vé sự kiện</h1>
                </div>

                <Row className="book-ticket-content">
                    <Col lg={4} className="book-ticket-sidebar">
                        <Card className="book-ticket-event-card">
                            <Card.Body>
                                <div className="book-ticket-event-header">
                                    <h2 className="book-ticket-event-title">{event.tieuDe}</h2>
                                    <p className="book-ticket-event-address">
                                        <i className="fas fa-map-marker-alt"></i>
                                        {formatAddress(event)}
                                    </p>
                                </div>

                                <div className="book-ticket-price-section">
                                    <h3 className="book-ticket-section-title">
                                        <i className="fas fa-tags"></i>
                                        Bảng giá vé
                                    </h3>
                                    <div className="book-ticket-price-list">
                                        {event.loaiVes.map(ticket => (
                                            <div key={ticket.maLoaiVe} className="book-ticket-price-item">
                                                <div className="book-ticket-price-info">
                                                    <span className="book-ticket-price-name">{ticket.tenLoaiVe}</span>
                                                    <span className="book-ticket-price-amount">{formatCurrency(ticket.giaTien)}</span>
                                                </div>
                                                <div className="book-ticket-price-limits">
                                                    <small>
                                                        Tối thiểu: {ticket.soLuongToiThieu || 0} |
                                                        Tối đa: {ticket.soLuongToiDa || ticket.veConLai || 0}
                                                    </small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {selectedTickets.length > 0 && (
                                    <div className="book-ticket-summary-section">
                                        <h3 className="book-ticket-section-title">
                                            <i className="fas fa-shopping-cart"></i>
                                            Vé đã chọn
                                        </h3>
                                        <div className="book-ticket-summary-list">
                                            {selectedTickets.map(selection => {
                                                const ticket = event.loaiVes.find(t => t.maLoaiVe === selection.id);
                                                if (!ticket) return null;
                                                return (
                                                    <div key={selection.id} className="book-ticket-summary-item">
                                                        <span className="book-ticket-summary-name">{ticket.tenLoaiVe}</span>
                                                        <div className="book-ticket-summary-details">
                                                            <span className="book-ticket-summary-quantity">x{selection.quantity}</span>
                                                            <span className="book-ticket-summary-price">
                                                                {formatCurrency(ticket.giaTien * selection.quantity)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="book-ticket-total">
                                            <span>Tổng cộng:</span>
                                            <span className="book-ticket-total-amount">{formatCurrency(calculateTotal())}</span>
                                        </div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={7}>
                        <Card className="book-ticket-selection-card">
                            <Card.Header className="book-ticket-card-header">
                                <h3 className="book-ticket-card-title">
                                    <i className="fas fa-ticket-alt"></i>
                                    Chọn loại vé và số lượng
                                </h3>
                                <p className="book-ticket-card-subtitle">
                                    Chọn số lượng vé cho từng loại
                                </p>
                            </Card.Header>
                            <Card.Body className="book-ticket-selection-body">
                                {bookingError && (
                                    <Alert variant="danger" className="book-ticket-booking-error">
                                        <i className="fas fa-exclamation-circle"></i>
                                        {bookingError}
                                    </Alert>
                                )}

                                <div className="book-ticket-types-grid">
                                    {event.loaiVes.map(ticket => {
                                        const min = ticket.soLuongToiThieu || 0;
                                        const max = Math.min(ticket.soLuongToiDa || ticket.veConLai || 0, ticket.veConLai || 0);
                                        const selectedQuantity = getSelectedQuantity(ticket.maLoaiVe ?? '');
                                        const isSelected = selectedQuantity > 0;
                                        const isSoldOut = ticket.veConLai === 0;

                                        return (
                                            <div
                                                key={ticket.maLoaiVe}
                                                className={`book-ticket-type-card ${isSelected ? 'book-ticket-selected' : ''} ${isSoldOut ? 'book-ticket-sold-out' : ''}`}
                                                ref={(el) => {
                                                    if (ticket.maLoaiVe) {
                                                        ticketRefs.current[ticket.maLoaiVe] = el;
                                                    }
                                                }}
                                            >
                                                <div className="book-ticket-type-header">
                                                    <div className="book-ticket-type-info">
                                                        <h4 className="book-ticket-type-name">{ticket.tenLoaiVe}</h4>
                                                        <div className="book-ticket-type-price">{formatCurrency(ticket.giaTien)}</div>
                                                    </div>
                                                    <div className="book-ticket-type-status">
                                                        {isSoldOut ? (
                                                            <Badge bg="danger" className="book-ticket-status-badge">
                                                                <i className="fas fa-times-circle"></i>
                                                                Hết vé
                                                            </Badge>
                                                        ) : (
                                                            <Badge bg={isSelected ? 'success' : 'secondary'} className="book-ticket-status-badge">
                                                                <i className="fas fa-ticket-alt"></i>
                                                                Còn {ticket.veConLai}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="book-ticket-type-controls">
                                                    <div className="book-ticket-quantity-section">
                                                        <label className="book-ticket-quantity-label">Số lượng:</label>
                                                        <div className="book-ticket-quantity-controls">
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                className="book-ticket-quantity-btn"
                                                                onClick={() => handleQuantityChange(ticket.maLoaiVe ?? '', -1)}
                                                                disabled={isSoldOut || selectedQuantity <= 0}
                                                            >
                                                                <i className="fas fa-minus"></i>
                                                            </Button>
                                                            <Form.Control
                                                                type="number"
                                                                min={0}
                                                                max={max}
                                                                value={selectedQuantity}
                                                                onChange={(e) => handleQuantityInput(ticket.maLoaiVe ?? '', e.target.value)}
                                                                className="book-ticket-quantity-input"
                                                                disabled={isSoldOut}
                                                            />
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                className="book-ticket-quantity-btn"
                                                                onClick={() => handleQuantityChange(ticket.maLoaiVe ?? '', 1)}
                                                                disabled={isSoldOut || selectedQuantity >= max}
                                                            >
                                                                <i className="fas fa-plus"></i>
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {isSelected && (
                                                        <div className="book-ticket-type-total">
                                                            <span>Thành tiền: </span>
                                                            <span className="book-ticket-type-total-amount">
                                                                {formatCurrency(ticket.giaTien * selectedQuantity)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="book-ticket-type-limits">
                                                    <small className="text-muted">
                                                        <i className="fas fa-info-circle"></i>
                                                        Mua tối thiểu {min} vé, tối đa {max} vé
                                                    </small>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={8} className="book-ticket-main">
                        {/* Zone Map Section */}
                        {event.khuVucs && event.khuVucs.length > 0 ? (
                            <Card className="book-ticket-map-card">
                                <Card.Header className="book-ticket-card-header">
                                    <h3 className="book-ticket-card-title">
                                        <i className="fas fa-map"></i>
                                        Sơ đồ chỗ ngồi
                                    </h3>
                                    <p className="book-ticket-card-subtitle">
                                        Nhấp vào khu vực để chọn vé tương ứng • {event.khuVucs.length} khu vực có sẵn
                                    </p>
                                </Card.Header>
                                <Card.Body className="book-ticket-map-body">
                                    <ZoneMapViewer
                                        eventZones={event.khuVucs}
                                        tickets={event.loaiVes}
                                        selectedZoneId={selectedZoneId || undefined}
                                        onZoneClick={handleZoneClick}
                                        onZoneHover={handleZoneHover}
                                        width={800}
                                        height={500}
                                        showLabels={true}
                                        showTicketInfo={true}
                                        readOnly={false}
                                        className="book-ticket-zone-map"
                                    />
                                </Card.Body>
                            </Card>
                        ) : (
                            <Alert variant="info" className="book-ticket-info-alert">
                                <i className="fas fa-info-circle"></i>
                                Sự kiện này không có sơ đồ chỗ ngồi
                            </Alert>
                        )}

                        <Card className="book-ticket-payment-card">
                            <Card.Body className="book-ticket-payment-body">
                                <div className="book-ticket-payment-summary">
                                    <div className="book-ticket-payment-details">
                                        <h4 className="book-ticket-payment-title">
                                            <i className="fas fa-receipt"></i>
                                            Tổng thanh toán
                                        </h4>
                                        <div className="book-ticket-payment-amount">
                                            {formatCurrency(calculateTotal())}
                                        </div>
                                        {selectedTickets.length > 0 && (
                                            <div className="book-ticket-payment-breakdown">
                                                <small className="text-muted">
                                                    {selectedTickets.reduce((total, s) => total + s.quantity, 0)} vé được chọn
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                    <div className="book-ticket-payment-action">
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="book-ticket-payment-button"
                                            onClick={handlePayment}
                                            disabled={calculateTotal() === 0 || isBooking}
                                        >
                                            {isBooking ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-credit-card me-2"></i>
                                                    Tiến hành thanh toán
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default BookTicket;