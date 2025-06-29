/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Badge,
  Spinner,
  Alert,
  Modal,
} from "react-bootstrap";
import { QrReader } from "react-qr-reader";
import { bookTicketService } from "../../../api/bookTicketService";
import {
  formatCurrency,
  getImageUrl,
  formatDate,
  formatFullAddress,
} from "../../../utils/helper";
import { TicketResponse } from "../../../types/BookingTypes";
import "./TicketScanner.css";
import 'webrtc-adapter';

const EventTicketScanner = () => {
  const [ticketCode, setTicketCode] = useState<string>("");
  const [ticketData, setTicketData] = useState<TicketResponse | null>(null);
  const [processingTicket, setProcessingTicket] = useState<TicketResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"scan" | "manual" | "result">("manual"); // Default to manual to avoid permission prompt immediately
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [verifyLoading, setVerifyLoading] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error("Camera permission error:", err);
      setHasCameraPermission(false);
      setError("Không thể truy cập camera. Vui lòng cấp quyền camera cho trình duyệt hoặc sử dụng chế độ nhập mã thủ công.");
    }
  };

  const handleTabChange = (tab: "scan" | "manual" | "result") => {
    if (tab === "scan" && hasCameraPermission === null) {
      setActiveTab(tab);
      requestCameraPermission();
    } else {
      setActiveTab(tab);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTicketCode(e.target.value);
  };

  const handleScan = async (result: any | null) => {
    if (result?.text && !loading) {
      const scannedText = result.text;
      setTicketCode(scannedText);

      try {
        setLoading(true);
        setError(null);

        const checkInResponse = await bookTicketService.checkInTicket(
          scannedText
        );

        if (checkInResponse.success && checkInResponse.data) {
          setTicketData(checkInResponse.data);
          setActiveTab("result");
        } else {
          setError(checkInResponse?.message);
        }
      } catch (err: any) {
        console.error("Error checking in ticket:", err);
        setError(
          err.response?.data?.message ||
            "Không thể kiểm tra vé. Vui lòng thử lại."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    if (success || error) {
      timeoutId = setTimeout(() => {
        setSuccess("");
        setError(null);
      }, 3000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [success, error]);

  // Toggle camera facing mode
  const toggleCamera = () => {
    setFacingMode(facingMode === "environment" ? "user" : "environment");
  };

  const handleSearch = async (overrideCode?: string) => {
    const code = overrideCode ?? ticketCode;
    if (!code.trim()) {
      setError("Vui lòng nhập mã vé");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await bookTicketService.checkInTicket(code.trim());

      if (response.success && response.data) {
        setTicketData(response.data);
        setActiveTab("result");
      } else {
        setError("Không tìm thấy thông tin vé");
      }
    } catch (err) {
      console.error("Error fetching ticket:", err);
      setError("Không thể tìm thấy thông tin vé. Vui lòng kiểm tra lại mã.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTicket = async () => {
    if (!processingTicket) return;

    try {
      setVerifyLoading(true);

      const response = await bookTicketService.verifyTicket(
        processingTicket.maVe
      );

      if (response.success && response.data) {
        setTicketData(response.data);
        setSuccess(`Vé ${processingTicket.maVe} đã được sử dụng thành công`);
        setShowVerifyModal(false);

        setSuccess(`Vé ${processingTicket.maVe} đã được sử dụng thành công`);
        setShowVerifyModal(false);
      } else {
        throw new Error("Không thể xác thực vé");
      }
    } catch (err: any) {
      console.error("Error verifying ticket:", err);
      setError(
        err.response?.data?.message ||
          "Không thể xác thực vé. Vui lòng thử lại."
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  // Reset scanner and search
  const handleReset = () => {
    setTicketData(null);
    setTicketCode("");
    setActiveTab("scan");
    setError(null);
    setSuccess("");
  };

  const isTicketUsed = (ticket: TicketResponse) => {
    return ticket.trangThai === "DA_SU_DUNG";
  };

  const getTicketStatusBadge = (ticket: TicketResponse) => {
    switch (ticket.trangThai) {
      case "DA_SU_DUNG":
        return <Badge bg="danger">Đã sử dụng</Badge>;
      case "DA_THANH_TOAN":
        return <Badge bg="success">Chưa sử dụng</Badge>;
      default:
        return (
          <Badge bg="warning" text="dark">
            Chưa xác định
          </Badge>
        );
    }
  };

  const getBookingStatusBadge = (ticket: TicketResponse) => {
    if (ticket?.datVe?.hoatDong) {
      return <Badge bg="success">Đã thanh toán</Badge>;
    } else if (new Date(ticket?.datVe?.thoiGianHetHan) > new Date()) {
      return (
        <Badge bg="warning" text="dark">
          Chờ thanh toán
        </Badge>
      );
    } else {
      return <Badge bg="danger">Hết hạn</Badge>;
    }
  };

  // Open verify modal for a specific ticket
  const openVerifyModal = (ticket: TicketResponse) => {
    setProcessingTicket(ticket);
    setShowVerifyModal(true);
  };

  return (
    <Container className="scanner-container">
      <div className="scanner-wrapper">
        <div className="scanner-header">
          <h2 className="page-title">Quét Vé Sự Kiện</h2>
        </div>

        {/* Notification area */}
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" onClose={() => setSuccess("")} dismissible>
            {success}
          </Alert>
        )}

        {/* Tab navigation - modified to use handleTabChange */}
        <div className="scanner-tabs">
          <Button
            variant={activeTab === "scan" ? "primary" : "outline-primary"}
            className="tab-btn"
            onClick={() => handleTabChange("scan")}
          >
            <i className="fas fa-qrcode me-2"></i>
            Quét mã QR
          </Button>
          <Button
            variant={activeTab === "manual" ? "primary" : "outline-primary"}
            className="tab-btn"
            onClick={() => handleTabChange("manual")}
          >
            <i className="fas fa-keyboard me-2"></i>
            Nhập mã thủ công
          </Button>
          {ticketData && (
            <Button
              variant={activeTab === "result" ? "primary" : "outline-primary"}
              className="tab-btn"
              onClick={() => handleTabChange("result")}
            >
              <i className="fas fa-ticket-alt me-2"></i>
              Kết quả
            </Button>
          )}
        </div>

        {/* Scanner view with error handling */}
        {activeTab === "scan" && (
          <div className="scanner-view">
            <div className="scanner-card">
              <div className="scanner-video-container">
                {hasCameraPermission === null ? (
                  <div className="camera-permission-request">
                    <i className="fas fa-camera fa-3x mb-3"></i>
                    <h5>Cho phép truy cập camera</h5>
                    <p>Ứng dụng cần quyền truy cập camera để quét mã QR. Vui lòng chấp nhận yêu cầu truy cập camera khi trình duyệt hiển thị.</p>
                    <Button 
                      variant="primary" 
                      onClick={requestCameraPermission}
                      className="permission-request-btn"
                    >
                      <i className="fas fa-video me-2"></i>
                      Cho phép truy cập camera
                    </Button>
                  </div>
                ) : hasCameraPermission === false ? (
                  <div className="camera-permission-error">
                    <i className="fas fa-camera-slash fa-3x mb-3"></i>
                    <h5>Không có quyền truy cập camera</h5>
                    <p>Vui lòng cấp quyền camera trong cài đặt trình duyệt hoặc sử dụng chế độ nhập mã thủ công.</p>
                    <Button 
                      variant="primary" 
                      onClick={() => {
                        setHasCameraPermission(null); // Reset permission state
                        requestCameraPermission();
                      }}
                    >
                      <i className="fas fa-redo me-2"></i>
                      Thử lại
                    </Button>
                  </div>
                ) : (
                  <>
                    <QrReader
                      constraints={{
                        facingMode,
                        aspectRatio: 1,
                        width: { min: 640, ideal: 1280, max: 1920 },
                        height: { min: 480, ideal: 720, max: 1080 },
                      }}
                      onResult={handleScan}
                      className="scanner-video"
                      videoStyle={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                      videoId="qr-video-element"
                      scanDelay={500}
                    />
                    <div className="scanner-overlay">
                      <div className="scanner-target">
                        <div className="scanner-corner top-left"></div>
                        <div className="scanner-corner top-right"></div>
                        <div className="scanner-corner bottom-left"></div>
                        <div className="scanner-corner bottom-right"></div>
                        <div className="scanner-line"></div>
                      </div>
                      <div className="scanner-instructions">
                        <p>Đặt mã QR vào trong khung</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="scanner-actions">
                {hasCameraPermission && (
                  <Button
                    variant="primary"
                    className="universe-btn"
                    onClick={toggleCamera}
                  >
                    <i className="fas fa-sync-alt me-2"></i>
                    Đổi camera
                  </Button>
                )}
                {hasCameraPermission === false && (
                  <Button
                    variant="outline-primary"
                    onClick={() => setActiveTab("manual")}
                  >
                    <i className="fas fa-keyboard me-2"></i>
                    Chuyển sang nhập mã thủ công
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Manual input */}
        {activeTab === "manual" && (
          <div className="manual-input">
            <div className="input-card">
              <div className="input-content">
                <h4>Nhập mã vé</h4>
                <div className="input-field">
                  <input
                    type="text"
                    placeholder="Nhập mã vé (VD: 1234-12345-123443)"
                    value={ticketCode}
                    onChange={handleInputChange}
                    className="ticket-input"
                  />
                </div>
                <div className="input-actions">
                  <Button
                    variant="primary"
                    className="universe-btn"
                    onClick={() => handleSearch()}
                    disabled={loading || !ticketCode.trim()}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Đang tìm kiếm...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-search me-2"></i>
                        Tìm kiếm
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "result" && ticketData && (
          <div className="result-view">
            <Card className="result-card">
              <Card.Body>
                <div className="ticket-result">
                  <div className="result-header">
                    <div className="result-status">
                      {getBookingStatusBadge(ticketData)}
                    </div>
                    <div className="result-code">
                      <h3>Mã đặt vé: {ticketData.datVe.maDatVe}</h3>
                    </div>
                  </div>

                  <Row>
                    <Col md={6}>
                      <div className="detail-section">
                        <h4 className="detail-section-title">
                          Thông tin đặt vé
                        </h4>
                        <div className="detail-item">
                          <span className="detail-label">Tổng tiền:</span>
                          <span className="detail-value">
                            {formatCurrency(ticketData.datVe.tongTien)}
                          </span>
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="detail-section">
                        <h4 className="detail-section-title">
                          Thông tin khách hàng
                        </h4>
                        <div className="detail-item">
                          <span className="detail-label">Mã:</span>
                          <span className="detail-value">
                            {ticketData?.khachHang?.maNguoiDung ||
                              "Không có thông tin"}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Tên:</span>
                          <span className="detail-value">
                            {ticketData?.khachHang?.tenHienThi ||
                              "Không có thông tin"}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Email:</span>
                          <span className="detail-value">
                            {ticketData?.khachHang?.email ||
                              "Không có thông tin"}
                          </span>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <div className="detail-section mt-4">
                    <h4 className="detail-section-title">Thông tin sự kiện</h4>
                    <div className="event-detail">
                      <div className="event-image">
                        <img
                          src={getImageUrl(ticketData?.suKien?.anhBia)}
                          alt={ticketData?.suKien?.tieuDe}
                        />
                      </div>
                      <div className="event-info">
                        <h5>{ticketData?.suKien?.tieuDe}</h5>
                        <div className="detail-item">
                          <span className="detail-label">Thời gian:</span>
                          <span className="detail-value">
                            {formatDate(
                              ticketData?.suKien?.thoiGianBatDau
                            )}{" "}
                            -{" "}
                            {formatDate(
                              ticketData?.suKien?.thoiGianKetThuc
                            )}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Địa điểm:</span>
                          <span className="detail-value">
                            {formatFullAddress(
                              ticketData?.suKien?.diaDiem
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section mt-4">
                    <h4 className="detail-section-title">Chi tiết vé</h4>
                    <div className="tickets-list">
                      <Card
                        className={`ticket-item ${
                          isTicketUsed(ticketData) ? "used" : ""
                        }`}
                      >
                        <Card.Body>
                          <div className="ticket-item-content">
                            <div className="ticket-item-info">
                              <div className="ticket-item-header">
                                <h5>Thông tin vé</h5>
                                <div className="ticket-item-status">
                                  {getTicketStatusBadge(ticketData)}
                                </div>
                              </div>
                              <div className="ticket-item-details">
                                <div className="detail-item">
                                  <span className="detail-label">Mã vé:</span>
                                  <span className="detail-value">
                                    {ticketData.maVe}
                                  </span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Loại vé:</span>
                                  <span className="detail-value">
                                    {ticketData.loaiVe.tenLoaiVe}
                                  </span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Giá:</span>
                                  <span className="detail-value">
                                    {formatCurrency(ticketData.loaiVe.giaTien)}
                                  </span>
                                </div>
                                {isTicketUsed(ticketData) && (
                                  <div className="detail-item">
                                    <span className="detail-label">
                                      Thời gian kiểm vé:
                                    </span>
                                    <span className="detail-value">
                                      {formatDate(ticketData?.thoiGianKiemVe ?? '')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="ticket-item-actions">
                              {!isTicketUsed(ticketData) ? (
                                <Button
                                  variant="success"
                                  className="verify-btn"
                                  onClick={() => openVerifyModal(ticketData)}
                                >
                                  <i className="fas fa-check-circle me-2"></i>
                                  Xác nhận sử dụng
                                </Button>
                              ) : (
                                <div className="used-ticket-marker">
                                  <i className="fas fa-check-circle"></i>
                                  <span>Đã sử dụng</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  </div>

                  <div className="result-actions mt-4">
                    <Button variant="secondary" onClick={handleReset}>
                      <i className="fas fa-redo me-2"></i>
                      Quét vé khác
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        )}
      </div>

      <Modal
        show={showVerifyModal}
        onHide={() => setShowVerifyModal(false)}
        centered
        className="universe-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận sử dụng vé</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {processingTicket && (
            <div className="verify-ticket-info">
              <p>
                Bạn có chắc chắn muốn xác nhận sử dụng vé này không? Hành động
                này không thể hoàn tác.
              </p>
              <div className="ticket-details">
                <div className="detail-item">
                  <span className="detail-label">Mã vé:</span>
                  <span className="detail-value">{processingTicket.maVe}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Loại vé:</span>
                  <span className="detail-value">
                    {processingTicket.loaiVe.tenLoaiVe}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tên khách hàng:</span>
                  <span className="detail-value">
                    {ticketData?.khachHang?.tenHienThi || "Không có thông tin"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVerifyModal(false)}>
            <i className="fas fa-times me-2"></i>
            Hủy
          </Button>
          <Button
            variant="success"
            onClick={handleVerifyTicket}
            disabled={verifyLoading}
          >
            {verifyLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang xử lý...
              </>
            ) : (
              <>
                <i className="fas fa-check me-2"></i>
                Xác nhận
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EventTicketScanner;
