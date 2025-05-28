import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, RegularPolygon, Line, Text, Transformer } from 'react-konva';
import Konva from 'konva';
import { Container, Row, Col, Card, Form, Button, ButtonGroup } from 'react-bootstrap';
import axios from 'axios';
import './styles/InteractiveZoneDesigner.css';
import { ZoneCanvas, ZoneDesignData, ZoneShape } from '../../../types/ZoneTypes';

interface InteractiveZoneDesignerProps {
    eventId?: string;
    initialData?: ZoneDesignData;
    onSave?: (data: ZoneDesignData) => void;
    readOnly?: boolean;
}

const InteractiveZoneDesigner: React.FC<InteractiveZoneDesignerProps> = ({
    eventId,
    initialData,
    onSave,
    readOnly = false
}) => {
    // States
    const [zones, setZones] = useState<ZoneShape[]>(initialData?.zones || []);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedTool, setSelectedTool] = useState<'select' | 'rectangle' | 'square' | 'circle' | 'triangle'>('select');
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
    const [isDrawing, setIsDrawing] = useState(false);
    const [newZoneStart, setNewZoneStart] = useState<{ x: number; y: number } | null>(null);

    // Refs
    const stageRef = useRef<Konva.Stage>(null);
    const layerRef = useRef<Konva.Layer>(null);
    const transformerRef = useRef<Konva.Transformer>(null);

    // Universe colors for zones
    const universeColors = [
        { fill: "rgba(167, 135, 255, 0.3)", stroke: "#a787ff" },
        { fill: "rgba(0, 247, 255, 0.3)", stroke: "#00f7ff" },
        { fill: "rgba(22, 169, 34, 0.3)", stroke: "#16a922" },
        { fill: "rgba(255, 87, 87, 0.3)", stroke: "#ff5757" },
        { fill: "rgba(255, 193, 7, 0.3)", stroke: "#ffc107" },
        { fill: "rgba(255, 105, 180, 0.3)", stroke: "#ff69b4" },
        { fill: "rgba(138, 43, 226, 0.3)", stroke: "#8a2be2" },
        { fill: "rgba(0, 255, 127, 0.3)", stroke: "#00ff7f" }
    ];

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

    // Generate unique ID for zones
    const generateZoneId = () => `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create new zone
    const createZone = useCallback((type: ZoneShape['type'], x: number, y: number, width: number, height: number) => {
        const colorIndex = zones.length % universeColors.length;
        const newZone: ZoneShape = {
            id: generateZoneId(),
            type,
            name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${zones.length + 1}`,
            position: { x, y },
            size: { width: Math.max(width, 50), height: Math.max(height, 50) },
            rotation: 0,
            color: universeColors[colorIndex].fill,
            borderColor: universeColors[colorIndex].stroke,
            borderWidth: 2,
            opacity: 0.8,
            visible: true,
            locked: false,
            zIndex: zones.length,
            labelVisible: true,
            labelPosition: 'center',
            properties: type === 'circle' ? { radius: Math.max(width, height) / 2 } : {}
        };

        setZones(prev => [...prev, newZone]);
        setSelectedId(newZone.id);
        return newZone;
    }, [zones.length, universeColors]);

    // Handle stage mouse down
    const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (readOnly) return;

        const stage = e.target.getStage();
        if (!stage) return;

        const pos = stage.getPointerPosition();
        if (!pos) return;

        // If clicking on stage background
        if (e.target === stage) {
            if (selectedTool !== 'select') {
                setIsDrawing(true);
                setNewZoneStart(pos);
            } else {
                setSelectedId(null);
            }
            return;
        }

        // If clicking on a zone
        const clickedId = e.target.id();
        if (clickedId && zones.find(z => z.id === clickedId)) {
            setSelectedId(clickedId);
            setSelectedTool('select');
        }
    };

    // Handle stage mouse move
    const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isDrawing || !newZoneStart || selectedTool === 'select' || readOnly) return;

        const stage = e.target.getStage();
        if (!stage) return;

        const pos = stage.getPointerPosition();
        if (!pos) return;

        // Update preview (you can implement preview rendering here)
    };

    // Handle stage mouse up
    const handleStageMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isDrawing || !newZoneStart || selectedTool === 'select' || readOnly) return;

        const stage = e.target.getStage();
        if (!stage) return;

        const pos = stage.getPointerPosition();
        if (!pos) return;

        const width = Math.abs(pos.x - newZoneStart.x);
        const height = Math.abs(pos.y - newZoneStart.y);

        if (width > 10 && height > 10) {
            const x = Math.min(newZoneStart.x, pos.x);
            const y = Math.min(newZoneStart.y, pos.y);

            createZone(selectedTool, x, y, width, height);
        }

        setIsDrawing(false);
        setNewZoneStart(null);
        setSelectedTool('select');
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

        setZones(prev =>
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

    // Delete selected zone
    const deleteSelectedZone = () => {
        if (selectedId) {
            setZones(prev => prev.filter(zone => zone.id !== selectedId));
            setSelectedId(null);
        }
    };

    // Update zone property
    const updateZoneProperty = (id: string, property: keyof ZoneShape, value: any) => {
        setZones(prev =>
            prev.map(zone =>
                zone.id === id ? { ...zone, [property]: value } : zone
            )
        );
    };

    // Save zones data
    const saveZonesData = async () => {
        const zoneData: ZoneDesignData = {
            eventId: '',
            canvasSettings: canvas,
            zones,
            version: 1,
            lastModified: new Date()
        };

            console.log(zoneData)
        try {
            const response = await axios.post(`/api/sukien/${eventId}/zones`, zoneData);
            onSave?.(zoneData);
            alert('Đã lưu thiết kế khu vực thành công!');
        } catch (error) {
            console.error('Lỗi khi lưu thiết kế:', error);
            alert('Có lỗi xảy ra khi lưu thiết kế.');
        }
    };

    // Get selected zone
    const selectedZone = zones.find(zone => zone.id === selectedId);

    // Render shape on canvas
    const renderShape = (zone: ZoneShape) => {
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
                    </React.Fragment>
                );

            default:
                return null;
        }
    };

    return (
        <Container fluid className="interactive-zone-designer">
            <Row className="h-100">
                {/* Toolbar */}
                <Col md={3} className="zone-designer-sidebar">
                    <Card className="universe-card h-100">
                        <Card.Header className="universe-card-header">
                            <h5><i className="fas fa-tools"></i> Công cụ thiết kế</h5>
                        </Card.Header>
                        <Card.Body className="p-3">
                            {!readOnly && (
                                <>
                                    {/* Tool Selection */}
                                    <div className="tool-section mb-4">
                                        <h6 className="section-title">Công cụ</h6>
                                        <ButtonGroup vertical className="w-100">
                                            <Button
                                                variant={selectedTool === 'select' ? 'primary' : 'outline-primary'}
                                                onClick={() => setSelectedTool('select')}
                                                className="universe-btn"
                                            >
                                                <i className="fas fa-mouse-pointer"></i> Chọn
                                            </Button>
                                            <Button
                                                variant={selectedTool === 'rectangle' ? 'primary' : 'outline-primary'}
                                                onClick={() => setSelectedTool('rectangle')}
                                                className="universe-btn"
                                            >
                                                <i className="fas fa-square"></i> Hình chữ nhật
                                            </Button>
                                            <Button
                                                variant={selectedTool === 'square' ? 'primary' : 'outline-primary'}
                                                onClick={() => setSelectedTool('square')}
                                                className="universe-btn"
                                            >
                                                <i className="fas fa-stop"></i> Hình vuông
                                            </Button>
                                            <Button
                                                variant={selectedTool === 'circle' ? 'primary' : 'outline-primary'}
                                                onClick={() => setSelectedTool('circle')}
                                                className="universe-btn"
                                            >
                                                <i className="fas fa-circle"></i> Hình tròn
                                            </Button>
                                            <Button
                                                variant={selectedTool === 'triangle' ? 'primary' : 'outline-primary'}
                                                onClick={() => setSelectedTool('triangle')}
                                                className="universe-btn"
                                            >
                                                <i className="fas fa-play"></i> Tam giác
                                            </Button>
                                        </ButtonGroup>
                                    </div>

                                    {/* Zone Properties */}
                                    {selectedZone && (
                                        <div className="zone-properties">
                                            <h6 className="section-title">Thuộc tính khu vực</h6>
                                            <Form>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Tên khu vực</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={selectedZone.name}
                                                        onChange={(e) => updateZoneProperty(selectedId!, 'name', e.target.value)}
                                                        className="universe-input"
                                                    />
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>Màu nền</Form.Label>
                                                    <Form.Control
                                                        type="color"
                                                        value={selectedZone.color.replace('rgba(', '#').replace(/,.*/, '')}
                                                        onChange={(e) => {
                                                            const color = e.target.value;
                                                            const rgba = `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.3)`;
                                                            updateZoneProperty(selectedId!, 'color', rgba);
                                                        }}
                                                        className="universe-input"
                                                    />
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>Độ mờ: {(selectedZone.opacity * 100).toFixed(0)}%</Form.Label>
                                                    <Form.Range
                                                        min={0.1}
                                                        max={1}
                                                        step={0.1}
                                                        value={selectedZone.opacity}
                                                        onChange={(e) => updateZoneProperty(selectedId!, 'opacity', parseFloat(e.target.value))}
                                                        className="universe-range"
                                                    />
                                                </Form.Group>

                                                <Form.Check
                                                    type="checkbox"
                                                    label="Hiển thị tên"
                                                    checked={selectedZone.labelVisible}
                                                    onChange={(e) => updateZoneProperty(selectedId!, 'labelVisible', e.target.checked)}
                                                    className="universe-checkbox mb-3"
                                                />

                                                <Button
                                                    variant="danger"
                                                    onClick={deleteSelectedZone}
                                                    className="universe-btn w-100"
                                                >
                                                    <i className="fas fa-trash"></i> Xóa khu vực
                                                </Button>
                                            </Form>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="zone-actions mt-4">
                                        <Button
                                            variant="success"
                                            onClick={saveZonesData}
                                            className="universe-btn w-100 mb-2"
                                            disabled={zones.length === 0}
                                        >
                                            <i className="fas fa-save"></i> Lưu thiết kế
                                        </Button>
                                    </div>
                                </>
                            )}

                            {/* Zone List */}
                            <div className="zone-list mt-4">
                                <h6 className="section-title">Danh sách khu vực ({zones.length})</h6>
                                <div className="zone-list-container">
                                    {zones.map((zone) => (
                                        <div
                                            key={zone.id}
                                            className={`zone-list-item ${selectedId === zone.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedId(zone.id)}
                                        >
                                            <div className="zone-icon">
                                                <i className={`fas fa-${zone.type === 'rectangle' ? 'square' : zone.type === 'circle' ? 'circle' : zone.type === 'triangle' ? 'play' : 'square'}`}></i>
                                            </div>
                                            <div className="zone-info">
                                                <div className="zone-name">{zone.name}</div>
                                                <div className="zone-type">{zone.type}</div>
                                            </div>
                                            <div className="zone-color" style={{ backgroundColor: zone.borderColor }}></div>
                                        </div>
                                    ))}
                                    {zones.length === 0 && (
                                        <div className="no-zones">
                                            <i className="fas fa-info-circle"></i>
                                            <span>Chưa có khu vực nào</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Canvas */}
                <Col md={9} className="zone-canvas-container">
                    <Card className="universe-card h-100">
                        <Card.Header className="universe-card-header">
                            <h5><i className="fas fa-map"></i> Thiết kế sơ đồ khu vực</h5>
                            <div className="canvas-controls">
                                <span className="selected-tool">
                                    Công cụ: <strong>{selectedTool === 'select' ? 'Chọn' : selectedTool}</strong>
                                </span>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-2">
                            <div className="stage-container">
                                <Stage
                                    width={canvas.width}
                                    height={canvas.height}
                                    ref={stageRef}
                                    onMouseDown={handleStageMouseDown}
                                    onMouseMove={handleStageMouseMove}
                                    onMouseUp={handleStageMouseUp}
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

                                        {/* Render all zones */}
                                        {zones.filter(zone => zone.visible).map(renderShape)}

                                        {/* Transformer for selected zone */}
                                        {!readOnly && (
                                            <Transformer
                                                ref={transformerRef}
                                                boundBoxFunc={(oldBox, newBox) => {
                                                    // Limit resize
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