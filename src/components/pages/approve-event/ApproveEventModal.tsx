import { Modal, Button, Table, Row, Col } from 'react-bootstrap';
import { SuKien } from '../../../types/EventTypes';
import { formatDate, getImageUrl, formatCurrency, getDefaulImagetUrl } from '../../../utils/helper';
import './ApproveEvent.css';

interface ApproveEventModalProps {
    show: boolean;
    onHide: () => void;
    event: SuKien;
    onApprove: (eventId: string) => void;
}

const ApproveEventModal = ({ show, onHide, event, onApprove }: ApproveEventModalProps) => {

    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            centered 
            className="approve-event-modal-container" 
            size="xl"
            backdrop="static"
            keyboard={true}
        >
            <Modal.Header closeButton className="approve-event-modal-header">
                <div className="d-flex align-items-center">
                    <Modal.Title className="approve-event-modal-title">
                        <i className="fas fa-clipboard-check me-2"></i>
                        Chi tiết sự kiện
                    </Modal.Title>
                </div>
            </Modal.Header>
            
            <Modal.Body className="approve-event-modal-body">
                <Row>
                    <Col lg={5} className="mb-4 mb-lg-0">
                        <div className="approve-event-modal-image-wrapper">
                            <img
                                src={getImageUrl(event.anhBia)}
                                alt={event.tieuDe}
                                className="approve-event-modal-image"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = getDefaulImagetUrl()
                                }}
                            />
                        </div>
                        
                        <div className="approve-event-modal-organizer mt-4">
                            <h5 className="approve-event-modal-section-title">
                                <i className="fas fa-user me-2"></i>
                                Thông tin người tổ chức
                            </h5>
                            <div className="approve-event-modal-info-row">
                                <span className="approve-event-modal-label">Người tổ chức:</span>
                                <span className="approve-event-modal-value">{event.nguoiToChuc?.tenHienThi || "Không xác định"}</span>
                            </div>
                            <div className="approve-event-modal-info-row">
                                <span className="approve-event-modal-label">Email:</span>
                                <span className="approve-event-modal-value">{event.nguoiToChuc?.email || "N/A"}</span>
                            </div>
                            <div className="approve-event-modal-info-row">
                                <span className="approve-event-modal-label">Ngày tạo:</span>
                                <span className="approve-event-modal-value">{formatDate(event.ngayTao)}</span>
                            </div>
                        </div>
                        
                        <div className="approve-event-modal-categories mt-4">
                            <h5 className="approve-event-modal-section-title">
                                <i className="fas fa-tags me-2"></i>
                                Danh mục
                            </h5>
                            <div className="approve-event-modal-categories-list">
                                {event.danhMucs.length > 0 ? (
                                    event.danhMucs.map((category) => (
                                        <span key={category.maDanhMuc} className="approve-event-modal-category-badge">
                                            {category.tenDanhMuc}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-muted">Không có danh mục</span>
                                )}
                            </div>
                        </div>
                    </Col>
                    
                    <Col lg={7}>
                        <h3 className="approve-event-modal-event-title mb-3">{event.tieuDe}</h3>
                        
                        <div className="approve-event-modal-times mb-4">
                            <h5 className="approve-event-modal-section-title">
                                <i className="fas fa-clock me-2"></i>
                                Thời gian sự kiện
                            </h5>
                            <Row className="g-3">
                                <Col sm={6} className="approve-event-modal-info-row">
                                    <span className="approve-event-modal-label">Thời gian bắt đầu:</span>
                                    <span className="approve-event-modal-value">{formatDate(event.thoiGianBatDau)}</span>
                                </Col>
                                <Col sm={6} className="approve-event-modal-info-row">
                                    <span className="approve-event-modal-label">Thời gian kết thúc:</span>
                                    <span className="approve-event-modal-value">{formatDate(event.thoiGianKetThuc)}</span>
                                </Col>
                                <Col sm={6} className="approve-event-modal-info-row">
                                    <span className="approve-event-modal-label">Ngày mở bán vé:</span>
                                    <span className="approve-event-modal-value">{formatDate(event.ngayMoBanVe)}</span>
                                </Col>
                                <Col sm={6} className="approve-event-modal-info-row">
                                    <span className="approve-event-modal-label">Ngày đóng bán vé:</span>
                                    <span className="approve-event-modal-value">{formatDate(event.ngayDongBanVe)}</span>
                                </Col>
                            </Row>
                        </div>
                        
                        <div className="approve-event-modal-location mb-4">
                            <h5 className="approve-event-modal-section-title">
                                <i className="fas fa-map-marker-alt me-2"></i>
                                Địa điểm
                            </h5>
                            <div className="approve-event-modal-info-row">
                                <div className="approve-event-modal-location-details">
                                    {event.diaDiem.tenDiaDiem}, {event.diaDiem.tenPhuongXa}, {event.diaDiem.tenQuanHuyen}, {event.diaDiem.tenTinhThanh}
                                </div>
                            </div>
                        </div>
                        
                        <div className="approve-event-modal-description mb-4">
                            <h5 className="approve-event-modal-section-title">
                                <i className="fas fa-align-left me-2"></i>
                                Mô tả sự kiện
                            </h5>
                            <div className="approve-event-modal-description-content" dangerouslySetInnerHTML={{ __html: event.moTa }} />
                        </div>

                        <div className="approve-event-modal-tickets">
                            <h5 className="approve-event-modal-section-title">
                                <i className="fas fa-ticket-alt me-2"></i>
                                Thông tin vé
                            </h5>
                            {event.loaiVes.length > 0 ? (
                                <div className="table-responsive">
                                    <Table className="approve-event-modal-ticket-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '30%' }}>Loại vé</th>
                                                <th style={{ width: '35%' }}>Mô tả</th>
                                                <th style={{ width: '15%' }} className="text-center">Số lượng</th>
                                                <th style={{ width: '20%' }} className="text-end">Giá tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {event.loaiVes.map((ticket) => (
                                                <tr key={ticket.maLoaiVe} className="approve-event-modal-ticket-row">
                                                    <td className="fw-bold">{ticket.tenLoaiVe}</td>
                                                    <td>{ticket.moTa || "Không có mô tả"}</td>
                                                    <td className="text-center">{ticket.soLuong}</td>
                                                    <td className="text-end fw-bold">{formatCurrency(ticket.giaTien)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="approve-event-modal-no-tickets">
                                    <p className="text-muted mb-0">Không có thông tin vé</p>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Modal.Body>
            
            <Modal.Footer className="approve-event-modal-footer">
                <div className="approve-event-modal-buttons">
                    <Button
                        variant="outline-secondary"
                        onClick={onHide}
                        className="me-2 approve-event-modal-button-close"
                    >
                        <i className="fas fa-times me-1"></i>
                        Đóng
                    </Button>
                    <Button
                        variant="success"
                        onClick={() => {
                            onApprove(event.maSuKien);
                            onHide();
                        }}
                        className="approve-event-modal-button-approve"
                    >
                        <i className="fas fa-check-circle me-1"></i>
                        Phê duyệt
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default ApproveEventModal;