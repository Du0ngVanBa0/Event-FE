import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { TicketType } from '../../../types/EventTypes';

interface TicketTypeModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (ticket: Omit<TicketType, 'id'>) => void;
    onDelete?: (id: string) => void;
    editTicket?: TicketType;
}

const initialForm = {
    tenLoaiVe: '',
    moTa: '',
    soLuong: 0,
    giaTien: 0,
    soLuongToiThieu: 0,
    soLuongToiDa: 0
};

const TicketTypeModal = ({ show, onHide, onSave, onDelete, editTicket }: TicketTypeModalProps) => {
    const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);
    const [ticketForm, setTicketForm] = useState(initialForm);

    useEffect(() => {
        if (editTicket) {
            setTicketForm({
                tenLoaiVe: editTicket.tenLoaiVe,
                moTa: editTicket.moTa,
                soLuong: editTicket.soLuong,
                giaTien: editTicket.giaTien,
                soLuongToiThieu: editTicket.soLuongToiThieu,
                soLuongToiDa: editTicket.soLuongToiDa
            });
        } else {
            setTicketForm(initialForm);
        }
    }, [editTicket]);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (ticketForm.soLuongToiDa > ticketForm.soLuong) {
            setNotification({ message: 'Số lượng tối đa không được lớn hơn tổng số lượng!', type: 'danger' });
            return;
        }
        onSave(ticketForm);
        onHide();
        setTicketForm(initialForm);
        setNotification(null);
    };

    return (
        <Modal show={show} onHide={onHide} centered className="universe-modal">
            <Modal.Header closeButton>
                <Modal.Title>{editTicket ? 'Chỉnh sửa loại vé' : 'Thêm loại vé'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Tên loại vé</Form.Label>
                        <Form.Control
                            type="text"
                            value={ticketForm.tenLoaiVe}
                            onChange={(e) => setTicketForm({ ...ticketForm, tenLoaiVe: e.target.value })}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Mô tả</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={ticketForm.moTa}
                            onChange={(e) => setTicketForm({ ...ticketForm, moTa: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Số lượng</Form.Label>
                        <Form.Control
                            type="number"
                            min="0"
                            value={ticketForm.soLuong}
                            onChange={(e) => setTicketForm({ ...ticketForm, soLuong: parseInt(e.target.value) })}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Giá tiền (VNĐ)</Form.Label>
                        <Form.Control
                            type="number"
                            min="0"
                            step="1000"
                            value={ticketForm.giaTien}
                            onChange={(e) => setTicketForm({ ...ticketForm, giaTien: parseInt(e.target.value) })}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Số lượng tối thiểu</Form.Label>
                        <Form.Control
                            type="number"
                            min="1"
                            value={ticketForm.soLuongToiThieu}
                            onChange={(e) => setTicketForm({ ...ticketForm, soLuongToiThieu: parseInt(e.target.value) })}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Số lượng tối đa</Form.Label>
                        <Form.Control
                            type="number"
                            min="1"
                            value={ticketForm.soLuongToiDa}
                            onChange={(e) => setTicketForm({ ...ticketForm, soLuongToiDa: parseInt(e.target.value) })}
                            required
                        />
                    </Form.Group>
                    <div className="d-flex justify-content-end gap-2">
                        {editTicket && editTicket.id && (
                            <Button
                                variant="danger"
                                onClick={() => {
                                    onDelete?.(editTicket.id);
                                    onHide();
                                }}
                                className="universe-btn"
                            >
                                Xóa
                            </Button>
                        )}
                        <Button variant="secondary" onClick={onHide} className="universe-btn">
                            Hủy
                        </Button>
                        <Button variant="primary" type="submit" className="universe-btn">
                            {editTicket ? 'Cập nhật' : 'Thêm'}
                        </Button>
                    </div>
                </Form>

                {notification && (
                    <Alert variant={notification.type} className="mt-3">
                        <div className="validation-error">{notification.message}</div>
                    </Alert>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default TicketTypeModal;