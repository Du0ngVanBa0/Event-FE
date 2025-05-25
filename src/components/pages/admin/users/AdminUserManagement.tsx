import { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Badge, Alert } from 'react-bootstrap';
import { UserProfile } from '../../../../types/UserTypes';
import UniverseTable, { Column } from '../../../common/table/UniverseTable';
import { formatDate, getImageUrl, getDefaulImagetUrl } from '../../../../utils/helper';
import './AdminUserManagement.css';
import userService from '../../../../api/userService';
import AdminUserModal from './AdminUserModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const PAGE_SIZE_OPTIONS = [5, 12, 20];

interface SearchParams {
    hoatDong?: boolean;
    tenNguoiDung?: string;
    vaiTro?: string;
    tenHienThi?: string;
}

const AdminUserManagement = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
    const [searchParams, setSearchParams] = useState<SearchParams>({});
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const loadUsers = async (page: number, size: number = pageSize) => {
        try {
            setLoading(true);
            const response = await userService.getUsers(page, size, searchParams);
            setUsers(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            setError('Không thể tải danh sách người dùng');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        if (success || error) {
            timeoutId = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);
        }
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [success, error]);

    const handleSearch = () => {
        setCurrentPage(0);
        loadUsers(0);
    };

    const handleResetSearch = () => {
        setSearchParams({});
        setCurrentPage(0);
        loadUsers(0);
    };

    const handleEditUser = (user: UserProfile) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    const handleDeleteUser = (user: UserProfile, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const confirmDeleteUser = async () => {
        if (selectedUser) {
            try {
                await userService.deleteUser(selectedUser.maNguoiDung);
                setSuccess('Xóa người dùng thành công');
                loadUsers(currentPage);
                setShowDeleteModal(false);
            } catch (error) {
                console.error(error);
                const message = error instanceof Error ? error.message : 'Không thể xóa người dùng';
                setError(message);
            }
        }
    };

    const handleUpdateUser = async (userData: Partial<UserProfile>) => {
        try {
            if (selectedUser) {
                await userService.updateUser(selectedUser.maNguoiDung, userData);
                setSuccess('Cập nhật thông tin người dùng thành công');
                loadUsers(currentPage);
                setShowUserModal(false);
            }
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Không thể cập nhật thông tin người dùng';
            setError(message);
        }
    };

    const handleUpdateRole = async (userId: string, role: 'ADMIN' | 'USER') => {
        try {
            await userService.updateUserRole(userId, role);
            setSuccess('Cập nhật quyền người dùng thành công');
            loadUsers(currentPage);
        }  catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Không thể cập nhật quyền người dùng';
            setError(message);
        }
    };

    const getRoleBadge = (role: string) => {
        if (role === 'ADMIN') {
            return <Badge bg="danger">Admin</Badge>;
        } else {
            return <Badge bg="info">User</Badge>;
        }
    };

    const getStatusBadge = (active: boolean) => {
        if (active) {
            return <Badge bg="success">Hoạt động</Badge>;
        } else {
            return <Badge bg="secondary">Vô hiệu</Badge>;
        }
    };

    // Update the columns definition to use explicit type casting
    const columns = [
        {
            key: 'username',
            header: 'Người dùng',
            render: (user: Record<keyof UserProfile, unknown>) => (
                <div className="user-info-cell">
                    <img
                        src={(user.anhDaiDien as string) ? getImageUrl(user.anhDaiDien as string) : getDefaulImagetUrl()}
                        alt={user.tenHienThi as string}
                        className="user-avatar"
                    />
                    <div className="user-details">
                        <div className="user-name">{user.tenHienThi as string}</div>
                        <div className="user-username">@{user.tenNguoiDung as string}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'email',
            header: 'Email',
        },
        {
            key: 'role',
            header: 'Quyền',
            render: (user: Record<keyof UserProfile, unknown>) => getRoleBadge(user.vaiTro as string),
        },
        {
            key: 'active',
            header: 'Trạng thái',
            render: (user: Record<keyof UserProfile, unknown>) => getStatusBadge(user.hoatDong as boolean || false),
        },
        {
            key: 'createdAt',
            header: 'Ngày tạo',
            render: (user: Record<keyof UserProfile, unknown>) => formatDate(user.ngayTao as string),
        },
        {
            key: 'id',
            header: 'Hành động',
            render: (user: Record<keyof UserProfile, unknown>) => (
                <div className="action-buttons">
                    <Button variant="primary" size="sm" className="me-2" onClick={(e) => {
                        e.stopPropagation();
                        handleEditUser(user as UserProfile);
                    }}>
                        <i className="fas fa-edit"></i>
                    </Button>
                    <Button variant="danger" size="sm" onClick={(e) => handleDeleteUser(user as UserProfile, e)}>
                        <i className="fas fa-trash"></i>
                    </Button>
                    {(user.vaiTro as string) !== 'ADMIN' ? (
                        <Button variant="warning" size="sm" className="ms-2" onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateRole(user.maNguoiDung as string, 'ADMIN');
                        }}>
                            <i className="fas fa-crown"></i>
                        </Button>
                    ) : (
                        <Button variant="secondary" size="sm" className="ms-2" onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateRole(user.maNguoiDung as string, 'USER');
                        }}>
                            <i className="fas fa-user"></i>
                        </Button>
                    )}
                </div>
            ),
        },
    ] as Column<Record<keyof UserProfile, unknown>>[];

    return (
        <Container className="admin-users-container">
            <div className="admin-users-wrapper">
                <h2 className="page-title mb-4">Quản lý người dùng</h2>

                {success && <Alert variant="success">{success}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}

                <Card className="search-card mb-4">
                    <Card.Body>
                        <Form>
                            <Row className="mb-3">
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Tên người dùng</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={searchParams.tenNguoiDung || ''}
                                            onChange={(e) => setSearchParams({ ...searchParams, tenNguoiDung: e.target.value })}
                                            placeholder="Tìm theo tên tài khoản"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Tên hiển thị</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={searchParams.tenHienThi || ''}
                                            onChange={(e) => setSearchParams({ ...searchParams, tenHienThi: e.target.value })}
                                            placeholder="Tìm theo tên hiển thị"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Quyền</Form.Label>
                                        <Form.Select
                                            value={searchParams.vaiTro || ''}
                                            onChange={(e) => setSearchParams({ ...searchParams, vaiTro: e.target.value })}
                                        >
                                            <option value="">Quyền</option>
                                            <option value="ADMIN">Admin</option>
                                            <option value="USER">User</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Trạng thái</Form.Label>
                                        <Form.Select
                                            value={searchParams.hoatDong === undefined ? '' : String(searchParams.hoatDong)}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setSearchParams({
                                                    ...searchParams,
                                                    hoatDong: value === '' ? undefined : value === 'true',
                                                });
                                            }}
                                        >
                                            <option value="">Tình trạng</option>
                                            <option value="true">Hoạt động</option>
                                            <option value="false">Vô hiệu</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="d-flex justify-content-end gap-2">
                                <Button variant="secondary" onClick={handleResetSearch}>
                                    <i className="fas fa-undo me-2"></i>
                                    Đặt lại
                                </Button>
                                <Button variant="primary" onClick={handleSearch}>
                                    <i className="fas fa-search me-2"></i>
                                    Tìm kiếm
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>

                <UniverseTable
                    columns={columns}
                    data={users as Record<keyof UserProfile, unknown>[]}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(newSize) => {
                        setPageSize(newSize);
                        setCurrentPage(0);
                    }}
                    isLoading={loading}
                />
            </div>

            {selectedUser && (
                <AdminUserModal
                    show={showUserModal}
                    onHide={() => setShowUserModal(false)}
                    user={selectedUser}
                    onSave={handleUpdateUser}
                />
            )}

            <DeleteConfirmModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                onConfirm={confirmDeleteUser}
                itemName={selectedUser?.tenHienThi || 'người dùng này'}
            />
        </Container>
    );
};

export default AdminUserManagement;