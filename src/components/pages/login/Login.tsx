// src/pages/Login.tsx
import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useAuth } from '../../../hooks/useAuth';
import authService from '../../../api/authService';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (error) {
      timeoutId = setTimeout(() => {
        setError('');
      }, 3000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [error]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { token, user } = await authService.login({
        email,
        matKhau: password
      });

      login(token, user);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="login-container">
      <div className="login-form-wrapper">
        <h2 className="text-center mb-4">Đăng Nhập</h2>
        
        {error && (
          <Alert variant="danger">{error}</Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3 d-flex justify-content-between align-items-center">
            <Form.Check
              type="checkbox"
              label="Ghi nhớ đăng nhập"
            />
            <Link to="/forgot-password" className="text-decoration-none">Quên mật khẩu?</Link>
          </Form.Group>

          <Button 
            variant="primary" 
            type="submit" 
            className="w-100" 
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </Button>

          <div className="text-center mt-3">
            <span>Chưa có tài khoản? </span>
            <Link to="/register" className="text-decoration-none">Đăng ký ngay</Link>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default Login;