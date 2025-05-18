import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Stage, Layer, Rect, Text } from "react-konva";
import "./EventZoneViewer.css";
import axios from "axios";

// Định nghĩa kiểu dữ liệu
interface ZoneLayout {
  id: string;
  attrs: {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
  };
}

interface KhuVuc {
  maKhuVuc: string;
  tenKhuVuc: string;
  moTa: string;
  viTri: string;
  layoutData: string;
  loaiVes: LoaiVe[];
}

interface LoaiVe {
  maLoaiVe: string;
  tenLoaiVe: string;
  moTa: string;
  soLuong: number;
  giaTien: number;
  khuVuc: KhuVuc;
}

interface SuKien {
  maSuKien: string;
  tieuDe: string;
  moTa: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  anhBia: string;
  hoatDong: boolean;
  khuVucs: KhuVuc[];
}

interface EventZoneViewerProps {
  maSuKien?: string; // Optional, có thể truyền từ component cha hoặc lấy từ URL
}

const EventZoneViewer: React.FC<EventZoneViewerProps> = ({ maSuKien }) => {
  const [event, setEvent] = useState<SuKien | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stageScale, setStageScale] = useState({ x: 1, y: 1 });
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });

  // Lấy dữ liệu sự kiện và khu vực
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        // Thay đổi URL API theo endpoint thực tế của bạn
        const response = await axios.get(`/api/sukien/${maSuKien}`);
        setEvent(response.data);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu sự kiện:", err);
        setError("Không thể tải dữ liệu sự kiện. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (maSuKien) {
      fetchEventData();
    }
  }, [maSuKien]);

  // Xử lý zoom stage
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    
    if (stage) {
      const oldScale = stage.scaleX();
      const pointerPosition = stage.getPointerPosition();
      
      if (pointerPosition) {
        const mousePointTo = {
          x: (pointerPosition.x - stage.x()) / oldScale,
          y: (pointerPosition.y - stage.y()) / oldScale,
        };

        const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

        setStageScale({ x: newScale, y: newScale });
        setStagePosition({
          x: pointerPosition.x - mousePointTo.x * newScale,
          y: pointerPosition.y - mousePointTo.y * newScale,
        });
      }
    }
  };

  // Hàm parse JSON layout data từ string
  const parseLayoutData = (layoutDataStr: string): ZoneLayout => {
    try {
      return JSON.parse(layoutDataStr);
    } catch (err) {
      console.error("Lỗi khi parse layout data:", err);
      // Default layout nếu parse lỗi
      return {
        id: "default",
        attrs: {
          x: 50,
          y: 50,
          width: 100,
          height: 50,
          fill: "rgba(167, 135, 255, 0.2)",
          stroke: "#a787ff",
          strokeWidth: 2
        }
      };
    }
  };

  // Tìm loại vé theo mã khu vực
  const getTicketsByZoneId = (maKhuVuc: string): LoaiVe[] => {
    if (!event) return [];
    const zone = event.khuVucs.find(z => z.maKhuVuc === maKhuVuc);
    return zone ? zone.loaiVes : [];
  };

  // Format giá tiền
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Format ngày giờ
  const formatDateTime = (dateTimeStr: string): string => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Hiển thị loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <Container className="event-zone-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
        </div>
      </Container>
    );
  }

  // Hiển thị khi không có sự kiện
  if (!event) {
    return (
      <Container className="event-zone-container">
        <div className="no-event-message">
          <i className="fas fa-calendar-times"></i>
          <p>Không tìm thấy thông tin sự kiện</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="event-zone-container">
      <div className="event-zone-wrapper">
        {/* Event Header */}
        <div className="event-header">
          <div className="event-cover">
            {event.anhBia && (
              <img 
                src={event.anhBia} 
                alt={event.tieuDe} 
                className="event-cover-img"
              />
            )}
          </div>
          <div className="event-info">
            <h1 className="event-title">{event.tieuDe}</h1>
            <div className="event-meta">
              <span className="event-time">
                <i className="fas fa-calendar-alt"></i>
                {formatDateTime(event.thoiGianBatDau)}
              </span>
              <span className="event-badge">
                {event.hoatDong ? (
                  <span className="badge active">
                    <i className="fas fa-check-circle"></i> Đang diễn ra
                  </span>
                ) : (
                  <span className="badge inactive">
                    <i className="fas fa-times-circle"></i> Chưa diễn ra
                  </span>
                )}
              </span>
            </div>
            <p className="event-description">{event.moTa}</p>
          </div>
        </div>

        {/* Zone Viewer Section */}
        <div className="zone-viewer-section">
          <h2 className="section-title">
            <i className="fas fa-map-marked-alt"></i> Sơ đồ khu vực
          </h2>

          <Row>
            <Col lg={8}>
              <div className="stage-container">
                <div className="stage-legend">
                  <div className="legend-item">
                    <i className="fas fa-search-plus"></i> Cuộn để phóng to/thu nhỏ
                  </div>
                  <div className="legend-item">
                    <i className="fas fa-hand-pointer"></i> Click vào khu vực để xem thông tin
                  </div>
                </div>

                <Stage
                  width={700}
                  height={500}
                  onWheel={handleWheel}
                  scaleX={stageScale.x}
                  scaleY={stageScale.y}
                  x={stagePosition.x}
                  y={stagePosition.y}
                  draggable
                >
                  <Layer>
                    {/* Background */}
                    <Rect
                      width={5000}
                      height={5000}
                      x={-2500}
                      y={-2500}
                      fill="#000"
                      perfectDrawEnabled={false}
                    />

                    {/* Stage platform */}
                    <Rect
                      x={250}
                      y={50}
                      width={200}
                      height={80}
                      fill="rgba(255, 215, 0, 0.2)"
                      stroke="#ffd700"
                      strokeWidth={2}
                      perfectDrawEnabled={false}
                    />
                    <Text
                      x={315}
                      y={80}
                      text="SÂN KHẤU"
                      fill="#ffd700"
                      fontSize={16}
                      fontStyle="bold"
                      perfectDrawEnabled={false}
                    />

                    {/* All zones */}
                    {event.khuVucs.map(zone => {
                      const layoutData = parseLayoutData(zone.layoutData);
                      const isSelected = selectedZone === zone.maKhuVuc;
                      
                      return (
                        <React.Fragment key={zone.maKhuVuc}>
                          <Rect
                            x={layoutData.attrs.x}
                            y={layoutData.attrs.y}
                            width={layoutData.attrs.width}
                            height={layoutData.attrs.height}
                            fill={isSelected 
                              ? `rgba(${parseInt(layoutData.attrs.stroke.slice(1, 3), 16)}, ${parseInt(layoutData.attrs.stroke.slice(3, 5), 16)}, ${parseInt(layoutData.attrs.stroke.slice(5, 7), 16)}, 0.3)` 
                              : layoutData.attrs.fill
                            }
                            stroke={layoutData.attrs.stroke}
                            strokeWidth={isSelected ? 3 : layoutData.attrs.strokeWidth}
                            shadowColor={isSelected ? "rgba(167, 135, 255, 0.8)" : "transparent"}
                            shadowBlur={isSelected ? 10 : 0}
                            cornerRadius={6}
                            onClick={() => setSelectedZone(zone.maKhuVuc)}
                          />
                          <Text
                            x={layoutData.attrs.x + 10}
                            y={layoutData.attrs.y + 10}
                            text={zone.tenKhuVuc}
                            fill={layoutData.attrs.stroke}
                            fontSize={16}
                            fontStyle="bold"
                            shadowColor="#000"
                            shadowBlur={3}
                            perfectDrawEnabled={false}
                          />
                          <Text
                            x={layoutData.attrs.x + 10}
                            y={layoutData.attrs.y + 30}
                            text={zone.viTri}
                            fill="#ffffff"
                            fontSize={12}
                            shadowColor="#000"
                            shadowBlur={3}
                            perfectDrawEnabled={false}
                          />
                        </React.Fragment>
                      );
                    })}
                  </Layer>
                </Stage>
              </div>
            </Col>

            <Col lg={4}>
              <div className="zone-details">
                <div className="zone-selection">
                  <h3>Danh sách khu vực</h3>
                  <div className="zone-list">
                    {event.khuVucs.map(zone => (
                      <div 
                        key={zone.maKhuVuc}
                        className={`zone-item ${selectedZone === zone.maKhuVuc ? 'selected' : ''}`}
                        onClick={() => setSelectedZone(zone.maKhuVuc)}
                      >
                        <div className="zone-name">{zone.tenKhuVuc}</div>
                        <div className="zone-position">{zone.viTri}</div>
                      </div>
                    ))}

                    {event.khuVucs.length === 0 && (
                      <div className="no-zones">
                        <i className="fas fa-info-circle"></i> Không có khu vực nào
                      </div>
                    )}
                  </div>
                </div>

                {selectedZone && (
                  <div className="ticket-details">
                    <h3>Loại vé có sẵn</h3>
                    <div className="ticket-list">
                      {getTicketsByZoneId(selectedZone).map(ticket => (
                        <Card key={ticket.maLoaiVe} className="ticket-item">
                          <Card.Body>
                            <Card.Title className="ticket-name">{ticket.tenLoaiVe}</Card.Title>
                            <div className="ticket-price">{formatCurrency(ticket.giaTien)}</div>
                            <div className="ticket-qty">
                              <span className="label">Số lượng còn lại:</span> 
                              <span className="value">{ticket.soLuong}</span>
                            </div>
                            {ticket.moTa && (
                              <div className="ticket-description">
                                {ticket.moTa}
                              </div>
                            )}
                            <button className="universe-btn buy-btn">
                              <i className="fas fa-shopping-cart"></i> Mua vé
                            </button>
                          </Card.Body>
                        </Card>
                      ))}

                      {getTicketsByZoneId(selectedZone).length === 0 && (
                        <div className="no-tickets">
                          <i className="fas fa-ticket-alt"></i> Không có loại vé nào trong khu vực này
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </Container>
  );
};

export default EventZoneViewer;