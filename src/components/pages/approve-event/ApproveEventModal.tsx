import { Modal, Button, Table } from 'react-bootstrap';
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
        <Modal show={show} onHide={onHide} centered className="universe-modal" size="lg">
            <Modal.Header>
                <Modal.Title>Chi tiết sự kiện</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="event-detail-content">
                    <div className="event-image-container">
                        <img
                            src={getImageUrl(event.anhBia)}
                            alt={event.tieuDe}
                            className="event-cover-image"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = getDefaulImagetUrl()
                            }}
                        />
                    </div>

                    <h3 className="event-title mt-4">{event.tieuDe}</h3>

                    <div className="event-info-grid">
                        <div className="info-item">
                            <label>Thời gian bắt đầu:</label>
                            <span>{formatDate(event.thoiGianBatDau)}</span>
                        </div>

                        <div className="info-item">
                            <label>Thời gian kết thúc:</label>
                            <span>{formatDate(event.thoiGianKetThuc)}</span>
                        </div>

                        <div className="info-item">
                            <label>Ngày mở bán vé:</label>
                            <span>{formatDate(event.ngayMoBanVe)}</span>
                        </div>

                        <div className="info-item">
                            <label>Ngày đóng bán vé:</label>
                            <span>{formatDate(event.ngayDongBanVe)}</span>
                        </div>

                        <div className="info-item">
                            <label>Ngày tạo:</label>
                            <span>{formatDate(event.ngayTao)}</span>
                        </div>

                        <div className="info-item">
                            <label>Địa điểm:</label>
                            <span>
                                {event.diaDiem.tenDiaDiem}, {event.diaDiem.tenPhuongXa}, {event.diaDiem.tenQuanHuyen}, {event.diaDiem.tenTinhThanh}
                            </span>
                        </div>

                        <div className="info-item">
                            <label>Danh mục:</label>
                            <div className="categories-list">
                                {event.danhMucs.map((category) => (
                                    <span key={category.maDanhMuc} className="category-badge">
                                        {category.tenDanhMuc}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="event-description">
                        <h4>Mô tả sự kiện</h4>
                        <div className="description-content" dangerouslySetInnerHTML={{ __html: event.moTa }} />
                    </div>

                    <div className="event-tickets mt-4">
                        <h4>Danh sách vé</h4>
                        <Table responsive className="universe-table">
                            <thead>
                                <tr>
                                    <th>Loại vé</th>
                                    <th>Mô tả</th>
                                    <th>Số lượng</th>
                                    <th>Giá tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {event.loaiVes.map((ticket) => (
                                    <tr key={ticket.maLoaiVe}>
                                        <td>{ticket.tenLoaiVe}</td>
                                        <td>{ticket.moTa}</td>
                                        <td>{ticket.soLuong}</td>
                                        <td>{formatCurrency(ticket.giaTien)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="d-flex justify-content-end gap-2">
                    <Button variant="secondary" onClick={onHide} className="approve-universe-btn">
                        Đóng
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            onApprove(event.maSuKien);
                            onHide();
                        }}
                        className="approve-universe-btn"
                    >
                        Phê duyệt
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default ApproveEventModal;