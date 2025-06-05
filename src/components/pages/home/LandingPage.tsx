import { useEffect, useRef, useState } from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import EventsPage from "../../common/events/EventsSlider";
import { useAuth } from "../../../hooks/useAuth";

const LandingPage = () => {
  const starsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/events');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const eventCategories = [
    { icon: "fas fa-music", name: "Âm nhạc", count: "150+ sự kiện" },
    { icon: "fas fa-palette", name: "Nghệ thuật", count: "80+ sự kiện" },
    { icon: "fas fa-running", name: "Thể thao", count: "120+ sự kiện" },
    { icon: "fas fa-graduation-cap", name: "Giáo dục", count: "90+ sự kiện" },
    { icon: "fas fa-utensils", name: "Ẩm thực", count: "60+ sự kiện" },
    { icon: "fas fa-briefcase", name: "Kinh doanh", count: "110+ sự kiện" }
  ];

  const steps = [
    {
      number: 1,
      title: "Tìm kiếm sự kiện",
      description: "Duyệt qua hàng ngàn sự kiện phong phú theo sở thích của bạn"
    },
    {
      number: 2,
      title: "Chọn vé phù hợp",
      description: "Lựa chọn loại vé và số lượng theo nhu cầu tham gia"
    },
    {
      number: 3,
      title: "Thanh toán an toàn",
      description: "Hoàn tất thanh toán với các phương thức bảo mật cao"
    },
    {
      number: 4,
      title: "Tham gia sự kiện",
      description: "Sử dụng vé điện tử để check-in và tận hưởng trải nghiệm"
    }
  ];

  return (
    <div className="landing-page">
      <div className="stars-container" ref={starsRef}></div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Khám phá & Đặt vé
            <br />
            Sự kiện tuyệt vời
          </h1>
          <p className="hero-subtitle">
            Nền tảng đặt vé sự kiện hàng đầu Việt Nam. Tìm kiếm, đặt vé và tham gia
            hàng ngàn sự kiện chất lượng từ âm nhạc, nghệ thuật đến thể thao và giáo dục.
          </p>

          {/* Search Bar */}
          <div className="hero-search">
            <div className="search-input-group d-flex">
              <input
                type="text"
                className="search-input"
                placeholder="Tìm kiếm sự kiện, địa điểm, nghệ sĩ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button className="search-btn" onClick={handleSearch}>
                <i className="fas fa-search me-2"></i>
                Tìm kiếm
              </button>
            </div>

            {/* Trending Tags */}
            <div className="trending-tags">
              <span style={{ color: 'var(--color-text-light)', marginRight: '1rem' }}>Xu hướng:</span>
              <a href="/events?category=music" className="trending-tag">Nhạc sống</a>
              <a href="/events?category=art" className="trending-tag">Triển lãm</a>
              <a href="/events?category=sport" className="trending-tag">Marathon</a>
              <a href="/events?category=food" className="trending-tag">Food Festival</a>
            </div>
          </div>

          <div className="hero-buttons">
            <Button
              className="universe-button large"
              onClick={() => navigate("/events")}
            >
              <i className="fas fa-calendar-alt me-2"></i>
              Khám phá sự kiện
            </Button>
            {isAuthenticated ? (
              <Button
                className="universe-button outline large"
                onClick={() => navigate("/organizer/create-event")}
              >
                <i className="fas fa-plus me-2"></i>
                Tạo sự kiện
              </Button>
            ) : (
              <Button
                className="universe-button outline large"
                onClick={() => navigate("/register")}
              >
                <i className="fas fa-user-plus me-2"></i>
                Đăng ký miễn phí
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Sự kiện đã tổ chức</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Người dùng tin tưởng</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Đối tác tổ chức</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="featured-events-section">
        <Container>
          <div className="section-header">
            <h2 className="section-title">Sự kiện nổi bật</h2>
            <p className="section-subtitle">
              Những sự kiện được yêu thích và đánh giá cao nhất từ cộng đồng
            </p>
          </div>
          <EventsPage />
          <div className="text-center mt-4">
            <Button
              className="see-more-btn"
              onClick={() => navigate("/events")}
            >
              <i className="fas fa-arrow-right me-2"></i>
              Xem tất cả sự kiện
            </Button>
          </div>
        </Container>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <Container>
          <div className="section-header">
            <h2 className="section-title">Danh mục sự kiện</h2>
            <p className="section-subtitle">
              Khám phá sự kiện theo từng lĩnh vực yêu thích của bạn
            </p>
          </div>
          <div className="categories-grid">
            {eventCategories.map((category, index) => (
              <div
                key={index}
                className="category-card"
                onClick={() => navigate(`/events?category=${category.name.toLowerCase()}`)}
              >
                <i className={`${category.icon} category-icon`}></i>
                <div className="category-name">{category.name}</div>
                <div className="category-count">{category.count}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* How it Works Section */}
      <section className="how-it-works-section">
        <Container>
          <div className="section-header">
            <h2 className="section-title">Cách thức hoạt động</h2>
            <p className="section-subtitle">
              Chỉ với 4 bước đơn giản để tham gia sự kiện yêu thích
            </p>
          </div>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{step.number}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <div className="cta-content">
            <h2>Bắt đầu hành trình khám phá</h2>
            <p>
              Tham gia cùng hàng nghìn người đã tin tưởng và sử dụng nền tảng của chúng tôi
            </p>
            {!isAuthenticated ? (
              <Button
                className="universe-button large"
                onClick={() => navigate("/register")}
              >
                <i className="fas fa-rocket me-2"></i>
                Đăng ký ngay miễn phí
              </Button>
            ) : (
              <div className="d-flex gap-3 justify-content-center">
                <Button
                  className="see-more-btn"
                  onClick={() => navigate("/events")}
                >
                  <i className="fas fa-calendar me-2"></i>
                  Khám phá sự kiện
                </Button>
                <Button
                  className="see-more-btn"
                  onClick={() => navigate("/organizer/create-event")}
                >
                  <i className="fas fa-plus me-2"></i>
                  Tạo sự kiện mới
                </Button>
              </div>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
};

export default LandingPage;
