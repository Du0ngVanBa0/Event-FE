import { useEffect, useRef } from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import EventsPage from "../../common/events/EventsSlider";
import { useAuth } from "../../../hooks/useAuth";

const LandingPage = () => {
  const starsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const stars = starsRef.current;
    if (!stars) return;

    const createStar = () => {
      const star = document.createElement("div");
      star.className = "star";
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDuration = `${Math.random() * 3 + 2}s`;
      stars.appendChild(star);

      star.addEventListener("animationend", () => {
        star.remove();
      });
    };

    const starInterval = setInterval(() => {
      createStar();
    }, 100);

    return () => clearInterval(starInterval);
  }, []);

  return (
    <div className="landing-page">
      <div className="stars-container" ref={starsRef}></div>

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="glowing-text">Universe Events</h1>
          <p className="hero-subtitle">
            Khám phá sự kiện nổi bật trong thời gian qua
          </p>
          <div className="hero-buttons">
            <Button
              className="universe-button"
              onClick={() => navigate("/events")}
            >
              Khám phá ngay
            </Button>
            {isAuthenticated ? (
              <Button
                className="universe-button outline"
                onClick={() => navigate("/organizer/create-event")}
              >
                Tạo sự kiện
              </Button>
            ) : (
              <Button
                className="universe-button outline"
                onClick={() => navigate("/register")}
              >
                Đăng ký miễn phí
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="features-section">
        <EventsPage />
        <div className="text-center mt-4">
          <Button
            className="universe-button see-more-btn"
            onClick={() => navigate("/events")}
          >
            <i className="fas fa-arrow-right me-2"></i>
            Xem thêm sự kiện
          </Button>
        </div>
      </section>

      <section className="features-section">
        <Container>
          <h2 className="section-title">Tính năng nổi bật</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-ticket-alt"></i>
              </div>
              <h3>Đặt vé dễ dàng</h3>
              <p>Chỉ với vài bước đơn giản, sở hữu ngay vé tham dự sự kiện</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <h3>Tổ chức sự kiện</h3>
              <p>Dễ dàng tạo và quản lý sự kiện của bạn</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>An toàn & Bảo mật</h3>
              <p>Thanh toán an toàn và bảo mật thông tin</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="cta-section">
        <Container>
          <div className="cta-content">
            <h2>Bắt đầu trải nghiệm ngay</h2>
            <p>Tham gia cùng hàng ngàn người dùng khác</p>
            {!isAuthenticated && (
              <Button
                className="universe-button large"
                onClick={() => navigate("/register")}
              >
                Đăng ký miễn phí
              </Button>
            )}
            {isAuthenticated && (
              <Button
                className="universe-button large"
                onClick={() => navigate("/organizer/create-event")}
              >
                Tạo sự kiện ngay
              </Button>
            )}
          </div>
        </Container>
      </section>

      <div className="orbit-animation">
        <div className="planet"></div>
        <div className="orbit">
          <div className="satellite"></div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
