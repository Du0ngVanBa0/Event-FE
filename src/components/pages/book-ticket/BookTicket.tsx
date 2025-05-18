import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Form } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { SuKien } from '../../../types/EventTypes';
import './BookTicket.css';
import eventService from '../../../api/eventService';
import { bookTicketService } from '../../../api/bookTicketService';

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

    const formatAddress = (event: SuKien) => {
        return `${event.diaDiem.tenDiaDiem}, ${event.diaDiem.tenPhuongXa}, ${event.diaDiem.tenQuanHuyen}, ${event.diaDiem.tenTinhThanh}`;
    };

    const handleQuantityChange = (ticketId: string, change: number) => {
        setSelectedTickets(prev => {
            const existing = prev.find(t => t.id === ticketId);
            if (!existing) {
                if (change > 0) {
                    return [...prev, { id: ticketId, quantity: 1 }];
                }
                return prev;
            }

            const newQuantity = Math.max(0, existing.quantity + change);
            if (newQuantity === 0) {
                return prev.filter(t => t.id !== ticketId);
            }

            return prev.map(t =>
                t.id === ticketId ? { ...t, quantity: newQuantity } : t
            );
        });
    };

    const handleQuantityInput = (ticketId: string, value: string) => {
        const quantity = parseInt(value) || 0;
        const ticket = event?.loaiVes.find(t => t.maLoaiVe === ticketId);
        const maxQuantity = ticket?.veConLai ?? 0;

        setSelectedTickets(prev => {
            if (quantity === 0) {
                return prev.filter(t => t.id !== ticketId);
            }

            const newQuantity = Math.min(Math.max(0, quantity), maxQuantity);
            const existing = prev.find(t => t.id === ticketId);

            if (!existing) {
                return [...prev, { id: ticketId, quantity: newQuantity }];
            }

            return prev.map(t =>
                t.id === ticketId ? { ...t, quantity: newQuantity } : t
            );
        });
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

    const handlePayment = async () => {
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
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Col>

                    <Col lg={8}>
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
                                {event.loaiVes.map(ticket => (
                                    <div key={ticket.maLoaiVe} className="ticket-selection-item">
                                        <div className="ticket-info">
                                            <h4>{ticket.tenLoaiVe}</h4>
                                            <p className="ticket-price">{formatCurrency(ticket.giaTien)}</p>
                                            <p className="tickets-remaining">
                                                {ticket.veConLai === 0 ? (
                                                    <span className="sold-out">Đã bán hết</span>
                                                ) : (
                                                    <span>Còn {ticket.veConLai} vé</span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="quantity-control">
                                            <Button 
                                                variant="outline-primary"
                                                onClick={() => handleQuantityChange(ticket.maLoaiVe ?? '', -1)}
                                                className="quantity-button"
                                                disabled={ticket.veConLai === 0}
                                            >
                                                -
                                            </Button>
                                            <Form.Control
                                                type="number"
                                                min="0"
                                                max={ticket.veConLai ?? 0}
                                                value={selectedTickets.find(t => t.id === ticket.maLoaiVe)?.quantity || 0}
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
                                                    (selectedTickets.find(t => t.id === ticket.maLoaiVe)?.quantity || 0) >= (ticket.veConLai ?? 0)
                                                }
                                            >
                                                +
                                            </Button>
                                        </div>
                                    </div>
                                ))}
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