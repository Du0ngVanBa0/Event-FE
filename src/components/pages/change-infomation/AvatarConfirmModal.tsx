import { Modal, Button } from 'react-bootstrap';
import './ChangeInformation.css';

interface AvatarConfirmModalProps {
    show: boolean;
    onHide: () => void;
    onConfirm: () => void;
    previewUrl: string;
}

const AvatarConfirmModal = ({ show, onHide, onConfirm, previewUrl }: AvatarConfirmModalProps) => {
    return (
        <Modal show={show} onHide={onHide} centered className="universe-modal">
            <Modal.Header>
                <Modal.Title>Xác nhận thay đổi ảnh đại diện</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="avatar-preview-container">
                    <img src={previewUrl} alt="Preview" className="avatar-preview" />
                </div>
                <p className="text-center mt-3">Bạn có chắc chắn muốn thay đổi ảnh đại diện?</p>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={onHide} className="universe-btn">
                    Hủy
                </Button>
                <Button variant="primary" onClick={onConfirm} className="universe-btn">
                    Xác nhận
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AvatarConfirmModal;