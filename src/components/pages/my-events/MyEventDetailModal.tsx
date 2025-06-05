import { Modal, Button, Row, Col } from 'react-bootstrap';
import { SuKien } from '../../../types/EventTypes';
import { getImageUrl, formatCurrency, getDefaulImagetUrl } from '../../../utils/helper';
import './MyEvents.css';

interface MyEventDetailModalProps {
    show: boolean;
    onHide: () => void;
    event: SuKien;
    onEdit: (eventId: string) => void;
    onDelete: (eventId: string) => void;
}

const MyEventDetailModal = ({ show, onHide, event, onEdit, onDelete }: MyEventDetailModalProps) => {
    const formatEventDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            full: date.toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const startDate = formatEventDate(event.thoiGianBatDau);
    const endDate = formatEventDate(event.thoiGianKetThuc);
    const openDate = formatEventDate(event.ngayMoBanVe);
    const closeDate = formatEventDate(event.ngayDongBanVe);

    const isEventEditable = !event.hoatDong;

    const handleEditClick = () => {
        if (!isEventEditable) {
            alert('Không thể chỉnh sửa sự kiện đã được phê duyệt');
            return;
        }
        onEdit(event.maSuKien);
        onHide();
    };

    const handleDeleteClick = () => {
        if (!isEventEditable) {
            alert('Không thể xóa sự kiện đã được phê duyệt');
            return;
        }
        if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác.')) {
            onDelete(event.maSuKien);
            onHide();
        }
    };

    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            centered 
            className="my-event-detail-modal-container" 
            size="xl"
        >
            <Modal.Header className="my-event-detail-modal-header" closeButton>
                <Modal.Title className="my-event-detail-modal-title">
                    <i className="fas fa-calendar-alt"></i>
                    <span>Chi tiết sự kiện</span>
                </Modal.Title>
            </Modal.Header>
            
            <Modal.Body className="my-event-detail-modal-body">
                <div className="my-event-detail-modal-content">
                    <div className="my-event-detail-modal-image-section">
                        <div className="my-event-detail-modal-image-container">
                            <img
                                src={getImageUrl(event.anhBia)}
                                alt={event.tieuDe}
                                className="my-event-detail-modal-cover-image"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = getDefaulImagetUrl();
                                }}
                            />
                            <div className="my-event-detail-modal-image-overlay">
                                <div className={`my-event-detail-modal-status-badge ${event.hoatDong ? 'my-event-detail-modal-status-approved' : 'my-event-detail-modal-status-pending'}`}>
                                    <i className={`fas fa-${event.hoatDong ? 'check-circle' : 'clock'}`}></i>
                                    <span>{event.hoatDong ? 'Đã duyệt' : 'Chờ duyệt'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="my-event-detail-modal-title-section">
                            <h2 className="my-event-detail-modal-event-title">{event.tieuDe}</h2>
                            <div className="my-event-detail-modal-categories">
                                {event.danhMucs?.map((category) => (
                                    <span key={category.maDanhMuc} className="my-event-detail-modal-category-badge">
                                        {category.tenDanhMuc}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="my-event-detail-modal-info-section">
                        <h3 className="my-event-detail-modal-section-title">
                            <i className="fas fa-info-circle"></i>
                            <span>Thông tin sự kiện</span>
                        </h3>
                        
                        <Row className="my-event-detail-modal-info-grid">
                            <Col md={5}>
                                <div className="my-event-detail-modal-info-item">
                                    <div className="my-event-detail-modal-info-label">
                                        <i className="fas fa-play-circle"></i>
                                        <span>Thời gian bắt đầu</span>
                                    </div>
                                    <div className="my-event-detail-modal-info-value">
                                        <div className="my-event-detail-modal-date">{startDate.full}</div>
                                        <div className="my-event-detail-modal-time">{startDate.time}</div>
                                    </div>
                                </div>
                            </Col>
                            
                            <Col md={5}>
                                <div className="my-event-detail-modal-info-item">
                                    <div className="my-event-detail-modal-info-label">
                                        <i className="fas fa-stop-circle"></i>
                                        <span>Thời gian kết thúc</span>
                                    </div>
                                    <div className="my-event-detail-modal-info-value">
                                        <div className="my-event-detail-modal-date">{endDate.full}</div>
                                        <div className="my-event-detail-modal-time">{endDate.time}</div>
                                    </div>
                                </div>
                            </Col>
                            
                            <Col md={5}>
                                <div className="my-event-detail-modal-info-item">
                                    <div className="my-event-detail-modal-info-label">
                                        <i className="fas fa-ticket-alt"></i>
                                        <span>Mở bán vé</span>
                                    </div>
                                    <div className="my-event-detail-modal-info-value">
                                        <div className="my-event-detail-modal-date">{openDate.full}</div>
                                        <div className="my-event-detail-modal-time">{openDate.time}</div>
                                    </div>
                                </div>
                            </Col>
                            
                            <Col md={5}>
                                <div className="my-event-detail-modal-info-item">
                                    <div className="my-event-detail-modal-info-label">
                                        <i className="fas fa-ban"></i>
                                        <span>Đóng bán vé</span>
                                    </div>
                                    <div className="my-event-detail-modal-info-value">
                                        <div className="my-event-detail-modal-date">{closeDate.full}</div>
                                        <div className="my-event-detail-modal-time">{closeDate.time}</div>
                                    </div>
                                </div>
                            </Col>
                            
                            <Col md={12}>
                                <div className="my-event-detail-modal-info-item">
                                    <div className="my-event-detail-modal-info-label">
                                        <i className="fas fa-map-marker-alt"></i>
                                        <span>Địa điểm</span>
                                    </div>
                                    <div className="my-event-detail-modal-info-value">
                                        <div className="my-event-detail-modal-location">
                                            <strong>{event.diaDiem?.tenDiaDiem}</strong>
                                            <div className="my-event-detail-modal-address">
                                                {event.diaDiem?.tenPhuongXa}, {event.diaDiem?.tenQuanHuyen}, {event.diaDiem?.tenTinhThanh}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    <div className="my-event-detail-modal-description-section">
                        <h3 className="my-event-detail-modal-section-title">
                            <i className="fas fa-align-left"></i>
                            <span>Mô tả sự kiện</span>
                        </h3>
                        <div className="my-event-detail-modal-description-content">
                            <div 
                                className="my-event-detail-modal-description-text" 
                                dangerouslySetInnerHTML={{ __html: event.moTa }} 
                            />
                        </div>
                    </div>

                    <div className="my-event-detail-modal-tickets-section">
                        <h3 className="my-event-detail-modal-section-title">
                            <i className="fas fa-ticket-alt"></i>
                            <span>Danh sách vé ({event.loaiVes?.length || 0} loại)</span>
                        </h3>
                        
                        <div className="my-event-detail-modal-tickets-container">
                            {event.loaiVes?.map((ticket) => (
                                <div key={ticket.maLoaiVe} className="my-event-detail-modal-ticket-card">
                                    <div className="my-event-detail-modal-ticket-header">
                                        <h4 className="my-event-detail-modal-ticket-name">{ticket.tenLoaiVe}</h4>
                                        <div className="my-event-detail-modal-ticket-price">
                                            {formatCurrency(ticket.giaTien)}
                                        </div>
                                    </div>
                                    <div className="my-event-detail-modal-ticket-body">
                                        <div className="my-event-detail-modal-ticket-description">
                                            {ticket.moTa}
                                        </div>
                                        <div className="my-event-detail-modal-ticket-info">
                                            <div className="my-event-detail-modal-ticket">
                                                <i className="fas fa-users"></i>
                                                <span>Số lượng: {ticket.soLuong}</span>
                                            </div>
                                            <div className="my-event-detail-modal-ticket">
                                                <i className="fas fa-layer-group"></i>
                                                <span>Tối thiểu: {ticket.soLuongToiThieu} - Tối đa: {ticket.soLuongToiDa}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal.Body>
            
            <Modal.Footer className="my-event-detail-modal-footer">
                <div className="my-event-detail-modal-actions">
                    <Button 
                        variant="secondary" 
                        onClick={onHide} 
                        className="my-event-detail-modal-close-button"
                    >
                        <span>Đóng</span>
                    </Button>
                    <Button
                        variant="warning"
                        onClick={handleEditClick}
                        className={`my-event-detail-modal-edit-button`}
                        disabled={!isEventEditable}
                    >
                        <i className="fas fa-edit"></i>
                        <span>Chỉnh sửa</span>
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDeleteClick}
                        className={`my-event-detail-modal-delete-button ${!isEventEditable ? 'my-event-detail-modal-button-disabled' : ''}`}
                        disabled={!isEventEditable}
                    >
                        <i className="fas fa-trash"></i>
                        <span>Xóa sự kiện</span>
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default MyEventDetailModal;