import { Modal, Button } from 'react-bootstrap';

interface DeleteConfirmModalProps {
    show: boolean;
    onHide: () => void;
    onConfirm: () => void;
    itemName: string;
}

const DeleteConfirmModal = ({ show, onHide, onConfirm, itemName }: DeleteConfirmModalProps) => {
    return (
        <Modal show={show} onHide={onHide} centered className="universe-modal">
            <Modal.Header>
                <Modal.Title>Xác nhận xóa</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Bạn có chắc chắn muốn xóa người dùng "<strong>{itemName}</strong>" không?</p>
                <p className="mb-0 text-danger">Lưu ý: Hành động này không thể hoàn tác!</p>
            </Modal.Body>
            <Modal.Footer>
                <div className="d-flex justify-content-end gap-2">
                    <Button variant="secondary" onClick={onHide} className="universe-btn">
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={onConfirm} className="universe-btn">
                        Xóa
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteConfirmModal;