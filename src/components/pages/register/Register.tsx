import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useAuth } from '../../../hooks/useAuth';
import authService, { decodeToken } from '../../../api/authService';
import './Register.css';

interface ValidationErrors {
    tenNguoiDung?: string;
    email?: string;
    matKhau?: string;
    tenHienThi?: string;
}

const Register = () => {
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otpCode, setOtpCode] = useState<string | null>(null);
    const [showOtpForm, setShowOtpForm] = useState(false);
    const [otp, setOtp] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const [enteredEmail, setEnteredEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
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

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        if (resendCooldown > 0) {
            intervalId = setInterval(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [resendCooldown]);

    const validateForm = () => {
        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return false;
        }
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await authService.register({
                tenNguoiDung: username,
                email,
                matKhau: password,
                tenHienThi: displayName || username
            });

            if (!response.success) {
                if (response.errors) {
                    setFieldErrors(response.errors);
                } else {
                    setError(response.message || 'Có lỗi xảy ra khi đăng ký');
                }
                return;
            }

            if (response.data.token) {
                const token = response.data.token;
                const user = decodeToken(token);
                login(token, user);
                navigate('/');
            } else if (response.data.maOtp) {
                setOtpCode(response.data.maOtp);
                setShowOtpForm(true);
                setEnteredEmail(email);
                setError('');
            }
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Có lỗi xảy ra khi đăng ký';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!otpCode || !otp) return;

        setLoading(true);
        try {
            const response = await authService.verifyOtp({
                maOtp: otpCode,
                maXacThuc: otp
            });

            if (!response.success) {
                setError(response.message || 'Có lỗi xảy ra khi xác thực OTP');
                return;
            }

            if (response.data.token) {
                const token = response.data.token;
                const user = decodeToken(token);
                login(token, user);
                navigate('/');
            } else {
                setError('Không thể xác thực tài khoản');
            }
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xác thực OTP';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!otpCode || resendCooldown > 0) return;

        try {
            setLoading(true);
            const response = await authService.resendOtp(otpCode);

            if (!response.success) {
                setError(response.message || 'Không thể gửi lại mã OTP');
                return;
            }

            if (response.data.maOtp) {
                setOtpCode(response.data.maOtp);
                setResendCooldown(60);
                setError('');
            }
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Có lỗi xảy ra khi gửi lại mã OTP';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="register-container">
            <div className="register-form-wrapper">
                {!showOtpForm ? (
                    <>
                        <h2 className="text-center mb-4">Đăng Ký</h2>

                        {error && (
                            <Alert variant="danger">{error}</Alert>
                        )}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Tên tài khoản</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    isInvalid={!!fieldErrors.tenNguoiDung}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {fieldErrors.tenNguoiDung}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Tên hiển thị</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    isInvalid={!!fieldErrors.tenHienThi}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {fieldErrors.tenHienThi}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    isInvalid={!!fieldErrors.email}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {fieldErrors.email}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Mật khẩu</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    isInvalid={!!fieldErrors.matKhau}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {fieldErrors.matKhau}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Xác nhận mật khẩu</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Button
                                variant="primary"
                                type="submit"
                                className="w-100"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Đăng Ký'}
                            </Button>

                            <div className="text-center mt-3">
                                <span>Đã có tài khoản? </span>
                                <Link to="/login" className="text-decoration-none">Đăng nhập ngay</Link>
                            </div>
                        </Form>
                    </>
                ) : (
                    <>
                        <h2 className="text-center mb-4">Xác thực OTP</h2>

                        {error && (
                            <Alert variant="danger">{error}</Alert>
                        )}

                        <div className="mb-4 text-center">
                            <p>Mã xác thực đã được gửi đến email:</p>
                            <p className="email-highlight">{enteredEmail}</p>
                            <p>Vui lòng kiểm tra hộp thư và nhập mã xác thực để hoàn tất đăng ký</p>
                        </div>

                        <Form onSubmit={handleOtpSubmit}>
                            <Form.Group className="mb-4">
                                <Form.Control
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Nhập mã OTP"
                                    className="otp-input"
                                    required
                                />
                            </Form.Group>

                            <Button
                                variant="primary"
                                type="submit"
                                className="w-100"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Xác nhận'}
                            </Button>

                            <div className="d-flex justify-content-between mt-3">
                                <Button
                                    variant='warning'
                                    className='universe-btn'
                                    onClick={() => setShowOtpForm(false)}
                                    disabled={loading}
                                >
                                    Quay lại
                                </Button>

                                <Button
                                    variant='secondary'
                                    className='universe-btn'
                                    onClick={handleResendOtp}
                                    disabled={loading || resendCooldown > 0}
                                >
                                    {resendCooldown > 0
                                        ? `Gửi lại sau (${resendCooldown}s)`
                                        : 'Gửi lại mã'}
                                </Button>
                            </div>
                        </Form>
                    </>
                )}
            </div>
        </Container>
    );
};

export default Register;