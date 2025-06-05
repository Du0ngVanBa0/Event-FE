import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, RegularPolygon, Line, Text, Transformer } from 'react-konva';
import Konva from 'konva';
import { Container, Row, Col, Card, Form, Button, ButtonGroup, Alert, Badge } from 'react-bootstrap';
import { ZoneCanvas, ZoneShape } from '../../../types/ZoneTypes';
import '../../../components/common/zone-design/styles/InteractiveZoneDesigner.css';
import { KhuVucEventRequest, KhuVucTemplate } from '../../../types/EventTypes';
import DefaultZoneService from '../../../api/DefaultZoneService';

interface ZoneDesignerTabProps {
  zones: KhuVucEventRequest[];
  onZonesChange: (zones: KhuVucEventRequest[]) => void;
  onTemplatesLoad?: (templates: KhuVucTemplate[]) => void;
  isEditMode?: boolean;
}

interface ZoneTemplate extends ZoneShape {
  templateId: string;
  isSelected: boolean;
  tenGoc: string;
}

const ZoneDesignerTab: React.FC<ZoneDesignerTabProps> = ({
  zones,
  onZonesChange,
  onTemplatesLoad,
  isEditMode = false
}) => {
  const [zoneTemplates, setZoneTemplates] = useState<ZoneTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mockTemplates, setMockTemplates] = useState<KhuVucTemplate[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);
  const [canvas] = useState<ZoneCanvas>({
    width: 800,
    height: 600,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    gridVisible: true,
    snapToGrid: true,
    gridSize: 20
  });
  const [isLoading, setIsLoading] = useState(true);

  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await DefaultZoneService.getAll();
      setMockTemplates(data);
      console.log('Fetched templates:', data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setNotification({
        message: 'Không thể tải danh sách mẫu khu vực. Vui lòng thử lại sau.',
        type: 'danger'
      });
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);


  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (notification) {
      timeoutId = setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [notification]);

  useEffect(() => {
    setIsLoading(true);
    console.log('Mock templates:', mockTemplates);
    onTemplatesLoad?.(mockTemplates);

    const convertedTemplates: ZoneTemplate[] = mockTemplates.map((template) => {
      const existingZone = zones.find(z => z.maKhuVucMau === template.maKhuVucMau);
      const isSelected = !!existingZone;

      return {
        id: `template_${template.maKhuVucMau}`,
        templateId: template.maKhuVucMau,
        type: template.hinhDang.toLowerCase() as any,
        name: existingZone?.tenTuyChon || template.tenKhuVuc,
        tenGoc: template.tenKhuVuc,
        position: {
          x: existingZone?.toaDoX || template.toaDoXMacDinh || 100,
          y: existingZone?.toaDoY || template.toaDoYMacDinh || 100
        },
        size: {
          width: existingZone?.chieuRong || template.chieuRongMacDinh || 200,
          height: existingZone?.chieuCao || template.chieuCaoMacDinh || 150
        },
        rotation: 0,
        color: isSelected
          ? `${existingZone?.mauSacTuyChon || template.mauSac}80`
          : `${template.mauSac}40`,
        borderColor: existingZone?.mauSacTuyChon || template.mauSac,
        borderWidth: isSelected ? 3 : 2,
        opacity: isSelected ? 0.8 : 0.6,
        visible: true,
        locked: false,
        zIndex: template.thuTuHienThi,
        labelVisible: true,
        labelPosition: 'center',
        properties: template.hinhDang === 'CIRCLE' ? {
          radius: Math.max(template.chieuRongMacDinh || 200, template.chieuCaoMacDinh || 150) / 2
        } : {},
        isSelected
      };
    });

    setZoneTemplates(convertedTemplates);
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mockTemplates]);


  useEffect(() => {
    setIsLoading(true);
    const convertedTemplates: ZoneTemplate[] = mockTemplates.map((template) => ({
      id: `template_${template.maKhuVucMau}`,
      templateId: template.maKhuVucMau,
      type: template.hinhDang.toLowerCase() as any,
      name: template.tenKhuVuc,
      tenGoc: template.tenKhuVuc,
      position: {
        x: template.toaDoXMacDinh || 100,
        y: template.toaDoYMacDinh || 100
      },
      size: {
        width: template.chieuRongMacDinh || 200,
        height: template.chieuCaoMacDinh || 150
      },
      rotation: 0,
      color: `${template.mauSac}40`, // More transparent by default
      borderColor: template.mauSac,
      borderWidth: 2,
      opacity: 0.6, // Lower opacity for unselected
      visible: true,
      locked: false,
      zIndex: template.thuTuHienThi,
      labelVisible: true,
      labelPosition: 'center',
      properties: template.hinhDang === 'CIRCLE' ? {
        radius: Math.max(template.chieuRongMacDinh || 200, template.chieuCaoMacDinh || 150) / 2
      } : {},
      isSelected: false // Default: not selected for use
    }));

    setZoneTemplates(convertedTemplates);
    setIsLoading(false);
  }, [mockTemplates]);

  // Convert zones to KhuVucEventRequest
  const convertToKhuVucEventRequests = useCallback(() => {
    const selectedZones = zoneTemplates.filter(zone => zone.isSelected);

    const khuVucRequests: KhuVucEventRequest[] = selectedZones.map((zone) => {
      return {
        maKhuVucMau: zone.templateId,
        tenTuyChon: zone.name !== zone.tenGoc ? zone.name : undefined,
        moTaTuyChon: undefined, // Can be extended later
        mauSacTuyChon: zone.borderColor !== mockTemplates.find(t => t.maKhuVucMau === zone.templateId)?.mauSac
          ? zone.borderColor : undefined,
        toaDoX: Math.round(zone.position.x),
        toaDoY: Math.round(zone.position.y),
        chieuRong: Math.round(zone.size.width),
        chieuCao: Math.round(zone.size.height),
        viTri: `Vị trí (${Math.round(zone.position.x)}, ${Math.round(zone.position.y)})`
      };
    });

    onZonesChange(khuVucRequests);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneTemplates, onZonesChange]);

  useEffect(() => {
    convertToKhuVucEventRequests();
  }, [convertToKhuVucEventRequests]);

  useEffect(() => {
    if (selectedId && transformerRef.current && layerRef.current) {
      const selectedNode = layerRef.current.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedId]);

  const toggleZoneSelection = (templateId: string) => {
    setZoneTemplates(prev =>
      prev.map(zone => {
        if (zone.templateId === templateId) {
          const newIsSelected = !zone.isSelected;
          return {
            ...zone,
            isSelected: newIsSelected,
            opacity: newIsSelected ? 0.8 : 0.6,
            color: newIsSelected
              ? `${zone.borderColor}80`
              : `${zone.borderColor}40`,
            borderWidth: newIsSelected ? 3 : 2
          };
        }
        return zone;
      })
    );
  };

  const handleZoneTransform = (id: string) => {
    const node = layerRef.current?.findOne(`#${id}`);
    if (!node) return;

    const newAttrs = {
      x: node.x(),
      y: node.y(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
      rotation: node.rotation(),
    };

    setZoneTemplates(prev =>
      prev.map(zone => {
        if (zone.id === id) {
          return {
            ...zone,
            position: { x: newAttrs.x, y: newAttrs.y },
            size: {
              width: zone.size.width * newAttrs.scaleX,
              height: zone.size.height * newAttrs.scaleY
            },
            rotation: newAttrs.rotation
          };
        }
        return zone;
      })
    );
  };

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    if (e.target === stage) {
      setSelectedId(null);
      return;
    }

    const clickedId = e.target.id();
    if (clickedId && zoneTemplates.find(z => z.id === clickedId)) {
      setSelectedId(clickedId);

      const zone = zoneTemplates.find(z => z.id === clickedId);
      if (zone) {
        toggleZoneSelection(zone.templateId);
      }
    }
  };

  const updateZoneProperty = (id: string, property: keyof ZoneTemplate, value: any) => {
    setZoneTemplates(prev =>
      prev.map(zone =>
        zone.id === id ? { ...zone, [property]: value } : zone
      )
    );
  };

  const selectAllZones = () => {
    setZoneTemplates(prev =>
      prev.map(zone => ({
        ...zone,
        isSelected: true,
        opacity: 0.8,
        color: `${zone.borderColor}80`,
        borderWidth: 3
      }))
    );
  };

  const deselectAllZones = () => {
    setZoneTemplates(prev =>
      prev.map(zone => ({
        ...zone,
        isSelected: false,
        opacity: 0.6,
        color: `${zone.borderColor}40`,
        borderWidth: 2
      }))
    );
  };

  // Get current data
  const selectedZone = zoneTemplates.find(zone => zone.id === selectedId);
  const selectedZonesCount = zoneTemplates.filter(zone => zone.isSelected).length;

  // Render shape on canvas
  const renderShape = (zone: ZoneTemplate) => {
    const commonProps = {
      id: zone.id,
      x: zone.position.x,
      y: zone.position.y,
      fill: zone.color,
      stroke: zone.borderColor,
      strokeWidth: zone.borderWidth,
      opacity: zone.opacity,
      rotation: zone.rotation,
      draggable: !zone.locked,
      onDragEnd: () => handleZoneTransform(zone.id),
      onTransformEnd: () => handleZoneTransform(zone.id),
    };

    switch (zone.type) {
      case 'rectangle':
      case 'square':
        return (
          <React.Fragment key={zone.id}>
            <Rect
              {...commonProps}
              width={zone.size.width}
              height={zone.size.height}
            />
            {zone.labelVisible && (
              <Text
                x={zone.position.x + zone.size.width / 2}
                y={zone.position.y + zone.size.height / 2}
                text={zone.name}
                fontSize={12}
                fontFamily="Arial"
                fill="#000000"
                align="center"
                verticalAlign="middle"
                offsetX={zone.name.length * 3}
                offsetY={6}
              />
            )}
            {zone.isSelected && (
              <Text
                x={zone.position.x + zone.size.width - 15}
                y={zone.position.y + 5}
                text="✓"
                fontSize={14}
                fontFamily="Arial"
                fill="#00ff00"
                fontStyle="bold"
              />
            )}
          </React.Fragment>
        );

      case 'circle':
        return (
          <React.Fragment key={zone.id}>
            <Circle
              {...commonProps}
              radius={Math.max(zone.size.width, zone.size.height) / 2}
            />
            {zone.labelVisible && (
              <Text
                x={zone.position.x}
                y={zone.position.y}
                text={zone.name}
                fontSize={12}
                fontFamily="Arial"
                fill="#000000"
                align="center"
                verticalAlign="middle"
                offsetX={zone.name.length * 3}
                offsetY={6}
              />
            )}
            {zone.isSelected && (
              <Text
                x={zone.position.x + 25}
                y={zone.position.y - 25}
                text="✓"
                fontSize={14}
                fontFamily="Arial"
                fill="#00ff00"
                fontStyle="bold"
              />
            )}
          </React.Fragment>
        );

      case 'triangle':
        return (
          <React.Fragment key={zone.id}>
            <RegularPolygon
              {...commonProps}
              sides={3}
              radius={Math.max(zone.size.width, zone.size.height) / 2}
            />
            {zone.labelVisible && (
              <Text
                x={zone.position.x}
                y={zone.position.y}
                text={zone.name}
                fontSize={12}
                fontFamily="Arial"
                fill="#000000"
                align="center"
                verticalAlign="middle"
                offsetX={zone.name.length * 3}
                offsetY={6}
              />
            )}
            {zone.isSelected && (
              <Text
                x={zone.position.x + 25}
                y={zone.position.y - 25}
                text="✓"
                fontSize={14}
                fontFamily="Arial"
                fill="#00ff00"
                fontStyle="bold"
              />
            )}
          </React.Fragment>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Đang tải dữ liệu khu vực...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="interactive-zone-designer">
      {notification && (
        <div className="notification-container">
          <Alert variant={notification.type} className="notification-alert">
            {notification.message}
          </Alert>
        </div>
      )}
      <Row className="mb-3">
        <Col>
          <Alert variant="info">
            <i className="fas fa-info-circle me-2"></i>
            {isEditMode ?
              'Chỉnh sửa khu vực cho sự kiện từ các mẫu có sẵn.' :
              'Chọn các khu vực từ mẫu có sẵn cho sự kiện của bạn. Bạn có thể tùy chỉnh tên và vị trí.'
            }
          </Alert>
        </Col>
      </Row>

      <Row className="h-100">
        <Col md={3} className="zone-designer-sidebar">
          <Card className="universe-card h-100">
            <Card.Header className="universe-card-header d-flex justify-content-between align-items-center">
              <h6>
                <i className="fas fa-tools"></i> Quản lý khu vực
              </h6>
              <Badge bg="light" text="dark">{selectedZonesCount}/{zoneTemplates.length}</Badge>
            </Card.Header>
            <Card.Body className="p-3">
              {/* Quick Actions */}
              <div className="template-controls mb-4">
                <h6 className="section-title">Chọn nhanh</h6>
                <ButtonGroup className="w-100 mb-2">
                  <Button variant="outline-success" size="sm" onClick={selectAllZones}>
                    Chọn tất cả
                  </Button>
                  <Button variant="outline-secondary" size="sm" onClick={deselectAllZones}>
                    Bỏ chọn tất cả
                  </Button>
                </ButtonGroup>
                <small className="text-muted d-block">
                  Nhấp vào khu vực trên sơ đồ để chọn/bỏ chọn
                </small>
              </div>

              {/* Zone Properties */}
              {selectedZone && (
                <div className="zone-properties mb-4">
                  <h6 className="section-title">
                    Tùy chỉnh: {selectedZone.tenGoc}
                    {selectedZone.isSelected && (
                      <Badge bg="success" className="ms-2">Đã chọn</Badge>
                    )}
                  </h6>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên khu vực</Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedZone.name}
                        onChange={(e) => updateZoneProperty(selectedId!, 'name', e.target.value)}
                        placeholder={selectedZone.tenGoc}
                        size="sm"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Màu sắc</Form.Label>
                      <Form.Control
                        type="color"
                        value={selectedZone.borderColor}
                        onChange={(e) => {
                          const color = e.target.value;
                          updateZoneProperty(selectedId!, 'borderColor', color);
                          updateZoneProperty(selectedId!, 'color',
                            selectedZone.isSelected ? `${color}80` : `${color}40`
                          );
                        }}
                        size="sm"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Độ mờ: {(selectedZone.opacity * 100).toFixed(0)}%</Form.Label>
                      <Form.Range
                        min={0.3}
                        max={1}
                        step={0.1}
                        value={selectedZone.opacity}
                        onChange={(e) => updateZoneProperty(selectedId!, 'opacity', parseFloat(e.target.value))}
                      />
                    </Form.Group>

                    <Form.Check
                      type="checkbox"
                      label="Hiển thị tên"
                      checked={selectedZone.labelVisible}
                      onChange={(e) => updateZoneProperty(selectedId!, 'labelVisible', e.target.checked)}
                      className="mb-3"
                    />

                    <div className="d-grid">
                      <Button
                        variant={selectedZone.isSelected ? "warning" : "success"}
                        onClick={() => toggleZoneSelection(selectedZone.templateId)}
                        size="sm"
                      >
                        <i className={`fas fa-${selectedZone.isSelected ? 'times' : 'check'}`}></i>
                        {selectedZone.isSelected ? ' Bỏ chọn' : ' Chọn khu vực'}
                      </Button>
                    </div>
                  </Form>
                </div>
              )}

              <div className="zone-list">
                <h6 className="section-title">
                  Danh sách mẫu khu vực ({zoneTemplates.length})
                </h6>
                <div className="zone-list-container" style={{ maxHeight: '300px' }}>
                  {zoneTemplates.map((zone) => (
                    <div
                      key={zone.id}
                      className={`zone-list-item ${selectedId === zone.id ? 'selected' : ''} ${zone.isSelected ? 'zone-enabled' : 'zone-disabled'
                        }`}
                      onClick={() => setSelectedId(zone.id)}
                      onDoubleClick={() => toggleZoneSelection(zone.templateId)}
                    >
                      <div className="zone-checkbox">
                        <Form.Check
                          type="checkbox"
                          checked={zone.isSelected}
                          onChange={() => toggleZoneSelection(zone.templateId)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="zone-icon">
                        <i className={`fas fa-${zone.type === 'rectangle' || zone.type === 'square' ? 'square' :
                          zone.type === 'circle' ? 'circle' :
                            zone.type === 'triangle' ? 'play' : 'square'
                          }`}></i>
                      </div>
                      <div className="zone-info">
                        <div className="zone-name">
                          {zone.name}
                          {zone.name !== zone.tenGoc && (
                            <small className="text-muted d-block">({zone.tenGoc})</small>
                          )}
                        </div>
                        <div className="zone-type">{zone.type}</div>
                      </div>
                      <div className="zone-color" style={{ backgroundColor: zone.borderColor }}></div>
                    </div>
                  ))}
                </div>
                <small className="text-muted mt-2 d-block">
                  <i className="fas fa-info-circle"></i> Nhấp đúp để chọn/bỏ chọn
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={9} className="zone-canvas-container">
          <Card className="universe-card h-100">
            <Card.Header className="universe-card-header">
              <h6><i className="fas fa-map"></i> Sơ đồ khu vực sự kiện</h6>
              <div className="canvas-info">
                <Badge bg="success" className="me-2">{selectedZonesCount} đã chọn</Badge>
                <Badge bg="secondary">{zoneTemplates.length - selectedZonesCount} chưa chọn</Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-2">
              <div className="canvas-instructions mb-2">
                <small className="text-muted">
                  <i className="fas fa-mouse-pointer"></i> Nhấp để chọn khu vực •
                  <i className="fas fa-hand-pointer ms-2"></i> Nhấp vào khu vực để chọn/bỏ chọn •
                  <i className="fas fa-arrows-alt ms-2"></i> Kéo thả để di chuyển
                </small>
              </div>
              <div className="stage-container" style={{ height: '500px' }}>
                <Stage
                  width={canvas.width}
                  height={canvas.height}
                  ref={stageRef}
                  onMouseDown={handleStageMouseDown}
                  className="zone-stage"
                >
                  <Layer ref={layerRef}>
                    {/* Grid background */}
                    {canvas.gridVisible && (
                      <>
                        {Array.from({ length: Math.ceil(canvas.width / canvas.gridSize) }, (_, i) => (
                          <Line
                            key={`v-${i}`}
                            points={[i * canvas.gridSize, 0, i * canvas.gridSize, canvas.height]}
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth={1}
                          />
                        ))}
                        {Array.from({ length: Math.ceil(canvas.height / canvas.gridSize) }, (_, i) => (
                          <Line
                            key={`h-${i}`}
                            points={[0, i * canvas.gridSize, canvas.width, i * canvas.gridSize]}
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth={1}
                          />
                        ))}
                      </>
                    )}

                    {zoneTemplates.filter(zone => zone.visible).map(renderShape)}

                    <Transformer
                      ref={transformerRef}
                      boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 30 || newBox.height < 30) {
                          return oldBox;
                        }
                        return newBox;
                      }}
                    />
                  </Layer>
                </Stage>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {zones.length > 0 && (
        <Row className="mt-3">
          <Col>
            <Card className="universe-card">
              <Card.Header className="universe-card-header">
                <h6><i className="fas fa-list"></i> Tóm tắt khu vực đã chọn ({zones.length})</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  {zones.map((zone, index) => {
                    const template = mockTemplates.find(t => t.maKhuVucMau === zone.maKhuVucMau);
                    const displayName = zone.tenTuyChon || template?.tenKhuVuc || 'Unknown';
                    return (
                      <Col key={index} md={6} lg={4} className="mb-2">
                        <div className="zone-summary-item">
                          <strong>{displayName}</strong>
                          <br />
                          <small className="text-muted">
                            {template?.tenKhuVuc} - {zone.viTri}
                          </small>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ZoneDesignerTab;