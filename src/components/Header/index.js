// src/components/Header.js
import React, { useContext, useState } from 'react';
import './style.scss';
import { Link } from 'react-router-dom';
import { Button, Dropdown, Menu } from 'antd';
import { GlobalContext } from '../../globalContext';
import { appState } from '../../config/models';
import CommonModal from '../common/modal';
import { TYPE_MODAL } from '../../config/data';
import { clearAllStorage } from '../../utils/localStorage';
import { LogoutOutlined, ProfileOutlined, UserOutlined } from '@ant-design/icons';

const Header = () => {
  const { user, setUser } = useContext(GlobalContext)

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
      <Menu.Item key="2" icon={<ProfileOutlined />}>
        <Link to="/profile">Cá nhân</Link>
      </Menu.Item>
      <Menu.Item key="3" icon={<LogoutOutlined />}>
        <Button type="text" onClick={logout}>Đăng xuất</Button>
      </Menu.Item>
    </Menu>
  );

  const handleShowLogin = () => {
    setStateApp({ ...stateApp, showLogin: true, change: new Date() })
  }
  const handleCloseLogin = () => {
    setStateApp({ ...stateApp, showLogin: false })
  }
  return (
    <header className="header-container p-2">
      <div className="header-logo">
        <h1>Học SQL</h1>
      </div>
      <nav className="header-nav">
        <ul>
          <li><Link to="/">Bài Tập</Link></li>
          <li><Link to="/submit-history">Submit</Link></li>
          {/* <li><Link to="/cac-bai-thi">Các Bài Thi</Link></li>
          <li><Link to="/cong-dong">Cộng Đồng</Link></li>
          <li><Link to="/thong-tin">Thông Tin</Link></li> */}
        </ul>
      </nav>
      <CommonModal typeModal={TYPE_MODAL.LOGIN} stateApp={stateApp} onClose={handleCloseLogin}></CommonModal>
      <div className='header-user-inf'>
        {
          user ? (
            <Dropdown overlay={menu} trigger={['click']} placement="topRight" arrow>
              <img src='/assets/user.png' alt="avt"></img>
            </Dropdown>
          ) : (
            <button className='btn-submit btn-login-custom' onClick={handleShowLogin}>Đăng nhập</button>
          )
        }

      </div>
    </header>
  );
}

export default Header;
