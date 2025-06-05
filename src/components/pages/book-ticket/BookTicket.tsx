import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Alert, Form, Card } from 'react-bootstrap';
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
                ticketElement.classList.add('ticket-highlight');
                setTimeout(() => {
                    ticketElement.classList.remove('ticket-highlight');
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
            <Container className="book-ticket-container">
                <div className="loading-container">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </Container>
        );
    }

    if (error || !event) {
        return (
            <Container className="book-ticket-container">
                <Alert variant="danger">{error || 'Không tìm thấy sự kiện'}</Alert>
            </Container>
        );
    }

    return (
        <Container className="book-ticket-container">
            <Button
                variant="link"
                className="back-button"
                onClick={() => navigate(-1)}
            >
                <i className="fas fa-arrow-left"></i> Quay lại
            </Button>

            <div className="booking-content">
                <Row>
                    <Col lg={4}>
                        <div className="event-info-panel">
                            <h2>{event.tieuDe}</h2>
                            <p className="event-address">
                                <i className="fas fa-map-marker-alt"></i>
                                {formatAddress(event)}
                            </p>

                            <div className="ticket-price-list">
                                <h3>Giá vé</h3>
                                {event.loaiVes.map(ticket => (
                                    <div key={ticket.maLoaiVe} className="ticket-price-item">
                                        <span>{ticket.tenLoaiVe}</span>
                                        <span>{formatCurrency(ticket.giaTien)}</span>
                                        <span>
                                            (Tối thiểu {ticket.soLuongToiThieu || 0} / Tối đa {ticket.soLuongToiDa || ticket.veConLai || 0})
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Col>

                    <Col lg={8}>
                        {event.khuVucs && event.khuVucs.length > 0 ? (
                            <Card className="mb-4">
                                <Card.Header>
                                    <h5 className="mb-0">
                                        <i className="fas fa-map"></i> Sơ đồ chỗ ngồi
                                    </h5>
                                    <small className="text-muted">
                                        Nhấp vào khu vực để chọn vé tương ứng (Có {event.khuVucs.length} khu vực)
                                    </small>
                                </Card.Header>
                                <Card.Body>
                                    <ZoneMapViewer
                                        eventZones={event.khuVucs}
                                        tickets={event.loaiVes}
                                        selectedZoneId={selectedZoneId || undefined}
                                        onZoneClick={handleZoneClick}
                                        onZoneHover={handleZoneHover}
                                        width={1200}
                                        height={1080}
                                        showLabels={true}
                                        showTicketInfo={true}
                                        readOnly={false}
                                        className="zone-map-booking"
                                    />
                                </Card.Body>
                            </Card>
                        ) : (
                            <Alert variant="info" className="mb-4">
                                <i className="fas fa-info-circle me-2"></i>
                                Sự kiện này không có sơ đồ chỗ ngồi
                            </Alert>
                        )}

                        <div className="ticket-selection-panel">
                            <div className="ticket-selection-header">
                                <h3>Loại vé</h3>
                                <h3>Số lượng</h3>
                            </div>

                            {bookingError && (
                                <Alert variant="danger" className="mt-3 mb-3">
                                    <i className="fas fa-exclamation-circle me-2"></i>
                                    {bookingError}
                                </Alert>
                            )}

                            <div className="ticket-selection-list">
                                {event.loaiVes.map(ticket => {
                                    const min = ticket.soLuongToiThieu || 0;
                                    const max = Math.min(ticket.soLuongToiDa || ticket.veConLai || 0, ticket.veConLai || 0);
                                    return (
                                        <div
                                            key={ticket.maLoaiVe}
                                            className="ticket-selection-item"
                                            ref={(el) => {
                                                if (ticket.maLoaiVe) {
                                                    ticketRefs.current[ticket.maLoaiVe] = el;
                                                }
                                            }}
                                        >
                                            <div className="ticket-info">
                                                <h4>{ticket.tenLoaiVe}</h4>
                                                <p className="ticket-price">{formatCurrency(ticket.giaTien)}</p>
                                                <p className="tickets-remaining">
                                                    {ticket.veConLai === 0 ? (
                                                        <span className="sold-out">Đã bán hết</span>
                                                    ) : (
                                                        <span>
                                                            Còn {ticket.veConLai} vé&nbsp;
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="quantity-control">
                                                <Button
                                                    variant="outline-primary"
                                                    onClick={() => handleQuantityChange(ticket.maLoaiVe ?? '', -1)}
                                                    className="quantity-button"
                                                    disabled={ticket.veConLai === 0 || getSelectedQuantity(ticket.maLoaiVe ?? '') <= min}
                                                >
                                                    -
                                                </Button>
                                                <Form.Control
                                                    type="number"
                                                    min={min}
                                                    max={max}
                                                    value={getSelectedQuantity(ticket.maLoaiVe ?? '')}
                                                    onChange={(e) => handleQuantityInput(ticket.maLoaiVe ?? '', e.target.value)}
                                                    className="quantity-input"
                                                    disabled={ticket.veConLai === 0}
                                                />
                                                <Button
                                                    variant="outline-primary"
                                                    onClick={() => handleQuantityChange(ticket.maLoaiVe ?? '', 1)}
                                                    className="quantity-button"
                                                    disabled={
                                                        ticket.veConLai === 0 ||
                                                        getSelectedQuantity(ticket.maLoaiVe ?? '') >= max
                                                    }
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="payment-section">
                                <div className="total-amount">
                                    <span>Tổng tiền:</span>
                                    <span className="amount">{formatCurrency(calculateTotal())}</span>
                                </div>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="payment-button"
                                    onClick={handlePayment}
                                    disabled={calculateTotal() === 0 || isBooking}
                                >
                                    {isBooking ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        'Thanh toán'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </Container>
    );
};

export default BookTicket;