import { useEffect, useState } from 'react';
import { Form, Badge, Dropdown } from 'react-bootstrap';
import { DanhMucSuKien } from '../../../types/EventTypeTypes';
import eventCategoryService from '../../../api/eventCategoryService';
import './CategorySelector.css';

interface CategorySelectorProps {
    selectedCategories: string[];
    onChange: (categories: string[]) => void;
}

const CategorySelector = ({ selectedCategories, onChange }: CategorySelectorProps) => {
    const [categories, setCategories] = useState<DanhMucSuKien[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [show, setShow] = useState(false);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await eventCategoryService.getAll();
                setCategories(response);
            } catch (error) {
                console.error('Error loading categories:', error);
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, []);

    const handleCategoryChange = (e: React.MouseEvent, maDanhMuc: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        const newSelection = selectedCategories.includes(maDanhMuc)
            ? selectedCategories.filter(id => id !== maDanhMuc)
            : [...selectedCategories, maDanhMuc];
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

    if (loading) {
        return <div className="text-center">Đang tải danh mục...</div>;
    }

    return (
        <div className="category-selector">
            <div className="selected-categories">
                {getSelectedCategoryNames().map((name) => (
                    <Badge 
                        key={name} 
                        className="category-badge"
                    >
                        {name}
                    </Badge>
                ))}
            </div>
            
            <Dropdown 
                className="category-dropdown"
                show={show}
                onToggle={(isOpen) => setShow(isOpen)}
            >
                <Dropdown.Toggle variant="outline-primary" id="category-dropdown">
                    Chọn danh mục
                </Dropdown.Toggle>

                <Dropdown.Menu className="category-dropdown-menu">
                    <div className="px-3 py-2" onClick={e => e.stopPropagation()}>
                        <Form.Control
                            type="text"
                            placeholder="Tìm danh mục..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="category-search"
                        />
                    </div>
                    <div className="category-list">
                        {filteredCategories.map(category => (
                            <Dropdown.Item
                                key={category.maDanhMuc}
                                onClick={(e) => handleCategoryChange(e, category.maDanhMuc)}
                                active={selectedCategories.includes(category.maDanhMuc)}
                                className="category-item"
                            >
                                <Form.Check
                                    type="checkbox"
                                    checked={selectedCategories.includes(category.maDanhMuc)}
                                    onChange={() => {}}
                                    label={category.tenDanhMuc}
                                    inline
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </Dropdown.Item>
                        ))}
                    </div>
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
};

export default CategorySelector;