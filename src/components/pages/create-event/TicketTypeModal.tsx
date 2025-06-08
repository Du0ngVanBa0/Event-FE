import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { TicketType, KhuVucEventRequest, KhuVucTemplate } from '../../../types/EventTypes';
import './TicketTypeModal.css';

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
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getZoneDisplayName = (zone: KhuVucEventRequest) => {
        if (zone.tenTuyChon && zone.tenTuyChon.trim() !== '') {
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
        setIsSubmitting(false);
    }, [editTicket, show]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.tenLoaiVe.trim()) {
            newErrors.tenLoaiVe = 'Tên loại vé không được để trống';
        } else if (formData.tenLoaiVe.length < 3) {
            newErrors.tenLoaiVe = 'Tên loại vé phải có ít nhất 3 ký tự';
        }

        if (!formData.maKhuVuc) {
            newErrors.maKhuVuc = 'Vui lòng chọn khu vực';
        }

        if (formData.soLuong <= 0) {
            newErrors.soLuong = 'Số lượng phải lớn hơn 0';
        } else if (formData.soLuong > 10000) {
            newErrors.soLuong = 'Số lượng không được vượt quá 10,000';
        }

        if (formData.giaTien < 0) {
            newErrors.giaTien = 'Giá tiền không được âm';
        } else if (formData.giaTien > 100000000) {
            newErrors.giaTien = 'Giá tiền không được vượt quá 100,000,000 VNĐ';
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                onSave(formData);
                onHide();
            } catch (error) {
                console.error('Error saving ticket:', error);
            } finally {
                setIsSubmitting(false);
            }
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
            size="xl"
            className="ticket-type-modal-container"
            backdrop="static"
            centered
        >
            <Modal.Header closeButton className="ticket-type-modal-header">
                <Modal.Title className="ticket-type-modal-title">
                    <i className="fas fa-ticket-alt ticket-type-modal-title-icon"></i>
                    <span>{editTicket ? 'Chỉnh sửa loại vé' : 'Thêm loại vé mới'}</span>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="ticket-type-modal-body">
                {availableZones.length === 0 && (
                    <Alert variant="warning" className="ticket-type-modal-alert">
                        <i className="fas fa-exclamation-triangle ticket-type-modal-alert-icon"></i>
                        <span>Vui lòng chọn ít nhất một khu vực từ mẫu trước khi thêm loại vé.</span>
                    </Alert>
                )}

                <Form onSubmit={handleSubmit} className="ticket-type-modal-form">
                    <div className="ticket-type-modal-section">
                        <h5 className="ticket-type-modal-section-title">
                            <i className="fas fa-info-circle"></i>
                            Thông tin cơ bản
                        </h5>
                        
                        <Row>
                            <Col md={8}>
                                <div className="ticket-type-modal-form-group">
                                    <label className="ticket-type-modal-label">
                                        Tên loại vé <span className="ticket-type-modal-required">*</span>
                                    </label>
                                    <Form.Control
                                        type="text"
                                        value={formData.tenLoaiVe}
                                        onChange={(e) => setFormData(prev => ({ ...prev, tenLoaiVe: e.target.value }))}
                                        className={`ticket-type-modal-input ${errors.tenLoaiVe ? 'ticket-type-modal-input-error' : ''}`}
                                        placeholder="VD: Vé VIP, Vé thường, Vé học sinh..."
                                        maxLength={100}
                                    />
                                    {errors.tenLoaiVe && (
                                        <div className="ticket-type-modal-error-message">
                                            <i className="fas fa-exclamation-circle"></i>
                                            {errors.tenLoaiVe}
                                        </div>
                                    )}
                                </div>
                            </Col>

                            <Col md={4}>
                                <div className="ticket-type-modal-form-group">
                                    <label className="ticket-type-modal-label">
                                        Khu vực <span className="ticket-type-modal-required">*</span>
                                    </label>
                                    <Form.Select
                                        value={formData.maKhuVuc}
                                        onChange={(e) => handleZoneChange(e.target.value)}
                                        className={`ticket-type-modal-input ${errors.maKhuVuc ? 'ticket-type-modal-input-error' : ''}`}
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
                                        <div className="ticket-type-modal-error-message">
                                            <i className="fas fa-exclamation-circle"></i>
                                            {errors.maKhuVuc}
                                        </div>
                                    )}
                                    <div className="ticket-type-modal-help-text">
                                        Mỗi khu vực chỉ có thể có một loại vé
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <div className="ticket-type-modal-form-group">
                            <label className="ticket-type-modal-label">Mô tả chi tiết</label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.moTa}
                                onChange={(e) => setFormData(prev => ({ ...prev, moTa: e.target.value }))}
                                className="ticket-type-modal-input ticket-type-modal-textarea"
                                placeholder="Mô tả chi tiết về loại vé này, quyền lợi, điều kiện sử dụng..."
                                maxLength={500}
                            />
                            <div className="ticket-type-modal-char-count">
                                {formData.moTa.length}/500 ký tự
                            </div>
                        </div>
                    </div>

                    <div className="ticket-type-modal-section">
                        <h5 className="ticket-type-modal-section-title">
                            <i className="fas fa-coins"></i>
                            Giá & Số lượng
                        </h5>
                        
                        <Row>
                            <Col md={4}>
                                <div className="ticket-type-modal-form-group">
                                    <label className="ticket-type-modal-label">
                                        Số lượng <span className="ticket-type-modal-required">*</span>
                                    </label>
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        max="10000"
                                        value={formData.soLuong}
                                        onChange={(e) => setFormData(prev => ({ ...prev, soLuong: parseInt(e.target.value) || 0 }))}
                                        className={`ticket-type-modal-input ${errors.soLuong ? 'ticket-type-modal-input-error' : ''}`}
                                    />
                                    {errors.soLuong && (
                                        <div className="ticket-type-modal-error-message">
                                            <i className="fas fa-exclamation-circle"></i>
                                            {errors.soLuong}
                                        </div>
                                    )}
                                </div>
                            </Col>

                            <Col md={4}>
                                <div className="ticket-type-modal-form-group">
                                    <label className="ticket-type-modal-label">
                                        Giá tiền (VNĐ) <span className="ticket-type-modal-required">*</span>
                                    </label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        step="1000"
                                        value={formData.giaTien}
                                        onChange={(e) => setFormData(prev => ({ ...prev, giaTien: parseInt(e.target.value) || 0 }))}
                                        className={`ticket-type-modal-input ${errors.giaTien ? 'ticket-type-modal-input-error' : ''}`}
                                    />
                                    {formData.giaTien > 0 && (
                                        <div className="ticket-type-modal-currency-display">
                                            {formatCurrency(formData.giaTien)}
                                        </div>
                                    )}
                                    {errors.giaTien && (
                                        <div className="ticket-type-modal-error-message">
                                            <i className="fas fa-exclamation-circle"></i>
                                            {errors.giaTien}
                                        </div>
                                    )}
                                </div>
                            </Col>

                            <Col md={4}>
                                <div className="ticket-type-modal-zone-preview">
                                    {formData.tenKhuVuc && (
                                        <div className="ticket-type-modal-selected-zone">
                                            <label className="ticket-type-modal-label">Khu vực đã chọn:</label>
                                            <div className="ticket-type-modal-zone-badge">
                                                <i className="fas fa-map-marker-alt"></i>
                                                <span>{formData.tenKhuVuc}</span>
                                            </div>
                                            {(() => {
                                                const selectedZone = availableZones.find(z => z.maKhuVucMau === formData.maKhuVuc);
                                                const template = mockTemplates?.find(t => t.maKhuVucMau === formData.maKhuVuc);
                                                if (selectedZone?.tenTuyChon && selectedZone.tenTuyChon !== template?.tenKhuVuc) {
                                                    return (
                                                        <div className="ticket-type-modal-template-info">
                                                            Mẫu gốc: {template?.tenKhuVuc}
                                                        </div>
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
                                <div className="ticket-type-modal-form-group">
                                    <label className="ticket-type-modal-label">Số lượng tối thiểu mỗi lần mua</label>
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        max={formData.soLuongToiDa || 999}
                                        value={formData.soLuongToiThieu}
                                        onChange={(e) => setFormData(prev => ({ ...prev, soLuongToiThieu: parseInt(e.target.value) || 1 }))}
                                        className={`ticket-type-modal-input ${errors.soLuongToiThieu ? 'ticket-type-modal-input-error' : ''}`}
                                    />
                                    {errors.soLuongToiThieu && (
                                        <div className="ticket-type-modal-error-message">
                                            <i className="fas fa-exclamation-circle"></i>
                                            {errors.soLuongToiThieu}
                                        </div>
                                    )}
                                </div>
                            </Col>

                            <Col md={6}>
                                <div className="ticket-type-modal-form-group">
                                    <label className="ticket-type-modal-label">Số lượng tối đa mỗi lần mua</label>
                                    <Form.Control
                                        type="number"
                                        min={formData.soLuongToiThieu || 1}
                                        max={formData.soLuong || 999}
                                        value={formData.soLuongToiDa}
                                        onChange={(e) => setFormData(prev => ({ ...prev, soLuongToiDa: parseInt(e.target.value) || 1 }))}
                                        className={`ticket-type-modal-input ${errors.soLuongToiDa ? 'ticket-type-modal-input-error' : ''}`}
                                    />
                                    {errors.soLuongToiDa && (
                                        <div className="ticket-type-modal-error-message">
                                            <i className="fas fa-exclamation-circle"></i>
                                            {errors.soLuongToiDa}
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </div>

                    {availableZones.length > 0 && (
                        <div className="ticket-type-modal-section">
                            <h6 className="ticket-type-modal-zones-title">
                                <i className="fas fa-map"></i>
                                Khu vực có sẵn ({availableZones.length})
                            </h6>
                            <div className="ticket-type-modal-zones-grid">
                                {availableZones.map((zone) => {
                                    const zoneKey = getZoneKey(zone);
                                    const isUsed = usedZones.includes(zoneKey) && 
                                                  (!editTicket || editTicket.maKhuVuc !== zoneKey);
                                    const isSelected = formData.maKhuVuc === zoneKey;
                                    
                                    return (
                                        <div 
                                            key={zoneKey}
                                            className={`ticket-type-modal-zone-item ${
                                                isUsed ? 'ticket-type-modal-zone-used' : ''
                                            } ${
                                                isSelected ? 'ticket-type-modal-zone-selected' : ''
                                            }`}
                                        >
                                            <div className="ticket-type-modal-zone-name">
                                                {getZoneDisplayName(zone)}
                                            </div>
                                            <div className="ticket-type-modal-zone-status">
                                                {isUsed && <span className="ticket-type-modal-status-used">Đã sử dụng</span>}
                                                {isSelected && <span className="ticket-type-modal-status-selected">Đã chọn ✓</span>}
                                                {!isUsed && !isSelected && <span className="ticket-type-modal-status-available">Có sẵn</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </Form>
            </Modal.Body>

            <Modal.Footer className="ticket-type-modal-footer">
                <Button 
                    variant="secondary" 
                    onClick={onHide} 
                    className="ticket-type-modal-button-cancel"
                    disabled={isSubmitting}
                >
                    <i className="fas fa-times"></i>
                    <span>Hủy</span>
                </Button>
                <Button 
                    variant="primary" 
                    onClick={handleSubmit}
                    className="ticket-type-modal-button-save"
                    disabled={availableZones.length === 0 || isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <div className="ticket-type-modal-spinner"></div>
                            <span>Đang lưu...</span>
                        </>
                    ) : (
                        <>
                            <i className="fas fa-save"></i>
                            <span>{editTicket ? 'Cập nhật' : 'Thêm mới'}</span>
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default TicketTypeModal;