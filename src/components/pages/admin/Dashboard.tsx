import React, { useState, useEffect } from 'react';
import { Container, Nav, Row, Col, Card, Button, Form, Alert, Spinner, Badge, Table } from 'react-bootstrap';
import { Link, Outlet, useLocation } from 'react-router-dom';
import reportService from '../../../api/reportService';
import eventService from '../../../api/eventService';
import './Dashboard.css';
import { ThongKeResponse, TopKhachHangResponse } from '../../../types/ReportTypes';
import { SuKien } from '../../../types/EventTypes';
import { getImageUrl, formatCurrency } from '../../../utils/helper';

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
    const [topCustomers, setTopCustomers] = useState<TopKhachHangResponse[]>([]);
    const [eventTopCustomers, setEventTopCustomers] = useState<TopKhachHangResponse[]>([]);
    const [events, setEvents] = useState<SuKien[]>([]);
    
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedEvent, setSelectedEvent] = useState('');
    const [customerLimit, setCustomerLimit] = useState(5);
    
    const [loading, setLoading] = useState(true);
    const [rangeLoading, setRangeLoading] = useState(false);
    const [customersLoading, setCustomersLoading] = useState(false);
    const [eventCustomersLoading, setEventCustomersLoading] = useState(false);
    
    const [error, setError] = useState('');
    const [rangeError, setRangeError] = useState('');
    const [customersError, setCustomersError] = useState('');
    const [eventCustomersError, setEventCustomersError] = useState('');

    useEffect(() => {
        fetchAllTimeData();
        fetchEvents();
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

    const fetchEvents = async () => {
        try {
            const response = await eventService.getPaginatedFiler(0, 1000, undefined, true);
            setEvents(response.data.content);
        } catch (err) {
            console.error('Error loading events:', err);
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

    const fetchTopCustomers = async () => {
        if (!startDate || !endDate) {
            setCustomersError('Vui lòng chọn ngày bắt đầu và ngày kết thúc');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            setCustomersError('Ngày bắt đầu không thể lớn hơn ngày kết thúc');
            return;
        }

        try {
            setCustomersLoading(true);
            setCustomersError('');
            const response = await reportService.getTopKhachHangByRange({
                tuNgay: startDate,
                denNgay: endDate,
                limit: customerLimit
            });
            setTopCustomers(response.data);
        } catch (err) {
            setCustomersError(err instanceof Error ? err.message : 'Không thể tải dữ liệu khách hàng');
        } finally {
            setCustomersLoading(false);
        }
    };

    const fetchEventTopCustomers = async () => {
        if (!selectedEvent) {
            setEventCustomersError('Vui lòng chọn sự kiện');
            return;
        }

        try {
            setEventCustomersLoading(true);
            setEventCustomersError('');
            const response = await reportService.getTopKhachHangByEvent(selectedEvent, customerLimit);
            setEventTopCustomers(response.data);
        } catch (err) {
            setEventCustomersError(err instanceof Error ? err.message : 'Không thể tải dữ liệu khách hàng theo sự kiện');
        } finally {
            setEventCustomersLoading(false);
        }
    };

    const formatDateRange = () => {
        if (!startDate || !endDate) return '';
        const start = new Date(startDate).toLocaleDateString('vi-VN');
        const end = new Date(endDate).toLocaleDateString('vi-VN');
        return `${start} - ${end}`;
    };

    const CustomerTable: React.FC<{ customers: TopKhachHangResponse[]; title: string }> = ({ customers, title }) => (
        <Card className="dashboard-page-chart-card">
            <Card.Body>
                <h4 className="dashboard-page-chart-title">
                    <i className="fas fa-crown"></i>
                    {title}
                </h4>
                {customers.length > 0 ? (
                    <Table responsive className="dashboard-page-customers-table">
                        <thead>
                            <tr>
                                <th>Hạng</th>
                                <th>Khách hàng</th>
                                <th>Số vé</th>
                                <th>Tổng tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer, index) => (
                                <tr key={customer.maNguoiDung}>
                                    <td>
                                        <div className="dashboard-page-rank-badge">
                                            {index === 0 && <i className="fas fa-trophy" style={{ color: '#FFD700' }}></i>}
                                            {index === 1 && <i className="fas fa-medal" style={{ color: '#C0C0C0' }}></i>}
                                            {index === 2 && <i className="fas fa-award" style={{ color: '#CD7F32' }}></i>}
                                            {index > 2 && <span className="rank-number">#{index + 1}</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="dashboard-page-customer-info">
                                            <div className="dashboard-page-customer-avatar">
                                                {customer.anhDaiDien ? (
                                                    <img 
                                                        src={getImageUrl(customer.anhDaiDien)} 
                                                        alt={customer.tenHienThi}
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                        }}
                                                    />
                                                ) : null}
                                                <div className="dashboard-page-avatar-placeholder" style={{ display: customer.anhDaiDien ? 'none' : 'flex' }}>
                                                    <i className="fas fa-user"></i>
                                                </div>
                                            </div>
                                            <div className="dashboard-page-customer-details">
                                                <div className="dashboard-page-customer-name">{customer.tenHienThi}</div>
                                                <div className="dashboard-page-customer-email">{customer.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <Badge bg="primary" className="dashboard-page-ticket-badge">
                                            <i className="fas fa-ticket-alt me-1"></i>
                                            {customer.soVe}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div className="dashboard-page-revenue-amount">
                                            {formatCurrency(customer.tongTien)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <div className="dashboard-page-no-data">
                        <i className="fas fa-users-slash"></i>
                        <p>Chưa có dữ liệu khách hàng</p>
                    </div>
                )}
            </Card.Body>
        </Card>
    );

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
                                    subtitle="Tổng doanh thu"
                                    color="purple"
                                />
                            </Col>
                        </Row>
                    </div>
                )}

                {/* Date Range Filter */}
                <div className="dashboard-page-section">
                    <h2 className="dashboard-page-section-title">
                        <i className="fas fa-calendar-week"></i>
                        Thống kê theo khoảng thời gian
                    </h2>

                    <Card className="dashboard-page-range-filter">
                        <Card.Body>
                            <Row className="align-items-end">
                                <Col md={3}>
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
                                <Col md={3}>
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
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label className="dashboard-page-label">
                                            <i className="fas fa-hashtag"></i>
                                            Số lượng
                                        </Form.Label>
                                        <Form.Select
                                            value={customerLimit}
                                            onChange={(e) => setCustomerLimit(Number(e.target.value))}
                                            className="dashboard-page-date-input"
                                        >
                                            <option value={5}>Top 5</option>
                                            <option value={10}>Top 10</option>
                                            <option value={20}>Top 20</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
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
                                <Col md={2}>
                                    <Button
                                        variant="success"
                                        onClick={fetchTopCustomers}
                                        disabled={customersLoading || !startDate || !endDate}
                                        className="dashboard-page-filter-btn"
                                    >
                                        {customersLoading ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Đang tải...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-crown"></i>
                                                Top KH
                                            </>
                                        )}
                                    </Button>
                                </Col>
                            </Row>

                            {(rangeError || customersError) && (
                                <Alert variant="danger" className="mt-3 dashboard-page-range-error">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {rangeError || customersError}
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Range Results */}
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
                                        color="green"
                                    />
                                </Col>
                            </Row>
                        </div>
                    )}

                    {/* Top Customers by Date Range */}
                    {topCustomers.length > 0 && (
                        <div className="dashboard-page-range-results">
                            <Row>
                                <Col lg={12}>
                                    <CustomerTable 
                                        customers={topCustomers} 
                                        title={`Top ${customerLimit} khách hàng (${formatDateRange()})`}
                                    />
                                </Col>
                            </Row>
                        </div>
                    )}
                </div>

                {/* Event Top Customers */}
                <div className="dashboard-page-section">
                    <h2 className="dashboard-page-section-title">
                        <i className="fas fa-trophy"></i>
                        Top khách hàng theo sự kiện
                    </h2>

                    <Card className="dashboard-page-range-filter">
                        <Card.Body>
                            <Row className="align-items-end">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="dashboard-page-label">
                                            <i className="fas fa-calendar-check"></i>
                                            Chọn sự kiện
                                        </Form.Label>
                                        <Form.Select
                                            value={selectedEvent}
                                            onChange={(e) => setSelectedEvent(e.target.value)}
                                            className="dashboard-page-date-input"
                                        >
                                            <option value="">-- Chọn sự kiện --</option>
                                            {events.map((event) => (
                                                <option key={event.maSuKien} value={event.maSuKien}>
                                                    {event.tieuDe}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="dashboard-page-label">
                                            <i className="fas fa-hashtag"></i>
                                            Số lượng
                                        </Form.Label>
                                        <Form.Select
                                            value={customerLimit}
                                            onChange={(e) => setCustomerLimit(Number(e.target.value))}
                                            className="dashboard-page-date-input"
                                        >
                                            <option value={5}>Top 5</option>
                                            <option value={10}>Top 10</option>
                                            <option value={20}>Top 20</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Button
                                        variant="warning"
                                        onClick={fetchEventTopCustomers}
                                        disabled={eventCustomersLoading || !selectedEvent}
                                        className="dashboard-page-filter-btn"
                                    >
                                        {eventCustomersLoading ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Đang tải...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-search"></i>
                                                Xem top KH
                                            </>
                                        )}
                                    </Button>
                                </Col>
                            </Row>

                            {eventCustomersError && (
                                <Alert variant="danger" className="mt-3 dashboard-page-range-error">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {eventCustomersError}
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Event Top Customers Results */}
                    {eventTopCustomers.length > 0 && (
                        <div className="dashboard-page-range-results">
                            <Row>
                                <Col lg={12}>
                                    <CustomerTable 
                                        customers={eventTopCustomers} 
                                        title={`Top ${customerLimit} khách hàng - ${events.find(e => e.maSuKien === selectedEvent)?.tieuDe || 'Sự kiện'}`}
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