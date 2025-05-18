import { useState, useEffect } from 'react';
import { Container, Card, Alert, Pagination } from 'react-bootstrap';
import { SuKien } from '../../../types/EventTypes';
import ApproveEventModal from './ApproveEventModal';
import './ApproveEvent.css';
import eventService from '../../../api/eventService';
import { formatDate, getImageUrl } from '../../../utils/helper';
import Form from 'react-bootstrap/Form';

const ITEMS_PER_PAGE = 8;
const PAGE_SIZE_OPTIONS = [8, 12, 16, 24,50,100];

const ApproveEvent = () => {
    const [events, setEvents] = useState<SuKien[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<SuKien | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: string } | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);

    const loadEvents = async (page: number, size: number = pageSize) => {
        try {
            const response = await eventService.getPaginatedFiler(page, size, undefined, false);
            setEvents(response.data.content);
            setTotalPages(response.data.totalPages);
            setLoading(false);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setNotification({
                message: 'Không thể tải danh sách sự kiện',
                type: 'danger'
            });
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEvents(currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize]);

    const handleApprove = async (eventId: string) => {
        try {
            await eventService.approveEvent(eventId);
            await loadEvents(currentPage);
            setNotification({
                message: 'Sự kiện được phê duyệt thành công',
                type: 'success'
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setNotification({
                message: 'Không thể phê duyệt sự kiện',
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
        <Container className="approve-event-container">
            {notification && (
                <div className="notification-container">
                    <Alert variant={notification.type} className="notification-alert">
                        {notification.message}
                    </Alert>
                </div>
            )}

            <div className="approve-event-wrapper">
                <h2 className="page-title mb-4">Phê duyệt sự kiện</h2>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="approve-events-grid">
                            {events.map(event => (
                                <Card
                                    key={event.maSuKien}
                                    className="approve-event-card"
                                    onClick={() => {
                                        setSelectedEvent(event);
                                        setShowModal(true);
                                    }}
                                >
                                    <div className="approve-event-card-image">
                                        <img
                                            src={getImageUrl(event.anhBia)}
                                            alt={event.tieuDe}
                                        />
                                    </div>
                                    <Card.Body className='approve-card-body'>
                                        <Card.Title className='approve-card-title'>{event.tieuDe}</Card.Title>
                                        <div className="approve-event-card-info">
                                            <span className="approve-event-date">
                                                <i className="fas fa-calendar-alt"></i>
                                                {formatDate(new Date(event.thoiGianBatDau))}
                                            </span>
                                            <span className="approve-event-status">Chờ duyệt</span>
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))}

                            {events.length === 0 && (
                                <div className="no-events-message">
                                    <i className="fas fa-check-circle"></i>
                                    <p>Không có sự kiện nào cần phê duyệt</p>
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
                    <ApproveEventModal
                        show={showModal}
                        onHide={() => {
                            setShowModal(false);
                            setSelectedEvent(null);
                        }}
                        event={selectedEvent}
                        onApprove={handleApprove}
                    />
                )}
            </div>
        </Container>
    );
};

export default ApproveEvent;