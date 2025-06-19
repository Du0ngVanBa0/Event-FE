import { useEffect, useRef, useState } from "react";
import { Container, Row, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import { useAuth } from "../../../hooks/useAuth";
import { eventService } from "../../../api/eventService";
import { SuKien } from "../../../types/EventTypes";
import { getImageUrl, getDefaulImagetUrl, formatDate } from "../../../utils/helper";
import EventsSlider from "../../common/events/EventsSlider";

const LandingPage = () => {
  const mouseParticlesRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [popularEvents, setPopularEvents] = useState<SuKien[]>([]);
  const [spotlightEvent, setSpotlightEvent] = useState<SuKien | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const response = await eventService.getPaginatedFiler(0, 10, undefined, true);
        const events = response.data.content;

        if (events.length > 0) {
          setPopularEvents(events.slice(0, 4));
          setSpotlightEvent(events[0]);
        }
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  useEffect(() => {
    if (!spotlightEvent) return;

    const timer = setInterval(() => {
      const eventDate = new Date(spotlightEvent.ngayMoBanVe).getTime();
      const now = new Date().getTime();
      const difference = eventDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [spotlightEvent]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseParticlesRef.current && Math.random() > 0.7) {
        const rect = mouseParticlesRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const particleTypes = ['🎫', '🎵', '⭐'];
        const randomType = particleTypes[Math.floor(Math.random() * particleTypes.length)];

        const particle = document.createElement('div');
        particle.className = 'landing-page-mouse-particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.innerHTML = randomType;
        particle.style.setProperty('--random-x', `${(Math.random() - 0.5) * 200}px`);
        particle.style.setProperty('--random-y', `${(Math.random() - 0.5) * 200}px`);

        mouseParticlesRef.current.appendChild(particle);

        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 2000);
      }
    };

    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (heroElement) {
        heroElement.removeEventListener('mousemove', handleMouseMove);
      }
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

  const getEventStatus = (event: SuKien) => {
    const now = new Date();
    const openSaleDate = new Date(event.ngayMoBanVe);
    const closeSaleDate = new Date(event.ngayDongBanVe);
    const eventDate = new Date(event.ngayDongBanVe);
    
    if (now > closeSaleDate) {
      return { label: "Hết bán vé", color: "#EF4444" };
    }
    
    if (now < openSaleDate) {
      const daysUntilSale = Math.ceil((openSaleDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilSale <= 7) {
        return { label: `Mở bán sau ${daysUntilSale} ngày`, color: "#F59E0B" };
      }
      return { label: "Sắp mở bán", color: "#8B5CF6" };
    }
    
    const totalOriginalTickets = event.loaiVes?.reduce((sum, ticket) => sum + ticket.soLuong, 0) || 0;
    const totalRemainingTickets = event.loaiVes?.reduce((sum, ticket) => sum + (ticket.veConLai || ticket.soLuong), 0) || 0;
    
    if (totalRemainingTickets === 0) {
      return { label: "Hết vé", color: "#EF4444" };
    }
    
    const percentageRemaining = (totalRemainingTickets / totalOriginalTickets) * 100;
    
    if (percentageRemaining < 10) {
      return { label: `Chỉ còn ${totalRemainingTickets} vé`, color: "#EF4444" };
    }
    
    if (percentageRemaining < 50) {
      return { label: "Sắp hết vé", color: "#F59E0B" };
    }
    
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilEvent <= 3) {
      return { label: `Còn ${daysUntilEvent} ngày`, color: "#F59E0B" };
    }
    
    return { label: "Đang mở bán", color: "#10B981" };
  };

  const getLowestPrice = (event: SuKien) => {
    if (!event.loaiVes || event.loaiVes.length === 0) return 0;
    return Math.min(...event.loaiVes.map(ticket => ticket.giaTien));
  };

  return (
    <div className="landing-page">
      <div className="landing-page-mouse-particles" ref={mouseParticlesRef}></div>

      <div className="landing-page-bg-elements">
        <div className="landing-page-bg-circle landing-page-bg-circle-1"></div>
        <div className="landing-page-bg-circle landing-page-bg-circle-2"></div>
        <div className="landing-page-bg-circle landing-page-bg-circle-3"></div>
        <div className="landing-page-bg-ticket landing-page-bg-ticket-1">🎫</div>
        <div className="landing-page-bg-ticket landing-page-bg-ticket-2">🎪</div>
        <div className="landing-page-bg-ticket landing-page-bg-ticket-3">🎵</div>
      </div>


      {spotlightEvent && (
        <section className="landing-page-spotlight-banner">
          <div className="landing-page-spotlight-bg">
            <img
              src={getImageUrl(spotlightEvent.anhBia) || getDefaulImagetUrl()}
              alt={spotlightEvent.tieuDe}
              className="landing-page-spotlight-bg-image"
            />
            <div className="landing-page-spotlight-overlay"></div>
          </div>

          <Container fluid>
            <div className="landing-page-spotlight-content">
              <div className="landing-page-spotlight-badge">
                <i className="fas fa-star"></i>
                <span>VỪA CÔNG BỐ</span>
              </div>

              <h2 className="landing-page-spotlight-title">{spotlightEvent.tieuDe}</h2>

              <div className="landing-page-spotlight-details">
                <div className="landing-page-spotlight-info">
                  <i className="fas fa-calendar"></i>
                  <span>{formatDate(spotlightEvent.thoiGianBatDau)}</span>
                </div>
                <div className="landing-page-spotlight-info">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{spotlightEvent.diaDiem?.tenDiaDiem}</span>
                </div>
              </div>

              <div className="landing-page-countdown">
                <div className="landing-page-countdown-item">
                  <span className="landing-page-countdown-number">{timeLeft.days}</span>
                  <span className="landing-page-countdown-label">Ngày</span>
                </div>
                <div className="landing-page-countdown-item">
                  <span className="landing-page-countdown-number">{timeLeft.hours}</span>
                  <span className="landing-page-countdown-label">Giờ</span>
                </div>
                <div className="landing-page-countdown-item">
                  <span className="landing-page-countdown-number">{timeLeft.minutes}</span>
                  <span className="landing-page-countdown-label">Phút</span>
                </div>
                <div className="landing-page-countdown-item">
                  <span className="landing-page-countdown-number">{timeLeft.seconds}</span>
                  <span className="landing-page-countdown-label">Giây</span>
                </div>
              </div>

              <Button
                className="landing-page-spotlight-cta"
                onClick={() => navigate(`/events/${spotlightEvent.maSuKien}`)}
              >
                <i className="fas fa-bolt"></i>
                <span>Đặt vé độc quyền</span>
                <div className="landing-page-button-shine"></div>
              </Button>
            </div>
          </Container>
        </section>
      )}

      <section className="landing-page-popular-events">
        <Container fluid>
          <div className="landing-page-section-header">
            <h2 className="landing-page-section-title">
              <span>🔥 Đang thịnh hành</span>
              <div className="landing-page-title-underline"></div>
            </h2>
            <p className="landing-page-section-subtitle">
              Đừng bỏ lỡ những sự kiện hot mà mọi người đang nói đến
            </p>
          </div>

          {loading ? (
            <div className="landing-page-loading">
              <div className="landing-page-spinner">
                <i className="fas fa-spinner fa-spin"></i>
              </div>
              <p>Đang tải những sự kiện tuyệt vời...</p>
            </div>
          ) : (
            <div className="landing-page-events-container">
              <div className="landing-page-events-scroll">
                {popularEvents.map((event, index) => {
                  const status = getEventStatus(event);
                  const lowestPrice = getLowestPrice(event);

                  return (
                    <div
                      key={event.maSuKien}
                      className="landing-page-event-card"
                      style={{ '--delay': `${index * 0.1}s` } as React.CSSProperties}
                    >
                      <div className="landing-page-event-image-container">
                        <img
                          src={getImageUrl(event.anhBia) || getDefaulImagetUrl()}
                          alt={event.tieuDe}
                          className="landing-page-event-image"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = getDefaulImagetUrl();
                          }}
                        />
                        <div className="landing-page-event-overlay">
                          <Button
                            className="landing-page-event-overlay-btn"
                            onClick={() => navigate(`/events/${event.maSuKien}`)}
                          >
                            <i className="fas fa-eye"></i>
                            Xem chi tiết
                          </Button>
                        </div>
                        <div
                          className="landing-page-event-status"
                          style={{ backgroundColor: status.color }}
                        >
                          {status.label}
                        </div>
                        {lowestPrice > 0 && (
                          <div className="landing-page-event-price">
                            Từ {lowestPrice.toLocaleString('vi-VN')}đ
                          </div>
                        )}
                      </div>

                      <div className="landing-page-event-content">
                        <h3 className="landing-page-event-title">{event.tieuDe}</h3>
                        <div className="landing-page-event-meta">
                          <div className="landing-page-event-date">
                            <i className="fas fa-calendar"></i>
                            {new Date(event.thoiGianBatDau).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="landing-page-event-location">
                            <i className="fas fa-map-marker-alt"></i>
                            {event.diaDiem?.tenDiaDiem}
                          </div>
                        </div>

                        <Button
                          className="landing-page-event-cta"
                          onClick={() => navigate(`/events/${event.maSuKien}`)}
                        >
                          <i className="fas fa-ticket-alt"></i>
                          <span>Mua vé</span>
                        </Button>
                      </div>

                      <div className="landing-page-event-glow"></div>
                    </div>
                  );
                })}
              </div>

              <div className="landing-page-events-actions">
                <Button
                  className="landing-page-see-more-btn"
                  onClick={() => navigate("/events")}
                >
                  <i className="fas fa-arrow-right"></i>
                  <span>Xem tất cả sự kiện</span>
                </Button>
              </div>
            </div>
          )}
        </Container>
      </section>

      <section className="landing-page-popular-events">
        <Container fluid>
          <div className="landing-page-section-header">
            <h2 className="landing-page-section-title">
              <span>Vừa ra mắt</span>
              <div className="landing-page-title-underline"></div>
            </h2>
            <p className="landing-page-section-subtitle">
              Đừng bỏ lỡ những sự kiện vừa ra mắt và đang thu hút sự chú ý
            </p>
          </div>
          <EventsSlider />
        </Container>
      </section>

      <section className="landing-page-hero-section" ref={heroRef}>
        <div className="landing-page-hero-bg-glow"></div>
        <Container fluid>
          <div className="landing-page-hero-content">
            <div className="landing-page-hero-left">
              <h1 className="landing-page-hero-title">
                Đặt vé cho những
                <span className="landing-page-ticket-emoji">🎫</span>
                <br />
                <span className="landing-page-title-highlight">Sự kiện HOT nhất</span>
                <br />
                gần bạn
              </h1>

              <p className="landing-page-hero-subtitle">
                Khám phá những sự kiện tuyệt vời đang diễn ra xung quanh bạn. Từ concert, lễ hội
                đến hội thảo, workshop - tìm trải nghiệm tuyệt vời tiếp theo và đặt vé ngay lập tức!
              </p>

              {/* Enhanced Search */}
              <div className="landing-page-hero-search">
                <div className="landing-page-search-container">
                  <input
                    type="text"
                    className="landing-page-search-input"
                    placeholder="🔍 Tìm sự kiện, nghệ sĩ, địa điểm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button className="landing-page-search-btn" onClick={handleSearch}>
                    <i className="fas fa-search"></i>
                    <span>Khám phá sự kiện</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="landing-page-hero-buttons">
                <Button
                  className="landing-page-cta-primary"
                  onClick={() => navigate("/events")}
                >
                  <i className="fas fa-ticket-alt"></i>
                  <span>Mua vé ngay</span>
                  <div className="landing-page-button-glow"></div>
                </Button>
                {!isAuthenticated && (
                  <Button
                    className="landing-page-cta-secondary"
                    onClick={() => navigate("/register")}
                  >
                    <i className="fas fa-user-plus"></i>
                    <span>Đăng ký miễn phí</span>
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="landing-page-hero-stats">
                <div className="landing-page-stat-item">
                  <span className="landing-page-stat-number">50K+</span>
                  <span className="landing-page-stat-label">Vé đã bán</span>
                </div>
                <div className="landing-page-stat-item">
                  <span className="landing-page-stat-number">500+</span>
                  <span className="landing-page-stat-label">Sự kiện</span>
                </div>
                <div className="landing-page-stat-item">
                  <span className="landing-page-stat-number">10K+</span>
                  <span className="landing-page-stat-label">Khách hàng hài lòng</span>
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
                        <div className="landing-page-ticket-title">Lễ hội âm nhạc mùa hè</div>
                        <div className="landing-page-ticket-date">Thứ 7, 15/6 • 19:00</div>
                      </div>
                      <div className="landing-page-ticket-qr">
                        <i className="fas fa-qrcode"></i>
                      </div>
                    </div>
                    <div className="landing-page-ticket-footer">
                      <div className="landing-page-ticket-price">299.000₫</div>
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
        <Container fluid>
          <div className="landing-page-section-header">
            <h2 className="landing-page-section-title">
              <span>Tại sao chọn chúng tôi?</span>
              <div className="landing-page-title-underline"></div>
            </h2>
            <p className="landing-page-section-subtitle">
              Trải nghiệm nền tảng đặt vé sự kiện tốt nhất với những tính năng tuyệt vời
            </p>
          </div>

          <Row className="landing-page-features-grid">
            <div className="landing-page-feature-card">
              <div className="landing-page-feature-icon">
                <i className="fas fa-bolt"></i>
              </div>
              <h3 className="landing-page-feature-title">Đặt vé nhanh chóng</h3>
              <p className="landing-page-feature-description">
                Đặt vé trong vài giây với quy trình thanh toán đơn giản và tối ưu
              </p>
            </div>
            <div className="landing-page-feature-card">
              <div className="landing-page-feature-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="landing-page-feature-title">Thanh toán an toàn</h3>
              <p className="landing-page-feature-description">
                Thanh toán được bảo vệ với mã hóa và bảo mật cấp độ ngân hàng
              </p>
            </div>
            <div className="landing-page-feature-card">
              <div className="landing-page-feature-icon">
                <i className="fas fa-star"></i>
              </div>
              <h3 className="landing-page-feature-title">Nền tảng uy tín</h3>
              <p className="landing-page-feature-description">
                Tham gia cùng hàng nghìn khách hàng hài lòng tin tưởng sử dụng dịch vụ
              </p>
            </div>
            <div className="landing-page-feature-card">
              <div className="landing-page-feature-icon">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <h3 className="landing-page-feature-title">Vé điện tử</h3>
              <p className="landing-page-feature-description">
                Nhận vé điện tử ngay lập tức trên điện thoại - không cần in vé
              </p>
            </div>
          </Row>
        </Container>
      </section>

      <section className="landing-page-cta-section">
        <div className="landing-page-cta-bg"></div>
        <Container fluid>
          <div className="landing-page-cta-content">
            <h2>Sẵn sàng tìm sự kiện tuyệt vời tiếp theo?</h2>
            <p>
              Tham gia cùng hàng nghìn người yêu thích sự kiện đã khám phá những trải nghiệm không thể quên qua nền tảng của chúng tôi
            </p>
            <div className="landing-page-cta_buttons">
              <Button
                className="landing-page-cta-final"
                onClick={() => navigate("/events")}
              >
                <i className="fas fa-rocket"></i>
                <span>Bắt đầu khám phá</span>
                <div className="landing-page-button-shine"></div>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default LandingPage;
