import { useState, useEffect } from 'react';
import { Container, Card, Form, Alert } from 'react-bootstrap';
import { SuKien } from '../../../types/EventTypes';
import { DanhMucSuKien } from '../../../types/EventTypeTypes';
import eventService from '../../../api/eventService';
import eventCategoryService from '../../../api/eventCategoryService';
import { formatDate, getDefaulImagetUrl, getImageUrl } from '../../../utils/helper';
import { useNavigate } from 'react-router-dom';
import './Events.css';
import UniversePagination from '../../common/pagination/UniversePagination';

const ITEMS_PER_PAGE = 8;
const PAGE_SIZE_OPTIONS = [8, 12, 16, 20];

const Events = () => {
    const [events, setEvents] = useState<SuKien[]>([]);
    const [categories, setCategories] = useState<DanhMucSuKien[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const loadCategories = async () => {
        try {
            const response = await eventCategoryService.getAll();
            setCategories(response);
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    };

    const loadEvents = async (page: number, size: number = pageSize) => {
        try {
            setLoading(true);
            const response = await eventService.getPaginatedFiler(
                page,
                size,
                selectedCategory || undefined,
                true
            );
            setEvents(response.data.content);
            setTotalPages(response.data.totalPages);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách sự kiện. Vui lòng thử lại sau.');
            console.error('Error loading events:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        setCurrentPage(0);
        loadEvents(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory]);

    useEffect(() => {
        loadEvents(currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize]);

    const handleEventClick = (eventId: string) => {
        navigate(`/events/${eventId}`);
    };

    return (
        <Container className="filter-events-container">
            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            <div className="filter-events-wrapper">
                <div className="events-header">
                    <h2 className="page-title">Danh sách sự kiện</h2>
                </div>

                <div className="category-filter-container">
                    <div className="category-filter">
                        <div className="category-filter-label">
                            <i className="fas fa-filter"></i>
                            <span>Lọc theo danh mục</span>
                        </div>
                        <Form.Select
                            className="category-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map((category) => (
                                <option key={category.maDanhMuc} value={category.maDanhMuc}>
                                    {category.tenDanhMuc}
                                </option>
                            ))}
                        </Form.Select>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="filter-events-grid">
                            {events.map((event) => (
                                <Card
                                    key={event.maSuKien}
                                    className="filter-event-card"
                                    onClick={() => handleEventClick(event.maSuKien)}
                                >
                                    <div className="filter-event-card-image-wrapper">
                                        <div className="filter-event-card-image">
                                            <img
                                                src={getImageUrl(event.anhBia)}
                                                alt={event.tieuDe}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = getDefaulImagetUrl();
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <Card.Body>
                                        <Card.Title>{event.tieuDe}</Card.Title>
                                        <div className="filter-event-card-info">
                                            <div className="filter-event-time">
                                                <i className="fas fa-calendar-alt"></i>
                                                <span>{formatDate(event.thoiGianBatDau)}</span>
                                            </div>
                                            <div className="filter-event-location">
                                                <i className="fas fa-map-marker-alt"></i>
                                                <span>{event.diaDiem.tenDiaDiem}</span>
                                            </div>
                                            <div className="ticket-sale-info">
                                                <div className="ticket-sale-period">
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
                                        </div>
                                        <div className="categories-list">
                                            {event.danhMucs.map((category) => (
                                                <span key={category.maDanhMuc} className="category-badge">
                                                    {category.tenDanhMuc}
                                                </span>
                                            ))}
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))}

                            {events.length === 0 && (
                                <div className="no-events-message">
                                    <i className="fas fa-calendar-times"></i>
                                    <p>Không có sự kiện nào</p>
                                </div>
                            )}
                        </div>

                        {events.length > 0 && (
                            <div className="d-flex justify-content-between align-items-center mt-4">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="text-light">Hiển thị</span>
                                    <Form.Select
                                        size="sm"
                                        value={pageSize}
                                        onChange={(e) => {
                                            setPageSize(Number(e.target.value));
                                            setCurrentPage(0);
                                        }}
                                        className="page-size-select"
                                        style={{ width: 'auto' }}
                                    >
                                        {PAGE_SIZE_OPTIONS.map(size => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <span className="text-light">dòng</span>
                                </div>
                                
                                <UniversePagination
                                    currentPage={currentPage}
                                    onPageChange={setCurrentPage}
                                    totalPages={totalPages} 
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </Container>
    );
};

export default Events;
