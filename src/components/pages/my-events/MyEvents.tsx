import { useState, useEffect } from 'react';
import { Container, Nav, Card, Alert, Pagination, Form, Button } from 'react-bootstrap';
import { SuKien } from '../../../types/EventTypes';
import eventService from '../../../api/eventService';
import { getImageUrl, getDefaulImagetUrl } from '../../../utils/helper';
import MyEventDetailModal from './MyEventDetailModal';
import './MyEvents.css';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE_OPTIONS = [6, 12, 18, 24];
const ITEMS_PER_PAGE = 6;

const MyEvents = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'pending'>('all');
    const [events, setEvents] = useState<SuKien[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
    const [error, setError] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<SuKien | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: string } | null>(null);
    const [hasApprovedEvents, setHasApprovedEvents] = useState(false);

    const loadEvents = async (page: number, size: number = pageSize) => {
        try {
            setLoading(true);
            let response;
            switch (activeTab) {
                case 'approved':
                    response = await eventService.getMyEvents(page, size, true);
                    break;
                case 'pending':
                    response = await eventService.getMyEvents(page, size, false);
                    break;
                default:
                    response = await eventService.getMyEvents(page, size);
            }
            setEvents(response.data.content);
            setTotalPages(response.data.totalPages);
            
            const hasApproved = response.data.content.some((event: SuKien) => event.hoatDong);
            setHasApprovedEvents(hasApproved);
        } catch (error) {
            setError('Không thể tải danh sách sự kiện');
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(0);
        loadEvents(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    useEffect(() => {
        loadEvents(currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize]);

    const handleTabChange = (tab: 'all' | 'approved' | 'pending') => {
        setActiveTab(tab);
    };

    const handleEdit = async (eventId: string) => {
        const event = events.find(e => e.maSuKien === eventId);
        if (event?.hoatDong) {
            setNotification({
                message: 'Không thể chỉnh sửa sự kiện đã được phê duyệt',
                type: 'warning'
            });
            return;
        }
        navigate(`/organizer/edit-event/${eventId}`);
    };

    const handleDelete = async (eventId: string) => {
        const event = events.find(e => e.maSuKien === eventId);
        if (event?.hoatDong) {
            setNotification({
                message: 'Không thể xóa sự kiện đã được phê duyệt',
                type: 'warning'
            });
            return;
        }

        try {
            await eventService.deleteEvent(eventId);
            await loadEvents(currentPage);
            setNotification({
                message: 'Xóa sự kiện thành công',
                type: 'success'
            });
        } catch (err) {
            console.error('Error deleting event:', err);
            setNotification({
                message: 'Không thể xóa sự kiện',
                type: 'danger'
            });
        }
    };

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const getTabIcon = (tab: string) => {
        switch (tab) {
            case 'all':
                return 'fas fa-list';
            case 'approved':
                return 'fas fa-check-circle';
            case 'pending':
                return 'fas fa-clock';
            default:
                return 'fas fa-calendar';
        }
    };

    const formatEventDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            day: date.getDate().toString().padStart(2, '0'),
            month: date.toLocaleDateString('vi-VN', { month: 'short' }),
            year: date.getFullYear(),
            time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const isEventEditable = (event: SuKien) => !event.hoatDong;

    return (
        <div className="my-events-page-container">
            {notification && (
                <div className="my-events-page-notification-container">
                    <Alert variant={notification.type} className="my-events-page-notification-alert">
                        <i className={`fas fa-${
                            notification.type === 'success' ? 'check-circle' : 
                            notification.type === 'warning' ? 'exclamation-triangle' : 
                            'exclamation-triangle'
                        }`}></i>
                        <span>{notification.message}</span>
                    </Alert>
                </div>
            )}

            <Container fluid className="my-events-page-wrapper">
                <div className="my-events-page-header">
                    <div className="my-events-page-title-section">
                        <h1 className="my-events-page-title">
                            <i className="fas fa-calendar-alt"></i>
                            <span>Sự kiện của tôi</span>
                        </h1>
                        <p className="my-events-page-subtitle">
                            Quản lý và theo dõi tất cả các sự kiện bạn đã tạo
                        </p>
                    </div>
                    <div className="my-events-page-buttons-group">
                        {hasApprovedEvents && (
                            <Button
                                variant="success"
                                className="my-events-page-scanner-button me-2"
                                onClick={() => navigate('/organizer/scan-event')}
                            >
                                <i className="fas fa-qrcode me-1"></i>
                                <span>Quét vé</span>
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            className="my-events-page-create-button"
                            onClick={() => navigate('/organizer/create-event')}
                        >
                            <i className="fas fa-plus me-1"></i>
                            <span>Tạo sự kiện mới</span>
                        </Button>
                    </div>
                </div>

                <div className="my-events-page-tabs-wrapper">
                    <Nav className="my-events-page-tabs">
                        {[
                            { key: 'all', label: 'Tất cả', count: events.length },
                            { key: 'approved', label: 'Đã duyệt' },
                            { key: 'pending', label: 'Chờ duyệt' }
                        ].map((tab) => (
                            <Nav.Item key={tab.key}>
                                <Nav.Link
                                    className={`my-events-page-tab ${activeTab === tab.key ? 'my-events-page-tab-active' : ''}`}
                                    onClick={() => handleTabChange(tab.key as 'all' | 'approved' | 'pending')}
                                >
                                    <div className="my-events-page-tab-content">
                                        <i className={getTabIcon(tab.key)}></i>
                                        <span>{tab.label}</span>
                                    </div>
                                    <div className="my-events-page-tab-indicator"></div>
                                </Nav.Link>
                            </Nav.Item>
                        ))}
                    </Nav>
                </div>

                {error && (
                    <Alert variant="danger" className="my-events-page-alert">
                        <i className="fas fa-exclamation-triangle"></i>
                        <span>{error}</span>
                    </Alert>
                )}

                <div className="my-events-page-content">
                    {loading ? (
                        <div className="my-events-page-loading">
                            <div className="my-events-page-spinner">
                                <div className="spinner-border" role="status"></div>
                            </div>
                            <p>Đang tải danh sách sự kiện...</p>
                        </div>
                    ) : (
                        <>
                            <div className="my-events-page-grid">
                                {events.map(event => {
                                    const eventDate = formatEventDate(event.thoiGianBatDau);
                                    const isEditable = isEventEditable(event);
                                    
                                    return (
                                        <Card 
                                            key={event.maSuKien} 
                                            className={`my-events-page-event-card ${!isEditable ? 'my-events-page-event-card-locked' : ''}`}
                                            onClick={() => {
                                                setSelectedEvent(event);
                                                setShowModal(true);
                                            }}
                                        >
                                            <div className="my-events-page-card-header">
                                                <div className="my-events-page-event-image">
                                                    <img
                                                        src={getImageUrl(event.anhBia)}
                                                        alt={event.tieuDe}
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = getDefaulImagetUrl();
                                                        }}
                                                    />
                                                    <div className="my-events-page-image-overlay">
                                                        <i className="fas fa-eye"></i>
                                                    </div>
                                                    {!isEditable && (
                                                        <div className="my-events-page-lock-overlay">
                                                            <i className="fas fa-lock"></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="my-events-page-event-date">
                                                    <div className="my-events-page-date-day">{eventDate.day}</div>
                                                    <div className="my-events-page-date-month">{eventDate.month}</div>
                                                    <div className="my-events-page-date-year">{eventDate.year}</div>
                                                </div>
                                            </div>

                                            <div className="my-events-page-card-body">
                                                <div className="my-events-page-event-info">
                                                    <h3 className="my-events-page-event-title">{event.tieuDe}</h3>
                                                    
                                                    <div className="my-events-page-event-details">
                                                        <div className="my-events-page-detail-item">
                                                            <i className="fas fa-clock"></i>
                                                            <span>{eventDate.time}</span>
                                                        </div>
                                                        <div className="my-events-page-detail-item">
                                                            <i className="fas fa-map-marker-alt"></i>
                                                            <span>{event.diaDiem?.tenDiaDiem || 'Chưa cập nhật'}</span>
                                                        </div>
                                                        <div className="my-events-page-detail-item">
                                                            <i className="fas fa-ticket-alt"></i>
                                                            <span>{event.loaiVes?.length || 0} loại vé</span>
                                                        </div>
                                                    </div>

                                                    <div className="my-events-page-categories">
                                                        {event.danhMucs?.slice(0, 2).map((category) => (
                                                            <span key={category.maDanhMuc} className="my-events-page-category-badge">
                                                                {category.tenDanhMuc}
                                                            </span>
                                                        ))}
                                                        {event.danhMucs?.length > 2 && (
                                                            <span className="my-events-page-category-more">
                                                                +{event.danhMucs.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="my-events-page-card-footer">
                                                <div className={`my-events-page-status-badge ${event.hoatDong ? 'my-events-page-status-approved' : 'my-events-page-status-pending'}`}>
                                                    <i className={`fas fa-${event.hoatDong ? 'check-circle' : 'clock'}`}></i>
                                                    <span>{event.hoatDong ? 'Đã duyệt' : 'Chờ duyệt'}</span>
                                                </div>
                                                
                                                <div className="my-events-page-action-buttons">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="my-events-page-view-button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedEvent(event);
                                                            setShowModal(true);
                                                        }}
                                                        title="Xem chi tiết"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </Button>
                                                    <Button
                                                        variant="outline-warning"
                                                        size="sm"
                                                        className={`my-events-page-edit-button ${!isEditable ? 'my-events-page-button-disabled' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(event.maSuKien);
                                                        }}
                                                        disabled={!isEditable}
                                                        title={isEditable ? "Chỉnh sửa" : "Không thể chỉnh sửa sự kiện đã được phê duyệt"}
                                                    >
                                                        <i className='fas fa-edit'></i>
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        className={`my-events-page-delete-button ${!isEditable ? 'my-events-page-button-disabled' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
                                                                handleDelete(event.maSuKien);
                                                            }
                                                        }}
                                                        disabled={!isEditable}
                                                        title={isEditable ? "Xóa sự kiện" : "Không thể xóa sự kiện đã được phê duyệt"}
                                                    >
                                                        <i className='fas fa-trash'></i>
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>

                            {events.length === 0 && (
                                <div className="my-events-page-empty-state">
                                    <div className="my-events-page-empty-icon">
                                        <i className="fas fa-calendar-times"></i>
                                    </div>
                                    <h3>Chưa có sự kiện nào</h3>
                                    <p>
                                        {activeTab === 'all' 
                                            ? 'Bạn chưa tạo sự kiện nào. Hãy tạo sự kiện đầu tiên!'
                                            : `Không có sự kiện nào trong trạng thái "${
                                                activeTab === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'
                                            }"`
                                        }
                                    </p>
                                    <Button
                                        variant="primary"
                                        className="my-events-page-create-event-button"
                                        onClick={() => navigate('/organizer/create-event')}
                                    >
                                        <i className="fas fa-plus"></i>
                                        <span>Tạo sự kiện đầu tiên</span>
                                    </Button>
                                </div>
                            )}

                            {events.length > 0 && (
                                <div className="my-events-page-pagination-wrapper">
                                    <div className="my-events-page-page-size-control">
                                        <span>Hiển thị</span>
                                        <Form.Select
                                            size="sm"
                                            value={pageSize}
                                            onChange={(e) => {
                                                setPageSize(Number(e.target.value));
                                                setCurrentPage(0);
                                            }}
                                            className="my-events-page-page-size-select"
                                        >
                                            {PAGE_SIZE_OPTIONS.map(size => (
                                                <option key={size} value={size}>
                                                    {size}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <span>dòng</span>
                                    </div>

                                    <Pagination className="my-events-page-pagination">
                                        <Pagination.First
                                            onClick={() => setCurrentPage(0)}
                                            disabled={currentPage === 0}
                                        />
                                        <Pagination.Prev
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={currentPage === 0}
                                        />

                                        {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                                            let pageIndex = index;
                                            if (totalPages > 5) {
                                                if (currentPage < 3) {
                                                    pageIndex = index;
                                                } else if (currentPage >= totalPages - 3) {
                                                    pageIndex = totalPages - 5 + index;
                                                } else {
                                                    pageIndex = currentPage - 2 + index;
                                                }
                                            }
                                            
                                            return (
                                                <Pagination.Item
                                                    key={pageIndex}
                                                    active={pageIndex === currentPage}
                                                    onClick={() => setCurrentPage(pageIndex)}
                                                >
                                                    {pageIndex + 1}
                                                </Pagination.Item>
                                            );
                                        })}

                                        <Pagination.Next
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={currentPage === (totalPages - 1)}
                                        />
                                        <Pagination.Last
                                            onClick={() => setCurrentPage(totalPages - 1)}
                                            disabled={currentPage === (totalPages - 1)}
                                        />
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {selectedEvent && (
                    <MyEventDetailModal
                        show={showModal}
                        onHide={() => {
                            setShowModal(false);
                            setSelectedEvent(null);
                        }}
                        event={selectedEvent}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
            </Container>
        </div>
    );
};

export default MyEvents;