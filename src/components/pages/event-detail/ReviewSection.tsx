import { useState, useEffect, useCallback, useRef } from 'react';
import { DanhGia } from '../../../types/ReviewTypes';
import { reviewService } from '../../../api/reviewService';
import socketService from '../../../services/socketService';
import { StompSubscription } from '@stomp/stompjs';
import './ReviewSection.css';

interface ReviewSectionProps {
    maSuKien: string;
}

const ReviewSection = ({ maSuKien }: ReviewSectionProps) => {
    const [reviews, setReviews] = useState<DanhGia[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const subscriptionRef = useRef<StompSubscription | null>(null);

    const loadReviews = useCallback(async (page: number = 0, append: boolean = false) => {
        try {
            if (!append) setLoading(true);
            else setLoadingMore(true);

            const response = await reviewService.getReviewsByEvent(maSuKien, {
                page,
                size: 10,
                sort: ['ngayTao,desc']
            });

            const newReviews = response.data.content;
            setReviews(prev => append ? [...prev, ...newReviews] : newReviews);
            setTotalElements(response.data.totalElements);
            setHasMore(page + 1 < response.data.totalPages);
            setCurrentPage(page);
            setError(null);
        } catch (err) {
            setError('Không thể tải đánh giá. Vui lòng thử lại sau.');
            console.error('Error loading reviews:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [maSuKien]);

    useEffect(() => {
        const connectSocket = async () => {
            try {
                await socketService.connect();
                setSocketConnected(true);

                const subscription = socketService.subscribeToEventReviews(maSuKien, (message) => {
                    if (message.type === 'NEW_REVIEW') {
                        loadReviews(0, false);
                    }
                });

                subscriptionRef.current = subscription;
            } catch (error) {
                console.error('Failed to connect socket:', error);
                setSocketConnected(false);
            }
        };

        if (maSuKien) {
            connectSocket();
        }

        return () => {
            if (subscriptionRef.current) {
                socketService.unsubscribe(subscriptionRef.current);
                subscriptionRef.current = null;
            }
        };
    }, [maSuKien, loadReviews]);

    useEffect(() => {
        if (maSuKien) {
            loadReviews();
        }
    }, [maSuKien, loadReviews]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        
        if (!socketConnected && maSuKien && !loading) {
            interval = setInterval(() => {
                loadReviews(0, false);
            }, 30000); // Poll every 30 seconds
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [socketConnected, maSuKien, loading, loadReviews]);

    const handleLoadMore = () => {
        if (hasMore && !loadingMore) {
            loadReviews(currentPage + 1, true);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<span key={i} className="review-section-star">★</span>);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<span key={i} className="review-section-star">☆</span>);
            } else {
                stars.push(<span key={i} className="review-section-star empty">☆</span>);
            }
        }
        return stars;
    };

    const getAverageRating = (): number => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.diemDanhGia, 0);
        return sum / reviews.length;
    };

    const getUserInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <div className="review-section-container">
                <div className="review-section-loading">
                    <div className="review-section-spinner"></div>
                    <span>Đang tải đánh giá...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="review-section-container">
                <div className="review-section-error">
                    <i className="fas fa-exclamation-triangle"></i>
                    <div>{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="review-section-container">
            <div className="review-section-header">
                <h3 className="review-section-title">
                    <i className="fas fa-star"></i>
                    Đánh giá từ người dùng
                    {socketConnected && (
                        <span className="review-section-live-badge">🔴 LIVE</span>
                    )}
                </h3>
                {reviews.length > 0 && (
                    <div className="review-section-stats">
                        <div className="review-section-average">
                            {renderStars(getAverageRating())}
                            <span>{getAverageRating().toFixed(1)}/5</span>
                        </div>
                        <div className="review-section-count">
                            ({totalElements} đánh giá)
                        </div>
                    </div>
                )}
            </div>

            {reviews.length === 0 ? (
                <div className="review-section-empty">
                    <i className="fas fa-comments"></i>
                    <h4>Chưa có đánh giá nào</h4>
                    <p>Hãy là người đầu tiên đánh giá sự kiện này!</p>
                </div>
            ) : (
                <>
                    <div className="review-section-list">
                        {reviews.map((review) => (
                            <div key={review.maDanhGia} className="review-section-item">
                                <div className="review-section-avatar-container">
                                    {review.anhDaiDienNguoiDung ? (
                                        <img
                                            src={review.anhDaiDienNguoiDung}
                                            alt={review.hoTenNguoiDung}
                                            className="review-section-avatar"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const fallback = target.nextElementSibling as HTMLElement;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div 
                                        className="review-section-avatar-fallback"
                                        style={{ 
                                            display: review.anhDaiDienNguoiDung ? 'none' : 'flex' 
                                        }}
                                    >
                                        {getUserInitials(review.hoTenNguoiDung)}
                                    </div>
                                </div>

                                <div className="review-section-content">
                                    <div className="review-section-header-info">
                                        <span className="review-section-name">
                                            {review.hoTenNguoiDung}
                                        </span>
                                        <span className="review-section-date">
                                            {formatDate(review.ngayTao)}
                                        </span>
                                    </div>

                                    <div className="review-section-stars">
                                        {renderStars(review.diemDanhGia)}
                                    </div>

                                    <p className="review-section-text">
                                        {review.noiDung}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {hasMore && (
                        <div className="review-section-pagination">
                            <button
                                className="review-section-load-more"
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                            >
                                {loadingMore ? (
                                    <>
                                        <div className="review-section-spinner" style={{ 
                                            width: '16px', 
                                            height: '16px', 
                                            marginRight: '0.5rem',
                                            display: 'inline-block' 
                                        }}></div>
                                        Đang tải...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-chevron-down"></i>
                                        Xem thêm đánh giá
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ReviewSection;
