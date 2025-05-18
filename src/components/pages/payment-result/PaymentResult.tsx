import { useState, useEffect } from 'react';
import { Container, Alert, Button, Card } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { paymentService } from '../../../api/paymentService';
import './PaymentResult.css';
import { PaymentResultResponse } from '../../../types/ResponseTypes';
import { formatCurrency, formatDateTime } from '../../../utils/helper';

const PaymentResult = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<PaymentResultResponse>();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const processPaymentResult = async () => {
            try {
                setLoading(true);
                
                // Get URL parameters
                const searchParams = new URLSearchParams(location.search);
                const params: URLSearchParams[] = [];
                
                // Convert URLSearchParams to the format expected by the API
                searchParams.forEach((value, key) => {
                    const param = new URLSearchParams();
                    param.append(key, value);
                    params.push(param);
                });
                
                const response = await paymentService.getPaymentResult(params);
                
                if (response.success) {
                    setResult(response.data);
                } else {
                    throw new Error(response.message || 'Không thể xác nhận kết quả thanh toán');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi đăng nhập');
            } finally {
                setLoading(false);
            }
        };

        processPaymentResult();
    }, [location.search]);

    const handleViewTickets = () => {
        navigate('/my-tickets');
    };

    const handleBackToEvents = () => {
        navigate('/events');
    };

    if (loading) {
        return (
            <Container className="payment-result-container">
                <div className="payment-result-loading-container">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang xử lý...</span>
                    </div>
                    <p className="mt-3">Đang xác nhận kết quả thanh toán...</p>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="payment-result-container">
                <Alert variant="danger">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                </Alert>
                <div className="text-center mt-4">
                    <Button variant="primary" onClick={handleBackToEvents}>
                        Quay lại trang sự kiện
                    </Button>
                </div>
            </Container>
        );
    }

    const isSuccessful = result?.success === true;

    return (
        <Container className="payment-result-container">
            <Card className="result-card">
                <Card.Body>
                    <div className="text-center mb-4">
                        {isSuccessful ? (
                            <div className="success-icon">
                                <i className="fas fa-check-circle"></i>
                            </div>
                        ) : (
                            <div className="failure-icon">
                                <i className="fas fa-times-circle"></i>
                            </div>
                        )}
                        
                        <h2 className={isSuccessful ? "text-success" : "text-danger"}>
                            {isSuccessful ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
                        </h2>
                        
                        <h2 className={isSuccessful ? "text-success" : "text-danger"}>
                            {isSuccessful ? `${formatCurrency(result?.tongTien || 0)}` : ''}
                        </h2>
                        
                        <p className="result-message">
                            {isSuccessful ? 
                                'Cảm ơn bạn đã đặt vé. Giao dịch của bạn đã được xử lý thành công.' : 
                                'Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại sau.'}
                        </p>
                    </div>

                    {isSuccessful && (
                        <div className="payment-details">
                            <div className="payment-result-detail-item">
                                <span>Mã giao dịch:</span>
                                <span>{result?.maGiaoDich || 'N/A'}</span>
                            </div>
                            <div className="payment-result-detail-item">
                                <span>Mã thanh toán:</span>
                                <span>{result?.maThanhToan || 'N/A'}</span>
                            </div>
                            <div className="payment-result-detail-item">
                                <span>Mã đặt vé:</span>
                                <span>{result?.maDatVe || 'N/A'}</span>
                            </div>
                            <div className="payment-result-detail-item">
                                <span>Thời gian thanh toán:</span>
                                <span>{formatDateTime(result.ngayThanhToan)}</span>
                            </div>
                        </div>
                    )}

                    <div className="payment-result-action-buttons">
                        {isSuccessful ? (
                            <>
                                <button onClick={handleBackToEvents} className='payment-result-more-btn payment-result-btn'>
                                    Khám phá thêm sự kiện
                                </button>
                                <button onClick={handleViewTickets} className='bg-success payment-result-btn'>
                                    Xem vé của tôi
                                </button>
                            </>
                        ) : (
                            <Button variant="primary" onClick={() => navigate(-1)}>
                                Thử lại
                            </Button>
                        )}
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default PaymentResult;