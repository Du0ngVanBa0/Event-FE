import { ComponentProps, useState, useEffect } from 'react';
import { Container, Form, Nav, Tab, Row, Col, Button, Alert } from 'react-bootstrap';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import './CreateEvent.css';
import { TicketType } from '../../../types/EventTypes';
import TicketTypeModal from './TicketTypeModal';
import placeService from '../../../api/placeService';
import { TinhThanh, QuanHuyen } from '../../../types/PlaceTypes';
import CategorySelector from './CategorySelector';
import eventService from '../../../api/eventService';
import { CreateSuKienDTO } from '../../../types/EventTypes';

interface EventForm {
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

type EditorType = ComponentProps<typeof CKEditor>['editor'];
const EditorWithTypes = ClassicEditor as unknown as EditorType;

const CreateEvent = () => {
    const [activeTab, setActiveTab] = useState('event-info');
    const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);
    const [eventForm, setEventForm] = useState<EventForm>({
        tieuDe: '',
        moTa: '',
        anhBiaFile: null,
        tinhThanh: '',
        quanHuyen: '',
        phuongXa: '',
        tenDiaDiem: '',
        ngayMoBanVe: '',
        gioMoBanVe: '',
        ngayDongBanVe: '',
        gioDongBanVe: '',
        ngayBatDau: '',
        gioBatDau: '',
        ngayKetThuc: '',
        gioKetThuc: '',
        danhMucSuKiens: []
    });

    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [editingTicket, setEditingTicket] = useState<TicketType | undefined>(undefined);
    const [places, setPlaces] = useState<TinhThanh[]>([]);
    const [selectedTinhThanh, setSelectedTinhThanh] = useState<TinhThanh | null>(null);
    const [selectedQuanHuyen, setSelectedQuanHuyen] = useState<QuanHuyen | null>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setEventForm({ ...eventForm, anhBiaFile: file });
            setSelectedImage(URL.createObjectURL(file));
        }
    };

    interface ValidationErrors {
        tieuDe?: string;
        moTa?: string;
        anhBiaFile?: string;
        diaDiem?: string;
        danhMucSuKiens?: string;
        thoiGian?: string;
        loaiVe?: string;
    }

    const validateEventForm = () => {
        const errors: ValidationErrors = {};

        if (!eventForm.tieuDe) errors.tieuDe = 'Vui lòng nhập tiêu đề sự kiện';
        if (!eventForm.moTa) errors.moTa = 'Vui lòng nhập mô tả sự kiện';
        if (!eventForm.anhBiaFile) errors.anhBiaFile = 'Vui lòng chọn ảnh bìa';
        if (!eventForm.tenDiaDiem || !eventForm.phuongXa) {
            errors.diaDiem = 'Vui lòng chọn địa điểm đầy đủ';
        }
        if (eventForm.danhMucSuKiens.length === 0) {
            errors.danhMucSuKiens = 'Vui lòng chọn ít nhất một danh mục';
        }

        if (!eventForm.ngayBatDau || !eventForm.gioBatDau) {
            errors.thoiGian = 'Vui lòng chọn thời gian bắt đầu';
            return { isValid: false, errors };
        }
        if (!eventForm.ngayKetThuc || !eventForm.gioKetThuc) {
            errors.thoiGian = 'Vui lòng chọn thời gian kết thúc';
            return { isValid: false, errors };
        }
        if (!eventForm.ngayMoBanVe || !eventForm.gioMoBanVe) {
            errors.thoiGian = 'Vui lòng chọn thời gian mở bán vé';
            return { isValid: false, errors };
        }
        if (!eventForm.ngayDongBanVe || !eventForm.gioDongBanVe) {
            errors.thoiGian = 'Vui lòng chọn thời gian đóng bán vé';
            return { isValid: false, errors };
        }

        const ticketSaleStart = new Date(`${eventForm.ngayMoBanVe}T${eventForm.gioMoBanVe}:00`);
        const ticketSaleEnd = new Date(`${eventForm.ngayDongBanVe}T${eventForm.gioDongBanVe}:00`);

        if (eventForm.ngayBatDau && eventForm.gioBatDau &&
            eventForm.ngayKetThuc && eventForm.gioKetThuc) {
            const startDate = new Date(`${eventForm.ngayBatDau}T${eventForm.gioBatDau}:00`);
            const endDate = new Date(`${eventForm.ngayKetThuc}T${eventForm.gioKetThuc}:00`);

            if (endDate <= startDate) {
                errors.thoiGian = 'Thời gian kết thúc phải sau thời gian bắt đầu';
            }
        }

        if (ticketSaleEnd <= ticketSaleStart) {
            errors.thoiGian = 'Thời gian đóng bán vé phải sau thời gian mở bán vé';
        }

        return { isValid: Object.keys(errors).length === 0, errors };
    };

    const validateTicketTypes = () => {
        return ticketTypes.length > 0;
    };

    const handleAddTicket = (ticket: Omit<TicketType, 'id'>) => {
        const newTicket = {
            ...ticket,
            id: Date.now().toString()
        };
        setTicketTypes([...ticketTypes, newTicket]);
    };

    const handleEditTicket = (ticket: Omit<TicketType, 'id'>) => {
        if (editingTicket) {
            setTicketTypes(ticketTypes.map(t =>
                t.id === editingTicket.id ? { ...ticket, id: editingTicket.id } : t
            ));
            setEditingTicket(undefined);
        }
    };

    const handleSubmit = async () => {
        try {
            const combinedDateTime = {
                thoiGianBatDau: `${eventForm.ngayBatDau}T${eventForm.gioBatDau}:00`,
                thoiGianKetThuc: `${eventForm.ngayKetThuc}T${eventForm.gioKetThuc}:00`,
                ngayMoBanVe: `${eventForm.ngayMoBanVe}T${eventForm.gioMoBanVe}:00`,
                ngayDongBanVe: `${eventForm.ngayDongBanVe}T${eventForm.gioDongBanVe}:00`,
            };


            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const cleanedTickets = ticketTypes.map(({ id, ...rest }) => rest);
            const eventData: CreateSuKienDTO = {
                tieuDe: eventForm.tieuDe,
                moTa: eventForm.moTa,
                tenDiaDiem: eventForm.tenDiaDiem,
                maPhuongXa: eventForm.phuongXa,
                maDanhMucs: eventForm.danhMucSuKiens,
                loaiVes: cleanedTickets,
                ...combinedDateTime,
                anhBia: eventForm.anhBiaFile,
            };

            await eventService.create(eventData);
            setNotification({
                message: 'Tạo sự kiện thành công',
                type: 'success'
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setNotification({
                message: 'Không thể tạo sự kiện',
                type: 'danger'
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
        const loadPlaces = async () => {
            try {
                const data = await placeService.getAll();
                setPlaces(data);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                setNotification({
                    message: 'Không thể tải danh sách địa điểm',
                    type: 'danger'
                });
            }
        };

        loadPlaces();
    }, []);

    const handleTinhThanhChange = (maTinhThanh: string) => {
        const tinhThanh = places.find(p => p.maTinhThanh === maTinhThanh);
        setSelectedTinhThanh(tinhThanh || null);
        setSelectedQuanHuyen(null);
        setEventForm(prev => ({
            ...prev,
            tinhThanh: maTinhThanh,
            quanHuyen: '',
            phuongXa: ''
        }));
    };

    const handleQuanHuyenChange = (maQuanHuyen: string) => {
        const quanHuyen = selectedTinhThanh?.quanHuyens.find(q => q.maQuanHuyen === maQuanHuyen);
        setSelectedQuanHuyen(quanHuyen || null);
        setEventForm(prev => ({
            ...prev,
            quanHuyen: maQuanHuyen,
            phuongXa: ''
        }));
    };

    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const handleTabChange = (tab: string | null) => {
        if (tab === 'ticket-types') {
            const { isValid, errors } = validateEventForm();
            if (!isValid) {
                setValidationErrors(errors);
                setTimeout(() => {
                    setValidationErrors({});
                }, 3000);
                return;
            }
        }
        setActiveTab(tab || 'event-info');
    };

    return (
        <Container className="create-event-container">
            {notification && (
                <div className="notification-container">
                    <Alert variant={notification.type} className="notification-alert">
                        {notification.message}
                    </Alert>
                </div>
            )}
            <div className="create-event-wrapper">

                <Tab.Container activeKey={activeTab} onSelect={handleTabChange}>
                    <Nav variant="tabs" className="mb-4 universe-tabs">
                        <Nav.Item>
                            <Nav.Link eventKey="event-info" className={Object.keys(validationErrors).length > 0 ? 'has-error' : ''}>
                                Thông tin sự kiện
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="ticket-types">
                                Loại vé
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>

                    {Object.keys(validationErrors).length > 0 && (
                        <Alert variant="danger" className="mt-3">
                            <strong>Vui lòng kiểm tra lại các thông tin sau:</strong>
                            {validationErrors.tieuDe && (
                                <div className="validation-error">{validationErrors.tieuDe}</div>
                            )}
                            {validationErrors.moTa && (
                                <div className="validation-error">{validationErrors.moTa}</div>
                            )}
                            {validationErrors.anhBiaFile && (
                                <div className="validation-error">{validationErrors.anhBiaFile}</div>
                            )}
                            {validationErrors.diaDiem && (
                                <div className="validation-error">{validationErrors.diaDiem}</div>
                            )}
                            {validationErrors.danhMucSuKiens && (
                                <div className="validation-error">{validationErrors.danhMucSuKiens}</div>
                            )}
                            {validationErrors.thoiGian && (
                                <div className="validation-error">{validationErrors.thoiGian}</div>
                            )}
                        </Alert>
                    )}

                    <Tab.Content>
                        <Tab.Pane eventKey="event-info">
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tiêu đề</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={eventForm.tieuDe}
                                        onChange={(e) => setEventForm({ ...eventForm, tieuDe: e.target.value })}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Mô tả</Form.Label>
                                    <CKEditor
                                        editor={EditorWithTypes}
                                        data={eventForm.moTa}
                                        onChange={(_event, editor) => {
                                            const data = editor.getData();
                                            setEventForm({ ...eventForm, moTa: data });
                                        }}
                                        config={{
                                            toolbar: [
                                                'heading',
                                                '|',
                                                'bold',
                                                'italic',
                                                'link',
                                                'bulletedList',
                                                'numberedList',
                                                '|',
                                                'undo',
                                                'redo'
                                            ]
                                        }}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Danh mục sự kiện</Form.Label>
                                    <CategorySelector
                                        selectedCategories={eventForm.danhMucSuKiens}
                                        onChange={(categories) => setEventForm({ ...eventForm, danhMucSuKiens: categories })}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Ảnh bìa</Form.Label>
                                    <div className="image-upload-container">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            style={{ display: 'none' }}
                                            id="image-upload"
                                        />
                                        <label htmlFor="image-upload" className="image-upload-label">
                                            {selectedImage ? (
                                                <img src={selectedImage} alt="Preview" className="image-preview" />
                                            ) : (
                                                <div className="upload-placeholder">
                                                    <i className="fas fa-cloud-upload-alt"></i>
                                                    <span>Click để tải ảnh lên</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </Form.Group>

                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label>Tỉnh/Thành phố</Form.Label>
                                            <Form.Select
                                                value={eventForm.tinhThanh}
                                                onChange={(e) => handleTinhThanhChange(e.target.value)}
                                            >
                                                <option value="">Chọn Tỉnh/Thành phố</option>
                                                {places.map(place => (
                                                    <option key={place.maTinhThanh} value={place.maTinhThanh}>
                                                        {place.tenTinhThanh}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label>Quận/Huyện</Form.Label>
                                            <Form.Select
                                                value={eventForm.quanHuyen}
                                                onChange={(e) => handleQuanHuyenChange(e.target.value)}
                                                disabled={!selectedTinhThanh}
                                            >
                                                <option value="">Chọn Quận/Huyện</option>
                                                {selectedTinhThanh?.quanHuyens.map(quanHuyen => (
                                                    <option key={quanHuyen.maQuanHuyen} value={quanHuyen.maQuanHuyen}>
                                                        {quanHuyen.tenQuanHuyen}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label>Phường/Xã</Form.Label>
                                            <Form.Select
                                                value={eventForm.phuongXa}
                                                onChange={(e) => setEventForm({ ...eventForm, phuongXa: e.target.value })}
                                                disabled={!selectedQuanHuyen}
                                            >
                                                <option value="">Chọn Phường/Xã</option>
                                                {selectedQuanHuyen?.phuongXas.map(phuongXa => (
                                                    <option key={phuongXa.maPhuongXa} value={phuongXa.maPhuongXa}>
                                                        {phuongXa.tenPhuongXa}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Địa chỉ cụ thể</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={eventForm.tenDiaDiem}
                                        onChange={(e) => setEventForm({ ...eventForm, tenDiaDiem: e.target.value })}
                                    />
                                </Form.Group>

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Thời gian bắt đầu</Form.Label>
                                            <Row>
                                                <Col>
                                                    <Form.Control
                                                        type="date"
                                                        value={eventForm.ngayBatDau}
                                                        onChange={(e) => setEventForm({ ...eventForm, ngayBatDau: e.target.value })}
                                                        min={new Date().toISOString().split('T')[0]}
                                                    />
                                                </Col>
                                                <Col>
                                                    <Form.Control
                                                        type="time"
                                                        value={eventForm.gioBatDau}
                                                        onChange={(e) => setEventForm({ ...eventForm, gioBatDau: e.target.value })}
                                                    />
                                                </Col>
                                            </Row>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Thời gian kết thúc</Form.Label>
                                            <Row>
                                                <Col>
                                                    <Form.Control
                                                        type="date"
                                                        value={eventForm.ngayKetThuc}
                                                        onChange={(e) => setEventForm({ ...eventForm, ngayKetThuc: e.target.value })}
                                                        min={eventForm.ngayBatDau || new Date().toISOString().split('T')[0]}
                                                    />
                                                </Col>
                                                <Col>
                                                    <Form.Control
                                                        type="time"
                                                        value={eventForm.gioKetThuc}
                                                        onChange={(e) => setEventForm({ ...eventForm, gioKetThuc: e.target.value })}
                                                    />
                                                </Col>
                                            </Row>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Ngày mở bán vé</Form.Label>
                                            <Row>
                                                <Col>
                                                    <Form.Control
                                                        type="date"
                                                        value={eventForm.ngayMoBanVe}
                                                        onChange={(e) => setEventForm({ ...eventForm, ngayMoBanVe: e.target.value })}
                                                        min={new Date().toISOString().split('T')[0]}
                                                    />
                                                </Col>
                                                <Col>
                                                    <Form.Control
                                                        type="time"
                                                        value={eventForm.gioMoBanVe}
                                                        onChange={(e) => setEventForm({ ...eventForm, gioMoBanVe: e.target.value })}
                                                    />
                                                </Col>
                                            </Row>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Ngày đóng bán vé</Form.Label>
                                            <Row>
                                                <Col>
                                                    <Form.Control
                                                        type="date"
                                                        value={eventForm.ngayDongBanVe}
                                                        onChange={(e) => setEventForm({ ...eventForm, ngayDongBanVe: e.target.value })}
                                                        min={eventForm.ngayMoBanVe || new Date().toISOString().split('T')[0]}
                                                        max={eventForm.ngayBatDau || undefined}
                                                    />
                                                </Col>
                                                <Col>
                                                    <Form.Control
                                                        type="time"
                                                        value={eventForm.gioDongBanVe}
                                                        onChange={(e) => setEventForm({ ...eventForm, gioDongBanVe: e.target.value })}
                                                    />
                                                </Col>
                                            </Row>
                                        </Form.Group>
                                    </Col>
                                </Row>

                            </Form>
                        </Tab.Pane>

                        <Tab.Pane eventKey="ticket-types">
                            <div className="mb-3"></div>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3>Danh sách loại vé</h3>
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        setEditingTicket(undefined);
                                        setShowTicketModal(true);
                                    }}
                                >
                                    Thêm loại vé
                                </Button>
                            </div>

                            <div className="ticket-types-grid">
                                {ticketTypes.map(ticket => (
                                    <div
                                        key={ticket.id}
                                        className="ticket-type-card"
                                        onClick={() => {
                                            setEditingTicket(ticket);
                                            setShowTicketModal(true);
                                        }}
                                    >
                                        <div className="ticket-type-name">{ticket.tenLoaiVe}</div>
                                    </div>
                                ))}
                            </div>

                            <TicketTypeModal
                                show={showTicketModal}
                                onHide={() => {
                                    setShowTicketModal(false);
                                    setEditingTicket(undefined);
                                }}
                                onSave={editingTicket ? handleEditTicket : handleAddTicket}
                                editTicket={editingTicket}
                            />

                            <div className="d-flex justify-content-between mt-4">
                                <Button
                                    variant="secondary"
                                    onClick={() => setActiveTab('event-info')}
                                >
                                    Quay lại
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleSubmit}
                                    disabled={!validateTicketTypes()}
                                >
                                    Tạo sự kiện
                                </Button>
                            </div>
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </div>
        </Container>
    );
};

export default CreateEvent;