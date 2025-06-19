import React, { useEffect, useState, useRef } from "react";
import { eventService } from "../../../api/eventService";
import { formatDate, getImageUrl } from "../../../utils/helper";
import "./EventSlider.css";
import { SuKien } from "../../../types/EventTypes";
import { useNavigate } from "react-router-dom";

const EventsSlider: React.FC = () => {
  const [events, setEvents] = useState<SuKien[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await eventService.getPaginatedFiler(
          0,
          12,
          undefined,
          true
        );
        setEvents(response.data.content);
        setError(null);
      } catch (err) {
        setError("Không thể tải danh sách sự kiện. Vui lòng thử lại sau.");
        console.error("Error loading events:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  useEffect(() => {
    const checkScroll = () => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

        const cardWidth = 320;
        const newIndex = Math.round(scrollLeft / cardWidth);
        setCurrentIndex(newIndex);
      }
    };

    const slider = sliderRef.current;
    if (slider) {
      checkScroll();
      slider.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }

    return () => {
      if (slider) {
        slider.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      }
    };
  }, [events]);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const cardWidth = 1000;
      const scrollAmount = cardWidth;
      const newScrollLeft =
        direction === "left"
          ? sliderRef.current.scrollLeft - scrollAmount
          : sliderRef.current.scrollLeft + scrollAmount;

      sliderRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const handleBookNow = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/events/${eventId}`);
  };

  const handleCardClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  if (loading) {
    return (
      <div className="event-slider-loading">
        <div className="event-slider-spinner">
          <div className="event-slider-spinner-ring"></div>
          <span>Đang tải sự kiện...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-slider-error">
        <i className="fas fa-exclamation-triangle"></i>
        <p>{error}</p>
        <button
          className="event-slider-retry-btn"
          onClick={() => window.location.reload()}
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="event-slider-empty">
        <i className="fas fa-calendar-times"></i>
        <p>Chưa có sự kiện nào được tổ chức</p>
      </div>
    );
  }

  return (
    <div className="event-slider-container">
      <div className="event-slider-wrapper">
        <button
          className={`event-slider-nav-btn event-slider-nav-prev ${!canScrollLeft ? "event-slider-nav-disabled" : ""
            }`}
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          aria-label="Previous events"
        >
          <i className="fas fa-chevron-left"></i>
          <div className="event-slider-nav-glow"></div>
        </button>

        <button
          className={`event-slider-nav-btn event-slider-nav-next ${!canScrollRight ? "event-slider-nav-disabled" : ""
            }`}
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          aria-label="Next events"
        >
          <i className="fas fa-chevron-right"></i>
          <div className="event-slider-nav-glow"></div>
        </button>

        <div className="event-slider-track" ref={sliderRef}>
          <div className="event-slider-content">
            {events.map((event, index) => (
              <div
                key={event.maSuKien}
                className="event-slider-card"
                onClick={() => handleCardClick(event.maSuKien)}
                style={{
                  "--card-index": index,
                  "--animation-delay": `${index * 0.1}s`,
                } as React.CSSProperties}
              >
                <div className="event-slider-card-inner">
                  <div className="event-slider-image-container">
                    <img
                      src={getImageUrl(event.anhBia)}
                      alt={event.tieuDe}
                      className="event-slider-image"
                      loading="lazy"
                    />
                    <div className="event-slider-image-overlay"></div>
                    <div className="event-slider-status-badge">
                      <i className="fas fa-calendar-check"></i>
                      <span>Đang bán</span>
                    </div>
                  </div>

                  <div className="event-slider-content-area">
                    <div className="event-slider-header">
                      <h3 className="event-slider-title">{event.tieuDe}</h3>
                    </div>

                    <div className="event-slider-details">
                      <div className="event-slider-detail-item">
                        <div className="event-slider-detail-icon">
                          <i className="fas fa-calendar-alt"></i>
                        </div>
                        <div className="event-slider-detail-text">
                          <span className="event-slider-detail-label">
                            Ngày diễn ra
                          </span>
                          <span className="event-slider-detail-value">
                            {formatDate(event.thoiGianBatDau)}
                          </span>
                        </div>
                      </div>

                      <div className="event-slider-detail-item">
                        <div className="event-slider-detail-icon">
                          <i className="fas fa-map-marker-alt"></i>
                        </div>
                        <div className="event-slider-detail-text">
                          <span className="event-slider-detail-label">Địa điểm</span>
                          <span className="event-slider-detail-value">
                            {event.diaDiem.tenDiaDiem}
                          </span>
                        </div>
                      </div>

                      <div className="event-slider-detail-item">
                        <div className="event-slider-detail-icon">
                          <i className="fas fa-clock"></i>
                        </div>
                        <div className="event-slider-detail-text">
                          <span className="event-slider-detail-label">
                            Bán vé đến
                          </span>
                          <span className="event-slider-detail-value">
                            {formatDate(event.ngayDongBanVe)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      className="event-slider-book-btn"
                      onClick={(e) => handleBookNow(event.maSuKien, e)}
                    >
                      <i className="fas fa-ticket-alt"></i>
                      <span>Đặt vé ngay</span>
                      <div className="event-slider-btn-shine"></div>
                    </button>
                  </div>
                </div>

                <div className="event-slider-card-glow"></div>
                <div className="event-slider-card-particles">
                  <div className="event-slider-particle"></div>
                  <div className="event-slider-particle"></div>
                  <div className="event-slider-particle"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="event-slider-indicators">
          {Array.from({ length: Math.ceil(events.length / 3) }).map((_, index) => (
            <div
              key={index}
              className={`event-slider-indicator ${Math.floor(currentIndex / 3) === index
                ? "event-slider-indicator-active"
                : ""
                }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsSlider;
