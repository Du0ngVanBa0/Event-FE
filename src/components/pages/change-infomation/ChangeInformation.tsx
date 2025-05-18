import { useState, FormEvent, useEffect } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../../../hooks/useAuth";
import AvatarConfirmModal from "./AvatarConfirmModal";
import "./ChangeInformation.css";
import { getDefaulImagetUrl } from "../../../utils/helper";

interface ChangeInfoForm {
  displayName: string;
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

  const [formData, setFormData] = useState<ChangeInfoForm>({
    displayName: user?.displayName || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowAvatarModal(true);
    }
  };

  const handleAvatarConfirm = async () => {
    if (newAvatar) {
      setLoading(true);
      try {
        // API call to update avatar would go here
        // For now, we'll just simulate it
        updateUser({ avatar: previewUrl });
        setSuccess("Ảnh đại diện đã được cập nhật thành công");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError("Không thể cập nhật ảnh đại diện");
      } finally {
        setLoading(false);
        setShowAvatarModal(false);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Mật khẩu mới không khớp");
      return;
    }

    setLoading(true);
    try {
      // API call would go here
      // For now, we'll just simulate it
      setSuccess("Thông tin đã được cập nhật thành công");

      // Clear password fields after successful update
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Không thể cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (success || error) {
      timeoutId = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [success, error]);

  return (
    <Container className="change-info-container">
      <div className="change-info-wrapper">
        <h2 className="text-center mb-4">Thay đổi thông tin cá nhân</h2>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <div className="avatar-section mb-4">
          <div className="current-avatar">
            <img
              src={user?.avatar !== '' ? user?.avatar : getDefaulImagetUrl()}
              className="avatar-image"
            />
            <div className="avatar-overlay">
              <label htmlFor="avatar-upload" className="avatar-upload-label">
                <i className="fas fa-camera"></i>
              </label>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
            </div>
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={user?.email || "tidumong789@gmail.com"}
              disabled
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tên tài khoản</Form.Label>
            <Form.Control type="text" value={user?.username || ""} disabled />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tên hiển thị</Form.Label>
            <Form.Control
              type="text"
              value={formData.displayName || ""}
              onChange={(e) =>
                setFormData({ ...formData, displayName: e.target.value })
              }
            />
          </Form.Group>

          <div className="password-section">
            <h3 className="section-title">Đổi mật khẩu</h3>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu hiện tại</Form.Label>
              <Form.Control
                type="password"
                value={formData.currentPassword}
                onChange={(e) =>
                  setFormData({ ...formData, currentPassword: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Xác nhận mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
            </Form.Group>
          </div>

          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            className="w-100 mt-4"
          >
            {loading ? "Đang xử lý..." : "Cập nhật thông tin"}
          </Button>
        </Form>

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
      </div>
    </Container>
  );
};

export default ChangeInformation;
