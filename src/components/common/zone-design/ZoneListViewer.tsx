import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text } from 'react-konva';
import Konva from 'konva';
import { Card, Alert } from 'react-bootstrap';
import { KhuVucResponse, TicketType } from '../../../types/EventTypes';

interface ZoneMapViewerProps {
  eventZones: KhuVucResponse[];
  tickets: TicketType[];
  selectedZoneId?: string;
  onZoneClick?: (zoneId: string, ticketType?: TicketType) => void;
  onZoneHover?: (zoneId: string | null) => void;
  width?: number;
  height?: number;
  showLabels?: boolean;
  showTicketInfo?: boolean;
  readOnly?: boolean;
  className?: string;
}

interface MinimalTemplate {
  maKhuVucMau: string;
  tenKhuVuc: string;
  mauSac: string;
  hinhDang: string;
  thuTuHienThi: number;
}

interface ZoneData {
  id: string;
  template?: MinimalTemplate;
  eventZone: KhuVucResponse;
  ticket?: TicketType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
  borderColor: string;
  isAvailable: boolean;
  isSelected: boolean;
  shape: string;
  textColor: string;
}

interface ViewportBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

const ZoneMapViewer: React.FC<ZoneMapViewerProps> = ({
  eventZones,
  tickets,
  selectedZoneId,
  onZoneClick,
  onZoneHover,
  width = 800,
  height = 600,
  showLabels = true,
  showTicketInfo = true,
  readOnly = false,
  className = ''
}) => {
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);

  // Calculate bounds of all zones
  const calculateBounds = (zoneData: ZoneData[]): ViewportBounds => {
    if (zoneData.length === 0) {
      return { minX: 0, minY: 0, maxX: width, maxY: height, width, height };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    zoneData.forEach(zone => {
      const left = zone.position.x;
      const top = zone.position.y;
      const right = zone.position.x + zone.size.width;
      const bottom = zone.position.y + zone.size.height;

      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, right);
      maxY = Math.max(maxY, bottom);
    });

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  };

  // Calculate scale and offset to fit all zones in viewport
  const calculateViewport = (zoneData: ZoneData[]) => {
    const bounds = calculateBounds(zoneData);
    
    if (bounds.width === 0 || bounds.height === 0) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
      return;
    }

    // Add padding around the content
    const padding = 50;
    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2;

    const scaleX = availableWidth / bounds.width;
    const scaleY = availableHeight / bounds.height;
    const newScale = Math.min(scaleX, scaleY, 1);

    const scaledWidth = bounds.width * newScale;
    const scaledHeight = bounds.height * newScale;
    const centerX = (width - scaledWidth) / 2;
    const centerY = (height - scaledHeight) / 2;

    const newOffset = {
      x: centerX - bounds.minX * newScale,
      y: centerY - bounds.minY * newScale
    };

    setScale(newScale);
    setOffset(newOffset);
  };

  // Convert templates and tickets to zone data
  useEffect(() => {
    const zoneData: ZoneData[] = eventZones.map(eventZone => {
      const ticket = tickets.find(t => t.maKhuVuc === eventZone.maKhuVuc);
      const isAvailable = ticket ? (ticket.veConLai || 0) > 0 : false;
      const isSelected = selectedZoneId === eventZone.maKhuVuc;

      let color: string;
      let borderColor: string;
      let textColor: string;

      if (!ticket) {
        // No ticket for this zone - use light gray with dark text
        color = '#e9ecef';
        borderColor = '#6c757d';
        textColor = '#495057';
      } else if (!isAvailable) {
        // Sold out
        color = '#dc3545';
        borderColor = '#dc3545';
        textColor = '#fff';
      } else if (isSelected) {
        // Selected
        color = '#28a745';
        borderColor = '#28a745';
        textColor = '#fff';
      } else {
        // Available - use template color if available
        const templateColor = eventZone.template?.mauSac || eventZone.mauSacHienThi || '#007bff';
        color = templateColor;
        borderColor = templateColor;
        textColor = '#fff';
      }

      return {
        id: eventZone.maKhuVuc,
        template: eventZone.template as MinimalTemplate,
        eventZone,
        ticket,
        position: {
          x: eventZone.toaDoX || 100,
          y: eventZone.toaDoY || 100
        },
        size: {
          width: eventZone.chieuRong || 200,
          height: eventZone.chieuCao || 150
        },
        color,
        borderColor,
        isAvailable,
        isSelected,
        shape: eventZone.template?.hinhDang?.toLowerCase() || 'rectangle',
        textColor
      };
    });

    console.log('Generated zoneData:', zoneData);
    setZones(zoneData);
    
    // Calculate viewport after zones are set
    calculateViewport(zoneData);
  }, [eventZones, tickets, selectedZoneId, width, height]);

  const handleZoneClick = (zone: ZoneData) => {
    if (readOnly || !onZoneClick) return;

    // Only allow clicks on zones that have tickets
    if (zone.ticket) {
      onZoneClick(zone.id, zone.ticket);
    }
  };

  const handleZoneMouseEnter = (zoneId: string) => {
    if (readOnly) return;

    const zone = zones.find(z => z.id === zoneId);
    
    // Only show hover for zones with tickets
    if (zone?.ticket) {
      setHoveredZone(zoneId);
      onZoneHover?.(zoneId);

      // Change cursor
      if (stageRef.current) {
        stageRef.current.container().style.cursor = 'pointer';
      }
    }
  };

  const handleZoneMouseLeave = () => {
    setHoveredZone(null);
    onZoneHover?.(null);

    if (stageRef.current) {
      stageRef.current.container().style.cursor = 'default';
    }
  };

  const renderZone = (zone: ZoneData) => {
    const isHovered = hoveredZone === zone.id;
    const commonProps = {
      id: zone.id,
      x: zone.position.x,
      y: zone.position.y,
      fill: zone.color,
      stroke: zone.borderColor,
      strokeWidth: zone.isSelected ? 3 : (isHovered ? 2.5 : 2),
      opacity: isHovered ? 0.9 : 0.8,
      onMouseEnter: () => handleZoneMouseEnter(zone.id),
      onMouseLeave: handleZoneMouseLeave,
      onClick: () => handleZoneClick(zone),
    };

    const labelText = zone.ticket?.tenLoaiVe || zone.template?.tenKhuVuc || zone.eventZone.tenHienThi || 'Khu vực';
    const priceText = zone.ticket ? `${zone.ticket.giaTien.toLocaleString('vi-VN')}đ` : '';
    const availableText = zone.ticket ? `Còn ${zone.ticket.veConLai || 0}` : '';
    const noTicketText = !zone.ticket ? 'Không bán vé' : '';

    // Scale font sizes based on scale
    const baseFontSize = Math.max(10, 14 * scale);
    const priceFontSize = Math.max(8, 12 * scale);
    const availableFontSize = Math.max(7, 10 * scale);

    const shapeType = zone.template?.hinhDang?.toLowerCase() || 'rectangle';

    switch (shapeType) {
      case 'rectangle':
        return (
          <React.Fragment key={zone.id}>
            <Rect
              {...commonProps}
              width={zone.size.width}
              height={zone.size.height}
            />
            {showLabels && (
              <>
                <Text
                  x={zone.position.x + zone.size.width / 2}
                  y={zone.position.y + zone.size.height / 2 - (zone.ticket ? 20 : 10)}
                  text={labelText}
                  fontSize={baseFontSize}
                  fontFamily="Arial"
                  fill={zone.textColor}
                  fontStyle="bold"
                  align="center"
                  offsetX={labelText.length * (baseFontSize / 4)}
                  listening={false}
                />
                {zone.ticket ? (
                  <>
                    {showTicketInfo && (
                      <>
                        <Text
                          x={zone.position.x + zone.size.width / 2}
                          y={zone.position.y + zone.size.height / 2}
                          text={priceText}
                          fontSize={priceFontSize}
                          fontFamily="Arial"
                          fill={zone.textColor}
                          align="center"
                          offsetX={priceText.length * (priceFontSize / 4)}
                          listening={false}
                        />
                        <Text
                          x={zone.position.x + zone.size.width / 2}
                          y={zone.position.y + zone.size.height / 2 + 20}
                          text={availableText}
                          fontSize={availableFontSize}
                          fontFamily="Arial"
                          fill={zone.textColor}
                          align="center"
                          offsetX={availableText.length * (availableFontSize / 4)}
                          listening={false}
                        />
                      </>
                    )}
                    {!zone.isAvailable && (
                      <Text
                        x={zone.position.x + zone.size.width / 2}
                        y={zone.position.y + zone.size.height / 2 + 40}
                        text="HẾT VÉ"
                        fontSize={baseFontSize}
                        fontFamily="Arial"
                        fill={zone.textColor}
                        fontStyle="bold"
                        align="center"
                        offsetX={25}
                        listening={false}
                      />
                    )}
                  </>
                ) : (
                  <Text
                    x={zone.position.x + zone.size.width / 2}
                    y={zone.position.y + zone.size.height / 2 + 10}
                    text={noTicketText}
                    fontSize={availableFontSize}
                    fontFamily="Arial"
                    fill={zone.textColor}
                    align="center"
                    offsetX={noTicketText.length * (availableFontSize / 4)}
                    listening={false}
                  />
                )}
              </>
            )}
          </React.Fragment>
        );

      case 'circle':
        { const radius = Math.min(zone.size.width, zone.size.height) / 2;
        return (
          <React.Fragment key={zone.id}>
            <Circle
              {...commonProps}
              x={zone.position.x + zone.size.width / 2}
              y={zone.position.y + zone.size.height / 2}
              radius={radius}
            />
            {showLabels && (
              <>
                <Text
                  x={zone.position.x + zone.size.width / 2}
                  y={zone.position.y + zone.size.height / 2 - (zone.ticket ? 15 : 5)}
                  text={labelText}
                  fontSize={baseFontSize}
                  fontFamily="Arial"
                  fill={zone.textColor}
                  fontStyle="bold"
                  align="center"
                  offsetX={labelText.length * (baseFontSize / 4)}
                  listening={false}
                />
                {zone.ticket ? (
                  <>
                    {showTicketInfo && (
                      <>
                        <Text
                          x={zone.position.x + zone.size.width / 2}
                          y={zone.position.y + zone.size.height / 2 + 5}
                          text={priceText}
                          fontSize={priceFontSize}
                          fontFamily="Arial"
                          fill={zone.textColor}
                          align="center"
                          offsetX={priceText.length * (priceFontSize / 4)}
                          listening={false}
                        />
                        <Text
                          x={zone.position.x + zone.size.width / 2}
                          y={zone.position.y + zone.size.height / 2 + 20}
                          text={availableText}
                          fontSize={availableFontSize}
                          fontFamily="Arial"
                          fill={zone.textColor}
                          align="center"
                          offsetX={availableText.length * (availableFontSize / 4)}
                          listening={false}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <Text
                    x={zone.position.x + zone.size.width / 2}
                    y={zone.position.y + zone.size.height / 2 + 10}
                    text={noTicketText}
                    fontSize={availableFontSize}
                    fontFamily="Arial"
                    fill={zone.textColor}
                    align="center"
                    offsetX={noTicketText.length * (availableFontSize / 4)}
                    listening={false}
                  />
                )}
              </>
            )}
          </React.Fragment>
        ); }

      default:
        // Default to rectangle for unknown shapes
        return (
          <React.Fragment key={zone.id}>
            <Rect
              {...commonProps}
              width={zone.size.width}
              height={zone.size.height}
            />
            <Text
              x={zone.position.x + zone.size.width / 2}
              y={zone.position.y + zone.size.height / 2}
              text={labelText}
              fontSize={baseFontSize}
              fontFamily="Arial"
              fill={zone.textColor}
              fontStyle="bold"
              align="center"
              offsetX={labelText.length * (baseFontSize / 4)}
              listening={false}
            />
          </React.Fragment>
        );
    }
  };

  const hoveredZoneData = zones.find(z => z.id === hoveredZone);

  return (
    <div className={`zone-map-viewer ${className}`}>
      <Card>
        <Card.Body className="p-2">

          {hoveredZoneData && hoveredZoneData.ticket && (
            <Alert variant="info" className="mb-2 py-2">
              <strong>{hoveredZoneData.ticket?.tenLoaiVe || hoveredZoneData.template?.tenKhuVuc || hoveredZoneData.eventZone.tenHienThi}</strong>
              <br />
              <small>
                Giá: {hoveredZoneData.ticket.giaTien.toLocaleString('vi-VN')}đ |
                Còn: {hoveredZoneData.ticket.veConLai || 0} vé |
                Tối thiểu: {hoveredZoneData.ticket.soLuongToiThieu} - Tối đa: {hoveredZoneData.ticket.soLuongToiDa}
              </small>
            </Alert>
          )}

          <div className="canvas-container" style={{ height: `${height}px`, border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#ffffff' }}>
            <Stage
              width={width}
              height={height}
              ref={stageRef}
              scaleX={scale}
              scaleY={scale}
              x={offset.x}
              y={offset.y}
            >
              <Layer ref={layerRef}>
                {zones.map(zone => renderZone(zone))}
              </Layer>
            </Stage>
          </div>

          {zones.length === 0 && (
            <Alert variant="warning">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Không có khu vực nào để hiển thị.
            </Alert>
          )}

          <div className="legend mt-2">
            <small className="text-muted">
              <span className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#28a745', width: '12px', height: '12px', display: 'inline-block', marginRight: '5px' }}></span>
                Có vé
              </span>
              <span className="legend-item ms-3">
                <span className="legend-color" style={{ backgroundColor: '#dc3545', width: '12px', height: '12px', display: 'inline-block', marginRight: '5px' }}></span>
                Hết vé
              </span>
              <span className="legend-item ms-3">
                <span className="legend-color" style={{ backgroundColor: '#e9ecef', border: '1px solid #6c757d', width: '12px', height: '12px', display: 'inline-block', marginRight: '5px' }}></span>
                Không bán vé
              </span>
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ZoneMapViewer;