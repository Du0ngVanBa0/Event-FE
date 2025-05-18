import { useState, useEffect } from 'react';
import { Container, Alert, Button, Card } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentService } from '../../../api/paymentService';
import './Payment.css';
import { BookingTicket } from '../../../types/BookingTypes';
import { CreatePaymentRequest } from '../../../types/RequestTypes';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    
    const handleVnpayReturn = async () => {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.toString()) {
            try {
                const response = await paymentService.getPaymentResult([searchParams]);
                if (response.success) {
                    navigate('/payment/success', { state: { paymentResult: response.data } });
                    return true;
                } else {
                    throw new Error(response.message || 'Thanh toán không thành công');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xử lý thanh toán');
                return true;
            }
        }
        return false;
    };
    
    useEffect(() => {
        const processPayment = async () => {
            try {
                setLoading(true);
    
                const searchParams = new URLSearchParams(window.location.search);
                const isVnpayReturn = searchParams.has("vnp_ResponseCode");
    
                if (isVnpayReturn) {
                    await handleVnpayReturn();
                    return;
                }
    
                const bookingData = location.state?.bookingData as BookingTicket;
                if (!bookingData) {
                    throw new Error('Không tìm thấy thông tin đặt vé');
                }
    
                const dataPayment: CreatePaymentRequest = {
                    maDatVe: bookingData.maDatVe,
                    bankCode: "VNBANK"
                };
    
                const response = await paymentService.createPayment(dataPayment);
                if (response.success && response.data?.paymentUrl) {
                    setPaymentUrl(response.data.paymentUrl);
                } else {
                    throw new Error(response.message || 'Không thể tạo yêu cầu thanh toán');
                }
    
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xử lý thanh toán');
            } finally {
                setLoading(false);
            }
        };
    
        processPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCancelPayment = () => {
        navigate('/user/events');
    };

    if (loading) {
        return (
            <Container className="payment-container">
                <div className="payment-loading-container">
                    <div className="payment-spinner-border text-primary" role="status">
                        <span className="visually-hidden payment-loading-text">Đang xử lý...</span>
                    </div>
                    <p className="mt-3 payment-loading-text">Đang chuẩn bị thông tin thanh toán...</p>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="payment-container">
                <Alert variant="danger">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                </Alert>
                <div className="text-center mt-4">
                    <Button variant="secondary" onClick={() => navigate(-1)}>
                        Quay lại
                    </Button>
                </div>
            </Container>
        );
    }

    if (paymentUrl) {
        window.location.href = paymentUrl;
        return (
            <Container className="payment-container">
                <div className="payment-loading-container">
                    <div className="payment-spinner-border text-primary" role="status">
                        <span className="visually-hidden payment-loading-text">Đang chuyển hướng...</span>
                    </div>
                    <p className="mt-3 payment-loading-text">Đang chuyển đến cổng thanh toán VNPay...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container className="payment-container">
            <Card className="payment-card">
                <Card.Header as="h4">Xác nhận thanh toán</Card.Header>
                <Card.Body>
                    <Card.Text className='payment-loading-text'>
                        Đang chuẩn bị kết nối đến cổng thanh toán...
                    </Card.Text>
                    <div className="text-center mt-4">
                        <Button variant="secondary" onClick={handleCancelPayment} className="me-3">
                            Hủy thanh toán
                        </Button>
                        <Button variant="primary" disabled>
                            Đang xử lý...
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Payment;