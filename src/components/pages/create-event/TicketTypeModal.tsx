import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { TicketType, KhuVucEventRequest, KhuVucTemplate } from '../../../types/EventTypes';

interface TicketTypeModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (ticket: Omit<TicketType, 'id'>) => void;
    editTicket?: TicketType;
    availableZones: KhuVucEventRequest[];
    usedZones: string[];
    mockTemplates?: KhuVucTemplate[];
}

const TicketTypeModal: React.FC<TicketTypeModalProps> = ({
    show,
    onHide,
    onSave,
    editTicket,
    availableZones,
    usedZones,
    mockTemplates
}) => {
    const [formData, setFormData] = useState<Omit<TicketType, 'id'>>({
        tenLoaiVe: '',
        moTa: '',
        soLuong: 0,
        giaTien: 0,
        soLuongToiThieu: 1,
        soLuongToiDa: 10,
        maKhuVuc: '',
        tenKhuVuc: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const getZoneDisplayName = (zone: KhuVucEventRequest) => {
        if (zone.tenTuyChon && zone.tenTuyChon.trim()!== '') {
            return zone.tenTuyChon;
        }
        
        const template = mockTemplates?.find(t => t.maKhuVucMau === zone.maKhuVucMau);
        return template?.tenKhuVuc || 'Unknown Zone';
    };

    const getZoneKey = (zone: KhuVucEventRequest) => {
        return zone.maKhuVucMau;
    };

    useEffect(() => {
        if (editTicket) {
            setFormData({
                tenLoaiVe: editTicket.tenLoaiVe,
                moTa: editTicket.moTa,
                soLuong: editTicket.soLuong,
                giaTien: editTicket.giaTien,
                soLuongToiThieu: editTicket.soLuongToiThieu,
                soLuongToiDa: editTicket.soLuongToiDa,
                maKhuVuc: editTicket.maKhuVuc || '',
                tenKhuVuc: editTicket.tenKhuVuc || ''
            });
        } else {
            setFormData({
                tenLoaiVe: '',
                moTa: '',
                soLuong: 0,
                giaTien: 0,
                soLuongToiThieu: 1,
                soLuongToiDa: 10,
                maKhuVuc: '',
                tenKhuVuc: ''
            });
        }
        setErrors({});
    }, [editTicket, show]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.tenLoaiVe.trim()) {
            newErrors.tenLoaiVe = 'Tên loại vé không được để trống';
        }

        if (!formData.maKhuVuc) {
            newErrors.maKhuVuc = 'Vui lòng chọn khu vực';
        }

        if (formData.soLuong <= 0) {
            newErrors.soLuong = 'Số lượng phải lớn hơn 0';
        }

        if (formData.giaTien < 0) {
            newErrors.giaTien = 'Giá tiền không được âm';
        }

        if (formData.soLuongToiThieu < 1) {
            newErrors.soLuongToiThieu = 'Số lượng tối thiểu phải từ 1';
        }

        if (formData.soLuongToiDa > formData.soLuong) {
            newErrors.soLuongToiDa = 'Số lượng tối đa không được vượt quá tổng số lượng';
        }

        if (formData.soLuongToiThieu > formData.soLuongToiDa) {
            newErrors.soLuongToiThieu = 'Số lượng tối thiểu không được lớn hơn tối đa';
        }

        if (formData.maKhuVuc && usedZones.includes(formData.maKhuVuc) && 
            (!editTicket || editTicket.maKhuVuc !== formData.maKhuVuc)) {
            newErrors.maKhuVuc = 'Khu vực này đã được sử dụng cho loại vé khác';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSave(formData);
            onHide();
        }
    };

    const handleZoneChange = (maTemplate: string) => {
        const selectedZone = availableZones.find(zone => zone.maKhuVucMau === maTemplate);
        
        setFormData(prev => ({
            ...prev,
            maKhuVuc: maTemplate,
            tenKhuVuc: selectedZone ? getZoneDisplayName(selectedZone) : ''
        }));
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            size="lg"
            className="universe-modal"
            backdrop="static"
        >
            <Modal.Header closeButton className="universe-modal-header">
                <Modal.Title>
                    <i className="fas fa-ticket-alt me-2"></i>
                    {editTicket ? 'Chỉnh sửa loại vé' : 'Thêm loại vé mới'}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="universe-modal-body">
                {availableZones.length === 0 && (
                    <Alert variant="warning">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Vui lòng chọn ít nhất một khu vực từ mẫu trước khi thêm loại vé.
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Tên loại vé <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.tenLoaiVe}
                                    onChange={(e) => setFormData(prev => ({ ...prev, tenLoaiVe: e.target.value }))}
                                    className={`universe-input ${errors.tenLoaiVe ? 'is-invalid' : ''}`}
                                    placeholder="VD: Vé VIP, Vé thường..."
                                />
                                {errors.tenLoaiVe && (
                                    <div className="invalid-feedback">{errors.tenLoaiVe}</div>
                                )}
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Khu vực <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Select
                                    value={formData.maKhuVuc}
                                    onChange={(e) => handleZoneChange(e.target.value)}
                                    className={`universe-input ${errors.maKhuVuc ? 'is-invalid' : ''}`}
                                    disabled={availableZones.length === 0}
                                >
                                    <option value="">Chọn khu vực</option>
                                    {availableZones.map((zone) => {
                                        const zoneKey = getZoneKey(zone);
                                        const isUsed = usedZones.includes(zoneKey) && 
                                                      (!editTicket || editTicket.maKhuVuc !== zoneKey);
                                        const displayName = getZoneDisplayName(zone);
                                        const templateInfo = mockTemplates?.find(t => t.maKhuVucMau === zone.maKhuVucMau);
                                        
                                        return (
                                            <option 
                                                key={zoneKey} 
                                                value={zoneKey}
                                                disabled={isUsed}
                                            >
                                                {displayName}
                                                {zone.tenTuyChon && zone.tenTuyChon !== templateInfo?.tenKhuVuc && 
                                                    ` (${templateInfo?.tenKhuVuc})`
                                                }
                                                {isUsed ? ' (Đã sử dụng)' : ''}
                                            </option>
                                        );
                                    })}
                                </Form.Select>
                                {errors.maKhuVuc && (
                                    <div className="invalid-feedback">{errors.maKhuVuc}</div>
                                )}
                                <Form.Text className="text-muted">
                                    Mỗi khu vực chỉ có thể có một loại vé
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Mô tả</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={formData.moTa}
                            onChange={(e) => setFormData(prev => ({ ...prev, moTa: e.target.value }))}
                            className="universe-input"
                            placeholder="Mô tả chi tiết về loại vé này..."
                        />
                    </Form.Group>

                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Số lượng <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    value={formData.soLuong}
                                    onChange={(e) => setFormData(prev => ({ ...prev, soLuong: parseInt(e.target.value) || 0 }))}
                                    className={`universe-input ${errors.soLuong ? 'is-invalid' : ''}`}
                                />
                                {errors.soLuong && (
                                    <div className="invalid-feedback">{errors.soLuong}</div>
                                )}
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Giá tiền (VNĐ) <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={formData.giaTien}
                                    onChange={(e) => setFormData(prev => ({ ...prev, giaTien: parseInt(e.target.value) || 0 }))}
                                    className={`universe-input ${errors.giaTien ? 'is-invalid' : ''}`}
                                />
                                {formData.giaTien > 0 && (
                                    <Form.Text className="text-muted">
                                        {formatCurrency(formData.giaTien)}
                                    </Form.Text>
                                )}
                                {errors.giaTien && (
                                    <div className="invalid-feedback">{errors.giaTien}</div>
                                )}
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <div className="zone-preview">
                                {formData.tenKhuVuc && (
                                    <div className="selected-zone-info">
                                        <small className="text-muted">Khu vực đã chọn:</small>
                                        <div className="zone-badge">
                                            <i className="fas fa-map-marker-alt me-1"></i>
                                            {formData.tenKhuVuc}
                                        </div>
                                        {(() => {
                                            const selectedZone = availableZones.find(z => z.maKhuVucMau === formData.maKhuVuc);
                                            const template = mockTemplates?.find(t => t.maKhuVucMau === formData.maKhuVuc);
                                            if (selectedZone?.tenTuyChon && selectedZone.tenTuyChon !== template?.tenKhuVuc) {
                                                return (
                                                    <small className="text-muted d-block">
                                                        Mẫu gốc: {template?.tenKhuVuc}
                                                    </small>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Số lượng tối thiểu mỗi lần mua</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    max={formData.soLuongToiDa || 999}
                                    value={formData.soLuongToiThieu}
                                    onChange={(e) => setFormData(prev => ({ ...prev, soLuongToiThieu: parseInt(e.target.value) || 1 }))}
                                    className={`universe-input ${errors.soLuongToiThieu ? 'is-invalid' : ''}`}
                                />
                                {errors.soLuongToiThieu && (
                                    <div className="invalid-feedback">{errors.soLuongToiThieu}</div>
                                )}
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Số lượng tối đa mỗi lần mua</Form.Label>
                                <Form.Control
                                    type="number"
                                    min={formData.soLuongToiThieu || 1}
                                    max={formData.soLuong || 999}
                                    value={formData.soLuongToiDa}
                                    onChange={(e) => setFormData(prev => ({ ...prev, soLuongToiDa: parseInt(e.target.value) || 1 }))}
                                    className={`universe-input ${errors.soLuongToiDa ? 'is-invalid' : ''}`}
                                />
                                {errors.soLuongToiDa && (
                                    <div className="invalid-feedback">{errors.soLuongToiDa}</div>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>

                    {availableZones.length > 0 && (
                        <Row>
                            <Col>
                                <div className="available-zones-summary">
                                    <small className="text-muted">
                                        <strong>Khu vực có sẵn ({availableZones.length}):</strong>
                                    </small>
                                    <div className="zones-list mt-2">
                                        {availableZones.map((zone) => {
                                            const zoneKey = getZoneKey(zone);
                                            const isUsed = usedZones.includes(zoneKey) && 
                                                          (!editTicket || editTicket.maKhuVuc !== zoneKey);
                                            const isSelected = formData.maKhuVuc === zoneKey;
                                            
                                            return (
                                                <p 
                                                    key={zoneKey}
                                                    className={`zone-tag ${isUsed ? 'used' : ''} ${isSelected ? 'selected' : ''}`}
                                                >
                                                    {getZoneDisplayName(zone)}
                                                    {isUsed && ' (Đã dùng)'}
                                                    {isSelected && ' ✓'}
                                                </p>
                                            );
                                        })}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    )}
                </Form>
            </Modal.Body>

            <Modal.Footer className="universe-modal-footer">
                <Button variant="secondary" onClick={onHide} className="universe-btn">
                    <i className="fas fa-times me-2"></i>
                    Hủy
                </Button>
                <Button 
                    variant="primary" 
                    onClick={handleSubmit}
                    className="universe-btn"
                    disabled={availableZones.length === 0}
                >
                    <i className="fas fa-save me-2"></i>
                    {editTicket ? 'Cập nhật' : 'Thêm mới'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default TicketTypeModal;