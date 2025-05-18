import { Modal, Form, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { DanhMucSuKien } from '../../../types/EventTypeTypes';
import { CreateEventCategory } from '../../../types/RequestTypes';

interface EventTypeModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (data: CreateEventCategory & { hoatDong?: boolean }) => void;
    editData?: DanhMucSuKien;
}

const EventTypeModal = ({ show, onHide, onSave, editData }: EventTypeModalProps) => {
    const [formData, setFormData] = useState<CreateEventCategory & { hoatDong?: boolean }>({
        tenDanhMuc: '',
        moTa: ''
    });

    useEffect(() => {
        if (editData) {
            setFormData({
                tenDanhMuc: editData.tenDanhMuc,
                moTa: editData.moTa,
                hoatDong: editData.hoatDong
            });
        } else {
            setFormData({
                tenDanhMuc: '',
                moTa: ''
            });
        }
    }, [editData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered className="universe-modal">
            <Modal.Header>
                <Modal.Title>{editData ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Tên danh mục</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.tenDanhMuc}
                            onChange={(e) => setFormData({ ...formData, tenDanhMuc: e.target.value })}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Mô tả</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={formData.moTa}
                            onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                        />
                    </Form.Group>

                    {editData && (
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Hoạt động"
                                checked={formData.hoatDong}
                                onChange={(e) => setFormData({ ...formData, hoatDong: e.target.checked })}
                            />
                        </Form.Group>
                    )}

                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="secondary" onClick={onHide} className="universe-btn">
                            Hủy
                        </Button>
                        <Button variant="primary" type="submit" className="universe-btn">
                            {editData ? 'Cập nhật' : 'Thêm'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EventTypeModal;