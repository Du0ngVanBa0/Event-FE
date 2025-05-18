import React, { useRef, useState, useEffect } from "react";
import Konva from "konva";
import { Stage, Layer, Rect, Text } from "react-konva";
import { Container, Row, Col, Card, Tabs, Tab } from "react-bootstrap";
import "./defaultView.css";

// Định nghĩa kiểu dữ liệu
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

interface LoaiVe {
  maLoaiVe: string;
  tenLoaiVe: string;
  moTa?: string;
  soLuong: number;
  giaTien: number;
}

const DefaultView: React.FC = () => {
  // State cho thiết kế và hiển thị zone
  const [activeTab, setActiveTab] = useState<string>("designer");
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newZoneName, setNewZoneName] = useState<string>("");
  const [newZonePosition, setNewZonePosition] = useState<string>("");
  const [stageScale, setStageScale] = useState({ x: 1, y: 1 });
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  
  // State cho tickets
  const [tickets, setTickets] = useState<Record<string, LoaiVe[]>>({});
  const [eventName, setEventName] = useState<string>("Sự kiện âm nhạc Universe");
  const [eventDescription, setEventDescription] = useState<string>("Festival âm nhạc lớn nhất năm với các nghệ sĩ hàng đầu thế giới");
  const [eventDate, setEventDate] = useState<string>(new Date().toISOString());
  
  // Refs
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  
  // Zone styling based on universe galaxy theme
  const universeColors = [
    { fill: "rgba(167, 135, 255, 0.2)", stroke: "#a787ff" }, // Primary
    { fill: "rgba(0, 247, 255, 0.2)", stroke: "#00f7ff" },   // Secondary 
    { fill: "rgba(22, 169, 34, 0.2)", stroke: "#16a922" },   // Success
    { fill: "rgba(255, 87, 87, 0.2)", stroke: "#ff5757" },   // Error/Danger
    { fill: "rgba(255, 193, 7, 0.2)", stroke: "#ffc107" }    // Warning
  ];

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
    const newZoneId = Math.floor(Math.random() * (233223 - 2 + 1) + 2).toString();
    
    const newZone: ZoneData = {
      id: newZoneId,
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
    
    // Add empty ticket list for this zone
    setTickets({
      ...tickets,
      [newZoneId]: []
    });
    
    setNewZoneName("");
    setNewZonePosition("");
  };

  // Remove selected zone
  const removeSelectedZone = () => {
    if (selectedId) {
      setZones(zones.filter(zone => zone.id !== selectedId));
      
      // Remove tickets for this zone
      const newTickets = { ...tickets };
      delete newTickets[selectedId];
      setTickets(newTickets);
      
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

  // Add a new ticket type to a zone
  const addTicket = (zoneId: string) => {
    if (!zoneId) return;
    
    const zoneTickets = tickets[zoneId] || [];
    const newTicket: LoaiVe = {
      maLoaiVe: `lv${Math.floor(Math.random() * 10000)}`,
      tenLoaiVe: "Loại vé mới",
      moTa: "Mô tả loại vé",
      soLuong: 100,
      giaTien: 100000
    };
    
    setTickets({
      ...tickets,
      [zoneId]: [...zoneTickets, newTicket]
    });
  };

  // Edit ticket information
  const editTicket = (zoneId: string, ticketId: string, field: keyof LoaiVe, value: any) => {
    if (!zoneId || !tickets[zoneId]) return;
    
    const updatedTickets = tickets[zoneId].map(ticket => {
      if (ticket.maLoaiVe === ticketId) {
        return {
          ...ticket,
          [field]: value
        };
      }
      return ticket;
    });
    
    setTickets({
      ...tickets,
      [zoneId]: updatedTickets
    });
  };

  // Remove a ticket
  const removeTicket = (zoneId: string, ticketId: string) => {
    if (!zoneId || !tickets[zoneId]) return;
    
    const updatedTickets = tickets[zoneId].filter(ticket => ticket.maLoaiVe !== ticketId);
    
    setTickets({
      ...tickets,
      [zoneId]: updatedTickets
    });
  };

  // Save all data
  const saveData = async () => {
    if (zones.length === 0) {
      alert("Không có khu vực nào để lưu!");
      return;
    }

    // Prepare data for saving
    const eventData = {
      tieuDe: eventName,
      moTa: eventDescription,
      thoiGianBatDau: eventDate,
      khuVucs: zones.map(zone => ({
        tenKhuVuc: zone.name,
        viTri: zone.position,
        layoutData: JSON.stringify({
          id: zone.id,
          attrs: zone.attributes
        }),
        loaiVes: tickets[zone.id] || []
      }))
    };

    try {
      // Giả lập việc gửi dữ liệu đến API
      console.log("Dữ liệu sẽ được gửi đến API:", eventData);
      alert("Đã lưu thành công!");
      
      // Uncomment dòng dưới đây khi có API thực tế
      // const response = await axios.post("/api/sukien", eventData);
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
      alert("Có lỗi xảy ra khi lưu dữ liệu.");
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Render stage with zones
  const renderStage = (isEditable: boolean = true) => {
    return (
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
            x={300}
            y={50}
            width={200}
            height={80}
            fill="rgba(255, 215, 0, 0.2)"
            stroke="#ffd700"
            strokeWidth={2}
            perfectDrawEnabled={false}
          />
          <Text
            x={365}
            y={80}
            text="SÂN KHẤU"
            fill="#ffd700"
            fontSize={16}
            fontStyle="bold"
            perfectDrawEnabled={false}
          />
          
          {/* All zones */}
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
                  draggable={isEditable}
                  onClick={() => {
                    setSelectedId(zone.id);
                  }}
                  onTap={() => {
                    setSelectedId(zone.id);
                  }}
                  onDragEnd={isEditable ? (e) => {
                    handleTransform(zone.id, {
                      x: e.target.x(),
                      y: e.target.y()
                    });
                  } : undefined}
                  onTransform={isEditable ? (e) => {
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
                  } : undefined}
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
                
                {/* Number of tickets available */}
                {tickets[zone.id] && tickets[zone.id].length > 0 && (
                  <Text
                    x={zone.attributes.x + 10}
                    y={zone.attributes.y + 50}
                    text={`${tickets[zone.id].length} loại vé`}
                    fill="#00f7ff"
                    fontSize={12}
                    shadowColor="#000"
                    shadowBlur={3}
                    shadowOffset={{ x: 1, y: 1 }}
                    shadowOpacity={0.8}
                    perfectDrawEnabled={false}
                    listening={false}
                  />
                )}
                
                {/* Transformer handles if selected and editable */}
                {isSelected && isEditable && (
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
    );
  };

  return (
    <Container className="zone-designer-container">
      <div className="zone-designer-wrapper">
        <h1 className="page-title">Quản lý sơ đồ khu vực</h1>
        
        {/* Event information form */}
        <div className="event-info-form">
          <h2 className="section-title">Thông tin sự kiện</h2>
          <Row>
            <Col md={6}>
              <div className="form-group">
                <label>Tên sự kiện:</label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Nhập tên sự kiện"
                />
              </div>
            </Col>
            <Col md={6}>
              <div className="form-group">
                <label>Ngày diễn ra:</label>
                <input
                  type="datetime-local"
                  value={eventDate.slice(0, 16)}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="datetime-input"
                />
              </div>
            </Col>
          </Row>
          <div className="form-group">
            <label>Mô tả:</label>
            <textarea
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="Nhập mô tả sự kiện"
              rows={2}
            />
          </div>
        </div>
        
        {/* Tabs for Designer and Preview */}
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => k && setActiveTab(k)}
          className="universe-tabs mb-4 mt-4"
        >
          <Tab eventKey="designer" title="Thiết kế khu vực">
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
            
            <Row>
              <Col lg={8}>
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
                  
                  {renderStage(true)}
                </div>
              </Col>
              
              <Col lg={4}>
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
                
                {/* Ticket Management for Selected Zone */}
                {selectedId && (
                  <div className="ticket-management">
                    <h3>
                      <i className="fas fa-ticket-alt"></i> Quản lý loại vé
                      <button
                        className="universe-btn add-btn btn-sm"
                        onClick={() => addTicket(selectedId)}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </h3>
                    
                    {tickets[selectedId] && tickets[selectedId].length > 0 ? (
                      <div className="ticket-list">
                        {tickets[selectedId].map((ticket, index) => (
                          <div key={ticket.maLoaiVe} className="ticket-item">
                            <div className="ticket-header">
                              <input
                                type="text"
                                value={ticket.tenLoaiVe}
                                onChange={(e) => editTicket(selectedId, ticket.maLoaiVe, "tenLoaiVe", e.target.value)}
                                className="ticket-name-input"
                                placeholder="Tên loại vé"
                              />
                              <button
                                className="universe-btn remove-btn btn-sm"
                                onClick={() => removeTicket(selectedId, ticket.maLoaiVe)}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                            
                            <div className="ticket-detail">
                              <div className="form-group">
                                <label>Giá:</label>
                                <input
                                  type="number"
                                  value={ticket.giaTien}
                                  onChange={(e) => editTicket(selectedId, ticket.maLoaiVe, "giaTien", parseInt(e.target.value))}
                                  placeholder="Giá vé"
                                />
                              </div>
                              <div className="form-group">
                                <label>Số lượng:</label>
                                <input
                                  type="number"
                                  value={ticket.soLuong}
                                  onChange={(e) => editTicket(selectedId, ticket.maLoaiVe, "soLuong", parseInt(e.target.value))}
                                  placeholder="Số lượng"
                                />
                              </div>
                              <div className="form-group">
                                <label>Mô tả:</label>
                                <textarea
                                  value={ticket.moTa || ""}
                                  onChange={(e) => editTicket(selectedId, ticket.maLoaiVe, "moTa", e.target.value)}
                                  placeholder="Mô tả loại vé"
                                  rows={2}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-tickets">
                        <i className="fas fa-info-circle"></i> Chưa có loại vé nào cho khu vực này
                      </div>
                    )}
                  </div>
                )}
              </Col>
            </Row>
          </Tab>
          
          <Tab eventKey="preview" title="Xem trước">
            <div className="event-preview">
              <div className="event-header">
                <div className="event-info">
                  <h2 className="event-title">{eventName}</h2>
                  <div className="event-meta">
                    <span className="event-time">
                      <i className="fas fa-calendar-alt"></i>
                      {new Date(eventDate).toLocaleString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="event-description">{eventDescription}</p>
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
                      
                      {renderStage(false)}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="zone-details">
                      <div className="zone-selection">
                        <h3>Danh sách khu vực</h3>
                        <div className="zone-list">
                          {zones.map(zone => (
                            <div 
                              key={zone.id}
                              className={`zone-item ${selectedId === zone.id ? 'selected' : ''}`}
                              onClick={() => setSelectedId(zone.id)}
                            >
                              <div className="zone-name">{zone.name}</div>
                              <div className="zone-position">{zone.position}</div>
                            </div>
                          ))}

                          {zones.length === 0 && (
                            <div className="no-zones">
                              <i className="fas fa-info-circle"></i> Không có khu vực nào
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedId && (
                        <div className="ticket-details">
                          <h3>Loại vé có sẵn</h3>
                          <div className="ticket-list">
                            {tickets[selectedId] && tickets[selectedId].length > 0 ? (
                              tickets[selectedId].map(ticket => (
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
                              ))
                            ) : (
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
          </Tab>
        </Tabs>
        
        <div className="zone-actions">
          <button className="universe-btn save-btn" onClick={saveData}>
            <i className="fas fa-save"></i> Lưu tất cả dữ liệu
          </button>
        </div>
      </div>
    </Container>
  );
};

export default DefaultView;