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
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await eventService.getAllPaginated({
          page: 0,
          size: 10,
          sort: "ngayTao,desc",
        });
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
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
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
      const scrollAmount = 740;
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="events-container">
      <div className="events-wrapper">
        <h1 className="page-title">Sự Kiện Nổi Bật</h1>
        <div className="events-slider-container">
          <button
            className="slider-nav-btn prev"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <div className="events-slider" ref={sliderRef}>
            {events.map((event) => (
              <div key={event.maSuKien} className="event-slide">
                <img src={getImageUrl(event.anhBia)} alt={event.tieuDe} />
                <div className="event-overlay">
                  <div className="event-info">
                    <h3>{event.tieuDe}</h3>
                    <div className="event-details">
                      <div className="detail-item">
                        <i className="fas fa-calendar-alt"></i>
                        <span>
                          Ngày diễn ra: {formatDate(event.thoiGianBatDau)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{event.diaDiem.tenDiaDiem}</span>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-ticket-alt"></i>
                        <span>Bán vé từ: {formatDate(event.ngayMoBanVe)}</span>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-clock"></i>
                        <span>Đóng bán: {formatDate(event.ngayDongBanVe)}</span>
                      </div>
                    </div>
                    <button className="view-details-btn" onClick={() => navigate(`/events/${event.maSuKien}`)}>Xem Chi Tiết</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="slider-nav-btn next"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventsSlider;
