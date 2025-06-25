import { useState, useEffect } from "react";
import { Container, Nav, Card, Alert, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { formatCurrency, formatFullAddress, getImageUrl } from "../../../utils/helper";
import "./MyTickets.css";
import { bookTicketService } from "../../../api/bookTicketService";
import UniversePagination from "../../common/pagination/UniversePagination";
import { BookingTicket } from "../../../types/BookingTypes";

const PAGE_SIZE_OPTIONS = [3, 6, 12, 18];
const ITEMS_PER_PAGE = 3;

interface GroupedTicket {
  maLoaiVe: string;
  tenLoaiVe: string;
  giaTien: number;
  soLuong: number;
}

const MyTickets = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "paid" | "expired"
  >("all");
  const [tickets, setTickets] = useState<BookingTicket[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
  const [error, setError] = useState<string | null>(null);

  const getStatusParam = (tab: string) => {
    switch (tab) {
      case "pending":
        return "CHO_THANH_TOAN";
      case "paid":
        return "DA_THANH_TOAN";
      case "expired":
        return "HET_HAN";
      default:
        return undefined;
    }
  };

  const loadTickets = async (page: number, size: number = pageSize) => {
    try {
      setLoading(true);
      const status = getStatusParam(activeTab);
      const response = await bookTicketService.getMyTickets(page, size, status);
      setTickets(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setError("Không thể tải danh sách vé");
      console.error("Error loading tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(0);
    loadTickets(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    loadTickets(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  const handlePayment = (paymentUrl: string) => {
    navigate(paymentUrl);
  };

  const handleTicketClick = (ticketId: string) => {
    navigate(`/bookings/${ticketId}`);
  };

  const getStatusLabel = (ticket: BookingTicket) => {
    if (ticket.hoatDong) {
      return (
        <div className="my-tickets-page-status-badge my-tickets-page-status-confirmed">
          <i className="fas fa-check-circle"></i>
          <span>Đã xác nhận</span>
        </div>
      );
    } else if (new Date(ticket.thoiGianHetHan) > new Date()) {
      return (
        <div className="my-tickets-page-status-wrapper">
          <div className="my-tickets-page-status-badge my-tickets-page-status-pending">
            <i className="fas fa-clock"></i>
            <span>Chờ thanh toán</span>
          </div>
          {ticket.url && (
            <Button
              variant="primary"
              size="sm"
              className="my-tickets-page-pay-button"
              onClick={(e) => {
                e.stopPropagation();
                handlePayment(ticket.url!);
              }}
            >
              <i className="fas fa-credit-card"></i>
              <span>Thanh toán ngay</span>
            </Button>
          )}
        </div>
      );
    } else {
      return (
        <div className="my-tickets-page-status-badge my-tickets-page-status-expired">
          <i className="fas fa-times-circle"></i>
          <span>Đã hủy</span>
        </div>
      );
    }
  };

  const groupTickets = (
    chiTietVes: BookingTicket["chiTietVes"]
  ): GroupedTicket[] => {
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

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "all":
        return "fas fa-list";
      case "pending":
        return "fas fa-clock";
      case "paid":
        return "fas fa-check-circle";
      case "expired":
        return "fas fa-times-circle";
      default:
        return "fas fa-ticket-alt";
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

  return (
    <div className="my-tickets-page-container">
      <Container fluid className="my-tickets-page-wrapper">
        {/* Page Header */}
        <div className="my-tickets-page-header">
          <div className="my-tickets-page-title-section">
            <h1 className="my-tickets-page-title">
              <i className="fas fa-ticket-alt"></i>
              <span>Vé của tôi</span>
            </h1>
            <p className="my-tickets-page-subtitle">
              Quản lý và theo dõi tất cả các vé sự kiện của bạn
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="my-tickets-page-nav-wrapper">
          <Nav className="my-tickets-page-tabs">
            {[
              { key: "all", label: "Tất cả", count: tickets.length },
              { key: "pending", label: "Chờ thanh toán" },
              { key: "paid", label: "Đã thanh toán" },
              { key: "expired", label: "Đã hủy" }
            ].map((tab) => (
              <Nav.Item key={tab.key}>
                <Nav.Link
                  className={`my-tickets-page-tab ${activeTab === tab.key ? 'my-tickets-page-tab-active' : ''}`}
                  onClick={() => setActiveTab(tab.key as "all" | "pending" | "paid" | "expired")}
                >
                  <div className="my-tickets-page-tab-content">
                    <i className={getTabIcon(tab.key)}></i>
                    <span>{tab.label}</span>
                  </div>
                  <div className="my-tickets-page-tab-indicator"></div>
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </div>

        {/* Alert Messages */}
        {error && (
          <Alert variant="danger" className="my-tickets-page-alert">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{error}</span>
          </Alert>
        )}

        {/* Content Section */}
        <div className="my-tickets-page-content">
          {loading ? (
            <div className="my-tickets-page-loading">
              <div className="my-tickets-page-spinner">
                <div className="spinner-border" role="status"></div>
              </div>
              <p>Đang tải danh sách vé...</p>
            </div>
          ) : (
            <>
              {/* Tickets Grid */}
              <div className="my-tickets-page-grid">
                {tickets.map((ticket) => {
                  const eventDate = formatEventDate(ticket.suKien?.thoiGianBatDau || '');
                  return (
                    <Card
                      key={ticket.maDatVe}
                      className="my-tickets-page-ticket-card"
                      onClick={() => handleTicketClick(ticket.maDatVe)}
                    >
                      <div className="my-tickets-page-card-header">
                        <div className="my-tickets-page-event-image">
                          <img
                            src={getImageUrl(ticket?.suKien?.anhBia)}
                            alt={ticket?.suKien?.tieuDe}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/default-event-image.jpg';
                            }}
                          />
                          <div className="my-tickets-page-image-overlay">
                            <i className="fas fa-eye"></i>
                          </div>
                        </div>
                        <div className="my-tickets-page-event-date">
                          <div className="my-tickets-page-date-day">{eventDate.day}</div>
                          <div className="my-tickets-page-date-month">{eventDate.month}</div>
                          <div className="my-tickets-page-date-year">{eventDate.year}</div>
                        </div>
                      </div>

                      <div className="my-tickets-page-card-body">
                        <div className="my-tickets-page-event-info">
                          <h3 className="my-tickets-page-event-title">
                            {ticket?.suKien?.tieuDe}
                          </h3>
                          <div className="my-tickets-page-event-details">
                            <div className="my-tickets-page-detail-item">
                              <i className="fas fa-clock"></i>
                              <span>{eventDate.time}</span>
                            </div>
                            <div className="my-tickets-page-detail-item">
                              <i className="fas fa-map-marker-alt"></i>
                              <span>{formatFullAddress(ticket?.suKien?.diaDiem)}</span>
                            </div>
                            <div className="my-tickets-page-detail-item">
                              <i className="fas fa-money-bill-wave"></i>
                              <span className="my-tickets-page-total-price">
                                {formatCurrency(ticket.tongTien)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="my-tickets-page-ticket-info">
                          <div className="my-tickets-page-ticket-header">
                            <h4>Chi tiết vé</h4>
                            <div className="my-tickets-page-ticket-id">
                              <i className="fas fa-hashtag"></i>
                              <span>{ticket.maDatVe}</span>
                            </div>
                          </div>
                          
                          <div className="my-tickets-page-ticket-types">
                            {groupTickets(ticket.chiTietVes).map((groupedTicket) => (
                              <div
                                key={groupedTicket.maLoaiVe}
                                className="my-tickets-page-ticket-type"
                              >
                                <div className="my-tickets-page-type-info">
                                  <span className="my-tickets-page-type-name">
                                    {groupedTicket.tenLoaiVe}
                                  </span>
                                  <span className="my-tickets-page-type-quantity">
                                    x{groupedTicket.soLuong}
                                  </span>
                                </div>
                                <div className="my-tickets-page-type-price">
                                  {formatCurrency(groupedTicket.giaTien * groupedTicket.soLuong)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="my-tickets-page-card-footer">
                        {getStatusLabel(ticket)}
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="my-tickets-page-view-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTicketClick(ticket.maDatVe);
                          }}
                        >
                          <i className="fas fa-eye"></i>
                          <span>Xem chi tiết</span>
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Empty State */}
              {tickets.length === 0 && (
                <div className="my-tickets-page-empty-state">
                  <div className="my-tickets-page-empty-icon">
                    <i className="fas fa-ticket-alt"></i>
                  </div>
                  <h3>Không có vé nào</h3>
                  <p>
                    {activeTab === "all" 
                      ? "Bạn chưa có vé nào. Hãy đặt vé cho sự kiện yêu thích!"
                      : `Không có vé nào trong trạng thái "${
                          activeTab === "pending" ? "Chờ thanh toán" :
                          activeTab === "paid" ? "Đã thanh toán" : "Đã hủy"
                        }"`
                    }
                  </p>
                  <Button
                    variant="primary"
                    className="my-tickets-page-browse-button"
                    onClick={() => navigate('/events')}
                  >
                    <i className="fas fa-search"></i>
                    <span>Khám phá sự kiện</span>
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {tickets.length > 0 && (
                <div className="my-tickets-page-pagination-wrapper">
                  <div className="my-tickets-page-page-size-control">
                    <span>Hiển thị</span>
                    <Form.Select
                      size="sm"
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(0);
                      }}
                      className="my-tickets-page-page-size-select"
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
            </>
          )}
        </div>
      </Container>
    </div>
  );
};

export default MyTickets;
