import { useState, useEffect } from "react";
import { 
  Container, 
  Card, 
  Table, 
  Form, 
  Button, 
  Row, 
  Col, 
  Badge, 
  Modal, 
  Alert,
  InputGroup
} from "react-bootstrap";
import { formatCurrency, getImageUrl, formatDate, formatFullAddress } from "../../../utils/helper";
import UniversePagination from "../../common/pagination/UniversePagination";
import { bookTicketService } from "../../../api/bookTicketService";
import { BookingTicket, BookingTicketSearchParams } from "../../../types/BookingTypes";
import "./AdminBookingTickets.css";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const ITEMS_PER_PAGE = 10;

interface GroupedTicket {
  maLoaiVe: string;
  tenLoaiVe: string;
  giaTien: number;
  soLuong: number;
}

const AdminBookingTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<BookingTicket[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string>('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<BookingTicket | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<BookingTicketSearchParams>({});
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  useEffect(() => {
    loadTickets(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (success || error) {
        timeoutId = setTimeout(() => {
            setSuccess('');
            setError('');
        }, 3000);
    }
    return () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    };
  }, [success, error]);

  const loadTickets = async (page: number) => {
    try {
      setLoading(true);
      const response = await bookTicketService.getBookManage(page, pageSize, searchParams);
      setTickets(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setError("Không thể tải danh sách vé");
      console.error("Error loading tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadTickets(0);
  };

  const handleResetSearch = () => {
    setSearchParams({});
    setCurrentPage(0);
    loadTickets(0);
  };

  const openDetailModal = (ticket: BookingTicket) => {
    setSelectedTicket(ticket);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTicket(null);
  };

  const openDeleteModal = (ticket: BookingTicket, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedTicket(ticket);
    setShowDeleteModal(true);
    setShowDetailModal(false);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedTicket(null);
  };

  const handleDeleteTicket = async () => {
    if (!selectedTicket) return;
    
    try {
      setDeleteLoading(true);
      await bookTicketService.deleteById(selectedTicket.maDatVe);
      
      loadTickets(currentPage);
      setSuccess("Xóa thành công")
      closeDeleteModal();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setError(error.message);
      console.error("Error deleting ticket:", error);
    } finally {
      setDeleteLoading(false);
    }
  };
  const getStatusBadge = (thoiGianHetHan: Date, hoatDong: boolean) => {
    if (hoatDong) {
      return <Badge bg="success">Đã thanh toán</Badge>;
    } else if (new Date(thoiGianHetHan) > new Date()) {
      return <Badge bg="warning" text="dark">Chờ thanh toán</Badge>;
    } else {
      return <Badge bg="danger">Hết hạn</Badge>
    }
  };

  const groupTickets = (chiTietVes: BookingTicket["chiTietVes"]): GroupedTicket[] => {
    const groupedMap = new Map<string, GroupedTicket>();

    chiTietVes.forEach((ve) => {
      const key = ve.loaiVe.maLoaiVe ?? "";
      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          maLoaiVe: key,
          tenLoaiVe: ve.loaiVe.tenLoaiVe,
          giaTien: ve.loaiVe.giaTien,
          soLuong: 1,
        });
      } else {
        const current = groupedMap.get(key)!;
        current.soLuong += 1;
      }
    });

    return Array.from(groupedMap.values());
  };

  return (
    <Container className="admin-booking-container">
      <div className="admin-booking-wrapper">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="page-title">Quản lý đặt vé</h2>
          <Button 
            variant="outline-primary" 
            className="admin-filter-btn"
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
          >
            <i className="fas fa-filter me-2"></i>
            {showAdvancedSearch ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
          </Button>
        </div>

        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

        {showAdvancedSearch && (
          <Card className="admin-search-card mb-4">
            <Card.Body>
              <Form>
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Mã đặt vé</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={searchParams.maDatVe || ''}
                        onChange={(e) => setSearchParams({...searchParams, maDatVe: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Mã khách hàng</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={searchParams.maKhachHang || ''}
                        onChange={(e) => setSearchParams({...searchParams, maKhachHang: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Trạng thái</Form.Label>
                      <Form.Select 
                        value={searchParams.trangThai || ''}
                        onChange={(e) => setSearchParams({...searchParams, trangThai: e.target.value || undefined})}
                      >
                        <option value="">Tất cả</option>
                        <option value="CHO_THANH_TOAN">Chờ thanh toán</option>
                        <option value="DA_THANH_TOAN">Đã thanh toán</option>
                        <option value="HET_HAN">Hết hạn</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Khoảng tiền</Form.Label>
                      <InputGroup>
                        <Form.Control 
                          type="number" 
                          placeholder="Từ"
                          value={searchParams.fromMoney || ''}
                          onChange={(e) => setSearchParams({...searchParams, fromMoney: e.target.value ? Number(e.target.value) : undefined})}
                        />
                        <InputGroup.Text>đến</InputGroup.Text>
                        <Form.Control 
                          type="number" 
                          placeholder="Đến"
                          value={searchParams.toMoney || ''}
                          onChange={(e) => setSearchParams({...searchParams, toMoney: e.target.value ? Number(e.target.value) : undefined})}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Khoảng thời gian</Form.Label>
                      <InputGroup>
                        <Form.Control 
                          type="datetime-local" 
                          value={searchParams.fromDate || ''}
                          onChange={(e) => setSearchParams({...searchParams, fromDate: e.target.value || undefined})}
                        />
                        <InputGroup.Text>đến</InputGroup.Text>
                        <Form.Control 
                          type="datetime-local" 
                          value={searchParams.toDate || ''}
                          onChange={(e) => setSearchParams({...searchParams, toDate: e.target.value || undefined})}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end gap-2">
                  <Button 
                    variant="secondary" 
                    onClick={handleResetSearch}
                  >
                    <i className="fas fa-undo me-2"></i>
                    Đặt lại
                  </Button>
                  <Button 
                    variant="primary" 
                    className="universe-btn"
                    onClick={handleSearch}
                  >
                    <i className="fas fa-search me-2"></i>
                    Tìm kiếm
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        )}

        <div className="table-dark">
          <>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <Table hover className="universe-table ">
                    <thead>
                      <tr>
                        <th>Mã đặt vé</th>
                        <th>Sự kiện</th>
                        <th>Khách hàng</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th>Thời gian hết hạn</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.length > 0 ? (
                        tickets.map((ticket) => (
                          <tr 
                            key={ticket.maDatVe} 
                            className="admin-booking-row" 
                            onClick={() => openDetailModal(ticket)}
                          >
                            <td>{ticket.maDatVe}</td>
                            <td className="event-cell">
                              <div className="event-info">
                                <img 
                                  src={getImageUrl(ticket.suKien?.anhBia)} 
                                  alt={ticket.suKien?.tieuDe} 
                                  className="event-thumbnail"
                                />
                                <span className="event-title">{ticket.suKien?.tieuDe}</span>
                              </div>
                            </td>
                            <td>{ticket.khachHang?.tenHienThi || ticket.khachHang?.email || "Không có thông tin"}</td>
                            <td>{formatCurrency(ticket.tongTien)}</td>
                            <td>
                              {getStatusBadge(
                                ticket.thoiGianHetHan,
                                ticket.hoatDong
                              )}
                            </td>
                            <td>{formatDate(ticket.thoiGianHetHan)}</td>
                            <td className="admin-action-cell">
                              <div className="admin-action-buttons">
                                <Button 
                                  size="sm" 
                                  variant="danger"
                                  onClick={(e) => openDeleteModal(ticket, e)}
                                  className="admin-action-btn"
                                  title="Xóa"
                                >
                                  <i className="fas fa-trash"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center py-4">
                            <div className="no-data-message">
                              <i className="fas fa-ticket-alt"></i>
                              <p>Không có dữ liệu</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </>
            )}
          </>
        </div>
      </div>

      {tickets.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="d-flex align-items-center gap-2">
            <span>Hiển thị</span>
            <Form.Select
              size="sm"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="page-size-select"
              style={{ width: "auto" }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Form.Select>
            <span>dòng</span>
          </div>

          <UniversePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <Modal
        show={showDetailModal}
        onHide={closeDetailModal}
        size="xl"
        centered
        className="universe-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết đặt vé</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket && (
            <div className="booking-detail">
              <Row>
                <Col md={6}>
                  <div className="detail-section">
                    <h4 className="detail-section-title">Thông tin đặt vé</h4>
                    <div className="detail-item">
                      <span className="detail-label">Mã đặt vé:</span>
                      <span className="detail-value">{selectedTicket.maDatVe}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Trạng thái:</span>
                      <span className="detail-value">
                        {getStatusBadge(
                          selectedTicket.thoiGianHetHan,
                          selectedTicket.hoatDong
                        )}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Tổng tiền:</span>
                      <span className="detail-value">{formatCurrency(selectedTicket.tongTien)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Hết hạn:</span>
                      <span className="detail-value">{formatDate(selectedTicket.thoiGianHetHan)}</span>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-section">
                    <h4 className="detail-section-title">Thông tin khách hàng</h4>
                    <div className="detail-item">
                      <span className="detail-label">Mã:</span>
                      <span className="detail-value">{selectedTicket.khachHang?.maNguoiDung || "Không có thông tin"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Tên:</span>
                      <span className="detail-value">{selectedTicket.khachHang?.tenHienThi || "Không có thông tin"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{selectedTicket.khachHang?.email || "Không có thông tin"}</span>
                    </div>
                  </div>
                </Col>
              </Row>

              <div className="detail-section mt-4">
                <h4 className="detail-section-title">Thông tin sự kiện</h4>
                <div className="event-detail">
                  <div className="admin-event-image">
                    <img 
                      src={getImageUrl(selectedTicket.suKien?.anhBia)} 
                      alt={selectedTicket.suKien?.tieuDe} 
                    />
                  </div>
                  <div className="event-info">
                    <h5>{selectedTicket.suKien?.tieuDe}</h5>
                    <div className="detail-item">
                      <span className="detail-label">Mã sự kiện:</span>
                      <span className="detail-value">{selectedTicket.suKien?.maSuKien}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Thời gian:</span>
                      <span className="detail-value">
                        {formatDate(selectedTicket.suKien?.thoiGianBatDau)} - {formatDate(selectedTicket.suKien?.thoiGianKetThuc)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Địa điểm:</span>
                      <span className="detail-value">
                        {formatFullAddress(selectedTicket?.suKien?.diaDiem)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-section mt-4">
                <h4 className="detail-section-title">Chi tiết vé</h4>
                <Table className="universe-table table-dark">
                  <thead>
                    <tr>
                      <th>Loại vé</th>
                      <th>Đơn giá</th>
                      <th>Số lượng</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupTickets(selectedTicket.chiTietVes).map((group) => (
                      <tr key={group.maLoaiVe}>
                        <td>{group.tenLoaiVe}</td>
                        <td>{formatCurrency(group.giaTien)}</td>
                        <td>{group.soLuong}</td>
                        <td>{formatCurrency(group.giaTien * group.soLuong)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="text-end fw-bold">Tổng cộng:</td>
                      <td className="fw-bold">{formatCurrency(selectedTicket.tongTien)}</td>
                    </tr>
                  </tfoot>
                </Table>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button 
                  variant="secondary"
                  onClick={() => {
                    navigate(`/bookings/${selectedTicket.maDatVe}`)
                  }}
                >
                  <i className="fas fa-info me-2"></i>
                  Chi tiết
                </Button>
                <Button 
                  variant="danger"
                  onClick={(e) => {
                    openDeleteModal(selectedTicket, e)
                  }}
                >
                  <i className="fas fa-trash me-2"></i>
                  Xóa
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={showDeleteModal}
        onHide={closeDeleteModal}
        centered
        className="universe-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa vé này không? Hành động này không thể hoàn tác.</p>
          {selectedTicket && (
            <div className="confirm-delete-info">
              <div className="detail-item">
                <span className="detail-label">Mã đặt vé:</span>
                <span className="detail-value">{selectedTicket.maDatVe}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Sự kiện:</span>
                <span className="detail-value">{selectedTicket.suKien?.tieuDe}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Khách hàng:</span>
                <span className="detail-value">{selectedTicket.khachHang?.tenHienThi || selectedTicket.khachHang?.email || "Không có thông tin"}</span>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteTicket}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang xóa...
              </>
            ) : (
              <>Xóa</>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminBookingTickets;