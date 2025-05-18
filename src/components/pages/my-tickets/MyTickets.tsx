import { useState, useEffect } from "react";
import { Container, Nav, Card, Alert, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { formatCurrency, getImageUrl } from "../../../utils/helper";
import "./MyTickets.css";
import { bookTicketService } from "../../../api/bookTicketService";
import UniversePagination from "../../common/pagination/UniversePagination";
import { BookingTicket } from "../../../types/BookingTypes";

const PAGE_SIZE_OPTIONS = [4, 8, 12, 16];
const ITEMS_PER_PAGE = 4;

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
    window.location.href = paymentUrl;
  };

  const handleTicketClick = (ticketId: string) => {
    navigate(`/bookings/${ticketId}`);
  };

  const getStatusLabel = (ticket: BookingTicket) => {
    if (ticket.hoatDong) {
      return <span className="my-tickets-status paid">Đã thanh toán</span>;
    } else if (new Date(ticket.thoiGianHetHan) > new Date()) {
      return (
        <div className="my-tickets-status-group">
          <span className="my-tickets-status pending">Chờ thanh toán</span>
          {ticket.url && (
            <Button
              variant="primary"
              className="my-tickets-pay-button universe-btn"
              onClick={(e) => {
                e.stopPropagation();
                handlePayment(ticket.url!);
              }}
            >
              <i className="fas fa-credit-card me-2"></i>
              Thanh toán ngay
            </Button>
          )}
        </div>
      );
    } else {
      return (
        <span className="my-tickets-status expired">
          Hết hạn (Đã hủy tự động)
        </span>
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

  return (
    <Container className="my-tickets-container">
      <div className="my-tickets-wrapper">
        <h2 className="page-title mb-4">Vé của tôi</h2>

        <Nav variant="tabs" className="universe-tabs mb-4">
          <Nav.Item>
            <Nav.Link
              active={activeTab === "all"}
              onClick={() => setActiveTab("all")}
            >
              Tất cả
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={activeTab === "pending"}
              onClick={() => setActiveTab("pending")}
            >
              Chờ thanh toán
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={activeTab === "paid"}
              onClick={() => setActiveTab("paid")}
            >
              Đã thanh toán
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={activeTab === "expired"}
              onClick={() => setActiveTab("expired")}
            >
              Hết hạn
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
            <div className="my-tickets-list">
              {tickets.map((ticket) => (
                <Card
                  key={ticket.maDatVe}
                  className="my-tickets-card"
                  onClick={() => handleTicketClick(ticket.maDatVe)}
                >
                  <div className="my-tickets-content">
                    <div className="my-tickets-header">
                      <div className="my-tickets-img-container">
                            <img
                            src={getImageUrl(ticket?.suKien?.anhBia)}
                            alt={ticket?.suKien?.tieuDe}
                            />
                            <h3>{ticket?.suKien?.tieuDe}</h3>
                      </div>
                      {getStatusLabel(ticket)}
                    </div>
                    <div className="my-tickets-details">
                      <div className="my-tickets-info">
                        <span>
                          <i className="fas fa-money-bill"></i>
                          Tổng tiền: {formatCurrency(ticket.tongTien)}
                        </span>
                      </div>
                      <div className="my-tickets-items">
                        <h4>Chi tiết vé:</h4>
                        <div className="my-tickets-summary">
                          {groupTickets(ticket.chiTietVes).map(
                            (groupedTicket) => (
                              <div
                                key={groupedTicket.maLoaiVe}
                                className="my-tickets-item"
                              >
                                <div className="my-tickets-info-group">
                                  <span className="my-tickets-type">
                                    {groupedTicket.tenLoaiVe}
                                  </span>
                                  <span className="my-tickets-quantity">
                                    x{groupedTicket.soLuong}
                                  </span>
                                </div>
                                <div className="my-tickets-price-group">
                                  <span className="my-tickets-unit-price">
                                    {formatCurrency(groupedTicket.giaTien)} / vé
                                  </span>
                                  <span className="my-tickets-total-price">
                                    Tổng:{" "}
                                    {formatCurrency(
                                      groupedTicket.giaTien *
                                        groupedTicket.soLuong
                                    )}
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {tickets.length === 0 && (
                <div className="no-tickets-message">
                  <i className="fas fa-ticket-alt"></i>
                  <p>Không có vé nào</p>
                </div>
              )}
            </div>

            {tickets.length > 0 && (
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
                    style={{ width: "auto" }}
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </Form.Select>
                  <span className="text-light">dòng</span>
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
  );
};

export default MyTickets;
