import { ComponentProps, useState, useEffect } from "react";
import {
  Container,
  Form,
  Nav,
  Tab,
  Row,
  Col,
  Button,
  Alert,
} from "react-bootstrap";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "./EditEvent.css";
import { TicketType, KhuVucEventRequest, KhuVucTemplate } from "../../../types/EventTypes";
import TicketTypeModal from "./TicketTypeModal";
import placeService from "../../../api/placeService";
import { TinhThanh, QuanHuyen } from "../../../types/PlaceTypes";
import CategorySelector from "./CategorySelector";
import ZoneDesignerTab from "../create-event/ZoneDesignerTab";
import eventService from "../../../api/eventService";
import { CreateSuKienDTO } from "../../../types/EventTypes";
import { useParams } from "react-router-dom";
import { getImageUrl } from "../../../utils/helper";

interface EventForm {
  maSuKien: string;
  tieuDe: string;
  moTa: string;
  anhBiaFile: File | null;
  tinhThanh: string;
  quanHuyen: string;
  phuongXa: string;
  tenDiaDiem: string;
  ngayMoBanVe: string;
  gioMoBanVe: string;
  ngayDongBanVe: string;
  gioDongBanVe: string;
  ngayBatDau: string;
  gioBatDau: string;
  ngayKetThuc: string;
  gioKetThuc: string;
  danhMucSuKiens: string[];
}

interface ValidationErrors {
  tieuDe?: string;
  moTa?: string;
  anhBiaFile?: string;
  diaDiem?: string;
  danhMucSuKiens?: string;
  thoiGian?: string;
  loaiVe?: string;
  khuVuc?: string;
}

type EditorType = ComponentProps<typeof CKEditor>["editor"];
const EditorWithTypes = ClassicEditor as unknown as EditorType;

const EditEvent = () => {
  const [activeTab, setActiveTab] = useState("basic-info");
  const [notification, setNotification] = useState<{
    message: string;
    type: string;
  } | null>(null);
  const [eventForm, setEventForm] = useState<EventForm>({
    maSuKien: "",
    tieuDe: "",
    moTa: "",
    anhBiaFile: null,
    tinhThanh: "",
    quanHuyen: "",
    phuongXa: "",
    tenDiaDiem: "",
    ngayMoBanVe: "",
    gioMoBanVe: "",
    ngayDongBanVe: "",
    gioDongBanVe: "",
    ngayBatDau: "",
    gioBatDau: "",
    ngayKetThuc: "",
    gioKetThuc: "",
    danhMucSuKiens: [],
  });

  const { id } = useParams();
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [zones, setZones] = useState<KhuVucEventRequest[]>([]);
  const [mockTemplates, setMockTemplates] = useState<KhuVucTemplate[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketType | undefined>(
    undefined
  );
  const [places, setPlaces] = useState<TinhThanh[]>([]);
  const [selectedTinhThanh, setSelectedTinhThanh] = useState<TinhThanh | null>(
    null
  );
  const [selectedQuanHuyen, setSelectedQuanHuyen] = useState<QuanHuyen | null>(
    null
  );
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEventForm({ ...eventForm, anhBiaFile: file });
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const validateBasicInfo = () => {
    const errors: ValidationErrors = {};

    if (!eventForm.tieuDe.trim()) errors.tieuDe = 'Vui lòng nhập tiêu đề sự kiện';
    if (!eventForm.moTa.trim()) errors.moTa = 'Vui lòng nhập mô tả sự kiện';
    if (!eventForm.anhBiaFile && !selectedImage) errors.anhBiaFile = 'Vui lòng chọn ảnh bìa';
    if (!eventForm.tenDiaDiem || !eventForm.phuongXa) {
      errors.diaDiem = 'Vui lòng chọn địa điểm đầy đủ';
    }

    if (!eventForm.ngayBatDau || !eventForm.gioBatDau) {
      errors.thoiGian = 'Vui lòng chọn thời gian bắt đầu';
    } else if (!eventForm.ngayKetThuc || !eventForm.gioKetThuc) {
      errors.thoiGian = 'Vui lòng chọn thời gian kết thúc';
    } else if (!eventForm.ngayMoBanVe || !eventForm.gioMoBanVe) {
      errors.thoiGian = 'Vui lòng chọn thời gian mở bán vé';
    } else if (!eventForm.ngayDongBanVe || !eventForm.gioDongBanVe) {
      errors.thoiGian = 'Vui lòng chọn thời gian đóng bán vé';
    } else {
      const startDate = new Date(`${eventForm.ngayBatDau}T${eventForm.gioBatDau}:00`);
      const endDate = new Date(`${eventForm.ngayKetThuc}T${eventForm.gioKetThuc}:00`);
      const ticketSaleStart = new Date(`${eventForm.ngayMoBanVe}T${eventForm.gioMoBanVe}:00`);
      const ticketSaleEnd = new Date(`${eventForm.ngayDongBanVe}T${eventForm.gioDongBanVe}:00`);

      if (endDate <= startDate) {
        errors.thoiGian = 'Thời gian kết thúc phải sau thời gian bắt đầu';
      } else if (ticketSaleEnd <= ticketSaleStart) {
        errors.thoiGian = 'Thời gian đóng bán vé phải sau thời gian mở bán vé';
      }
    }

    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const validateCategories = () => {
    return eventForm.danhMucSuKiens.length > 0;
  };

  const validateZones = () => {
    return zones.length > 0;
  };

  const validateTicketTypes = () => {
    if (ticketTypes.length === 0) return false;
    const ticketsWithoutZones = ticketTypes.filter(ticket => !ticket.maKhuVuc);
    return ticketsWithoutZones.length === 0;
  };

  const showNotification = (message: string, type: string) => {
    setNotification({ message, type });
  };

  const handleTabChange = (tab: string | null) => {
    if (!tab) return;

    if (activeTab === 'basic-info') {
      const { isValid, errors } = validateBasicInfo();
      if (!isValid && (tab === 'categories' || tab === 'zones' || tab === 'tickets')) {
        setValidationErrors(errors);
        showNotification('Vui lòng hoàn thành thông tin cơ bản trước khi tiếp tục', 'warning');
        return;
      }
    }

    if (activeTab === 'categories') {
      if (!validateCategories() && (tab === 'zones' || tab === 'tickets')) {
        showNotification('Vui lòng chọn ít nhất một danh mục', 'warning');
        return;
      }
    }

    if (activeTab === 'zones') {
      if (!validateZones() && tab === 'tickets') {
        showNotification('Vui lòng tạo ít nhất một khu vực', 'warning');
        return;
      }
    }

    setActiveTab(tab);
    setValidationErrors({});
  };

  const handleNext = () => {
    const tabs = ['basic-info', 'categories', 'zones', 'tickets'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      handleTabChange(tabs[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const tabs = ['basic-info', 'categories', 'zones', 'tickets'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const getUsedZones = () => {
    return ticketTypes
      .filter(ticket => ticket.maKhuVuc)
      .map(ticket => ticket.maKhuVuc!);
  };

  const handleAddTicket = (ticket: Omit<TicketType, "id">) => {
    const newTicket = {
      ...ticket,
      id: Date.now().toString(),
    };
    setTicketTypes([...ticketTypes, newTicket]);
  };

  const handleEditTicket = (ticket: Omit<TicketType, "id">) => {
    if (editingTicket) {
      setTicketTypes(
        ticketTypes.map((t) =>
          t.id === editingTicket.id ? { ...ticket, id: editingTicket.id } : t
        )
      );
      setEditingTicket(undefined);
    }
  };

  const handleDeleteTicket = (ticketId: string) => {
    setTicketTypes(prev => prev.filter(t => t.id !== ticketId));
  };

  const handleTemplatesLoad = (templates: KhuVucTemplate[]) => {
    setMockTemplates(templates);
  };

  const handleSubmit = async () => {
    try {
      const { isValid } = validateBasicInfo();
      if (!isValid || !validateCategories() || !validateZones() || !validateTicketTypes()) {
        showNotification('Vui lòng kiểm tra lại tất cả thông tin', 'danger');
        return;
      }

      const combinedDateTime = {
        thoiGianBatDau: `${eventForm.ngayBatDau}T${eventForm.gioBatDau}:00`,
        thoiGianKetThuc: `${eventForm.ngayKetThuc}T${eventForm.gioKetThuc}:00`,
        ngayMoBanVe: `${eventForm.ngayMoBanVe}T${eventForm.gioMoBanVe}:00`,
        ngayDongBanVe: `${eventForm.ngayDongBanVe}T${eventForm.gioDongBanVe}:00`,
      };

      const processedTicketTypes = ticketTypes.map(ticket => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { maLoaiVe: _id, id, veConLai, tenKhuVuc, ...rest } = ticket;
        
        return {
          ...rest,
          maKhuVuc: ticket.maKhuVuc || ""
        };
      });

      const eventData: CreateSuKienDTO = {
        tieuDe: eventForm.tieuDe,
        moTa: eventForm.moTa,
        tenDiaDiem: eventForm.tenDiaDiem,
        maPhuongXa: eventForm.phuongXa,
        maDanhMucs: eventForm.danhMucSuKiens,
        loaiVes: processedTicketTypes,
        khuVucs: zones,
        ...combinedDateTime,
        anhBia: eventForm.anhBiaFile,
      };

      await eventService.update(eventForm?.maSuKien, eventData);
      setNotification({
        message: "Cập nhật sự kiện thành công",
        type: "success",
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setNotification({
        message: "Không thể cập nhật sự kiện",
        type: "danger",
      });
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (notification) {
      timeoutId = setTimeout(() => {
        setNotification(null);
      }, 3000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [notification]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const placesData = await placeService.getAll();
        setPlaces(placesData);
      } catch (error) {
        console.error('Error loading data:', error);
        setNotification({
          message: "Không thể tải thông tin sự kiện",
          type: "danger",
        });
      }
    };

    loadData();
  }, [id]);

  useEffect(() => {
    const loadEvent = async () => {
      if (id) {
        const response = await eventService.getEventById(id);
        if (response.data) {
          const eventData = response.data;

          if (eventData.anhBia) {
            setSelectedImage(eventData.anhBia);
          }

          const tinhThanh = places.find(p => p.maTinhThanh === eventData.diaDiem.maTinhThanh);
          if (tinhThanh) {
            setSelectedTinhThanh(tinhThanh);
            const quanHuyen = tinhThanh.quanHuyens.find(q => q.maQuanHuyen === eventData.diaDiem.maQuanHuyen);
            if (quanHuyen) {
              setSelectedQuanHuyen(quanHuyen);
            }
          }

          setEventForm({
            maSuKien: eventData?.maSuKien,
            tieuDe: eventData.tieuDe,
            moTa: eventData.moTa,
            anhBiaFile: null,
            tinhThanh: eventData.diaDiem.maTinhThanh,
            quanHuyen: eventData.diaDiem.maQuanHuyen,
            phuongXa: eventData.diaDiem.maPhuongXa,
            tenDiaDiem: eventData.diaDiem.tenDiaDiem,
            ngayMoBanVe: eventData.ngayMoBanVe.split('T')[0],
            gioMoBanVe: eventData.ngayMoBanVe.split('T')[1].substring(0, 5),
            ngayDongBanVe: eventData.ngayDongBanVe.split('T')[0],
            gioDongBanVe: eventData.ngayDongBanVe.split('T')[1].substring(0, 5),
            ngayBatDau: eventData.thoiGianBatDau.split('T')[0],
            gioBatDau: eventData.thoiGianBatDau.split('T')[1].substring(0, 5),
            ngayKetThuc: eventData.thoiGianKetThuc.split('T')[0],
            gioKetThuc: eventData.thoiGianKetThuc.split('T')[1].substring(0, 5),
            danhMucSuKiens: eventData.danhMucs.map((dm) => dm.maDanhMuc)
          });

          setTicketTypes(eventData.loaiVes.map((ve) => {
            const correspondingZone = eventData.khuVucs?.find(kv => kv.maKhuVuc === ve.maKhuVuc);
            const templateId = correspondingZone?.template?.maKhuVucMau;
            
            return {
              id: ve.maLoaiVe || Date.now().toString(),
              maLoaiVe: ve.maLoaiVe,
              tenLoaiVe: ve.tenLoaiVe,
              moTa: ve.moTa,
              soLuong: ve.soLuong,
              giaTien: ve.giaTien,
              soLuongToiThieu: ve.soLuongToiThieu,
              soLuongToiDa: ve.soLuongToiDa,
              veConLai: ve.veConLai,
              maKhuVuc: templateId || ve.maKhuVuc,
              tenKhuVuc: correspondingZone?.tenHienThi || 'Unknown Zone'
            };
          }));

          if (eventData.khuVucs && eventData.khuVucs.length > 0) {
            const existingZones: KhuVucEventRequest[] = eventData.khuVucs.map(kv => ({
              maKhuVucMau: kv.template?.maKhuVucMau || '',
              tenTuyChon: kv.tenHienThi !== kv.tenGoc ? kv.tenHienThi : undefined,
              moTaTuyChon: kv.moTa,
              mauSacTuyChon: kv.mauSacHienThi !== kv.template?.mauSac ? kv.mauSacHienThi : undefined,
              toaDoX: kv.toaDoX,
              toaDoY: kv.toaDoY,
              chieuRong: kv.chieuRong,
              chieuCao: kv.chieuCao,
              viTri: `Vị trí (${kv.toaDoX}, ${kv.toaDoY})`
            }));
            setZones(existingZones);
          }
        }
      }
    }
    loadEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places])

  useEffect(() => {
    if (places.length > 0 && eventForm.tinhThanh) {
      const tinhThanh = places.find(p => p.maTinhThanh === eventForm.tinhThanh);
      if (tinhThanh) {
        setSelectedTinhThanh(tinhThanh);
        if (eventForm.quanHuyen) {
          const quanHuyen = tinhThanh.quanHuyens.find(q => q.maQuanHuyen === eventForm.quanHuyen);
          if (quanHuyen) {
            setSelectedQuanHuyen(quanHuyen);
          }
        }
      }
    }
  }, [places, eventForm.tinhThanh, eventForm.quanHuyen]);

  const handleTinhThanhChange = (maTinhThanh: string) => {
    const tinhThanh = places.find((p) => p.maTinhThanh === maTinhThanh);
    setSelectedTinhThanh(tinhThanh || null);
    setSelectedQuanHuyen(null);
    setEventForm((prev) => ({
      ...prev,
      tinhThanh: maTinhThanh,
      quanHuyen: "",
      phuongXa: "",
    }));
  };

  const handleQuanHuyenChange = (maQuanHuyen: string) => {
    const quanHuyen = selectedTinhThanh?.quanHuyens.find(
      (q) => q.maQuanHuyen === maQuanHuyen
    );
    setSelectedQuanHuyen(quanHuyen || null);
    setEventForm((prev) => ({
      ...prev,
      quanHuyen: maQuanHuyen,
      phuongXa: "",
    }));
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (Object.keys(validationErrors).length > 0) {
      timeoutId = setTimeout(() => {
        setValidationErrors({});
      }, 5000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [validationErrors]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const getTabStatus = (tab: string) => {
    switch (tab) {
      case 'basic-info':
        { const { isValid: basicValid } = validateBasicInfo();
        return basicValid ? 'completed' : 'incomplete'; }
      case 'categories':
        return validateCategories() ? 'completed' : 'incomplete';
      case 'zones':
        return validateZones() ? 'completed' : 'incomplete';
      case 'tickets':
        return validateTicketTypes() ? 'completed' : 'incomplete';
      default:
        return 'incomplete';
    }
  };

  const getSortedTinhThanhs = () => {
    return [...places].sort((a, b) => a.tenTinhThanh.localeCompare(b.tenTinhThanh, 'vi'));
  };

  const getSortedQuanHuyens = () => {
    if (!selectedTinhThanh) return [];
    return [...selectedTinhThanh.quanHuyens].sort((a, b) => a.tenQuanHuyen.localeCompare(b.tenQuanHuyen, 'vi'));
  };

  const getSortedPhuongXas = () => {
    if (!selectedQuanHuyen) return [];
    return [...selectedQuanHuyen.phuongXas].sort((a, b) => a.tenPhuongXa.localeCompare(b.tenPhuongXa, 'vi'));
  };

  return (
    <Container className="create-event-page-container">
      {notification && (
        <div className="create-event-page-notification">
          <Alert variant={notification.type} className="create-event-page-alert">
            <i className={`fas fa-${notification.type === 'success' ? 'check-circle' : 
              notification.type === 'warning' ? 'exclamation-triangle' : 'exclamation-circle'}`}></i>
            {notification.message}
          </Alert>
        </div>
      )}

      <div className="create-event-page-wrapper">
        <div className="create-event-page-header">
          <h1 className="create-event-page-title">
            <i className="fas fa-edit"></i>
            Chỉnh sửa sự kiện
          </h1>
          <p className="create-event-page-subtitle">
            Cập nhật thông tin chi tiết cho sự kiện của bạn
          </p>
        </div>

        <Tab.Container activeKey={activeTab} onSelect={handleTabChange}>
          <div className="create-event-page-tabs-container">
            <Nav variant="tabs" className="create-event-page-tabs">
              <Nav.Item>
                <Nav.Link 
                  eventKey="basic-info" 
                  className={`create-event-page-tab ${getTabStatus('basic-info')}`}
                >
                  <div className="create-event-page-tab-icon">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <div className="create-event-page-tab-content">
                    <span className="create-event-page-tab-label">Thông tin cơ bản</span>
                    <small className="create-event-page-tab-status">
                      {getTabStatus('basic-info') === 'completed' ? 'Hoàn thành' : 'Chưa hoàn thành'}
                    </small>
                  </div>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  eventKey="categories" 
                  className={`create-event-page-tab ${getTabStatus('categories')}`}
                >
                  <div className="create-event-page-tab-icon">
                    <i className="fas fa-tags"></i>
                  </div>
                  <div className="create-event-page-tab-content">
                    <span className="create-event-page-tab-label">Danh mục</span>
                    <small className="create-event-page-tab-status">
                      {eventForm.danhMucSuKiens.length} đã chọn
                    </small>
                  </div>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  eventKey="zones" 
                  className={`create-event-page-tab ${getTabStatus('zones')}`}
                >
                  <div className="create-event-page-tab-icon">
                    <i className="fas fa-map"></i>
                  </div>
                  <div className="create-event-page-tab-content">
                    <span className="create-event-page-tab-label">Khu vực</span>
                    <small className="create-event-page-tab-status">
                      {zones.length} khu vực
                    </small>
                  </div>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  eventKey="tickets" 
                  className={`create-event-page-tab ${getTabStatus('tickets')}`}
                >
                  <div className="create-event-page-tab-icon">
                    <i className="fas fa-ticket-alt"></i>
                  </div>
                  <div className="create-event-page-tab-content">
                    <span className="create-event-page-tab-label">Loại vé</span>
                    <small className="create-event-page-tab-status">
                      {ticketTypes.length} loại vé
                    </small>
                  </div>
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>

          {Object.keys(validationErrors).length > 0 && (
            <Alert variant="danger" className="create-event-page-validation-alert">
              <Alert.Heading>
                <i className="fas fa-exclamation-triangle"></i>
                Vui lòng kiểm tra lại các thông tin sau:
              </Alert.Heading>
              <ul className="create-event-page-error-list">
                {Object.values(validationErrors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          <div className="create-event-page-content">
            <Tab.Content>
              <Tab.Pane eventKey="basic-info">
                <div className="create-event-page-section">
                  <div className="create-event-page-section-header">
                    <h3 className="create-event-page-section-title">
                      <i className="fas fa-info-circle"></i>
                      Thông tin cơ bản
                    </h3>
                    <p className="create-event-page-section-description">
                      Cập nhật thông tin cơ bản về sự kiện của bạn
                    </p>
                  </div>

                  <Form className="create-event-page-form">
                    <Row>
                      <Col md={8}>
                        <Form.Group className="create-event-page-form-group">
                          <Form.Label className="create-event-page-form-label">
                            Tiêu đề sự kiện <span className="create-event-page-required">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={eventForm.tieuDe}
                            onChange={(e) => setEventForm({ ...eventForm, tieuDe: e.target.value })}
                            className="create-event-page-form-control"
                            placeholder="Nhập tiêu đề sự kiện"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="create-event-page-form-group">
                          <Form.Label className="create-event-page-form-label">
                            Ảnh bìa <span className="create-event-page-required">*</span>
                          </Form.Label>
                          <div className="create-event-page-image-upload">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              style={{ display: 'none' }}
                              id="create-event-page-image-input"
                            />
                            <label 
                              htmlFor="create-event-page-image-input" 
                              className="create-event-page-image-label"
                            >
                              {selectedImage ? (
                                <img 
                                  src={getImageUrl(selectedImage)} 
                                  alt="Preview" 
                                  className="create-event-page-image-preview" 
                                />
                              ) : (
                                <div className="create-event-page-image-placeholder">
                                  <i className="fas fa-cloud-upload-alt"></i>
                                  <span>Click để tải ảnh lên</span>
                                </div>
                              )}
                            </label>
                          </div>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="create-event-page-form-group">
                      <Form.Label className="create-event-page-form-label">
                        Mô tả sự kiện <span className="create-event-page-required">*</span>
                      </Form.Label>
                      <div className="create-event-page-editor">
                        <CKEditor
                          editor={EditorWithTypes}
                          data={eventForm.moTa}
                          onChange={(_event, editor) => {
                            const data = editor.getData();
                            setEventForm({ ...eventForm, moTa: data });
                          }}
                          config={{
                            toolbar: [
                              'heading', '|',
                              'bold', 'italic', 'link', '|',
                              'bulletedList', 'numberedList', '|',
                              'undo', 'redo'
                            ]
                          }}
                        />
                      </div>
                    </Form.Group>

                    <div className="create-event-page-location-section">
                      <h4 className="create-event-page-subsection-title">
                        <i className="fas fa-map-marker-alt"></i>
                        Địa điểm tổ chức
                      </h4>
                      <Row>
                        <Col md={4}>
                          <Form.Group className="create-event-page-form-group">
                            <Form.Label className="create-event-page-form-label">
                              Tỉnh/Thành phố <span className="create-event-page-required">*</span>
                            </Form.Label>
                            <Form.Select
                              value={eventForm.tinhThanh}
                              onChange={(e) => handleTinhThanhChange(e.target.value)}
                              className="create-event-page-form-control"
                            >
                              <option value="">Chọn Tỉnh/Thành phố</option>
                              {getSortedTinhThanhs().map(place => (
                                <option key={place.maTinhThanh} value={place.maTinhThanh}>
                                  {place.tenTinhThanh}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="create-event-page-form-group">
                            <Form.Label className="create-event-page-form-label">
                              Quận/Huyện <span className="create-event-page-required">*</span>
                            </Form.Label>
                            <Form.Select
                              value={eventForm.quanHuyen}
                              onChange={(e) => handleQuanHuyenChange(e.target.value)}
                              disabled={!selectedTinhThanh}
                              className="create-event-page-form-control"
                            >
                              <option value="">Chọn Quận/Huyện</option>
                              {getSortedQuanHuyens().map(quanHuyen => (
                                <option key={quanHuyen.maQuanHuyen} value={quanHuyen.maQuanHuyen}>
                                  {quanHuyen.tenQuanHuyen}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="create-event-page-form-group">
                            <Form.Label className="create-event-page-form-label">
                              Phường/Xã <span className="create-event-page-required">*</span>
                            </Form.Label>
                            <Form.Select
                              value={eventForm.phuongXa}
                              onChange={(e) => setEventForm({ ...eventForm, phuongXa: e.target.value })}
                              disabled={!selectedQuanHuyen}
                              className="create-event-page-form-control"
                            >
                              <option value="">Chọn Phường/Xã</option>
                              {getSortedPhuongXas().map(phuongXa => (
                                <option key={phuongXa.maPhuongXa} value={phuongXa.maPhuongXa}>
                                  {phuongXa.tenPhuongXa}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="create-event-page-form-group">
                        <Form.Label className="create-event-page-form-label">
                          Địa chỉ cụ thể <span className="create-event-page-required">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={eventForm.tenDiaDiem}
                          onChange={(e) => setEventForm({ ...eventForm, tenDiaDiem: e.target.value })}
                          className="create-event-page-form-control"
                          placeholder="Số nhà, tên đường..."
                        />
                      </Form.Group>
                    </div>

                    <div className="create-event-page-datetime-section">
                      <h4 className="create-event-page-subsection-title">
                        <i className="fas fa-clock"></i>
                        Thời gian tổ chức
                      </h4>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="create-event-page-form-group">
                            <Form.Label className="create-event-page-form-label">
                              Thời gian bắt đầu <span className="create-event-page-required">*</span>
                            </Form.Label>
                            <Row>
                              <Col>
                                <Form.Control
                                  type="date"
                                  value={eventForm.ngayBatDau}
                                  onChange={(e) => setEventForm({ ...eventForm, ngayBatDau: e.target.value })}
                                  className="create-event-page-form-control"
                                  min={new Date().toISOString().split('T')[0]}
                                />
                              </Col>
                              <Col>
                                <Form.Control
                                  type="time"
                                  value={eventForm.gioBatDau}
                                  onChange={(e) => setEventForm({ ...eventForm, gioBatDau: e.target.value })}
                                  className="create-event-page-form-control"
                                />
                              </Col>
                            </Row>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="create-event-page-form-group">
                            <Form.Label className="create-event-page-form-label">
                              Thời gian kết thúc <span className="create-event-page-required">*</span>
                            </Form.Label>
                            <Row>
                              <Col>
                                <Form.Control
                                  type="date"
                                  value={eventForm.ngayKetThuc}
                                  onChange={(e) => setEventForm({ ...eventForm, ngayKetThuc: e.target.value })}
                                  className="create-event-page-form-control"
                                  min={eventForm.ngayBatDau || new Date().toISOString().split('T')[0]}
                                />
                              </Col>
                              <Col>
                                <Form.Control
                                  type="time"
                                  value={eventForm.gioKetThuc}
                                  onChange={(e) => setEventForm({ ...eventForm, gioKetThuc: e.target.value })}
                                  className="create-event-page-form-control"
                                />
                              </Col>
                            </Row>
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>

                    <div className="create-event-page-ticket-sale-section">
                      <h4 className="create-event-page-subsection-title">
                        <i className="fas fa-ticket-alt"></i>
                        Thời gian bán vé
                      </h4>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="create-event-page-form-group">
                            <Form.Label className="create-event-page-form-label">
                              Mở bán vé <span className="create-event-page-required">*</span>
                            </Form.Label>
                            <Row>
                              <Col>
                                <Form.Control
                                  type="date"
                                  value={eventForm.ngayMoBanVe}
                                  onChange={(e) => setEventForm({ ...eventForm, ngayMoBanVe: e.target.value })}
                                  className="create-event-page-form-control"
                                  min={new Date().toISOString().split('T')[0]}
                                />
                              </Col>
                              <Col>
                                <Form.Control
                                  type="time"
                                  value={eventForm.gioMoBanVe}
                                  onChange={(e) => setEventForm({ ...eventForm, gioMoBanVe: e.target.value })}
                                  className="create-event-page-form-control"
                                />
                              </Col>
                            </Row>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="create-event-page-form-group">
                            <Form.Label className="create-event-page-form-label">
                              Đóng bán vé <span className="create-event-page-required">*</span>
                            </Form.Label>
                            <Row>
                              <Col>
                                <Form.Control
                                  type="date"
                                  value={eventForm.ngayDongBanVe}
                                  onChange={(e) => setEventForm({ ...eventForm, ngayDongBanVe: e.target.value })}
                                  className="create-event-page-form-control"
                                  min={eventForm.ngayMoBanVe || new Date().toISOString().split('T')[0]}
                                />
                              </Col>
                              <Col>
                                <Form.Control
                                  type="time"
                                  value={eventForm.gioDongBanVe}
                                  onChange={(e) => setEventForm({ ...eventForm, gioDongBanVe: e.target.value })}
                                  className="create-event-page-form-control"
                                />
                              </Col>
                            </Row>
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  </Form>
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="categories">
                <div className="create-event-page-section">
                  <div className="create-event-page-section-header">
                    <h3 className="create-event-page-section-title">
                      <i className="fas fa-tags"></i>
                      Danh mục sự kiện
                    </h3>
                    <p className="create-event-page-section-description">
                      Cập nhật các danh mục phù hợp với sự kiện của bạn để giúp khách hàng dễ dàng tìm thấy
                    </p>
                  </div>

                  <CategorySelector
                    selectedCategories={eventForm.danhMucSuKiens}
                    onChange={(categories) => setEventForm({ ...eventForm, danhMucSuKiens: categories })}
                  />
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="zones">
                <div className="create-event-page-section">
                  <div className="create-event-page-section-header">
                    <h3 className="create-event-page-section-title">
                      <i className="fas fa-map"></i>
                      Chỉnh sửa khu vực
                    </h3>
                    <p className="create-event-page-section-description">
                      Cập nhật và tùy chỉnh các khu vực cho sự kiện của bạn
                    </p>
                  </div>

                  <ZoneDesignerTab
                    zones={zones}
                    onZonesChange={setZones}
                    onTemplatesLoad={handleTemplatesLoad}
                    isEditMode={true}
                  />
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="tickets">
                <div className="create-event-page-section">
                  <div className="create-event-page-section-header">
                    <h3 className="create-event-page-section-title">
                      <i className="fas fa-ticket-alt"></i>
                      Cập nhật loại vé
                    </h3>
                    <p className="create-event-page-section-description">
                      Chỉnh sửa các loại vé với giá cả và điều kiện khác nhau cho từng khu vực
                    </p>
                  </div>

                  {zones.length === 0 ? (
                    <Alert variant="warning" className="create-event-page-warning">
                      <i className="fas fa-exclamation-triangle"></i>
                      Vui lòng tạo ít nhất một khu vực trước khi thêm loại vé.
                    </Alert>
                  ) : (
                    <>
                      <div className="create-event-page-ticket-header">
                        <Button
                          variant="primary"
                          onClick={() => {
                            setEditingTicket(undefined);
                            setShowTicketModal(true);
                          }}
                          className="create-event-page-button-add"
                        >
                          <i className="fas fa-plus"></i>
                          Thêm loại vé
                        </Button>
                      </div>

                      <div className="create-event-page-tickets-grid">
                        {ticketTypes.map(ticket => (
                          <div key={ticket.id} className="create-event-page-ticket-card">
                            <div className="create-event-page-ticket-header">
                              <h4 className="create-event-page-ticket-name">{ticket.tenLoaiVe}</h4>
                              <div className="create-event-page-ticket-actions">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => {
                                    setEditingTicket(ticket);
                                    setShowTicketModal(true);
                                  }}
                                  className="create-event-page-ticket-edit"
                                >
                                  <i className="fas fa-edit"></i>
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteTicket(ticket.id!)}
                                  className="create-event-page-ticket-delete"
                                >
                                  <i className="fas fa-trash"></i>
                                </Button>
                              </div>
                            </div>
                            <div className="create-event-page-ticket-details">
                              <div className="create-event-page-ticket-info">
                                <span className="create-event-page-ticket-price">
                                  {formatCurrency(ticket.giaTien)}
                                </span>
                                <span className="create-event-page-ticket-quantity">
                                  {ticket.soLuong} vé
                                </span>
                              </div>
                              {ticket.tenKhuVuc && (
                                <div className="create-event-page-ticket-zone">
                                  <i className="fas fa-map-marker-alt"></i>
                                  {ticket.tenKhuVuc}
                                </div>
                              )}
                              <div className="create-event-page-ticket-limits">
                                Mua: {ticket.soLuongToiThieu}-{ticket.soLuongToiDa} vé/lần
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <TicketTypeModal
                    show={showTicketModal}
                    onHide={() => {
                      setShowTicketModal(false);
                      setEditingTicket(undefined);
                    }}
                    onSave={editingTicket ? handleEditTicket : handleAddTicket}
                    editTicket={editingTicket}
                    availableZones={zones}
                    usedZones={getUsedZones()}
                    mockTemplates={mockTemplates}
                  />
                </div>
              </Tab.Pane>
            </Tab.Content>
          </div>

          <div className="create-event-page-navigation">
            <div className="create-event-page-nav-buttons">
              {activeTab !== 'basic-info' && (
                <Button
                  variant="secondary"
                  onClick={handleBack}
                  className="create-event-page-button-back"
                >
                  <i className="fas fa-arrow-left"></i>
                  Quay lại
                </Button>
              )}
              
              {activeTab !== 'tickets' ? (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  className="create-event-page-button-next"
                >
                  Tiếp tục
                  <i className="fas fa-arrow-right"></i>
                </Button>
              ) : (
                <Button
                  variant="success"
                  onClick={handleSubmit}
                  disabled={!validateTicketTypes() || !validateZones()}
                  className="create-event-page-button-submit"
                >
                  <i className="fas fa-save"></i>
                  Cập nhật sự kiện
                </Button>
              )}
            </div>
          </div>
        </Tab.Container>
      </div>
    </Container>
  );
};

export default EditEvent;
