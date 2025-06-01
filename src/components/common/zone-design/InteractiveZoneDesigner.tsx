import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, RegularPolygon, Line, Text, Transformer } from 'react-konva';
import Konva from 'konva';
import { Container, Row, Col, Card, Form, Button, ButtonGroup, Badge } from 'react-bootstrap';
import axios from 'axios';
import './styles/InteractiveZoneDesigner.css';
import { ZoneCanvas, ZoneDesignData, ZoneShape } from '../../../types/ZoneTypes';
import DefaultZoneService from '../../../api/DefaultZoneService';

interface InteractiveZoneDesignerProps {
    eventId?: string;
    initialData?: ZoneDesignData;
    onSave?: (data: ZoneDesignData) => void;
    onZonesChange?: (zones: ZoneShape[]) => void;
    readOnly?: boolean;
}

export interface KhuVucTemplate {
    maTemplate: string;
    tenKhuVuc: string;
    moTa: string;
    mauSac: string;
    hinhDang: string;
    thuTuHienThi: number;
    hoatDong: boolean;
    toaDoXMacDinh?: number;
    toaDoYMacDinh?: number;
    chieuRongMacDinh?: number;
    chieuCaoMacDinh?: number;
}

interface ZoneTemplate extends ZoneShape {
    templateId: string;
    isSelected: boolean; // Whether user wants to use this zone
    tenGoc: string; // Original template name
}

const InteractiveZoneDesigner: React.FC<InteractiveZoneDesignerProps> = ({
    eventId,
    initialData,
    onSave,
    onZonesChange,
    readOnly = false
}) => {
    // States
    const [zoneTemplates, setZoneTemplates] = useState<ZoneTemplate[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [mockTemplates, setMockTemplates] = useState<KhuVucTemplate[]>([]);
    const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);
    const [canvas, setCanvas] = useState<ZoneCanvas>(
        initialData?.canvasSettings || {
            width: 1000,
            height: 700,
            scale: 1,
            offsetX: 0,
            offsetY: 0,
            gridVisible: true,
            snapToGrid: true,
            gridSize: 20
        }
    );

    const [isLoading, setIsLoading] = useState(true);

    // Refs
    const stageRef = useRef<Konva.Stage>(null);
    const layerRef = useRef<Konva.Layer>(null);
    const transformerRef = useRef<Konva.Transformer>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await DefaultZoneService.getAll();
            setMockTemplates(data);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setNotification({
                message: 'Không thể tải danh sách địa điểm',
                type: 'danger'
            });
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
        const convertedTemplates: ZoneTemplate[] = mockTemplates.map((template) => ({
            id: `template_${template.maTemplate}`,
            templateId: template.maTemplate,
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

    useEffect(() => {
        const selectedZones = zoneTemplates.filter(zone => zone.isSelected);
        onZonesChange?.(selectedZones);
    }, [zoneTemplates, onZonesChange]);

    // Update transformer when selection changes
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

    // Toggle zone selection for event
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

    // Handle zone transform
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

    // Handle stage mouse down
    const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (readOnly) return;

        const stage = e.target.getStage();
        if (!stage) return;

        // If clicking on stage background
        if (e.target === stage) {
            setSelectedId(null);
            return;
        }

        // If clicking on a zone
        const clickedId = e.target.id();
        if (clickedId && zoneTemplates.find(z => z.id === clickedId)) {
            setSelectedId(clickedId);
        }
    };

    // Update zone property
    const updateZoneProperty = (id: string, property: keyof ZoneTemplate, value: any) => {
        setZoneTemplates(prev =>
            prev.map(zone =>
                zone.id === id ? { ...zone, [property]: value } : zone
            )
        );
    };

    // Reset zone to original template
    const resetZoneToTemplate = (templateId: string) => {
        const originalTemplate = mockTemplates.find(t => t.maTemplate === templateId);
        if (!originalTemplate) return;

        setZoneTemplates(prev =>
            prev.map(zone => {
                if (zone.templateId === templateId) {
                    return {
                        ...zone,
                        name: originalTemplate.tenKhuVuc,
                        color: zone.isSelected
                            ? `${originalTemplate.mauSac}80`
                            : `${originalTemplate.mauSac}40`,
                        borderColor: originalTemplate.mauSac,
                        position: {
                            x: originalTemplate.toaDoXMacDinh || 100,
                            y: originalTemplate.toaDoYMacDinh || 100
                        },
                        size: {
                            width: originalTemplate.chieuRongMacDinh || 200,
                            height: originalTemplate.chieuCaoMacDinh || 150
                        }
                    };
                }
                return zone;
            })
        );
    };

    // Get zones data for saving (only selected zones)
    const getZonesData = (): ZoneDesignData => {
        const selectedZones = zoneTemplates.filter(zone => zone.isSelected);
        return {
            eventId: eventId || '',
            canvasSettings: canvas,
            zones: selectedZones,
            version: 1,
            lastModified: new Date()
        };
    };

    // Save zones data
    const saveZonesData = async () => {
        const zoneData = getZonesData();

        try {
            const response = await axios.post(`/api/sukien/${eventId}/zones`, zoneData);
            onSave?.(zoneData);
            alert('Đã lưu thiết kế khu vực thành công!');
        } catch (error) {
            console.error('Lỗi khi lưu thiết kế:', error);
            alert('Có lỗi xảy ra khi lưu thiết kế.');
        }
    };

    // Select all zones
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

    // Deselect all zones
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

    // Get selected zone
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
            draggable: !readOnly && !zone.locked,
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
                                fontSize={14}
                                fontFamily="Arial"
                                fill="#ffffff"
                                align="center"
                                verticalAlign="middle"
                                offsetX={zone.name.length * 4}
                                offsetY={7}
                            />
                        )}
                        {/* Selection indicator */}
                        {zone.isSelected && (
                            <Text
                                x={zone.position.x + zone.size.width - 15}
                                y={zone.position.y + 5}
                                text="✓"
                                fontSize={16}
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
                                fontSize={14}
                                fontFamily="Arial"
                                fill="#ffffff"
                                align="center"
                                verticalAlign="middle"
                                offsetX={zone.name.length * 4}
                                offsetY={7}
                            />
                        )}
                        {/* Selection indicator */}
                        {zone.isSelected && (
                            <Text
                                x={zone.position.x + 30}
                                y={zone.position.y - 30}
                                text="✓"
                                fontSize={16}
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
                                fontSize={14}
                                fontFamily="Arial"
                                fill="#ffffff"
                                align="center"
                                verticalAlign="middle"
                                offsetX={zone.name.length * 4}
                                offsetY={7}
                            />
                        )}
                        {/* Selection indicator */}
                        {zone.isSelected && (
                            <Text
                                x={zone.position.x + 30}
                                y={zone.position.y - 30}
                                text="✓"
                                fontSize={16}
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
            <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '600px' }}>
                <div className="text-center">
                    <div className="spinner-border mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Đang tải các mẫu khu vực...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="interactive-zone-designer">
            <Row className="h-100">
                {/* Sidebar */}
                <Col md={3} className="zone-designer-sidebar">
                    <Card className="universe-card h-100">
                        <Card.Header className="universe-card-header d-flex justify-content-between align-items-center">
                            <h5><i className="fas fa-tools"></i> Quản lý khu vực</h5>
                            <Badge bg="primary">{selectedZonesCount}/{zoneTemplates.length}</Badge>
                        </Card.Header>
                        <Card.Body className="p-3">
                            {!readOnly && (
                                <>
                                    {/* Quick Actions */}
                                    <div className="quick-actions mb-4">
                                        <h6 className="section-title">Chọn nhanh</h6>
                                        <ButtonGroup className="w-100 mb-2">
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                onClick={selectAllZones}
                                            >
                                                Chọn tất cả
                                            </Button>
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                onClick={deselectAllZones}
                                            >
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
                                                        className="universe-input"
                                                        placeholder={selectedZone.tenGoc}
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
                                                        className="universe-input"
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
                                                        className="universe-range"
                                                    />
                                                </Form.Group>

                                                <Form.Check
                                                    type="checkbox"
                                                    label="Hiển thị tên khu vực"
                                                    checked={selectedZone.labelVisible}
                                                    onChange={(e) => updateZoneProperty(selectedId!, 'labelVisible', e.target.checked)}
                                                    className="universe-checkbox mb-3"
                                                />

                                                <div className="d-grid gap-2">
                                                    <Button
                                                        variant={selectedZone.isSelected ? "warning" : "success"}
                                                        onClick={() => toggleZoneSelection(selectedZone.templateId)}
                                                        className="universe-btn"
                                                    >
                                                        <i className={`fas fa-${selectedZone.isSelected ? 'times' : 'check'}`}></i>
                                                        {selectedZone.isSelected ? ' Bỏ chọn khu vực' : ' Chọn khu vực này'}
                                                    </Button>

                                                    <Button
                                                        variant="outline-secondary"
                                                        onClick={() => resetZoneToTemplate(selectedZone.templateId)}
                                                        size="sm"
                                                    >
                                                        <i className="fas fa-undo"></i> Đặt lại mặc định
                                                    </Button>
                                                </div>
                                            </Form>
                                        </div>
                                    )}

                                    {/* Save Button */}
                                    {eventId && (
                                        <div className="zone-actions mb-4">
                                            <Button
                                                variant="primary"
                                                onClick={saveZonesData}
                                                className="universe-btn w-100"
                                                disabled={selectedZonesCount === 0}
                                            >
                                                <i className="fas fa-save"></i> Lưu thiết kế ({selectedZonesCount} khu vực)
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Zone List */}
                            <div className="zone-list">
                                <h6 className="section-title">Danh sách mẫu khu vực</h6>
                                <div className="zone-list-container">
                                    {zoneTemplates.map((zone) => (
                                        <div
                                            key={zone.id}
                                            className={`zone-list-item ${selectedId === zone.id ? 'selected' : ''} ${zone.isSelected ? 'zone-enabled' : 'zone-disabled'}`}
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
                                    <i className="fas fa-info-circle"></i> Nhấp đúp để chọn/bỏ chọn khu vực
                                </small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Canvas */}
                <Col md={9} className="zone-canvas-container">
                    <Card className="universe-card h-100">
                        <Card.Header className="universe-card-header">
                            <h5><i className="fas fa-map"></i> Sơ đồ khu vực sự kiện</h5>
                            <div className="canvas-info">
                                <Badge bg="success" className="me-2">{selectedZonesCount} đã chọn</Badge>
                                <Badge bg="secondary">{zoneTemplates.length - selectedZonesCount} chưa chọn</Badge>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-2">
                            <div className="canvas-instructions mb-2">
                                <small className="text-muted">
                                    <i className="fas fa-mouse-pointer"></i> Nhấp để chọn khu vực •
                                    <i className="fas fa-hand-pointer ms-2"></i> Nhấp vào khu vực để chọn/bỏ chọn sử dụng •
                                    <i className="fas fa-arrows-alt ms-2"></i> Kéo thả để di chuyển
                                </small>
                            </div>
                            <div className="stage-container">
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

                                        {/* Render all zone templates */}
                                        {zoneTemplates.filter(zone => zone.visible).map(renderShape)}

                                        {/* Transformer for selected zone */}
                                        {!readOnly && (
                                            <Transformer
                                                ref={transformerRef}
                                                boundBoxFunc={(oldBox, newBox) => {
                                                    if (newBox.width < 30 || newBox.height < 30) {
                                                        return oldBox;
                                                    }
                                                    return newBox;
                                                }}
                                            />
                                        )}
                                    </Layer>
                                </Stage>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default InteractiveZoneDesigner;