import { useState, FormEvent, useEffect } from "react";
import { Container, Form, Button, Alert, InputGroup } from "react-bootstrap";
import { useAuth } from "../../../hooks/useAuth";
import AvatarConfirmModal from "./AvatarConfirmModal";
import "./ChangeInformation.css";
import { getDefaulImagetUrl } from "../../../utils/helper";

interface ChangeInfoForm {
  fullName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangeInformation = () => {
  const { user, updateUser } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ChangeInfoForm>({
    fullName: user?.displayName || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Họ và tên không được để trống";
    }

    if (!formData.email.trim()) {
      errors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email không đúng định dạng";
    }

    if (showPasswordSection) {
      if (!formData.currentPassword) {
        errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
      }

      if (formData.newPassword && formData.newPassword.length < 6) {
        errors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
      }

      if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = "Mật khẩu xác nhận không khớp";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Kích thước file ảnh không được vượt quá 5MB");
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError("Vui lòng chọn file ảnh hợp lệ");
        return;
      }

      setNewAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowAvatarModal(true);
    }
  };

  const handleAvatarConfirm = async () => {
    if (newAvatar) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('avatar', newAvatar);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        updateUser({ 
          ...user,
          avatar: previewUrl
        });
        
        setSuccess("Ảnh đại diện đã được cập nhật thành công");
      } catch (err) {
        setError("Không thể cập nhật ảnh đại diện");
        console.error("Error uploading avatar:", err);
      } finally {
        setLoading(false);
        setShowAvatarModal(false);
        setNewAvatar(null);
        setPreviewUrl("");
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setValidationErrors({});

    if (!validateForm()) {
      setError("Vui lòng kiểm tra lại thông tin đã nhập");
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateUser({
        displayName: formData.fullName,
        email: formData.email,
      });

      setSuccess("Thông tin đã được cập nhật thành công");

      if (showPasswordSection) {
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        setShowPasswordSection(false);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError("Không thể cập nhật thông tin. Vui lòng thử lại sau.");
      console.error("Error updating user information:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: user?.displayName || "",
      email: user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setValidationErrors({});
    setError("");
    setSuccess("");
    setShowPasswordSection(false);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    if (success || error) {
      timeoutId = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 5000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [success, error]);

  return (
    <div className="change-info-page-container">
      <Container className="change-info-page-wrapper">
        {error && (
          <Alert variant="danger" className="change-info-page-alert change-info-page-alert-error">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{error}</span>
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="change-info-page-alert change_info-page_alert_success">
            <i className="fas fa-check-circle"></i>
            <span>{success}</span>
          </Alert>
        )}

        <div className="change-info-page-content">
          <div className="change-info-page-header">
            <h1 className="change-info-page-title">
              <i className="fas fa-user-edit"></i>
              <span>Cập nhật thông tin cá nhân</span>
            </h1>
            <p className="change-info-page-subtitle">
              Quản lý và cập nhật thông tin tài khoản của bạn
            </p>
          </div>

          <div className="change-info-page-avatar-section">
            <div className="change-info-page-avatar-container">
              <div className="change-info-page-avatar-wrapper">
                <img
                  src={user?.avatar || getDefaulImagetUrl()}
                  alt="Profile Avatar"
                  className="change-info-page-avatar-image"
                />
                <div className="change-info-page-avatar-overlay">
                  <label htmlFor="avatar-upload" className="change-info-page-avatar-upload-btn">
                    <i className="fas fa-camera"></i>
                    <span>Thay đổi</span>
                  </label>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="change-info-page-avatar-input"
                  />
                </div>
              </div>
              <div className="change-info-page-avatar-info">
                <h3>Ảnh đại diện</h3>
                <p>Nhấp vào ảnh để thay đổi ảnh đại diện</p>
                <small>Định dạng: JPG, PNG. Kích thước tối đa: 5MB</small>
              </div>
            </div>
          </div>

          <Form onSubmit={handleSubmit} className="change-info-page-form">
            <div className="change-info-page-section">
              <h2 className="change-info-page-section-title">
                <i className="fas fa-info-circle"></i>
                <span>Thông tin cơ bản</span>
              </h2>

              <div className="change-info-page-form-grid">
                <Form.Group className="change-info-page-form-group">
                  <Form.Label className="change-info-page-label">
                    Họ và tên <span className="change-info-page-required">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={`change-info-page-input ${validationErrors.fullName ? 'change-info-page-input-error' : ''}`}
                    placeholder="Nhập họ và tên của bạn"
                  />
                  {validationErrors.fullName && (
                    <div className="change-info-page-error-message">
                      <i className="fas fa-exclamation-circle"></i>
                      {validationErrors.fullName}
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="change-info-page-form-group">
                  <Form.Label className="change-info-page-label">
                    Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`change-info-page-input ${validationErrors.email ? 'change-info-page-input-error' : ''}`}
                    placeholder="Nhập địa chỉ email"
                    disabled
                  />
                  <small className="change-info-page-help-text">
                    Email không thể thay đổi
                  </small>
                </Form.Group>

                
                <Form.Group className="change-info-page-form-group">
                  <Form.Label className="change-info-page-label">Tên đăng nhập</Form.Label>
                  <Form.Control
                    type="text"
                    value={user?.username || ""}
                    disabled
                    className="change-info-page-input change-info-page-input-disabled"
                  />
                  <small className="change-info-page-help-text">
                    Tên đăng nhập không thể thay đổi
                  </small>
                </Form.Group>
              </div>
            </div>

            <div className="change-info-page-section">
              <div className="change-info-page-section-header">
                <h2 className="change-info-page-section-title">
                  <i className="fas fa-lock"></i>
                  <span>Bảo mật</span>
                </h2>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className="change-info-page-toggle-password"
                >
                  <i className={`fas fa-${showPasswordSection ? 'eye-slash' : 'eye'}`}></i>
                  <span>{showPasswordSection ? 'Ẩn' : 'Đổi mật khẩu'}</span>
                </Button>
              </div>

              {showPasswordSection && (
                <div className="change-info-page-password-section">
                  <div className="change-info-page-form-grid">
                    <Form.Group className="change-info-page-form-group change-info-page-form-group-full">
                      <Form.Label className="change-info-page-label">
                        Mật khẩu hiện tại <span className="change-info-page-required">*</span>
                      </Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                          className={`change-info-page-input ${validationErrors.currentPassword ? 'change-info-page-input-error' : ''}`}
                          placeholder="Nhập mật khẩu hiện tại"
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                          className="change-info-page-password-toggle"
                        >
                          <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                        </Button>
                      </InputGroup>
                      {validationErrors.currentPassword && (
                        <div className="change-info-page-error-message">
                          <i className="fas fa-exclamation-circle"></i>
                          {validationErrors.currentPassword}
                        </div>
                      )}
                    </Form.Group>

                    <Form.Group className="change-info-page-form-group">
                      <Form.Label className="change-info-page-label">Mật khẩu mới</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showNewPassword ? "text" : "password"}
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          className={`change-info-page-input ${validationErrors.newPassword ? 'change-info-page-input-error' : ''}`}
                          placeholder="Nhập mật khẩu mới"
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="change-info-page-password-toggle"
                        >
                          <i className={`fas fa-${showNewPassword ? 'eye-slash' : 'eye'}`}></i>
                        </Button>
                      </InputGroup>
                      {validationErrors.newPassword && (
                        <div className="change-info-page-error-message">
                          <i className="fas fa-exclamation-circle"></i>
                          {validationErrors.newPassword}
                        </div>
                      )}
                    </Form.Group>

                    <Form.Group className="change-info-page-form-group">
                      <Form.Label className="change-info-page-label">Xác nhận mật khẩu mới</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className={`change-info-page-input ${validationErrors.confirmPassword ? 'change-info-page-input-error' : ''}`}
                          placeholder="Nhập lại mật khẩu mới"
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="change-info-page-password-toggle"
                        >
                          <i className={`fas fa-${showConfirmPassword ? 'eye-slash' : 'eye'}`}></i>
                        </Button>
                      </InputGroup>
                      {validationErrors.confirmPassword && (
                        <div className="change-info-page-error-message">
                          <i className="fas fa-exclamation-circle"></i>
                          {validationErrors.confirmPassword}
                        </div>
                      )}
                    </Form.Group>
                  </div>
                </div>
              )}
            </div>

            <div className="change-info-page-actions">
              <Button
                variant="outline-secondary"
                onClick={handleReset}
                disabled={loading}
                className="change-info-page-button-reset"
              >
                <i className="fas fa-undo"></i>
                <span>Đặt lại</span>
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="change-info-page-button-save"
              >
                {loading ? (
                  <>
                    <div className="change-info-page-spinner"></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </Button>
            </div>
          </Form>
        </div>

        <AvatarConfirmModal
          show={showAvatarModal}
          onHide={() => {
            setShowAvatarModal(false);
            setNewAvatar(null);
            setPreviewUrl("");
          }}
          onConfirm={handleAvatarConfirm}
          previewUrl={previewUrl}
        />
      </Container>
    </div>
  );
};

export default ChangeInformation;
