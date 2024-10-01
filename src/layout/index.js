

import { Outlet } from "react-router-dom";
import './style.css';
import Header from "../components/Header";
import Footer from "../components/Footer";

function Layout() {

    return (
        <div className="layout-container">
            <div className="layout-header">
                <Header></Header>
            </div>
            <div className="layout-outlet">
                <Outlet></Outlet>
            </div>
            <div className="layout-footer">
                <Footer></Footer>
            </div>
        </div>
    );
}
export default Layout;