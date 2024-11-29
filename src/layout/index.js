

import { Outlet, useNavigate } from "react-router-dom";
import './style.css';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../globalContext";
import { getCurrentContestExamRunning } from "../services/contestService";

function Layout() {
    const { fullScreen } = useContext(GlobalContext)
    const { user } = useContext(GlobalContext)
    const navi = useNavigate()

    const checkContestRunning = () => {
        getCurrentContestExamRunning()
            .then(response => {
                if (response?.id) {
                    navi(`/contest-wating/${response?.id}`)
                }
            })
    }
    
    useEffect(() => {
        checkContestRunning()
    }, [user])

    return (
        <div className="layout-container">
            {
                !fullScreen && (
                    <div className="layout-header">
                        <Header></Header>
                    </div>
                )
            }

            <div className={`layout-outlet ${fullScreen ? 'h-screen' : ''}`}>
                <Outlet></Outlet>
            </div>
            {
                !fullScreen && (
                    <div className="layout-footer">
                        <Footer></Footer>
                    </div>
                )
            }

        </div>
    );
}
export default Layout;