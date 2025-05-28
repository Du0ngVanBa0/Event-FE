import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { Stage, Layer, Rect, Circle, RegularPolygon, Text } from 'react-konva';

import axios from 'axios';
import './styles/ZoneListViewer.css';
import { ZoneDesignData, ZoneShape } from '../../../types/ZoneTypes';

interface ZoneListViewerProps {
  eventId: string;
  onZoneSelect?: (zoneId: string) => void;
  selectedZoneId?: string;
  showTicketInfo?: boolean;
}

interface TicketInfo {
  maLoaiVe: string;
  tenLoaiVe: string;
  giaTien: number;
  soLuong: number;
  soLuongDaBan: number;
}

const ZoneListViewer: React.FC<ZoneListViewerProps> = ({
  eventId,
  onZoneSelect,
  selectedZoneId,
  showTicketInfo = true
}) => {
  const [zones, setZones] = useState<ZoneShape[]>([]);
  const [tickets, setTickets] = useState<Record<string, TicketInfo[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch zones data
  useEffect(() => {
    const fetchZonesData = async () => {
      try {
        setLoading(true);
        
        // Fetch zone design data
        const zoneResponse = await axios.get(`/api/sukien/${eventId}/zones`);
        const zoneData: ZoneDesignData = zoneResponse.data;
        setZones(zoneData.zones || []);

        // Fetch ticket information if needed
        if (showTicketInfo) {
          const ticketResponse = await axios.get(`/api/sukien/${eventId}/tickets`);
          setTickets(ticketResponse.data || {});
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu khu vực:', err);
        setError('Không thể tải dữ liệu khu vực');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchZonesData();
    }
  }, [eventId, showTicketInfo]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Render mini zone preview
  const renderZonePreview = (zone: ZoneShape, size: number = 60) => {
    const scale = size / Math.max(zone.size.width, zone.size.height);
    const centerX = size / 2;
    const centerY = size / 2;

    const commonProps = {
      x: centerX,
      y: centerY,
      fill: zone.color,
      stroke: zone.borderColor,
      strokeWidth: 2,
      opacity: zone.opacity,
    };

    switch (zone.type) {
      case 'rectangle':
      case 'square':
        return (
          <Rect
            {...commonProps}
            width={zone.size.width * scale}
            height={zone.size.height * scale}
            offsetX={(zone.size.width * scale) / 2}
            offsetY={(zone.size.height * scale) / 2}
          />
        );

      case 'circle':
        return (
          <Circle
            {...commonProps}
            radius={(Math.max(zone.size.width, zone.size.height) / 2) * scale}
          />
        );

      case 'triangle':
        return (
          <RegularPolygon
            {...commonProps}
            sides={3}
            radius={(Math.max(zone.size.width, zone.size.height) / 2) * scale}
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container className="zone-list-viewer">
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="zone-list-viewer">
        <Card className="universe-card error-card">
          <Card.Body>
            <div className="error-content">
              <i className="fas fa-exclamation-triangle"></i>
              <p>{error}</p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="zone-list-viewer">
      <Row>
        <Col lg={8}>
          {/* Zone Grid */}
          <Card className="universe-card zones-grid-card">
            <Card.Header className="universe-card-header">
              <h5><i className="fas fa-map-marked-alt"></i> Sơ đồ khu vực ({zones.length})</h5>
            </Card.Header>
            <Card.Body>
              {zones.length > 0 ? (
                <Row className="zone-grid">
                  {zones.map((zone) => (
                    <Col key={zone.id} md={6} lg={4} className="mb-4">
                      <Card 
                        className={`zone-card ${selectedZoneId === zone.id ? 'selected' : ''}`}
                        onClick={() => onZoneSelect?.(zone.id)}
                      >
                        <Card.Body className="p-3">
                          <div className="zone-preview-container">
                            <Stage width={80} height={80}>
                              <Layer>
                                {renderZonePreview(zone, 60)}
                              </Layer>
                            </Stage>
                          </div>
                          
                          <div className="zone-info">
                            <h6 className="zone-name">{zone.name}</h6>
                            <div className="zone-meta">
                              <Badge bg="secondary" className="zone-type-badge">
                                {zone.type}
                              </Badge>
                              <span className="zone-size">
                                {Math.round(zone.size.width)} × {Math.round(zone.size.height)}
                              </span>
                            </div>
                          </div>

                          {showTicketInfo && tickets[zone.id] && (
                            <div className="ticket-summary">
                              <div className="ticket-count">
                                <i className="fas fa-ticket-alt"></i>
                                <span>{tickets[zone.id].length} loại vé</span>
                              </div>
                              {tickets[zone.id].length > 0 && (
                                <div className="price-range">
                                  {formatCurrency(Math.min(...tickets[zone.id].map(t => t.giaTien)))}
                                  {tickets[zone.id].length > 1 && 
                                    ` - ${formatCurrency(Math.max(...tickets[zone.id].map(t => t.giaTien)))}`
                                  }
                                </div>
                              )}
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="no-zones-message">
                  <i className="fas fa-map"></i>
                  <h6>Chưa có khu vực nào</h6>
                  <p>Hãy tạo khu vực đầu tiên cho sự kiện của bạn</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Zone Details */}
          {selectedZoneId && zones.find(z => z.id === selectedZoneId) && (
            <Card className="universe-card zone-detail-card">
              <Card.Header className="universe-card-header">
                <h6><i className="fas fa-info-circle"></i> Chi tiết khu vực</h6>
              </Card.Header>
              <Card.Body>
                {(() => {
                  const selectedZone = zones.find(z => z.id === selectedZoneId)!;
                  return (
                    <>
                      <div className="zone-detail-preview">
                        <Stage width={200} height={120}>
                          <Layer>
                            {renderZonePreview(selectedZone, 100)}
                            <Text
                              x={100}
                              y={105}
                              text={selectedZone.name}
                              fontSize={12}
                              fontFamily="Arial"
                              fill="#ffffff"
                              align="center"
                              offsetX={selectedZone.name.length * 3}
                            />
                          </Layer>
                        </Stage>
                      </div>

                      <div className="zone-properties">
                        <div className="property-row">
                          <span className="property-label">Tên:</span>
                          <span className="property-value">{selectedZone.name}</span>
                        </div>
                        <div className="property-row">
                          <span className="property-label">Loại:</span>
                          <span className="property-value">{selectedZone.type}</span>
                        </div>
                        <div className="property-row">
                          <span className="property-label">Kích thước:</span>
                          <span className="property-value">
                            {Math.round(selectedZone.size.width)} × {Math.round(selectedZone.size.height)}
                          </span>
                        </div>
                        <div className="property-row">
                          <span className="property-label">Vị trí:</span>
                          <span className="property-value">
                            ({Math.round(selectedZone.position.x)}, {Math.round(selectedZone.position.y)})
                          </span>
                        </div>
                      </div>

                      {showTicketInfo && tickets[selectedZoneId] && (
                        <div className="ticket-details">
                          <h6 className="section-title">
                            <i className="fas fa-ticket-alt"></i> Thông tin vé
                          </h6>
                          {tickets[selectedZoneId].length > 0 ? (
                            <div className="ticket-list">
                              {tickets[selectedZoneId].map((ticket) => (
                                <div key={ticket.maLoaiVe} className="ticket-item">
                                  <div className="ticket-name">{ticket.tenLoaiVe}</div>
                                  <div className="ticket-price">{formatCurrency(ticket.giaTien)}</div>
                                  <div className="ticket-availability">
                                    Còn lại: {ticket.soLuong - ticket.soLuongDaBan}/{ticket.soLuong}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="no-tickets">
                              <i className="fas fa-info-circle"></i>
                              <span>Chưa có loại vé nào</span>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </Card.Body>
            </Card>
          )}

          {/* Zone Statistics */}
          <Card className="universe-card zone-stats-card mt-3">
            <Card.Header className="universe-card-header">
              <h6><i className="fas fa-chart-bar"></i> Thống kê</h6>
            </Card.Header>
            <Card.Body>
              <div className="stat-item">
                <span className="stat-label">Tổng khu vực:</span>
                <span className="stat-value">{zones.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Loại hình dạng:</span>
                <span className="stat-value">
                  {[...new Set(zones.map(z => z.type))].length}
                </span>
              </div>
              {showTicketInfo && (
                <>
                  <div className="stat-item">
                    <span className="stat-label">Tổng loại vé:</span>
                    <span className="stat-value">
                      {Object.values(tickets).reduce((sum, ticketList) => sum + ticketList.length, 0)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Tổng vé:</span>
                    <span className="stat-value">
                      {Object.values(tickets)
                        .flat()
                        .reduce((sum, ticket) => sum + ticket.soLuong, 0)}
                    </span>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ZoneListViewer;