import React, { useState, useEffect } from 'react';
import { Container, Nav, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { Link, Outlet, useLocation } from 'react-router-dom';
import reportService from '../../../api/reportService';
import './Dashboard.css';
import { ThongKeResponse } from '../../../types/ReportTypes';

interface SummaryCardProps {
    icon: string;
    title: string;
    value: number | string;
    subtitle?: string;
    color: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, title, value, subtitle, color, trend }) => {
    const [animatedValue, setAnimatedValue] = useState(0);

    useEffect(() => {
        if (typeof value === 'number' && value > 0) {
            const increment = value / 50;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= value) {
                    current = value;
                    clearInterval(timer);
                }
                setAnimatedValue(Math.floor(current));
            }, 30);

            return () => clearInterval(timer);
        }
    }, [value]);

    const formatValue = (val: number | string) => {
        if (typeof val === 'number') {
            if (val >= 1000000) {
                return `${(val / 1000000).toFixed(1)}M`;
            } else if (val >= 1000) {
                return `${(val / 1000).toFixed(1)}K`;
            }
            return val.toLocaleString('vi-VN');
        }
        return val;
    };

    return (
        <Card className="dashboard-page-summary-card">
            <Card.Body>
                <div className="dashboard-page-card-content">
                    <div className={`dashboard-page-card-icon dashboard-page-icon-${color}`}>
                        <i className={icon}></i>
                    </div>
                    <div className="dashboard-page-card-info">
                        <div className="dashboard-page-card-value">
                            {typeof value === 'number' ? formatValue(animatedValue) : value}
                        </div>
                        <div className="dashboard-page-card-title">{title}</div>
                        {subtitle && (
                            <div className="dashboard-page-card-subtitle">{subtitle}</div>
                        )}
                        {trend && (
                            <div className={`dashboard-page-card-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
                                <i className={`fas fa-arrow-${trend.isPositive ? 'up' : 'down'}`}></i>
                                {Math.abs(trend.value)}%
                            </div>
                        )}
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

const DashboardPage: React.FC = () => {
    const [allTimeData, setAllTimeData] = useState<ThongKeResponse | null>(null);
    const [rangeData, setRangeData] = useState<ThongKeResponse | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [rangeLoading, setRangeLoading] = useState(false);
    const [error, setError] = useState('');
    const [rangeError, setRangeError] = useState('');

    useEffect(() => {
        fetchAllTimeData();
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        setEndDate(today.toISOString().split('T')[0]);
        setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    }, []);

    const fetchAllTimeData = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await reportService.getAll();
            setAllTimeData(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu thống kê');
        } finally {
            setLoading(false);
        }
    };

    const fetchRangeData = async () => {
        if (!startDate || !endDate) {
            setRangeError('Vui lòng chọn ngày bắt đầu và ngày kết thúc');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            setRangeError('Ngày bắt đầu không thể lớn hơn ngày kết thúc');
            return;
        }

        try {
            setRangeLoading(true);
            setRangeError('');
            const response = await reportService.getThongKeByRange({ tuNgay: startDate, denNgay: endDate });
            setRangeData(response.data);
        } catch (err) {
            setRangeError(err instanceof Error ? err.message : 'Không thể tải dữ liệu theo khoảng thời gian');
        } finally {
            setRangeLoading(false);
        }
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDateRange = () => {
        if (!startDate || !endDate) return '';
        const start = new Date(startDate).toLocaleDateString('vi-VN');
        const end = new Date(endDate).toLocaleDateString('vi-VN');
        return `${start} - ${end}`;
    };

    if (loading) {
        return (
            <div className="dashboard-page-loading">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Đang tải dữ liệu thống kê...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page-container">
            <Container fluid>
                <div className="dashboard-page-header">
                    <h1 className="dashboard-page-title">
                        <i className="fas fa-chart-line"></i>
                        Bảng điều khiển thống kê
                    </h1>
                    <p className="dashboard-page-subtitle">
                        Tổng quan hiệu suất và số liệu hệ thống
                    </p>
                </div>

                {error && (
                    <Alert variant="danger" className="dashboard-page-alert">
                        <Alert.Heading>
                            <i className="fas fa-exclamation-triangle"></i>
                            Lỗi tải dữ liệu
                        </Alert.Heading>
                        <p>{error}</p>
                        <Button variant="outline-danger" onClick={fetchAllTimeData}>
                            <i className="fas fa-redo"></i>
                            Thử lại
                        </Button>
                    </Alert>
                )}

                {/* Summary Cards */}
                {allTimeData && (
                    <>
                        <div className="dashboard-page-section">
                            <h2 className="dashboard-page-section-title">
                                <i className="fas fa-globe"></i>
                                Thống kê tổng quan
                            </h2>
                            <Row className="dashboard-page-summary-grid">
                                <Col xl={3} lg={6} md={6} sm={12}>
                                    <SummaryCard
                                        icon="fas fa-calendar-alt"
                                        title="Tổng sự kiện"
                                        value={allTimeData.tongSuKien}
                                        subtitle="Tất cả thời gian"
                                        color="blue"
                                    />
                                </Col>
                                <Col xl={3} lg={6} md={6} sm={12}>
                                    <SummaryCard
                                        icon="fas fa-users"
                                        title="Người dùng"
                                        value={allTimeData.tongNguoiDung}
                                        subtitle="Đã đăng ký"
                                        color="green"
                                    />
                                </Col>
                                <Col xl={3} lg={6} md={6} sm={12}>
                                    <SummaryCard
                                        icon="fas fa-clock"
                                        title="Chờ duyệt"
                                        value={allTimeData.tongSuKienChoDuyet}
                                        subtitle="Sự kiện"
                                        color="orange"
                                    />
                                </Col>
                                <Col xl={3} lg={6} md={6} sm={12}>
                                    <SummaryCard
                                        icon="fas fa-money-bill-wave"
                                        title="Doanh thu tổng"
                                        value={formatCurrency(allTimeData.doanhThuThang)}
                                        subtitle="Tổng doanh thú"
                                        color="purple"
                                    />
                                </Col>
                            </Row>
                        </div>
                    </>
                )}

                <div className="dashboard-page-section">
                    <h2 className="dashboard-page-section-title">
                        <i className="fas fa-calendar-week"></i>
                        Thống kê theo khoảng thời gian
                    </h2>

                    <Card className="dashboard-page-range-filter">
                        <Card.Body>
                            <Row className="align-items-end">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="dashboard-page-label">
                                            <i className="fas fa-calendar-day"></i>
                                            Từ ngày
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="dashboard-page-date-input"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="dashboard-page-label">
                                            <i className="fas fa-calendar-day"></i>
                                            Đến ngày
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="dashboard-page-date-input"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Button
                                        variant="primary"
                                        onClick={fetchRangeData}
                                        disabled={rangeLoading || !startDate || !endDate}
                                        className="dashboard-page-filter-btn"
                                    >
                                        {rangeLoading ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Đang tải...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-search"></i>
                                                Lấy thống kê
                                            </>
                                        )}
                                    </Button>
                                </Col>
                            </Row>

                            {rangeError && (
                                <Alert variant="danger" className="mt-3 dashboard-page-range-error">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {rangeError}
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>

                    {rangeData && (
                        <div className="dashboard-page-range-results">
                            <div className="dashboard-page-range-header">
                                <h3 className="dashboard-page-range-title">
                                    Kết quả thống kê
                                </h3>
                                <p className="dashboard-page-range-period">
                                    Khoảng thời gian: {formatDateRange()}
                                </p>
                            </div>

                            <Row className="dashboard-page-range-grid">
                                <Col xl={3} lg={6} md={6} sm={12}>
                                    <SummaryCard
                                        icon="fas fa-clock"
                                        title="Tổng sự kiện chờ duyệt"
                                        value={rangeData.tongSuKienChoDuyet}
                                        subtitle="Trong khoảng thời gian"
                                        color="orange"
                                    />
                                </Col>
                                <Col xl={3} lg={6} md={6} sm={12}>
                                    <SummaryCard
                                        icon="fas fa-chart-line"
                                        title="Doanh thu"
                                        value={formatCurrency(rangeData.doanhThuThang)}
                                        subtitle="Tổng thu nhập"
                                        color="blue"
                                    />
                                </Col>
                                <Col xl={3} lg={6} md={6} sm={12}>
                                    <SummaryCard
                                        icon="fas fa-plus-circle"
                                        title="Sự kiện tạo mới"
                                        value={rangeData.tongSuKien}
                                        subtitle="Được tạo"
                                        color="purple"
                                    />
                                </Col>
                                <Col xl={3} lg={6} md={6} sm={12}>
                                    <SummaryCard
                                        icon="fas fa-user-check"
                                        title="Người dùng hoạt động"
                                        value={rangeData.tongNguoiDung}
                                        subtitle="Tham gia"
                                        color="orange"
                                    />
                                </Col>
                            </Row>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
};

const Dashboard = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const showDashboardPage = currentPath === '/admin' || currentPath === '/admin/' || currentPath === '/admin/dashboard';

    return (
        <Container fluid className="admin-dashboard">
            <Row>
                <Col md={2} className="admin-sidebar">
                    <Nav className="flex-column">
                        <Nav.Link
                            as={Link}
                            to="/admin/dashboard"
                            className={currentPath.endsWith('/dashboard') || currentPath === '/admin' || currentPath === '/admin/' ? 'active' : ''}
                        >
                            <i className="fas fa-chart-line"></i>
                            Thống kê
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/admin/approve-events"
                            className={currentPath.includes('approve-events') ? 'active' : ''}
                        >
                            <i className="fas fa-check-circle"></i>
                            Phê duyệt sự kiện
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/admin/event-types"
                            className={currentPath.includes('event-types') ? 'active' : ''}
                        >
                            <i className="fas fa-tags"></i>
                            Quản lý danh mục
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/admin/booking-tickets"
                            className={currentPath.includes('booking-tickets') ? 'active' : ''}
                        >
                            <i className="fas fa-ticket"></i>
                            Quản lý vé
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/admin/users"
                            className={currentPath.includes('users') ? 'active' : ''}
                        >
                            <i className="fas fa-users"></i>
                            Quản lý người dùng
                        </Nav.Link>
                    </Nav>
                </Col>

                <Col md={10} className="admin-content">
                    {showDashboardPage && <DashboardPage />}
                    
                    {!showDashboardPage && <Outlet />}
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;