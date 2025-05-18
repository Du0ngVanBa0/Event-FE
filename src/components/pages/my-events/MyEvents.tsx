import { useState, useEffect } from 'react';
import { Container, Nav, Card, Alert, Pagination, Form } from 'react-bootstrap';
import { SuKien } from '../../../types/EventTypes';
import eventService from '../../../api/eventService';
import { formatDate, getImageUrl } from '../../../utils/helper';
import MyEventDetailModal from './MyEventDetailModal';
import './MyEvents.css';

const PAGE_SIZE_OPTIONS = [8, 12, 16, 24];
const ITEMS_PER_PAGE = 8;

const MyEvents = () => {
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
        window.location.href = `/organizer/edit-event/${eventId}`;
    };

    const handleDelete = async (eventId: string) => {
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
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    return (
        <Container className="my-events-container">
            {notification && (
                <div className="notification-container">
                    <Alert variant={notification.type} className="notification-alert">
                        {notification.message}
                    </Alert>
                </div>
            )}

            <div className="my-events-wrapper">
                <h2 className="page-title mb-4">Sự kiện của tôi</h2>

                <Nav variant="tabs" className="universe-tabs mb-4">
                    <Nav.Item>
                        <Nav.Link
                            active={activeTab === 'all'}
                            onClick={() => handleTabChange('all')}
                        >
                            Tất cả
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            active={activeTab === 'approved'}
                            onClick={() => handleTabChange('approved')}
                        >
                            Đã duyệt
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            active={activeTab === 'pending'}
                            onClick={() => handleTabChange('pending')}
                        >
                            Chờ duyệt
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                {error && <Alert variant="danger">{error}</Alert>}

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="events-list">
                            {events.map(event => (
                                <Card 
                                    key={event.maSuKien} 
                                    className="event-list-item"
                                    onClick={() => {
                                        setSelectedEvent(event);
                                        setShowModal(true);
                                    }}
                                >
                                    <div className="event-content">
                                        <div className="event-image">
                                            <img
                                                src={getImageUrl(event.anhBia)}
                                                alt={event.tieuDe}
                                            />
                                        </div>
                                        <div className="event-details">
                                            <h3>{event.tieuDe}</h3>
                                            <div className="event-meta">
                                                <span>
                                                    <i className="fas fa-calendar-alt"></i>
                                                    {formatDate(event.thoiGianBatDau)}
                                                </span>
                                                <span>
                                                    <i className="fas fa-map-marker-alt"></i>
                                                    {event.diaDiem.tenDiaDiem}
                                                </span>
                                                <span className={`event-status ${event.hoatDong ? 'approved' : 'pending'}`}>
                                                    {event.hoatDong ? 'Đã duyệt' : 'Chờ duyệt'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
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

                                <Pagination className="mb-0">
                                    <Pagination.First
                                        onClick={() => setCurrentPage(0)}
                                        disabled={currentPage === 0}
                                    />
                                    <Pagination.Prev
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 0}
                                    />

                                    {[...Array(totalPages)].map((_, index) => (
                                        <Pagination.Item
                                            key={index}
                                            active={index === currentPage}
                                            onClick={() => setCurrentPage(index)}
                                        >
                                            {index + 1}
                                        </Pagination.Item>
                                    ))}

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
            </div>
        </Container>
    );
};

export default MyEvents;