import { useEffect, useState } from 'react';
import { Form, Alert } from 'react-bootstrap';
import { DanhMucSuKien } from '../../../types/EventTypeTypes';
import eventCategoryService from '../../../api/eventCategoryService';
import './CategorySelector.css';

interface CategorySelectorProps {
    selectedCategories: string[];
    onChange: (categories: string[]) => void;
    categories?: DanhMucSuKien[];
    disabled?: boolean;
    maxSelections?: number;
    showSearch?: boolean;
    variant?: 'pills' | 'checkboxes';
}

const CategorySelector = ({ 
    selectedCategories, 
    onChange, 
    categories: propCategories,
    disabled = false,
    maxSelections,
    showSearch = true,
    variant = 'pills'
}: CategorySelectorProps) => {
    const [categories, setCategories] = useState<DanhMucSuKien[]>([]);
    const [loading, setLoading] = useState(!propCategories);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (propCategories) {
            setCategories(propCategories);
            setLoading(false);
            return;
        }

        const loadCategories = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await eventCategoryService.getAll();
                setCategories(response);
            } catch (err) {
                setError('Không thể tải danh sách danh mục');
                console.error('Error loading categories:', err);
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, [propCategories]);

    const handleCategoryToggle = (categoryId: string) => {
        if (disabled) return;

        const isSelected = selectedCategories.includes(categoryId);
        let newSelection: string[];

        if (isSelected) {
            newSelection = selectedCategories.filter(id => id !== categoryId);
        } else {
            if (maxSelections && selectedCategories.length >= maxSelections) {
                return;
            }
            newSelection = [...selectedCategories, categoryId];
        }

        onChange(newSelection);
    };

    const filteredCategories = categories.filter(category =>
        category.tenDanhMuc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSelectedCategoryNames = () => {
        return categories
            .filter(cat => selectedCategories.includes(cat.maDanhMuc))
            .map(cat => cat.tenDanhMuc);
    };

    const renderSelectedCategories = () => {
        const selectedNames = getSelectedCategoryNames();
        
        if (selectedNames.length === 0) {
            return (
                <div className="category-selector-empty-state">
                    <i className="fas fa-tags"></i>
                    <span>Chưa chọn danh mục nào</span>
                </div>
            );
        }

        return (
            <div className="category-selector-selected-container">
                <div className="category-selector-selected-header">
                    <span className="category-selector-selected-label">
                        Đã chọn ({selectedNames.length}
                        {maxSelections && `/${maxSelections}`}):
                    </span>
                    {selectedNames.length > 0 && (
                        <button
                            type="button"
                            className="category-selector-clear-button"
                            onClick={() => onChange([])}
                            disabled={disabled}
                            title="Xóa tất cả"
                        >
                            <i className="fas fa-times"></i>
                            Xóa tất cả
                        </button>
                    )}
                </div>
                <div className="category-selector-selected-tags">
                    {selectedNames.map((name) => {
                        const categoryId = categories.find(cat => cat.tenDanhMuc === name)?.maDanhMuc;
                        return (
                            <div key={name} className="category-selector-selected-tag">
                                <span className="category-selector-tag-text">{name}</span>
                                <button
                                    type="button"
                                    className="category-selector-tag-remove"
                                    onClick={() => categoryId && handleCategoryToggle(categoryId)}
                                    disabled={disabled}
                                    title="Xóa danh mục này"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderPillsVariant = () => (
        <div className="category-selector-pills-container">
            {filteredCategories.map(category => {
                const isSelected = selectedCategories.includes(category.maDanhMuc);
                const isMaxReached = maxSelections && selectedCategories.length >= maxSelections && !isSelected;
                
                return (
                    <button
                        key={category.maDanhMuc}
                        type="button"
                        className={`category-selector-pill ${
                            isSelected ? 'category-selector-pill-active' : ''
                        } ${isMaxReached ? 'category-selector-pill-disabled' : ''}`}
                        onClick={() => handleCategoryToggle(category.maDanhMuc)}
                        disabled={disabled || !!isMaxReached}
                        title={isMaxReached ? 'Đã đạt giới hạn tối đa' : category.tenDanhMuc}
                    >
                        <span className="category-selector-pill-text">{category.tenDanhMuc}</span>
                        {isSelected && (
                            <i className="fas fa-check category-selector-pill-icon"></i>
                        )}
                    </button>
                );
            })}
        </div>
    );

    const renderCheckboxesVariant = () => (
        <div className="category-selector-checkboxes-container">
            {filteredCategories.map(category => {
                const isSelected = selectedCategories.includes(category.maDanhMuc);
                const isMaxReached = maxSelections && selectedCategories.length >= maxSelections && !isSelected;
                
                return (
                    <div
                        key={category.maDanhMuc}
                        className={`category-selector-checkbox-item ${
                            isSelected ? 'category-selector-checkbox-item-active' : ''
                        } ${isMaxReached ? 'category-selector-checkbox-item-disabled' : ''}`}
                    >
                        <Form.Check
                            type="checkbox"
                            id={`category-${category.maDanhMuc}`}
                            checked={isSelected}
                            onChange={() => handleCategoryToggle(category.maDanhMuc)}
                            disabled={disabled || !!isMaxReached}
                            className="category-selector-checkbox"
                        />
                        <label
                            htmlFor={`category-${category.maDanhMuc}`}
                            className="category-selector-checkbox-label"
                        >
                            {category.tenDanhMuc}
                        </label>
                        {isMaxReached && (
                            <span className="category-selector-limit-indicator" title="Đã đạt giới hạn">
                                <i className="fas fa-lock"></i>
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );

    if (loading) {
        return (
            <div className="category-selector-wrapper">
                <div className="category-selector-loading">
                    <div className="category-selector-spinner">
                        <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                    </div>
                    <span>Đang tải danh mục...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="category-selector-wrapper">
                <Alert variant="danger" className="category-selector-error">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>{error}</span>
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => window.location.reload()}
                    >
                        Thử lại
                    </button>
                </Alert>
            </div>
        );
    }

    return (
        <div className="category-selector-wrapper">
            {renderSelectedCategories()}

            {maxSelections && selectedCategories.length >= maxSelections && (
                <div className="category-selector-warning">
                    <i className="fas fa-info-circle"></i>
                    <span>Đã đạt giới hạn tối đa {maxSelections} danh mục</span>
                </div>
            )}

            {showSearch && categories.length > 5 && (
                <div className="category-selector-search-container">
                    <div className="category-selector-search-wrapper">
                        <i className="fas fa-search category-selector-search-icon"></i>
                        <Form.Control
                            type="text"
                            placeholder="Tìm kiếm danh mục..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="category-selector-search"
                            disabled={disabled}
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                className="category-selector-search-clear"
                                onClick={() => setSearchTerm('')}
                                title="Xóa tìm kiếm"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="category-selector-list-container">
                <div className="category-selector-list-header">
                    <span className="category-selector-list-title">
                        Chọn danh mục ({filteredCategories.length})
                    </span>
                    {searchTerm && (
                        <span className="category-selector-search-results">
                            Tìm thấy {filteredCategories.length} kết quả
                        </span>
                    )}
                </div>

                <div className="category-selector-list">
                    {filteredCategories.length > 0 ? (
                        variant === 'pills' ? renderPillsVariant() : renderCheckboxesVariant()
                    ) : (
                        <div className="category-selector-no-results">
                            <i className="fas fa-search"></i>
                            <span>Không tìm thấy danh mục nào</span>
                            {searchTerm && (
                                <button
                                    type="button"
                                    className="btn btn-link btn-sm"
                                    onClick={() => setSearchTerm('')}
                                >
                                    Xóa bộ lọc
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategorySelector;