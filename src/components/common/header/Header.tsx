import { Navbar, Container, Nav, Button, Dropdown, Image, Spinner } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Header.css';
import { useAuth } from '../../../hooks/useAuth';
import { getDefaulImagetUrl, getImageUrl } from '../../../utils/helper';

const Header = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setShowMobileMenu(false);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const handleNavClick = () => {
    setShowMobileMenu(false);
  };

  const renderAuthSection = () => {
    if (isLoading) {
      return (
        <div className="header-auth-loading">
          <Spinner animation="border" variant="primary" size="sm" />
        </div>
      );
    }

    if (isAuthenticated && user) {
      return (
        <Dropdown align="end" className="header-user-dropdown">
          <Dropdown.Toggle as="div" className="header-user-toggle" id="dropdown-user">
            <div className="header-user-info">
              <Image
                src={user.avatar ? getImageUrl(user.avatar) : getDefaulImagetUrl()}
                alt="Avatar"
                className="header-avatar-circle"
              />
              <div className="header-user-details">
                <span className="header-user-name">{user.email}</span>
                <span className="header-user-role">{user.role}</span>
              </div>
              <i className="fas fa-chevron-down header-dropdown-arrow"></i>
            </div>
            <div className="header-user-glow"></div>
          </Dropdown.Toggle>

          <Dropdown.Menu className="header-dropdown-menu">
            <div className="header-dropdown-header">
              <div className="header-dropdown-user-info">
                <Image
                  src={user.avatar ? getImageUrl(user.avatar) : getDefaulImagetUrl()}
                  alt="Avatar"
                  className="header-dropdown-avatar"
                />
                <div>
                  <div className="header-dropdown-name">{user.email}</div>
                  <div className="header-dropdown-role">{user.role}</div>
                </div>
              </div>
            </div>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to="/profile/settings" className="header-dropdown-item">
              <i className="fas fa-user"></i>
              <span>Thông tin cá nhân</span>
            </Dropdown.Item>
            <Dropdown.Item as={Link} to="/my-tickets" className="header-dropdown-item">
              <i className="fas fa-ticket-alt"></i>
              <span>Vé của tôi</span>
            </Dropdown.Item>
            <Dropdown.Item as={Link} to="/my-events" className="header-dropdown-item">
              <i className="fas fa-calendar-alt"></i>
              <span>Sự kiện của tôi</span>
            </Dropdown.Item>
            <Dropdown.Item as={Link} to="/settings" className="header-dropdown-item">
              <i className="fas fa-cog"></i>
              <span>Cài đặt</span>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout} className="header-dropdown-item header-logout-item">
              <i className="fas fa-sign-out-alt"></i>
              <span>Đăng xuất</span>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );
    }

    return (
      <div className="header-auth-buttons">
        <Link to="/login" className="header-auth-link">
          <Button className="header-button-login">
            <i className="fas fa-sign-in-alt"></i>
            <span>Đăng nhập</span>
            <div className="header-button-ripple"></div>
          </Button>
        </Link>
        <Link to="/register" className="header-auth-link">
          <Button className="header-button-register">
            <i className="fas fa-user-plus"></i>
            <span>Đăng ký</span>
            <div className="header-button-shine"></div>
          </Button>
        </Link>
      </div>
    );
  };

  return (
    <Navbar 
      expand="lg" 
      className={`header-navbar ${isScrolled ? 'header-navbar-scrolled' : ''}`} 
      fixed="top"
      expanded={showMobileMenu}
    >
      <Container className="header-container">
        <Navbar.Brand as={Link} to="/" className="header-brand" onClick={handleNavClick}>
          <div className="header-logo-container">
            <div className="header-logo-text">
              <span className="header-logo-main">Universe</span>
              <span className="header-logo-accent">Event</span>
            </div>
            <div className="header-logo-glow"></div>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle 
          aria-controls="header-navbar-nav" 
          className="header-mobile-toggle"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <span className="header-hamburger-line"></span>
          <span className="header-hamburger-line"></span>
          <span className="header-hamburger-line"></span>
        </Navbar.Toggle>

        <Navbar.Collapse id="header-navbar-nav" className="header-navbar-collapse">
          <Nav className="header-nav-menu me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={`header-nav-link ${isActiveRoute('/') ? 'header-nav-active' : ''}`}
              onClick={handleNavClick}
            >
              <i className="fas fa-home"></i>
              <span>Trang chủ</span>
              <div className="header-nav-underline"></div>
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/events" 
              className={`header-nav-link ${isActiveRoute('/events') ? 'header-nav-active' : ''}`}
              onClick={handleNavClick}
            >
              <i className="fas fa-calendar-alt"></i>
              <span>Sự kiện</span>
              <div className="header-nav-underline"></div>
            </Nav.Link>

            {isAuthenticated && (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/organizer/create-event" 
                  className={`header-nav-link ${isActiveRoute('/organizer/create-event') ? 'header-nav-active' : ''}`}
                  onClick={handleNavClick}
                >
                  <i className="fas fa-plus-circle"></i>
                  <span>Tạo Sự kiện</span>
                  <div className="header-nav-underline"></div>
                </Nav.Link>
                
                {user?.role === 'ADMIN' && (
                  <Nav.Link 
                    as={Link} 
                    to="/admin/dashboard" 
                    className={`header-nav-link ${isActiveRoute('/admin/dashboard') ? 'header-nav-active' : ''}`}
                    onClick={handleNavClick}
                  >
                    <i className="fas fa-shield-alt"></i>
                    <span>Quản trị</span>
                    <div className="header-nav-underline"></div>
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>

          <div className="header-auth-section">
            {renderAuthSection()}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;