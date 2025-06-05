import { useState, useEffect, useRef } from 'react';
import { Container, Card, Form, Alert, Button } from 'react-bootstrap';
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
    const [cardsVisible, setCardsVisible] = useState(false);
    const eventsGridRef = useRef<HTMLDivElement>(null);
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

    useEffect(() => {
        if (!loading && events.length > 0) {
            setTimeout(() => {
                setCardsVisible(true);
            }, 100);
        }
    }, [loading, events]);

    const handlePageChange = (page: number) => {
        setCardsVisible(false);
        setCurrentPage(page);
        
        setTimeout(() => {
            if (eventsGridRef.current) {
                eventsGridRef.current.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }, 100);
    };

    const handleEventClick = (eventId: string) => {
        navigate(`/events/${eventId}`);
    };

    const handleBookNow = (eventId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/events/${eventId}`);
    };

    return (
        <Container className="events-page-container">
            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            <div className="events-page-wrapper">
                <div className="events-page-header">
                    <h2 className="events-page-title">Danh sách sự kiện</h2>
                </div>

                <div className="events-page-filter-container">
                    <div className="events-page-filter">
                        <div className="events-page-filter-label">
                            <i className="fas fa-filter"></i>
                            <span>Lọc theo danh mục</span>
                        </div>
                        <Form.Select
                            className="events-page-select"
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
                    <div className="events-page-loading">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div 
                            ref={eventsGridRef}
                            className={`events-page-grid ${cardsVisible ? 'events-page-cards-visible' : ''}`}
                        >
                            {events.map((event, index) => (
                                <Card
                                    key={event.maSuKien}
                                    className="events-page-card"
                                    style={{ '--animation-delay': `${index * 0.1}s` } as React.CSSProperties}
                                    onClick={() => handleEventClick(event.maSuKien)}
                                >
                                    <div className="events-page-card-particles"></div>
                                    <div className="events-page-card-image-wrapper">
                                        <div className="events-page-card-image">
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
                                    <Card.Body className="events-page-card-body">
                                        <Card.Title className="events-page-card-title">{event.tieuDe}</Card.Title>
                                        <div className="events-page-card-info">
                                            <div className="events-page-card-time">
                                                <i className="fas fa-calendar-alt"></i>
                                                <span>{formatDate(event.thoiGianBatDau)}</span>
                                            </div>
                                            <div className="events-page-card-location">
                                                <i className="fas fa-map-marker-alt"></i>
                                                <span>{event.diaDiem.tenDiaDiem}</span>
                                            </div>
                                        </div>
                                        <div className="events-page-categories">
                                            {event.danhMucs.slice(0, 2).map((category) => (
                                                <span key={category.maDanhMuc} className="events-page-category-badge">
                                                    {category.tenDanhMuc}
                                                </span>
                                            ))}
                                            {event.danhMucs.length > 2 && (
                                                <span className="events-page-category-badge events-page-category-more">
                                                    +{event.danhMucs.length - 2}
                                                </span>
                                            )}
                                        </div>
                                        <Button
                                            className="events-page-button"
                                            onClick={(e) => handleBookNow(event.maSuKien, e)}
                                        >
                                            <i className="fas fa-ticket-alt"></i>
                                            <span>Đặt vé ngay</span>
                                        </Button>
                                    </Card.Body>
                                </Card>
                            ))}

                            {events.length === 0 && (
                                <div className="events-page-no-events">
                                    <i className="fas fa-calendar-times"></i>
                                    <p>Không có sự kiện nào</p>
                                </div>
                            )}
                        </div>

                        {events.length > 0 && (
                            <div className="events-page-pagination-wrapper">
                                <div className="events-page-page-size">
                                    <span className="events-page-page-size-label">Hiển thị</span>
                                    <Form.Select
                                        size="sm"
                                        value={pageSize}
                                        onChange={(e) => {
                                            setPageSize(Number(e.target.value));
                                            setCurrentPage(0);
                                        }}
                                        className="events-page-page-size-select"
                                    >
                                        {PAGE_SIZE_OPTIONS.map(size => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <span className="events-page-page-size-label">dòng</span>
                                </div>
                                
                                <UniversePagination
                                    currentPage={currentPage}
                                    onPageChange={handlePageChange}
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
