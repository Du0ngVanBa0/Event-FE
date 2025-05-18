import { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import eventCategoryService from '../../../api/eventCategoryService';
import UniverseTable, { Column } from '../../common/table/UniverseTable';
import EventTypeModal from './EventTypeModal';
import { DanhMucSuKien } from '../../../types/EventTypeTypes';
import { CreateEventCategory } from '../../../types/RequestTypes';
import DeleteConfirmModal from './DeleteConfirmModal';
import './EventType.css';

const EventType = () => {
    const [eventTypes, setEventTypes] = useState<DanhMucSuKien[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingEventType, setEditingEventType] = useState<DanhMucSuKien | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingEventType, setDeletingEventType] = useState<DanhMucSuKien | null>(null);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    const loadEventTypes = async (page: number = 0, size: number = pageSize) => {
        try {
            setLoading(true);
            const response = await eventCategoryService.getAllPaginated({
                page,
                size,
                sort: 'ngayTao,desc'
            });
            setEventTypes(response.data.content);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.number);
        } catch {
            setError('Không thể tải danh sách danh mục');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEventTypes(0, pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageSize]);

    const handleCreate = async (data: CreateEventCategory) => {
        try {
            await eventCategoryService.create(data);
            loadEventTypes();
            setShowModal(false);
        } catch (error) {
            console.error('Error creating event type:', error);
        }
    };

    const handleEdit = async (data: CreateEventCategory & { hoatDong?: boolean }) => {
        if (editingEventType) {
            try {
                await eventCategoryService.update(editingEventType.maDanhMuc, data as Partial<DanhMucSuKien>);
                await loadEventTypes(currentPage);
                setSuccess('Cập nhật danh mục thành công');
            } catch {
                setError('Không thể cập nhật danh mục');
            }
        }
        setShowModal(false);
        setEditingEventType(null);
    };

    const handleDeleteConfirm = async () => {
        if (deletingEventType) {
            try {
                await eventCategoryService.delete(deletingEventType.maDanhMuc);
                await loadEventTypes(Math.max(0, currentPage - (eventTypes.length === 1 ? 1 : 0)));
                setSuccess('Xóa danh mục thành công');
            } catch {
                setError('Không thể xóa danh mục');
            } finally {
                setShowDeleteModal(false);
                setDeletingEventType(null);
            }
        }
    };

    const handlePageChange = (page: number) => {
        loadEventTypes(page, pageSize);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
    };

    const columns: Column<DanhMucSuKien>[] = [
        {
            key: 'maDanhMuc',
            header: 'Mã danh mục'
        },
        {
            key: 'tenDanhMuc',
            header: 'Tên danh mục'
        },
        {
            key: 'moTa',
            header: 'Mô tả'
        },
        {
            key: 'hoatDong',
            header: 'Trạng thái',
            render: (item: DanhMucSuKien) => (
                <span className={`badge ${item.hoatDong ? 'bg-success' : 'bg-danger'}`}>
                    {item.hoatDong ? 'Hoạt động' : 'Không hoạt động'}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Thao tác',
            width: '200px',
            render: (item: DanhMucSuKien) => (
                <div className="action-buttons">
                    <Button
                        variant="outline-primary"
                        onClick={() => {
                            setEditingEventType(item);
                            setShowModal(true);
                        }}
                        className="universe-btn"
                    >
                        Sửa
                    </Button>
                    <Button
                        variant="outline-danger"
                        onClick={() => {
                            setDeletingEventType(item);
                            setShowDeleteModal(true);
                        }}
                        className="universe-btn"
                    >
                        Xóa
                    </Button>
                </div>
            )
        }
    ];

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        if (success || error) {
            timeoutId = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);
        }
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [success, error]);

    return (
        <Container className="event-type-container">
            {(error || success) && (
                <div className="notification-container">
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                </div>
            )}

            <div className="event-type-wrapper">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className='page-title'>Quản lý Danh mục Sự kiện</h2>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setEditingEventType(null);
                            setShowModal(true);
                        }}
                    >
                        Thêm danh mục
                    </Button>
                </div>

                <UniverseTable
                    columns={columns}
                    data={eventTypes}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    isLoading={loading}
                />

                <EventTypeModal
                    show={showModal}
                    onHide={() => {
                        setShowModal(false);
                        setEditingEventType(null);
                    }}
                    onSave={editingEventType ? handleEdit : handleCreate}
                    editData={editingEventType || undefined}
                />

                <DeleteConfirmModal
                    show={showDeleteModal}
                    onHide={() => {
                        setShowDeleteModal(false);
                        setDeletingEventType(null);
                    }}
                    onConfirm={handleDeleteConfirm}
                    itemName={deletingEventType?.tenDanhMuc || ''}
                />
            </div>
        </Container>
    );
};

export default EventType;