import { Table, Pagination, Form } from 'react-bootstrap';
import { ReactNode } from 'react';
import './UniverseTable.css';

export interface Column<T> {
    key: keyof T | 'actions';
    header: string;
    render?: (item: T) => ReactNode;
    width?: string;
}

interface UniverseTableProps<T extends Record<keyof T, unknown>> {
    columns: Column<T>[];
    data: T[];
    totalPages: number;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    className?: string;
    isLoading?: boolean;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function UniverseTable<T extends Record<keyof T, unknown>>({
    columns,
    data,
    totalPages,
    currentPage,
    pageSize,
    onPageChange,
    onPageSizeChange,
    className = '',
    isLoading = false,
}: UniverseTableProps<T>) {
    const renderCell = (item: T, column: Column<T>) => {
        if (column.render) {
            return column.render(item);
        }
        return column.key !== 'actions' ? String(item[column.key as keyof T]) : null;
    };

    return (
        <div className="universe-table-container">
            <div className="table-responsive">
                <Table className={`universe-table table-dark ${className}`}>
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th 
                                    key={String(column.key)}
                                    style={column.width ? { width: column.width } : undefined}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center">
                                    Không có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr key={index}>
                                    {columns.map((column) => (
                                        <td key={String(column.key)}>
                                            {renderCell(item, column)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="d-flex align-items-center gap-2">
                    <span className="text-light">Hiển thị</span>
                    <Form.Select
                        size="sm"
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="page-size-select"
                        style={{ width: 'auto' }}
                    >
                        {PAGE_SIZE_OPTIONS.map(size => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </Form.Select>
                    <span className="text-light">dòng</span>
                </div>

                <Pagination className="mb-0">
                    <Pagination.First
                        onClick={() => onPageChange(0)}
                        disabled={currentPage === 0}
                    />
                    <Pagination.Prev
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                    />
                    
                    {Array.from({ length: totalPages || 1 }, (_, i) => (
                        <Pagination.Item
                            key={i}
                            active={i === currentPage}
                            onClick={() => onPageChange(i)}
                        >
                            {i + 1}
                        </Pagination.Item>
                    ))}

                    <Pagination.Next
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === (totalPages - 1)}
                    />
                    <Pagination.Last
                        onClick={() => onPageChange((totalPages || 1) - 1)}
                        disabled={currentPage === (totalPages - 1)}
                    />
                </Pagination>
            </div>
        </div>
    );
}

export default UniverseTable;