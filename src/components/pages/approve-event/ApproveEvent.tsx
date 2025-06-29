import { useState, useEffect } from 'react';
import { Container, Alert, Pagination, Table, Button, Form, Row, Col, Card } from 'react-bootstrap';
import { SuKien } from '../../../types/EventTypes';
import ApproveEventModal from './ApproveEventModal';
import './ApproveEvent.css';
import eventService from '../../../api/eventService';
import { formatDate, getImageUrl, getDefaulImagetUrl } from '../../../utils/helper';

const ITEMS_PER_PAGE = 8;
const PAGE_SIZE_OPTIONS = [8, 12, 16, 24, 50, 100];

const ApproveEvent = () => {
    const [events, setEvents] = useState<SuKien[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<SuKien | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: string } | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

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
        <Container fluid className="approve-event-container py-4">
            {notification && (
                <div className="approve-event-notification">
                    <Alert variant={notification.type} className="mb-4 shadow-sm">
                        <div className="d-flex align-items-center">
                            <i className={`fas fa-${notification.type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2`}></i>
                            <span>{notification.message}</span>
                        </div>
                    </Alert>
                </div>
            )}

            <div className="approve-event-wrapper">
                <div className="approve-event-header mb-4">
                    <Row className="align-items-center">
                        <Col>
                            <h2 className="approve-event-title">
                                <i className="fas fa-clipboard-check me-2"></i>
                                Phê duyệt sự kiện
                            </h2>
                            <p className="approve-event-subtitle text-muted mb-0">
                                Quản lý và phê duyệt các sự kiện đang chờ xử lý
                            </p>
                        </Col>
                        <Col xs="auto">
                            <div className="approve-event-view-toggle">
                                <Button 
                                    variant={viewMode === 'table' ? 'primary' : 'outline-primary'} 
                                    className="me-2"
                                    onClick={() => setViewMode('table')}
                                >
                                    <i className="fas fa-table me-1"></i> Bảng
                                </Button>
                                <Button 
                                    variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <i className="fas fa-th-large me-1"></i> Lưới
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </div>

                {loading ? (
                    <div className="approve-event-loading">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                        <p className="mt-2 text-muted">Đang tải danh sách sự kiện...</p>
                    </div>
                ) : (
                    <>
                        {viewMode === 'table' ? (
                            <div className="approve-event-table-container">
                                <Table hover responsive className="approve-event-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '40%' }}>Tên sự kiện</th>
                                            <th style={{ width: '25%' }}>Người tổ chức</th>
                                            <th style={{ width: '15%' }}>Thời gian</th>
                                            <th style={{ width: '10%' }}>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {events.length > 0 ? (
                                            events.map(event => (
                                                <tr key={event.maSuKien} className="approve-event-table-row">
                                                    <td className="approve-event-table-title">
                                                        <div className="d-flex align-items-center">
                                                            <div className="approve-event-table-title-text">
                                                                <span className="fw-bold">{event.tieuDe}</span>
                                                                <small className="text-muted d-block">
                                                                    <i className="fas fa-map-marker-alt me-1"></i>
                                                                    {event.diaDiem.tenTinhThanh}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="approve-event-organizer">
                                                            <span>{event.nguoiToChuc?.tenHienThi || "Không xác định"}</span>
                                                            <small className="text-muted d-block">
                                                                <i className="fas fa-envelope me-1"></i>
                                                                {event.nguoiToChuc?.email || "N/A"}
                                                            </small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="approve-event-dates">
                                                            <div className="approve-event-date">
                                                                <i className="fas fa-calendar me-1"></i>
                                                                {formatDate(new Date(event.thoiGianBatDau))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="approve-event-buttons">
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline-primary"
                                                                className="approve-event-button-view me-1"
                                                                onClick={() => {
                                                                    setSelectedEvent(event);
                                                                    setShowModal(true);
                                                                }}
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline-success"
                                                                className="approve-event-button-approve"
                                                                onClick={() => handleApprove(event.maSuKien)}
                                                            >
                                                                <i className="fas fa-check"></i>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="text-center py-4">
                                                    <div className="approve-event-empty-state">
                                                        <i className="fas fa-check-circle mb-2"></i>
                                                        <p>Không có sự kiện nào cần phê duyệt</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        ) : (
                            <div className="approve-event-grid">
                                {events.length > 0 ? (
                                    <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                                        {events.map(event => (
                                            <Col key={event.maSuKien}>
                                                <Card className="approve-event-card h-100">
                                                    <div className="approve-event-card-image">
                                                        <img
                                                            src={getImageUrl(event.anhBia)}
                                                            alt={event.tieuDe}
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.src = getDefaulImagetUrl();
                                                            }}
                                                        />
                                                    </div>
                                                    <Card.Body className="approve-event-card-body">
                                                        <Card.Title className="approve-event-card-title">{event.tieuDe}</Card.Title>
                                                        <div className="approve-event-card-info mb-3">
                                                            <div className="approve-event-card-organizer mb-2">
                                                                <i className="fas fa-user me-2"></i>
                                                                {event.nguoiToChuc?.tenHienThi || "Không xác định"}
                                                            </div>
                                                            <div className="approve-event-card-date mb-2">
                                                                <i className="fas fa-calendar-alt me-2"></i>
                                                                {formatDate(new Date(event.thoiGianBatDau))}
                                                            </div>
                                                            <div className="approve-event-card-location">
                                                                <i className="fas fa-map-marker-alt me-2"></i>
                                                                {event.diaDiem.tenTinhThanh}
                                                            </div>
                                                        </div>
                                                        <div className="d-flex justify-content-between align-items-center">      
                                                            <div className="approve-event-card-buttons">
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    className="me-1 approve-event-button-view"
                                                                    onClick={() => {
                                                                        setSelectedEvent(event);
                                                                        setShowModal(true);
                                                                    }}
                                                                >
                                                                    <i className="fas fa-eye me-1"></i> Xem
                                                                </Button>
                                                                <Button
                                                                    variant="outline-success"
                                                                    size="sm"
                                                                    className="approve-event-button-approve"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleApprove(event.maSuKien);
                                                                    }}
                                                                >
                                                                    <i className="fas fa-check me-1"></i> Duyệt
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                ) : (
                                    <div className="approve-event-empty-state">
                                        <i className="fas fa-check-circle mb-3"></i>
                                        <h4>Không có sự kiện nào cần phê duyệt</h4>
                                        <p className="text-muted">Tất cả các sự kiện đã được xử lý</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {events.length > 0 && (
                            <div className="approve-event-pagination">
                                <Row className="align-items-center mt-4">
                                    <Col xs={12} md="auto" className="mb-3 mb-md-0">
                                        <div className="d-flex align-items-center">
                                            <span className="me-2">Hiển thị</span>
                                            <Form.Select
                                                size="sm"
                                                value={pageSize}
                                                onChange={(e) => {
                                                    setPageSize(Number(e.target.value));
                                                    setCurrentPage(0);
                                                }}
                                                className="approve-event-page-size-select me-2"
                                                style={{ width: "80px" }}
                                            >
                                                {PAGE_SIZE_OPTIONS.map(size => (
                                                    <option key={size} value={size}>
                                                        {size}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            <span>sự kiện mỗi trang</span>
                                        </div>
                                    </Col>
                                    <Col xs={12} md className="d-flex justify-content-md-end">
                                        <Pagination className="mb-0 approve-event-pagination-controls">
                                            <Pagination.First
                                                onClick={() => setCurrentPage(0)}
                                                disabled={currentPage === 0}
                                            />
                                            <Pagination.Prev
                                                onClick={() => setCurrentPage(currentPage - 1)}
                                                disabled={currentPage === 0}
                                            />

                                            {[...Array(totalPages)].map((_, index) => {
                                                // Show limited pagination items to avoid overflow
                                                if (
                                                    index === 0 || 
                                                    index === totalPages - 1 || 
                                                    (index >= currentPage - 1 && index <= currentPage + 1)
                                                ) {
                                                    return (
                                                        <Pagination.Item
                                                            key={index}
                                                            active={index === currentPage}
                                                            onClick={() => setCurrentPage(index)}
                                                        >
                                                            {index + 1}
                                                        </Pagination.Item>
                                                    );
                                                } else if (
                                                    index === currentPage - 2 || 
                                                    index === currentPage + 2
                                                ) {
                                                    return <Pagination.Ellipsis key={index} />;
                                                }
                                                return null;
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
                                    </Col>
                                </Row>
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