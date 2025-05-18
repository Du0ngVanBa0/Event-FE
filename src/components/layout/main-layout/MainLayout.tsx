import { Outlet } from 'react-router-dom';
import Header from '../../common/header/Header';
import './MainLayout.css';

const MainLayout = () => {
    return (
        <div className="main-layout">
            <div className="header-fixed">
                <Header />
            </div>
            <div className="main-content">
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;
