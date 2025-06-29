import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, RegularPolygon, Line, Text, Transformer } from 'react-konva';
import Konva from 'konva';
import { Row, Col, Card, Form, Button, ButtonGroup, Alert, Badge } from 'react-bootstrap';
import { ZoneCanvas, ZoneShape } from '../../../types/ZoneTypes';
import { KhuVucEventRequest, KhuVucTemplate } from '../../../types/EventTypes';
import DefaultZoneService from '../../../api/DefaultZoneService';
import './ZoneDesignerTab.css';

let templateCache: KhuVucTemplate[] | null = null;
let zonesCache: KhuVucEventRequest[] | null = null;

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
    if (templateCache) {
      setMockTemplates(templateCache);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await DefaultZoneService.getAll();
      templateCache = data;
      setMockTemplates(data);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Convert templates to zone templates with proper edit mode handling
  useEffect(() => {
    // If in edit mode and we have zones data, update our cache
    if (isEditMode && zones.length > 0) {
      zonesCache = [...zones];
    }
  }, [zones, isEditMode]);

  useEffect(() => {
    const zonesToProcess = (isEditMode && zones.length === 0 && zonesCache) ? zonesCache : zones;

    if (mockTemplates.length === 0 || (isEditMode && zonesToProcess.length === 0)) {
      if (isEditMode && mockTemplates.length > 0) {
        return;
      }
      if (mockTemplates.length === 0) return;
    }

    setIsLoading(true);

    onTemplatesLoad?.(mockTemplates);

    const convertedTemplates: ZoneTemplate[] = mockTemplates.map((template) => {
      const existingZone = isEditMode ? zonesToProcess.find(z => z.maKhuVucMau === template.maKhuVucMau) : null;
      const isSelected = !!existingZone;

      return {
        id: `template_${template.maKhuVucMau}`,
        templateId: template.maKhuVucMau,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: template.hinhDang.toLowerCase() as any,
        name: existingZone?.tenTuyChon || template.tenKhuVuc,
        tenGoc: template.tenKhuVuc,
        position: {
          x: existingZone?.toaDoX ?? template.toaDoXMacDinh ?? 100,
          y: existingZone?.toaDoY ?? template.toaDoYMacDinh ?? 100
        },
        size: {
          width: existingZone?.chieuRong ?? template.chieuRongMacDinh ?? 200,
          height: existingZone?.chieuCao ?? template.chieuCaoMacDinh ?? 150
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
          radius: Math.max(
            existingZone?.chieuRong ?? template.chieuRongMacDinh ?? 200,
            existingZone?.chieuCao ?? template.chieuCaoMacDinh ?? 150
          ) / 2
        } : {},
        isSelected
      };
    });

    setZoneTemplates(convertedTemplates);
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mockTemplates, isEditMode]);

  const convertToKhuVucEventRequests = useCallback(() => {
    const selectedZones = zoneTemplates.filter(zone => zone.isSelected);

    const khuVucRequests: KhuVucEventRequest[] = selectedZones.map((zone) => {
      const originalTemplate = mockTemplates.find(t => t.maKhuVucMau === zone.templateId);

      return {
        maKhuVucMau: zone.templateId,
        tenTuyChon: zone.name !== zone.tenGoc ? zone.name : undefined,
        moTaTuyChon: undefined,
        mauSacTuyChon: zone.borderColor !== originalTemplate?.mauSac
          ? zone.borderColor : undefined,
        toaDoX: Math.round(zone.position.x),
        toaDoY: Math.round(zone.position.y),
        chieuRong: Math.round(zone.size.width),
        chieuCao: Math.round(zone.size.height),
        viTri: `Vị trí (${Math.round(zone.position.x)}, ${Math.round(zone.position.y)})`
      };
    });

    onZonesChange(khuVucRequests);
  }, [zoneTemplates, mockTemplates, onZonesChange]);

  useEffect(() => {
    convertToKhuVucEventRequests();
  }, [zoneTemplates, convertToKhuVucEventRequests]);

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const selectedZone = zoneTemplates.find(zone => zone.id === selectedId);
  const selectedZonesCount = zoneTemplates.filter(zone => zone.isSelected).length;

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
      <div className="zone-designer-tab-container">
        <div className="zone-designer-tab-loading">
          <div className="zone-designer-tab-spinner">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
          <p className="zone-designer-tab-loading-text">Đang tải dữ liệu khu vực...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="zone-designer-tab-container">
      {notification && (
        <div className="zone-designer-tab-notification">
          <Alert variant={notification.type} className="zone-designer-tab-alert">
            <i className="fas fa-exclamation-triangle zone-designer-tab-alert-icon"></i>
            <span>{notification.message}</span>
          </Alert>
        </div>
      )}

      {/* Header Information */}
      <div className="zone-designer-tab-header">
        <Alert variant="info" className="zone-designer-tab-info-alert">
          <i className="fas fa-info-circle zone-designer-tab-info-icon"></i>
          <div className="zone-designer-tab-info-content">
            <h6 className="zone-designer-tab-info-title">
              {isEditMode ? 'Chỉnh sửa khu vực sự kiện' : 'Thiết kế khu vực sự kiện'}
            </h6>
            <p className="zone-designer-tab-info-text">
              {isEditMode ?
                'Cập nhật các khu vực đã chọn cho sự kiện này. Bạn có thể thêm, bỏ hoặc chỉnh sửa khu vực.' :
                'Chọn các khu vực từ mẫu có sẵn cho sự kiện của bạn. Bạn có thể tùy chỉnh tên và vị trí.'
              }
            </p>
          </div>
        </Alert>
      </div>

      {/* Edit Mode Status */}
      {isEditMode && (
        <div className="zone-designer-tab-edit-status">
          <Alert variant="success" className="zone-designer-tab-edit-alert">
            <i className="fas fa-edit zone-designer-tab-alert-icon"></i>
            <div>
              <strong>Chế độ chỉnh sửa:</strong> Hiện tại có {selectedZonesCount} khu vực đã được chọn cho sự kiện này.
              {selectedZonesCount === 0 && " Hãy chọn ít nhất một khu vực."}
            </div>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <Row className="zone-designer-tab-main-row">
        {/* Sidebar */}
        <Col lg={4} xl={3} className="zone-designer-tab-sidebar">
          <Card className="zone-designer-tab-card zone-designer-tab-sidebar-card">
            <Card.Header className="zone-designer-tab-card-header">
              <div className="zone-designer-tab-header-content">
                <h6 className="zone-designer-tab-header-title">
                  <i className="fas fa-tools zone-designer-tab-header-icon"></i>
                  {isEditMode ? 'Cập nhật khu vực' : 'Quản lý khu vực'}
                </h6>
                <Badge bg={selectedZonesCount > 0 ? "success" : "secondary"} className="zone-designer-tab-counter">
                  {selectedZonesCount}/{zoneTemplates.length}
                </Badge>
              </div>
            </Card.Header>

            <Card.Body className="zone-designer-tab-card-body">
              {/* Quick Actions */}
              <div className="zone-designer-tab-section">
                <h6 className="zone-designer-tab-section-title">
                  <i className="fas fa-mouse-pointer"></i>
                  {isEditMode ? 'Chỉnh sửa nhanh' : 'Chọn nhanh'}
                </h6>
                <div className="zone-designer-tab-actions">
                  <ButtonGroup className="zone-designer-tab-button-group">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={selectAllZones}
                      className="zone-designer-tab-button zone-designer-tab-button-select-all"
                    >
                      <i className="fas fa-check-double"></i>
                      Chọn tất cả
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={deselectAllZones}
                      className="zone-designer-tab-button zone-designer-tab-button-deselect-all"
                    >
                      <i className="fas fa-times"></i>
                      Bỏ chọn
                    </Button>
                  </ButtonGroup>
                  <small className="zone-designer-tab-help-text">
                    <i className="fas fa-lightbulb"></i>
                    {isEditMode ?
                      'Nhấp vào khu vực để thêm/bỏ khỏi sự kiện' :
                      'Nhấp vào khu vực trên sơ đồ để chọn/bỏ chọn'
                    }
                  </small>
                </div>
              </div>

              {/* Zone Properties */}
              {selectedZone && (
                <div className="zone-designer-tab-section zone-designer-tab-properties">
                  <h6 className="zone-designer-tab-section-title">
                    <i className="fas fa-edit"></i>
                    Tùy chỉnh khu vực
                  </h6>

                  <div className="zone-designer-tab-zone-header">
                    <div className="zone-designer-tab-zone-name">{selectedZone.tenGoc}</div>
                    <Badge
                      bg={selectedZone.isSelected ? "success" : "secondary"}
                      className="zone-designer-tab-status-badge"
                    >
                      <i className={`fas fa-${selectedZone.isSelected ? 'check' : 'times'}`}></i>
                      {selectedZone.isSelected ? 'Đã chọn' : 'Chưa chọn'}
                    </Badge>
                  </div>

                  <Form className="zone-designer-tab-form">
                    <div className="zone-designer-tab-form-group">
                      <label className="zone-designer-tab-label">Tên hiển thị</label>
                      <Form.Control
                        type="text"
                        value={selectedZone.name}
                        onChange={(e) => updateZoneProperty(selectedId!, 'name', e.target.value)}
                        placeholder={selectedZone.tenGoc}
                        className="zone-designer-tab-input"
                      />
                    </div>

                    <div className="zone-designer-tab-form-group">
                      <label className="zone-designer-tab-label">Màu sắc</label>
                      <div className="zone-designer-tab-color-input-wrapper">
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
                          className="zone-designer-tab-color-input"
                        />
                        <div
                          className="zone-designer-tab-color-preview"
                          style={{ backgroundColor: selectedZone.borderColor }}
                        ></div>
                      </div>
                    </div>

                    <div className="zone-designer-tab-form-group">
                      <label className="zone-designer-tab-label">
                        Độ mờ: {(selectedZone.opacity * 100).toFixed(0)}%
                      </label>
                      <Form.Range
                        min={0.3}
                        max={1}
                        step={0.1}
                        value={selectedZone.opacity}
                        onChange={(e) => updateZoneProperty(selectedId!, 'opacity', parseFloat(e.target.value))}
                        className="zone-designer-tab-range"
                      />
                    </div>

                    <div className="zone-designer-tab-form-group">
                      <Form.Check
                        type="checkbox"
                        label="Hiển thị tên trên sơ đồ"
                        checked={selectedZone.labelVisible}
                        onChange={(e) => updateZoneProperty(selectedId!, 'labelVisible', e.target.checked)}
                        className="zone-designer-tab-checkbox"
                      />
                    </div>

                    <div className="zone-designer-tab-form-group">
                      <Button
                        variant={selectedZone.isSelected ? "warning" : "success"}
                        onClick={() => toggleZoneSelection(selectedZone.templateId)}
                        className={`zone-designer-tab-toggle-button ${selectedZone.isSelected ? 'zone-designer-tab-toggle-remove' : 'zone-designer-tab-toggle-add'
                          }`}
                      >
                        <i className={`fas fa-${selectedZone.isSelected ? 'minus' : 'plus'}`}></i>
                        {selectedZone.isSelected ?
                          (isEditMode ? 'Bỏ khỏi sự kiện' : 'Bỏ chọn khu vực') :
                          (isEditMode ? 'Thêm vào sự kiện' : 'Chọn khu vực')
                        }
                      </Button>
                    </div>
                  </Form>
                </div>
              )}

              {/* Zone List */}
              <div className="zone-designer-tab-section">
                <h6 className="zone-designer-tab-section-title">
                  <i className="fas fa-list"></i>
                  Danh sách mẫu ({zoneTemplates.length})
                </h6>

                <div className="zone-designer-tab-zone-list">
                  {zoneTemplates.map((zone) => (
                    <div
                      key={zone.id}
                      className={`zone-designer-tab-zone-item ${selectedId === zone.id ? 'zone-designer-tab-zone-item-selected' : ''
                        } ${zone.isSelected ? 'zone-designer-tab-zone-item-active' : 'zone-designer-tab-zone-item-inactive'
                        }`}
                      onClick={() => setSelectedId(zone.id)}
                      onDoubleClick={() => toggleZoneSelection(zone.templateId)}
                    >
                      <div className="zone-designer-tab-zone-item-content">
                        <div className="zone-designer-tab-zone-item-checkbox">
                          <Form.Check
                            type="checkbox"
                            checked={zone.isSelected}
                            onChange={() => toggleZoneSelection(zone.templateId)}
                            onClick={(e) => e.stopPropagation()}
                            className="zone-designer-tab-item-checkbox"
                          />
                        </div>

                        <div className="zone-designer-tab-zone-item-icon">
                          <i className={`fas fa-${zone.type === 'rectangle' || zone.type === 'square' ? 'square' :
                              zone.type === 'circle' ? 'circle' :
                                zone.type === 'triangle' ? 'play' : 'square'
                            } zone-designer-tab-icon`}></i>
                        </div>

                        <div className="zone-designer-tab-zone-item-info">
                          <div className="zone-designer-tab-zone-item-name">{zone.name}</div>
                          {zone.name !== zone.tenGoc && (
                            <div className="zone-designer-tab-zone-item-original">({zone.tenGoc})</div>
                          )}
                          <div className="zone-designer-tab-zone-item-type">{zone.type}</div>
                        </div>

                        <div
                          className="zone-designer-tab-zone-item-color"
                          style={{ backgroundColor: zone.borderColor }}
                        ></div>
                      </div>

                      {zone.isSelected && (
                        <div className="zone-designer-tab-zone-item-badge">
                          <i className="fas fa-check"></i>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="zone-designer-tab-list-help">
                  <small className="zone-designer-tab-help-text">
                    <i className="fas fa-info-circle"></i>
                    {isEditMode ?
                      'Nhấp đúp để thêm/bỏ khu vực khỏi sự kiện' :
                      'Nhấp đúp để chọn/bỏ chọn khu vực'
                    }
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Canvas Area */}
        <Col lg={8} xl={9} className="zone-designer-tab-canvas-col">
          <Card className="zone-designer-tab-card zone-designer-tab-canvas-card">
            <Card.Header className="zone-designer-tab-card-header">
              <div className="zone-designer-tab-canvas-header">
                <h6 className="zone-designer-tab-header-title">
                  <i className="fas fa-map zone-designer-tab-header-icon"></i>
                  {isEditMode ? 'Sơ đồ khu vực hiện tại' : 'Sơ đồ khu vực sự kiện'}
                </h6>
                <div className="zone-designer-tab-canvas-info">
                  <Badge
                    bg={selectedZonesCount > 0 ? "success" : "secondary"}
                    className="zone-designer-tab-info-badge"
                  >
                    <i className="fas fa-check"></i>
                    {selectedZonesCount} {isEditMode ? 'trong sự kiện' : 'đã chọn'}
                  </Badge>
                  <Badge bg="secondary" className="zone-designer-tab-info-badge">
                    <i className="fas fa-clock"></i>
                    {zoneTemplates.length - selectedZonesCount} {isEditMode ? 'có thể thêm' : 'chưa chọn'}
                  </Badge>
                </div>
              </div>
            </Card.Header>

            <Card.Body className="zone-designer-tab-canvas-body">
              <div className="zone-designer-tab-canvas-instructions">
                <div className="zone-designer-tab-instruction-item">
                  <i className="fas fa-mouse-pointer zone-designer-tab-instruction-icon"></i>
                  <span>Nhấp để chọn khu vực</span>
                </div>
                <div className="zone-designer-tab-instruction-item">
                  <i className="fas fa-hand-pointer zone-designer-tab-instruction-icon"></i>
                  <span>
                    {isEditMode ?
                      'Nhấp vào khu vực để thêm/bỏ' :
                      'Nhấp vào khu vực để chọn/bỏ chọn'
                    }
                  </span>
                </div>
                <div className="zone-designer-tab-instruction-item">
                  <i className="fas fa-arrows-alt zone-designer-tab-instruction-icon"></i>
                  <span>Kéo thả để di chuyển</span>
                </div>
              </div>

              <div className="zone-designer-tab-canvas-wrapper">
                <Stage
                  width={canvas.width}
                  height={canvas.height}
                  ref={stageRef}
                  onMouseDown={handleStageMouseDown}
                  className="zone-designer-tab-stage"
                >
                  <Layer ref={layerRef}>
                    {canvas.gridVisible && (
                      <>
                        {Array.from({ length: Math.ceil(canvas.width / canvas.gridSize) }, (_, i) => (
                          <Line
                            key={`v-${i}`}
                            points={[i * canvas.gridSize, 0, i * canvas.gridSize, canvas.height]}
                            stroke="rgba(0, 0, 0, 0.1)"
                            strokeWidth={1}
                          />
                        ))}
                        {Array.from({ length: Math.ceil(canvas.height / canvas.gridSize) }, (_, i) => (
                          <Line
                            key={`h-${i}`}
                            points={[0, i * canvas.gridSize, canvas.width, i * canvas.gridSize]}
                            stroke="rgba(0, 0, 0, 0.1)"
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

      {/* Selected Zones Summary */}
      {zones.length > 0 && (
        <div className="zone-designer-tab-summary">
          <Card className="zone-designer-tab-card zone-designer-tab-summary-card">
            <Card.Header className="zone-designer-tab-card-header">
              <h6 className="zone-designer-tab-header-title">
                <i className="fas fa-check-circle zone-designer-tab-header-icon"></i>
                {isEditMode ?
                  `Khu vực trong sự kiện (${zones.length})` :
                  `Khu vực đã chọn (${zones.length})`
                }
              </h6>
            </Card.Header>
            <Card.Body className="zone-designer-tab-summary-body">
              <div className="zone-designer-tab-summary-grid">
                {zones.map((zone, index) => {
                  const template = mockTemplates.find(t => t.maKhuVucMau === zone.maKhuVucMau);
                  const displayName = zone.tenTuyChon || template?.tenKhuVuc || 'Unknown';
                  return (
                    <div key={index} className="zone-designer-tab-summary-item">
                      <div className="zone-designer-tab-summary-item-header">
                        <i className="fas fa-map-marker-alt zone-designer-tab-summary-icon"></i>
                        <span className="zone-designer-tab-summary-name">{displayName}</span>
                      </div>
                      <div className="zone-designer-tab-summary-details">
                        <small className="zone-designer-tab-summary-template">
                          Mẫu: {template?.tenKhuVuc}
                        </small>
                        <small className="zone-designer-tab-summary-position">
                          {zone.viTri}
                        </small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ZoneDesignerTab;