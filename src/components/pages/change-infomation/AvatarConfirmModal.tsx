import { Modal, Button, Spinner } from 'react-bootstrap';
import './ChangeInformation.css';

interface AvatarConfirmModalProps {
    show: boolean;
    onHide: () => void;
    onConfirm: () => void;
    previewUrl: string;
    loading?: boolean;
}

const AvatarConfirmModal = ({ show, onHide, onConfirm, previewUrl, loading = false }: AvatarConfirmModalProps) => {
    return (
        <Modal show={show} onHide={onHide} centered className="universe-modal">
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="fas fa-image"></i>
                    <span>Xác nhận thay đổi ảnh đại diện</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="avatar-preview-container">
                    {previewUrl ? (
                        <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="avatar-preview"
                            onError={(e) => {
                                console.error("Error loading preview image");
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="avatar-preview-placeholder">
                            <i className="fas fa-image"></i>
                            <span>Không thể tải ảnh xem trước</span>
                        </div>
                    )}
                </div>
                <p className="text-center mt-3 mb-0">
                    Bạn có chắc chắn muốn thay đổi ảnh đại diện này không?
                </p>
                <small className="text-muted text-center d-block mt-1">
                    Ảnh sẽ được tải lên và cập nhật vào hồ sơ của bạn.
                </small>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-end gap-2">
                <Button 
                    variant="secondary" 
                    onClick={onHide} 
                    className="universe-btn"
                    disabled={loading}
                >
                    <i className="fas fa-times"></i>
                    <span>Hủy</span>
                </Button>
                <Button 
                    variant="primary" 
                    onClick={onConfirm} 
                    className="universe-btn"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Spinner animation="border" size="sm" />
                            <span>Đang tải lên...</span>
                        </>
                    ) : (
                        <>
                            <i className="fas fa-check"></i>
                            <span>Xác nhận</span>
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AvatarConfirmModal;