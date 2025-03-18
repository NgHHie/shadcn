// src/components/Header.js
import React, { useContext, useEffect, useState } from 'react';
import './style.scss';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Badge, Button, Dropdown, Menu, Tooltip } from 'antd';
import { GlobalContext } from '../../globalContext';
import CommonModal from '../common/modal';
import { TYPE_MODAL } from '../../config/data';
import { clearAllStorage } from '../../utils/localStorage';
import { LogoutOutlined, ProfileOutlined, UserOutlined } from '@ant-design/icons';
import { getNumberContestOpening } from '../../services/contestService';
import { getNumberTopicNew } from '../../services/topicService';
import { getFullName } from '../../utils/Util';

const Header = () => {
  const { user, clearContext } = useContext(GlobalContext)
  const [typeModal, setTypeModal] = useState(TYPE_MODAL.LOGIN)
  const [numberContestOpen, setNumberContestOpen] = useState(0)
  const [numberTopicNew, setNumberTopicNew] = useState(0)
  const navi = useNavigate()
  const [stateApp, setStateApp] = useState({
    showLogin: false,
    change: ''
  });

  const logout = () => {
    clearContext()
    clearAllStorage()
    navi('/')
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
  const initCountNumber = () => {
    getNumberContestOpening()
      .then(response => {
        setNumberContestOpen(response?.number)
      })
      .catch(err => {

      })
    getNumberTopicNew()
      .then(response => {
        setNumberTopicNew(response?.topicCount)
      })
      .catch(err => {

      })
  }

  useEffect(() => {
    initCountNumber()
  }, [user])

  return (
    <header className="header-container p-2">
      <div className="header-logo">
        <h1>Học SQL</h1>
      </div>
      <nav className="header-nav">
        <ul>
          <li><Link to="/">Bài Tập</Link></li>
          {
            user && (
              <li><Link to="/submit-history">Lịch sử</Link></li>
            )
          }
          {
            user && (
              <li><Link to="/top-user">Bảng xếp hạng</Link></li>
            )
          }
          {
            user && (
              <li>
                <Tooltip title={`${numberContestOpen} contest đang mở`}>
                  <Badge count={numberContestOpen} offset={[12, -5]} className='cursor-pointer'>
                    <Link to="/contest" style={{ textDecoration: "none" }}>
                      Các cuộc thi
                    </Link>
                  </Badge>
                </Tooltip>
              </li>
            )
          }
          {
            user && (
              <li>
                <Badge count={numberTopicNew} offset={[12, -5]} className='cursor-pointer'>
                  <Link to="/discuss">Thảo luận</Link>
                </Badge>
              </li>
            )
          }
          {/* <li><Link to="/thong-tin">Thông Tin</Link></li> */}
        </ul>
      </nav>
      <CommonModal typeModal={typeModal} stateApp={stateApp} onClose={handleCloseLogin}></CommonModal>
      <div className='header-user-inf'>
        {
          user ? (
            <Dropdown overlay={menu} trigger={['click']} placement="topRight" arrow>
              <Avatar
                className="w-10 h-10 flex justify-center items-center"
                src={user?.avatar ? user?.avatar : '/assets/avatar.png'}
              >
                {user?.firstName ? user.firstName[0].toUpperCase() : null}
              </Avatar>
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
