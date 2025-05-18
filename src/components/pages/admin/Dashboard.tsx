import { Container, Nav, Row, Col, Card } from 'react-bootstrap';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './Dashboard.css';
import { useEffect, useState } from 'react';
import { ReportDataState } from '../../../types/ReportTypes';
import reportService from '../../../api/reportService';

const Dashboard = () => {
    const [reportData, setReportData] = useState<ReportDataState>({
        totalEvents: 0,
        pendingEvents: 0,
        totalUsers: 0,
        activeUsers: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        popularCategories: [],
        recentEvents: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const location = useLocation();
    const currentPath = location.pathname;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');
                const dataa = await reportService.getAll();

                const data = dataa.data;
                setReportData({
                    totalEvents: data.tongSuKien,
                    pendingEvents: data.tongSuKienChoDuyet,
                    totalUsers: data.tongNguoiDung,
                    activeUsers: 0, 
                    totalRevenue: 0,
                    monthlyRevenue: data.doanhThuThang,
                    popularCategories: data.danhMucPhoBien.map(cat => ({
                        name: cat.tenDanhMuc,
                        count: cat.soSuKien
                    })),
                    recentEvents: data.suKienHot.map(event => ({
                        name: event.tenSuKien,
                        tickets: event.soVeBan,
                        revenue: event.doanhThu
                    }))
                });
                
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Không thể tải dữ liệu thống kê");
            }
        };
        
        fetchData();
    }, []);

    const renderDashboardContent = () => {
        if (loading) {
            return (
                <div className="alert alert-info" role="alert">
                    <i className="fas fa-spinner fa-spin"></i> Đang tải dữ liệu thống kê...
                </div>
            );
        } else return (
            <div className="dashboard-content">
                <h2 className="mb-4">Tổng quan hệ thống</h2>
                
                <Row className="stats-cards">
                    <Col md={3}>
                        <Card className="stat-card">
                            <Card.Body>
                                <div className="stat-icon">
                                    <i className="fas fa-calendar-alt"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{reportData.totalEvents}</h3>
                                    <p>Tổng số sự kiện</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="stat-card">
                            <Card.Body>
                                <div className="stat-icon">
                                    <i className="fas fa-users"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{reportData.totalUsers}</h3>
                                    <p>Người dùng</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="stat-card">
                            <Card.Body>
                                <div className="stat-icon">
                                    <i className="fas fa-clock"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{reportData.pendingEvents}</h3>
                                    <p>Sự kiện chờ duyệt</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="stat-card">
                            <Card.Body>
                                <div className="stat-icon">
                                    <i className="fas fa-money-bill-wave"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{formatCurrency(reportData.monthlyRevenue)}</h3>
                                    <p>Doanh thu tháng</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row className="mt-4">
                    <Col md={6}>
                        <Card className="chart-card">
                            <Card.Body>
                                <h4>Danh mục phổ biến</h4>
                                <div className="category-stats">
                                    {reportData.popularCategories.map((category, index) => (
                                        <div key={index} className="category-stat-item">
                                            <span className="category-name">{category.name}</span>
                                            <span className="category-count">{category.count} sự kiện</span>
                                        </div>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="chart-card">
                            <Card.Body>
                                <h4>Sự kiện nổi bật gần đây</h4>
                                <div className="recent-events">
                                    {reportData.recentEvents.map((event, index) => (
                                        <div key={index} className="recent-event-item">
                                            <span className="event-name">{event.name}</span>
                                            <div className="event-stats">
                                                <span>{event.tickets} vé</span>
                                                <span>{formatCurrency(event.revenue)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    };

    return (
        <Container fluid className="admin-dashboard">
            <Row>
                <Col md={2} className="admin-sidebar">
                    <Nav className="flex-column">
                        <Nav.Link
                            as={Link}
                            to="/admin/dashboard"
                            className={currentPath.endsWith('/dashboard') || currentPath === '/admin' ? 'active' : ''}
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
                    </Nav>
                </Col>

                <Col md={10} className="admin-content">
                    {(currentPath.endsWith('/dashboard') || currentPath === '/admin') && renderDashboardContent()}
                    <Outlet />
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard; 