import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { UserProfile } from '../../../../types/UserTypes';
import { getImageUrl, getDefaulImagetUrl } from '../../../../utils/helper';
import './AdminUserModal.css';

interface AdminUserModalProps {
  show: boolean;
  onHide: () => void;
  user: UserProfile;
  onSave: (userData: Partial<UserProfile>) => void;
}

const AdminUserModal = ({ show, onHide, user, onSave }: AdminUserModalProps) => {
  const [formData, setFormData] = useState({
    tenNguoiDung: '',
    tenHienThi: '',
    email: '',
    matKhau: '',
    hoatDong: true,
  });
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        tenNguoiDung: user.tenNguoiDung || '',
        tenHienThi: user.tenHienThi || '',
        email: user.email || '',
        matKhau: '',
        hoatDong: user.hoatDong !== undefined ? user.hoatDong : true,
      });
      
      setSelectedImage(user.anhDaiDien ? getImageUrl(user.anhDaiDien) : null);
      setImageFile(null);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userData: Partial<UserProfile> = {
      tenNguoiDung: formData.tenNguoiDung,
      tenHienThi: formData.tenHienThi,
      email: formData.email,
      hoatDong: formData.hoatDong,
    };

    if (formData.matKhau) {
      userData.matKhau = formData.matKhau;
    }
    
    if (imageFile) {
      userData.anhDaiDienFile = imageFile;
    }

    onSave(userData);
  };

  return (
    <Modal show={show} onHide={onHide} centered className="universe-modal" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Thông tin người dùng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="user-profile-header mb-4">
          <div className="image-upload-container">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              id="profile-image-upload"
            />
            <label htmlFor="profile-image-upload" className="image-upload-label">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={user?.tenHienThi}
                  className="user-profile-avatar"
                />
              ) : (
                <img
                  src={getDefaulImagetUrl()}
                  alt="Default profile"
                  className="user-profile-avatar"
                />
              )}
              <div className="image-upload-overlay">
                <i className="fas fa-camera"></i>
              </div>
            </label>
          </div>
          <div className="user-profile-info">
            <h3>{user?.tenHienThi}</h3>
            <div className="user-profile-meta">
              <span className="user-profile-username">@{user?.tenNguoiDung}</span>
              <span className="user-profile-role">{user?.vaiTro === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}</span>
            </div>
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tên tài khoản</Form.Label>
                <Form.Control
                  type="text"
                  name="tenNguoiDung"
                  value={formData.tenNguoiDung}
                  onChange={handleChange}
                  disabled
                />
                  Tên tài khoản không thể thay đổi
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tên hiển thị</Form.Label>
                <Form.Control
                  type="text"
                  name="tenHienThi"
                  value={formData.tenHienThi}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu mới</Form.Label>
                <Form.Control
                  type="password"
                  name="matKhau"
                  value={formData.matKhau}
                  onChange={handleChange}
                  placeholder="Để trống nếu không thay đổi"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="active-switch"
              name="hoatDong"
              label="Tài khoản hoạt động"
              checked={formData.hoatDong}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Lưu thay đổi
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AdminUserModal;