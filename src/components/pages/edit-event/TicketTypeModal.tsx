import { Modal, Form, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { TicketType } from '../../../types/EventTypes';

interface TicketTypeModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (ticket: Omit<TicketType, 'id'>) => void;
    onDelete?: (id: string) => void; 
    editTicket?: TicketType;
}

const TicketTypeModal = ({ show, onHide, onSave, onDelete, editTicket }: TicketTypeModalProps) => {
    const [ticketForm, setTicketForm] = useState({
        tenLoaiVe: '',
        moTa: '',
        soLuong: 0,
        giaTien: 0
    });

    useEffect(() => {
        if (editTicket) {
            setTicketForm({
                tenLoaiVe: editTicket.tenLoaiVe,
                moTa: editTicket.moTa,
                soLuong: editTicket.soLuong,
                giaTien: editTicket.giaTien
            });
        } else {
            setTicketForm({
                tenLoaiVe: '',
                moTa: '',
                soLuong: 0,
                giaTien: 0
            });
        }
    }, [editTicket]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(ticketForm);
        onHide();
        setTicketForm({ tenLoaiVe: '', moTa: '', soLuong: 0, giaTien: 0 });
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
            </Modal.Body>
        </Modal>
    );
};

export default TicketTypeModal;