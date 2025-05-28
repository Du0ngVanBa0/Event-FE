import { Navbar, Container, Nav, Button, Dropdown, Image, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Header.css';
import logo from '../../../assets/react.svg';
import { useAuth } from '../../../hooks/useAuth';
import { getDefaulImagetUrl, getImageUrl } from '../../../utils/helper';

const Header = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const renderAuthSection = () => {
    if (isLoading) {
      return (
        <div className="auth-loading">
          <Spinner animation="border" variant="primary" size="sm" />
        </div>
      );
    }

    if (isAuthenticated && user) {
      return (
        <Dropdown align="end">
          <Dropdown.Toggle as="div" id="dropdown-user">
            <Image
              src={user.avatar ? getImageUrl(user.avatar) : getDefaulImagetUrl()}
              alt="Avatar"
              className="avatar-circle"
            />
          </Dropdown.Toggle>

          <Dropdown.Menu className="dropdown-menu-dark">
            <Dropdown.Item as={Link} to="/profile/settings">Thông tin cá nhân</Dropdown.Item>
            <Dropdown.Item as={Link} to="/my-tickets">Vé của tôi</Dropdown.Item>
            <Dropdown.Item as={Link} to="/my-events">Sự kiện của tôi</Dropdown.Item>
            <Dropdown.Item as={Link} to="/settings">Cài đặt</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout}>Đăng xuất</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );
    }

    return (
      <div className="auth-buttons">
        <Link to="/login">
          <Button variant="outline-primary" className="me-2">Đăng nhập</Button>
        </Link>
        <Link to="/register">
          <Button variant="primary">Đăng ký</Button>
        </Link>
      </div>
    );
  };

  return (
    <Navbar expand="lg" className="header-navbar" fixed="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            src={logo}
            alt="Logo"
            className="logo-image"
            width="40"
            height="40"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
            <Nav.Link as={Link} to="/events">Sự kiện</Nav.Link>
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/organizer/create-event">Tạo Sự kiện</Nav.Link>
                {user?.role === 'ADMIN' ? (
                  <Nav.Link as={Link} to="/admin/dashboard">Quản trị</Nav.Link>
                ) : null}
              </>
            )}
          </Nav>

          <div className="d-flex align-items-center">
            {renderAuthSection()}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;