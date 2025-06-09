import { useEffect, useRef, useState } from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import EventsPage from "../../common/events/EventsSlider";
import { useAuth } from "../../../hooks/useAuth";

const LandingPage = () => {
  const mouseParticlesRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const particles = mouseParticlesRef.current;
    if (!particles) return;

    const createParticle = (x: number, y: number) => {
      const particle = document.createElement("div");
      const random = Math.random();
      
      if (random > 0.7) {
        particle.innerHTML = "🎫";
        particle.className = "landing-page-ticket-particle";
      } else if (random > 0.5) {
        particle.className = "landing-page-confetti-particle";
        particle.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
      } else if (random > 0.3) {
        particle.innerHTML = ["♪", "♫", "♬", "♩"] [
          Math.floor(Math.random() * 4)
        ];
        particle.className = "landing-page-music-note";
      } else {
        particle.className = "landing-page-particle";
      }

      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.setProperty("--random-x", `${(Math.random() - 0.5) * 200}px`);
      particle.style.setProperty("--random-y", `${(Math.random() - 0.5) * 200}px`);

      particles.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 4000);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() > 0.92) {
        createParticle(e.clientX, e.clientY);
      }
    };

    const autoParticles = setInterval(() => {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      createParticle(x, y);
    }, 1500);

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      clearInterval(autoParticles);
    };
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/events");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const eventCategories = [
    { icon: "fas fa-music", name: "Âm nhạc", count: "150+ sự kiện" },
    { icon: "fas fa-palette", name: "Nghệ thuật", count: "80+ sự kiện" },
    { icon: "fas fa-running", name: "Thể thao", count: "120+ sự kiện" },
    { icon: "fas fa-graduation-cap", name: "Giáo dục", count: "90+ sự kiện" },
    { icon: "fas fa-utensils", name: "Ẩm thực", count: "60+ sự kiện" },
    { icon: "fas fa-briefcase", name: "Kinh doanh", count: "110+ sự kiện" },
  ];

  const steps = [
    {
      number: 1,
      title: "Tìm kiếm sự kiện",
      description:
        "Duyệt qua hàng ngàn sự kiện phong phú theo sở thích của bạn",
    },
    {
      number: 2,
      title: "Chọn vé phù hợp",
      description: "Lựa chọn loại vé và số lượng theo nhu cầu tham gia",
    },
    {
      number: 3,
      title: "Thanh toán an toàn",
      description: "Hoàn tất thanh toán với các phương thức bảo mật cao",
    },
    {
      number: 4,
      title: "Tham gia sự kiện",
      description: "Sử dụng vé điện tử để check-in và tận hưởng trải nghiệm",
    },
  ];

  const features = [
    {
      icon: "fas fa-ticket-alt",
      title: "Đặt vé dễ dàng",
      description: "Giao diện thân thiện, đặt vé chỉ trong vài phút"
    },
    {
      icon: "fas fa-shield-alt",
      title: "Thanh toán bảo mật",
      description: "Hệ thống thanh toán an toàn với nhiều phương thức"
    },
    {
      icon: "fas fa-mobile-alt",
      title: "Vé điện tử",
      description: "Vé được gửi ngay qua email và app di động"
    },
    {
      icon: "fas fa-headset",
      title: "Hỗ trợ 24/7",
      description: "Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ"
    }
  ];

  return (
    <div className="landing-page">
      <div className="landing-page-mouse-particles" ref={mouseParticlesRef}></div>

      <div className="landing-page-bg-elements">
        <div className="landing-page-bg-circle landing-page-bg-circle-1"></div>
        <div className="landing-page-bg-circle landing-page-bg-circle-2"></div>
        <div className="landing-page-bg-circle landing-page-bg-circle-3"></div>
        <div className="landing-page-bg-ticket landing-page-bg-ticket-1">🎫</div>
        <div className="landing-page-bg-ticket landing-page-bg-ticket-2">🎟️</div>
        <div className="landing-page-bg-ticket landing-page-bg-ticket-3">🎫</div>
      </div>

      <section
        className="landing-page-hero-section"
        ref={heroRef}
        style={{
          "--mouse-x": `${mousePosition.x}%`,
          "--mouse-y": `${mousePosition.y}%`,
        } as React.CSSProperties}
      >
        <div className="landing-page-hero-bg-glow"></div>
        <Container>
          <div className="landing-page-hero-content">
            <div className="landing-page-hero-left">
              <h1 className="landing-page-hero-title">
                Đặt vé
                <span className="landing-page-ticket-emoji">🎫</span>
                <br />
                <span className="landing-page-title-highlight">Sự kiện tuyệt vời</span>
                <br />
                ngay hôm nay!
              </h1>
              <p className="landing-page-hero-subtitle">
                Nền tảng đặt vé sự kiện hàng đầu Việt Nam. Tìm kiếm, đặt vé và tham
                gia hàng ngàn sự kiện chất lượng từ âm nhạc, nghệ thuật đến thể thao
                và giáo dục với giá tốt nhất.
              </p>

              <div className="landing-page-hero-search">
                <div className="landing-page-search-container">
                  <input
                    type="text"
                    className="landing-page-search-input"
                    placeholder="🎫 Tìm sự kiện, nghệ sĩ, địa điểm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    className="landing-page-search-btn"
                    onClick={handleSearch}
                  >
                    <i className="fas fa-search"></i>
                    <span>Tìm vé ngay</span>
                  </button>
                </div>

                <div className="landing-page-trending-tags">
                  <span className="landing-page-trending-label">🔥 Phổ biến:</span>
                  <a
                    href="/events?category=music"
                    className="landing-page-trending-tag"
                  >
                    Concert
                  </a>
                  <a
                    href="/events?category=art"
                    className="landing-page-trending-tag"
                  >
                    Triển lãm
                  </a>
                  <a
                    href="/events?category=sport"
                    className="landing-page-trending-tag"
                  >
                    Thể thao
                  </a>
                  <a
                    href="/events?category=food"
                    className="landing-page-trending-tag"
                  >
                    Food Festival
                  </a>
                </div>
              </div>

              <div className="landing-page-hero-buttons">
                <Button
                  className="landing-page-cta_primary"
                  onClick={() => navigate("/events")}
                >
                  <i className="fas fa-ticket-alt"></i>
                  <span> Đặt vé ngay</span>
                  <div className="landing-page-button-glow"></div>
                </Button>
                {isAuthenticated ? (
                  <Button
                    className="landing-page-cta-secondary"
                    onClick={() => navigate("/organizer/create-event")}
                  >
                    <i className="fas fa-plus"></i>
                    <span>Tạo sự kiện</span>
                  </Button>
                ) : (
                  <Button
                    className="landing-page-cta-secondary"
                    onClick={() => navigate("/register")}
                  >
                    <i className="fas fa-user-plus"></i>
                    <span>Đăng ký miễn phí</span>
                  </Button>
                )}
              </div>

              <div className="landing-page-hero-stats">
                <div className="landing-page-stat-item">
                  <span className="landing-page-stat-number">1000+</span>
                  <span className="landing-page-stat-label">Vé đã bán</span>
                </div>
                <div className="landing-page-stat-item">
                  <span className="landing-page-stat-number">50K+</span>
                  <span className="landing-page-stat-label">Khách hàng tin tưởng</span>
                </div>
                <div className="landing-page-stat-item">
                  <span className="landing-page-stat-number">500+</span>
                  <span className="landing-page-stat-label">Sự kiện đã tổ chức</span>
                </div>
              </div>
            </div>

            <div className="landing-page-hero-right">
              <div className="landing-page-hero-visual">
                <div className="landing-page-main-ticket">
                  <div className="landing-page-ticket-perforation"></div>
                  <div className="landing-page-ticket-content">
                    <div className="landing-page-ticket-header">
                      <div>
                        <div className="landing-page-ticket-title">LIVE CONCERT</div>
                        <div className="landing-page-ticket-date">28 DEC 2024 • 20:00</div>
                      </div>
                      <div className="landing-page-ticket-qr">
                        <i className="fas fa-qrcode"></i>
                      </div>
                    </div>
                    <div className="landing-page-ticket-footer">
                      <div className="landing-page-ticket-price">500K</div>
                      <div className="landing-page-ticket-id">#VE001234</div>
                    </div>
                  </div>
                </div>
                
                <div className="landing-page-floating-tickets">
                  <div className="landing-page-mini-ticket landing-page-mini-ticket-1"></div>
                  <div className="landing-page-mini-ticket landing-page-mini-ticket-2"></div>
                  <div className="landing-page-mini-ticket landing-page-mini-ticket-3"></div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="landing-page-features-section">
        <Container>
          <div className="landing-page-section-header">
            <h2 className="landing-page-section-title">
              <span>Tại sao chọn chúng tôi?</span>
              <div className="landing-page-title-underline"></div>
            </h2>
            <p className="landing-page-section-subtitle">
              Trải nghiệm đặt vé tuyệt vời với những tính năng vượt trội
            </p>
          </div>
          <div className="landing-page-features-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className="landing-page-feature-card"
                style={{ "--delay": `${index * 0.1}s` } as React.CSSProperties}
              >
                <div className="landing-page-feature-icon">
                  <i className={feature.icon}></i>
                </div>
                <h3 className="landing-page-feature-title">{feature.title}</h3>
                <p className="landing-page-feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <div className="landing-page-wave-divider">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"></path>
        </svg>
      </div>

      <section className="landing-page-featured-section">
        <Container>
          <div className="landing-page-section-header">
            <h2 className="landing-page-section-title">
              <span>Sự kiện nổi bật</span>
              <div className="landing-page-title-underline"></div>
            </h2>
            <p className="landing-page-section-subtitle">
              Những sự kiện được yêu thích và đặt vé nhiều nhất
            </p>
          </div>
          <div className="landing-page-events-container">
            <EventsPage />
          </div>
          <div className="text-center mt-4">
            <Button
              className="landing-page-see-more-btn"
              onClick={() => navigate("/events")}
            >
              <span>Xem tất cả sự kiện</span>
              <i className="fas fa-arrow-right"></i>
            </Button>
          </div>
        </Container>
      </section>

      <section className="landing-page-categories-section">
        <Container>
          <div className="landing-page-section-header">
            <h2 className="landing-page-section-title">
              <span>Danh mục sự kiện</span>
              <div className="landing-page-title-underline"></div>
            </h2>
            <p className="landing-page-section-subtitle">
              Khám phá vé sự kiện theo từng lĩnh vực yêu thích của bạn
            </p>
          </div>
          <div className="landing-page-categories-grid">
            {eventCategories.map((category, index) => (
              <div
                key={index}
                className="landing-page-category-card"
                onClick={() =>
                  navigate(`/events?category=${category.name.toLowerCase()}`)
                }
                style={{ "--delay": `${index * 0.1}s` } as React.CSSProperties}
              >
                <div className="landing-page-category-icon">
                  <i className={category.icon}></i>
                </div>
                <div className="landing-page-category-content">
                  <div className="landing-page-category-name">{category.name}</div>
                  <div className="landing-page-category-count">{category.count}</div>
                </div>
                <div className="landing-page-category-hover-effect"></div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="landing-page-steps-section">
        <Container>
          <div className="landing-page-section-header">
            <h2 className="landing-page-section-title">
              <span>Cách đặt vé</span>
              <div className="landing-page-title-underline"></div>
            </h2>
            <p className="landing-page-section-subtitle">
              Chỉ với 4 bước đơn giản để có vé tham gia sự kiện yêu thích
            </p>
          </div>
          <div className="landing-page-steps-grid">
            {steps.map((step, index) => (
              <div
                key={index}
                className="landing-page-step-card"
                style={{ "--delay": `${index * 0.2}s` } as React.CSSProperties}
              >
                <div className="landing-page-step-number">
                  <span>{step.number}</span>
                  <div className="landing-page-step-number-bg"></div>
                </div>
                <h3 className="landing-page-step-title">{step.title}</h3>
                <p className="landing-page-step-description">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="landing-page-step-connector"></div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="landing-page-cta-section">
        <div className="landing-page-cta-bg"></div>
        <Container>
          <div className="landing-page-cta-content">
            <h2>Bắt đầu đặt vé ngay hôm nay!</h2>
            <p>
              Tham gia cùng hàng nghìn người đã tin tưởng và đặt vé qua nền tảng
              của chúng tôi
            </p>
            {!isAuthenticated ? (
              <Button
                className="landing-page-cta-final"
                onClick={() => navigate("/register")}
              >
                <i className="fas fa-ticket-alt"></i>
                <span>Đăng ký & Đặt vé ngay</span>
                <div className="landing-page-button-shine"></div>
              </Button>
            ) : (
              <div className="landing-page-cta-buttons">
                <Button
                  className="landing-page-cta_primary"
                  onClick={() => navigate("/events")}
                >
                  <i className="fas fa-ticket-alt"></i>
                  <span> Đặt vé ngay</span>
                </Button>
                <Button
                  className="landing-page-cta_primary"
                  onClick={() => navigate("/organizer/create-event")}
                >
                  <i className="fas fa-plus"></i>
                  <span> Tạo sự kiện mới</span>
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
