import { useState } from 'react';
import { Button, Form, Alert } from 'react-bootstrap';
import { reviewService } from '../../../api/reviewService';
import { CreateReviewRequest } from '../../../types/ReviewTypes';
import './ReviewForm.css';

interface ReviewFormProps {
    maSuKien: string;
    onReviewSubmitted?: () => void;
}

const ReviewForm = ({ maSuKien, onReviewSubmitted }: ReviewFormProps) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (rating === 0) {
            setError('Vui lòng chọn số sao đánh giá');
            return;
        }

        if (content.trim().length < 10) {
            setError('Nội dung đánh giá phải có ít nhất 10 ký tự');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const request: CreateReviewRequest = {
                noiDung: content.trim(),
                diemDanhGia: rating
            };

            await reviewService.createReview(maSuKien, request);
            
            setRating(0);
            setContent('');
            setSuccess(true);
            
            if (onReviewSubmitted) {
                onReviewSubmitted();
            }

            setTimeout(() => setSuccess(false), 3000);
            
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Error submitting review:', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Không thể gửi đánh giá. Vui lòng thử lại sau.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleStarClick = (starRating: number) => {
        setRating(starRating);
        setError(null);
    };

    const handleStarHover = (starRating: number) => {
        setHoverRating(starRating);
    };

    const handleStarLeave = () => {
        setHoverRating(0);
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            const filled = i <= (hoverRating || rating);
            stars.push(
                <button
                    key={i}
                    type="button"
                    className={`review-form-star ${filled ? 'filled' : ''}`}
                    onClick={() => handleStarClick(i)}
                    onMouseEnter={() => handleStarHover(i)}
                    onMouseLeave={handleStarLeave}
                    disabled={submitting}
                >
                    ★
                </button>
            );
        }
        return stars;
    };

    const getRatingText = (rating: number) => {
        switch (rating) {
            case 1: return 'Rất tệ';
            case 2: return 'Tệ';
            case 3: return 'Trung bình';
            case 4: return 'Tốt';
            case 5: return 'Xuất sắc';
            default: return 'Chọn đánh giá';
        }
    };

    return (
        <div className="review-form-container">
            <div className="review-form-header">
                <h4 className="review-form-title">
                    <i className="fas fa-edit"></i>
                    Viết đánh giá
                </h4>
                <p className="review-form-subtitle">
                    Chia sẻ trải nghiệm của bạn về sự kiện này
                </p>
            </div>

            {success && (
                <Alert variant="success" className="review-form-success">
                    <i className="fas fa-check-circle"></i>
                    Đánh giá của bạn đã được gửi thành công! Cảm ơn bạn đã chia sẻ.
                </Alert>
            )}

            <Form onSubmit={handleSubmit} className="review-form">
                <div className="review-form-rating">
                    <label className="review-form-label">
                        Đánh giá của bạn *
                    </label>
                    <div className="review-form-stars">
                        {renderStars()}
                        <span className="review-form-rating-text">
                            {getRatingText(hoverRating || rating)}
                        </span>
                    </div>
                </div>

                <Form.Group className="review-form-content">
                    <Form.Label className="review-form-label">
                        Nội dung đánh giá *
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value);
                            setError(null);
                        }}
                        placeholder="Chia sẻ chi tiết về trải nghiệm của bạn..."
                        disabled={submitting}
                        className="review-form-textarea"
                        maxLength={500}
                    />
                    <small className="review-form-counter">
                        {content.length}/500 ký tự
                    </small>
                </Form.Group>

                {error && (
                    <Alert variant="danger" className="review-form-error">
                        <i className="fas fa-exclamation-triangle"></i>
                        {error}
                    </Alert>
                )}

                <div className="review-form-actions">
                    <Button
                        type="submit"
                        className="review-form-submit"
                        disabled={submitting || rating === 0 || content.trim().length < 10}
                    >
                        {submitting ? (
                            <>
                                <div className="review-form-spinner"></div>
                                Đang gửi...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-paper-plane"></i>
                                Gửi đánh giá
                            </>
                        )}
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default ReviewForm;