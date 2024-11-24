// src/components/Header.js
import React, { useContext, useEffect, useState } from 'react';
import './style.scss';
import { Link } from 'react-router-dom';
import { Badge, Button, Dropdown, Menu, Tooltip } from 'antd';
import { GlobalContext } from '../../globalContext';
import { appState } from '../../config/models';
import CommonModal from '../common/modal';
import { TYPE_MODAL } from '../../config/data';
import { clearAllStorage } from '../../utils/localStorage';
import { LogoutOutlined, ProfileOutlined, UserOutlined } from '@ant-design/icons';
import UserActionTracker from '../common/LogAction';
import { getNumberContestOpening } from '../../services/contestService';

const Header = () => {
  const { user, setUser } = useContext(GlobalContext)
  const [typeModal, setTypeModal] = useState(TYPE_MODAL.LOGIN)
  const [numberContestOpen,setNumberContestOpen] = useState(0)

  const [stateApp, setStateApp] = useState({
    showLogin: false,
    change: ''
  });

  const logout = () => {
    setUser(null)
    clearAllStorage()

  }

  const menu = (
    <Menu>
      <Menu.Item key="1" icon={<UserOutlined />}>
        <p>{user?.fullName}</p>
      </Menu.Item>
      <Menu.Item key="2" icon={<ProfileOutlined />} onClick={() => handleShowLogin(TYPE_MODAL.INFOMATION)}>
        <p>Cá nhân</p>
      </Menu.Item>
      <Menu.Item key="3" icon={<LogoutOutlined />}>
        <Button type="text" onClick={logout}>Đăng xuất</Button>
      </Menu.Item>
    </Menu>
  );

  const handleShowLogin = (type) => {
    setTypeModal(type ? type : TYPE_MODAL.LOGIN)
    setStateApp({ ...stateApp, showLogin: true, change: new Date() })
  }
  const handleCloseLogin = () => {
    setStateApp({ ...stateApp, showLogin: false })
  }
  const getNumberContestOpen = () => {
    getNumberContestOpening()
      .then(response => {
        setNumberContestOpen(response?.number)
      })
  }

  useEffect(() => {
    getNumberContestOpen()
  },[user])

  return (
    <header className="header-container p-2">
      <div className="header-logo">
        <h1>Học SQL</h1>
      </div>
      <nav className="header-nav">
        <ul>
          <li><Link to="/">Bài Tập</Link></li>
          <li><Link to="/submit-history">Lịch sử</Link></li>
          <li><Link to="/top-user">Bảng xếp hạng</Link></li>
          <li>
            <Tooltip title={`${numberContestOpen} contest đang mở`}>
              <Badge count={numberContestOpen} offset={[12, -5]} className='cursor-pointer'>
                <Link to="/contest" style={{ textDecoration: "none" }}>
                  Các cuộc thi
                </Link>
              </Badge>
            </Tooltip>
          </li>
          {/* <li><Link to="/cong-dong">Cộng Đồng</Link></li>
          <li><Link to="/thong-tin">Thông Tin</Link></li> */}
        </ul>
      </nav>
      <CommonModal typeModal={typeModal} stateApp={stateApp} onClose={handleCloseLogin}></CommonModal>
      <div className='header-user-inf'>
        {
          user ? (
            <Dropdown overlay={menu} trigger={['click']} placement="topRight" arrow>
              <img src='/assets/user.png' alt="avt"></img>
            </Dropdown>
          ) : (
            <button className='btn-submit btn-login-custom' onClick={() => handleShowLogin(TYPE_MODAL.LOGIN)}>Đăng nhập</button>
          )
        }

      </div>
    </header>
  );
}

export default Header;
