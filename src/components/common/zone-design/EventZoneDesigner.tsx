import React, { useRef, useState, useEffect } from "react";
import Konva from "konva";
import { Stage, Layer, Rect, Text } from "react-konva";
import axios from "axios";
import { Container } from "react-bootstrap";
import "./Zone.css";
import EventZoneViewer from "./EventZoneViewer";
import DefaultView from "./DefaultView";

interface ZoneData {
  id: string;
  name: string;
  position: string;
  attributes: {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
  };
}

const ZoneDesigner: React.FC = () => {
  // Zone styling based on universe galaxy theme
  const universeColors = [
    { fill: "rgba(167, 135, 255, 0.2)", stroke: "#a787ff" }, // Primary
    { fill: "rgba(0, 247, 255, 0.2)", stroke: "#00f7ff" },   // Secondary 
    { fill: "rgba(22, 169, 34, 0.2)", stroke: "#16a922" },   // Success
    { fill: "rgba(255, 87, 87, 0.2)", stroke: "#ff5757" },   // Error/Danger
    { fill: "rgba(255, 193, 7, 0.2)", stroke: "#ffc107" }    // Warning
  ];

  const [zones, setZones] = useState<ZoneData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newZoneName, setNewZoneName] = useState<string>("");
  const [newZonePosition, setNewZonePosition] = useState<string>("");
  const [stageScale, setStageScale] = useState({ x: 1, y: 1 });
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);

  // Update transformer on selection change
  useEffect(() => {
    if (selectedId && layerRef.current) {
      layerRef.current.batchDraw();
    }
  }, [selectedId]);

  // Add a new zone
  const addZone = () => {
    if (!newZoneName || !newZonePosition) {
      alert("Vui lòng nhập tên khu vực và vị trí!");
      return;
    }

    const colorIndex = zones.length % universeColors.length;
    const newZone: ZoneData = {
      id: Math.floor(Math.random() * (233223 - 2 + 1) + 2).toString(),
      name: newZoneName,
      position: newZonePosition,
      attributes: {
        x: 100 + zones.length * 30,
        y: 100 + zones.length * 30,
        width: 200,
        height: 100,
        fill: universeColors[colorIndex].fill,
        stroke: universeColors[colorIndex].stroke,
        strokeWidth: 2
      }
    };

    setZones([...zones, newZone]);
    setNewZoneName("");
    setNewZonePosition("");
  };

  // Remove selected zone
  const removeSelectedZone = () => {
    if (selectedId) {
      setZones(zones.filter(zone => zone.id !== selectedId));
      setSelectedId(null);
    }
  };

  // Update zone attributes on drag or resize
  const handleTransform = (id: string, newAttrs: any) => {
    setZones(
      zones.map(zone => {
        if (zone.id === id) {
          return {
            ...zone,
            attributes: {
              ...zone.attributes,
              ...newAttrs
            }
          };
        }
        return zone;
      })
    );
  };

  // Save all zones
  const saveZones = async () => {
    if (!stageRef.current || zones.length === 0) {
      alert("Không có khu vực nào để lưu!");
      return;
    }

    // Prepare data for saving
    const zoneData = zones.map(zone => ({
      tenKhuVuc: zone.name,
      viTri: zone.position,
      layoutData: JSON.stringify({
        id: zone.id,
        attrs: zone.attributes
      })
    }));

    try {
      // Send each zone individually or as a batch
      const response = await axios.post("/api/khuvuc/batch", zoneData);
      alert(`Đã lưu ${zones.length} khu vực thành công!`);
    } catch (error) {
      console.error("Lỗi khi lưu khu vực:", error);
      alert("Có lỗi xảy ra khi lưu khu vực.");
    }
  };

  // Handle zooming with mouse wheel
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
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

  // Handle stage drag
  const handleDragStart = () => {
    setSelectedId(null);
  };

  return (
    <Container className="zone-designer-container">
      <div className="zone-designer-wrapper">
        <h1 className="page-title">Thiết kế sơ đồ khu vực</h1>
        
        {/* Form to add new zone */}
        <div className="zone-form">
          <div className="form-content">
            <div className="form-group">
              <label>
                Tên khu vực:
                <input
                  type="text"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="Nhập tên khu vực"
                />
              </label>
            </div>
            
            <div className="form-group">
              <label>
                Vị trí:
                <input
                  type="text"
                  value={newZonePosition}
                  onChange={(e) => setNewZonePosition(e.target.value)}
                  placeholder="Nhập vị trí (Trước/Sau sân khấu)"
                />
              </label>
            </div>
          </div>
          
          <div className="form-actions">
            <button className="universe-btn add-btn" onClick={addZone}>
              <i className="fas fa-plus-circle"></i> Thêm khu vực
            </button>
            <button 
              className="universe-btn remove-btn" 
              onClick={removeSelectedZone} 
              disabled={!selectedId}
            >
              <i className="fas fa-trash-alt"></i> Xóa khu vực đã chọn
            </button>
          </div>
        </div>
        
        {/* List of existing zones */}
        <div className="zones-list-section">
          <h3>
            <i className="fas fa-map-marked-alt"></i> Danh sách khu vực
          </h3>
          <div className="zones-list-table">
            <table>
              <thead>
                <tr>
                  <th>Tên khu vực</th>
                  <th>Vị trí</th>
                  <th>Màu sắc</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => (
                  <tr 
                    key={zone.id} 
                    className={selectedId === zone.id ? "selected" : ""}
                    onClick={() => setSelectedId(zone.id)}
                  >
                    <td>{zone.name}</td>
                    <td>{zone.position}</td>
                    <td>
                      <div 
                        className="color-box" 
                        style={{ 
                          backgroundColor: zone.attributes.fill,
                          border: `1px solid ${zone.attributes.stroke}`
                        }}
                      ></div>
                    </td>
                  </tr>
                ))}
                {zones.length === 0 && (
                  <tr>
                    <td colSpan={3} className="no-zones">
                      <i className="fas fa-info-circle"></i> Chưa có khu vực nào được tạo
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Stage for visual design */}
        <div className="stage-container">
          <div className="stage-legend">
            <div className="legend-item">
              <i className="fas fa-mouse-pointer"></i> Click để chọn khu vực
            </div>
            <div className="legend-item">
              <i className="fas fa-arrows-alt"></i> Kéo để di chuyển khu vực
            </div>
            <div className="legend-item">
              <i className="fas fa-expand-arrows-alt"></i> 8 điểm điều khiển để co dãn
            </div>
            <div className="legend-item">
              <i className="fas fa-search-plus"></i> Scroll để phóng to/thu nhỏ
            </div>
          </div>

          <Stage
            width={800}
            height={600}
            ref={stageRef}
            onWheel={handleWheel}
            scaleX={stageScale.x}
            scaleY={stageScale.y}
            x={stagePosition.x}
            y={stagePosition.y}
            draggable
            onDragStart={handleDragStart}
            onMouseDown={(e) => {
              // Check if clicked on stage but not on a rectangle
              const clickedOnEmpty = e.target === e.target.getStage();
              if (clickedOnEmpty) {
                setSelectedId(null);
              }
            }}
          >
            <Layer ref={layerRef}>
              {/* Background grid pattern */}
              <Rect
                width={5000}
                height={5000}
                x={-2500}
                y={-2500}
                fill="#000"
                perfectDrawEnabled={false}
              />
              
              {zones.map((zone) => {
                const isSelected = selectedId === zone.id;
                return (
                  <React.Fragment key={zone.id}>
                    <Rect
                      id={zone.id}
                      x={zone.attributes.x}
                      y={zone.attributes.y}
                      width={zone.attributes.width}
                      height={zone.attributes.height}
                      fill={zone.attributes.fill}
                      stroke={isSelected ? "#ffffff" : zone.attributes.stroke}
                      strokeWidth={isSelected ? 3 : zone.attributes.strokeWidth}
                      shadowColor={isSelected ? "rgba(167, 135, 255, 0.8)" : "transparent"}
                      shadowBlur={isSelected ? 10 : 0}
                      shadowOffset={{ x: 0, y: 0 }}
                      shadowOpacity={0.8}
                      cornerRadius={6}
                      draggable
                      onClick={() => {
                        setSelectedId(zone.id);
                      }}
                      onTap={() => {
                        setSelectedId(zone.id);
                      }}
                      onDragEnd={(e) => {
                        handleTransform(zone.id, {
                          x: e.target.x(),
                          y: e.target.y()
                        });
                      }}
                      onTransform={(e) => {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();
                        
                        node.scaleX(1);
                        node.scaleY(1);
                        
                        handleTransform(zone.id, {
                          x: node.x(),
                          y: node.y(),
                          width: Math.max(30, node.width() * scaleX),
                          height: Math.max(30, node.height() * scaleY)
                        });
                      }}
                    />
                    
                    {/* Zone Label */}
                    <Text
                      x={zone.attributes.x + 10}
                      y={zone.attributes.y + 10}
                      text={zone.name}
                      fill={zone.attributes.stroke}
                      fontSize={16}
                      fontStyle="bold"
                      shadowColor="#000"
                      shadowBlur={3}
                      shadowOffset={{ x: 1, y: 1 }}
                      shadowOpacity={0.8}
                      perfectDrawEnabled={false}
                      listening={false}
                    />
                    
                    {/* Zone Position Label */}
                    <Text
                      x={zone.attributes.x + 10}
                      y={zone.attributes.y + 30}
                      text={zone.position}
                      fill="#ffffff"
                      fontSize={12}
                      shadowColor="#000"
                      shadowBlur={3}
                      shadowOffset={{ x: 1, y: 1 }}
                      shadowOpacity={0.8}
                      perfectDrawEnabled={false}
                      listening={false}
                    />
                    
                    {/* Transformer handles if selected */}
                    {isSelected && (
                      <React.Fragment>
                        {/* Custom transform handles */}
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                          let x = zone.attributes.x;
                          let y = zone.attributes.y;
                          const width = zone.attributes.width;
                          const height = zone.attributes.height;
                          
                          // Calculate handle position
                          switch (i) {
                            case 0: // top-left
                              break;
                            case 1: // top-center
                              x += width / 2;
                              break;
                            case 2: // top-right
                              x += width;
                              break;
                            case 3: // middle-right
                              x += width;
                              y += height / 2;
                              break;
                            case 4: // bottom-right
                              x += width;
                              y += height;
                              break;
                            case 5: // bottom-center
                              x += width / 2;
                              y += height;
                              break;
                            case 6: // bottom-left
                              y += height;
                              break;
                            case 7: // middle-left
                              y += height / 2;
                              break;
                          }
                          
                          return (
                            <Rect
                              key={i}
                              x={x - 5}
                              y={y - 5}
                              width={10}
                              height={10}
                              fill="#a787ff"
                              stroke="#ffffff"
                              strokeWidth={1}
                              perfectDrawEnabled={false}
                            />
                          );
                        })}
                      </React.Fragment>
                    )}
                  </React.Fragment>
                );
              })}
            </Layer>
          </Stage>
        </div>
        
        <div className="zone-actions">
          <button className="universe-btn save-btn" onClick={saveZones}>
            <i className="fas fa-save"></i> Lưu tất cả khu vực
          </button>
        </div>
        
        {/* Guide section */}
        <div className="help-section">
          <h4><i className="fas fa-question-circle"></i> Hướng dẫn:</h4>
          <div className="help-content">
            <ul>
              <li><i className="fas fa-plus"></i> Thêm khu vực mới bằng form bên trên</li>
              <li><i className="fas fa-hand-pointer"></i> Chọn khu vực bằng cách click vào nó</li>
              <li><i className="fas fa-arrows-alt"></i> Kéo khu vực để di chuyển vị trí</li>
              <li><i className="fas fa-expand"></i> Kéo các điểm điều khiển (khi đã chọn) để thay đổi kích thước</li>
              <li><i className="fas fa-trash"></i> Bấm "Xóa khu vực đã chọn" để xóa khu vực hiện tại</li>
              <li><i className="fas fa-save"></i> Bấm "Lưu tất cả khu vực" khi hoàn thành</li>
            </ul>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ZoneDesigner;