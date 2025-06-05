import { Pagination } from 'react-bootstrap';

interface UniversePaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const UniversePagination = ({ currentPage, totalPages, onPageChange }: UniversePaginationProps) => {
    const renderPaginationItems = () => {
        const items = [];
        const maxVisiblePages = 5;
        const halfVisible = Math.floor(maxVisiblePages / 2);
        
        let startPage = Math.max(currentPage - halfVisible, 0);
        const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(endPage - maxVisiblePages + 1, 0);
        }

        if (startPage > 0) {
            items.push(
                <Pagination.Item
                    key={0}
                    active={0 === currentPage}
                    onClick={() => onPageChange(0)}
                >
                    1
                </Pagination.Item>
            );
            if (startPage > 1) {
                items.push(<Pagination.Ellipsis key="ellipsis1" />);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <Pagination.Item
                    key={i}
                    active={i === currentPage}
                    disabled={i === currentPage}
                    onClick={() => onPageChange(i)}
                >
                    {i + 1}
                </Pagination.Item>
            );
        }

        if (endPage < totalPages - 1) {
            if (endPage < totalPages - 2) {
                items.push(<Pagination.Ellipsis key="ellipsis2" />);
            }
            items.push(
                <Pagination.Item
                    key={totalPages - 1}
                    active={totalPages - 1 === currentPage}
                    onClick={() => onPageChange(totalPages - 1)}
                >
                    {totalPages}
                </Pagination.Item>
            );
        }

        return items;
    };

    return (
        <Pagination className="universe-pagination mb-0">
            <Pagination.First
                onClick={() => onPageChange(0)}
                disabled={currentPage === 0}
            />
            <Pagination.Prev
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
            />

            {renderPaginationItems()}

            <Pagination.Next
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === (totalPages - 1)}
            />
            <Pagination.Last
                onClick={() => onPageChange(totalPages - 1)}
                disabled={currentPage === (totalPages - 1)}
            />
        </Pagination>
    );
};

export default UniversePagination; 