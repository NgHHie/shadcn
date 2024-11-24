// src/GlobalContext.js
import React, { createContext, useEffect, useState } from 'react';
import { getUserInfo } from '../utils/masterData';
import { responseOk } from '../utils/FetchUtil';
import { Spin } from 'antd';
import { getCurrentContestExamRunning } from '../services/contestService';

const GlobalContext = createContext();

const initialState = {
  user: null,
  currentContest: {},
  fullScreen: false,
};

const GlobalProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentContest,setCurrentContest] = useState({})
  const [fullScreen,setFullScreen] = useState(false)

  const clearContext = () => {
    setUser(initialState.user);
    setCurrentContest(initialState.currentContest);
    setFullScreen(initialState.fullScreen);
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfo = await getUserInfo();
      if (userInfo) {
        setUser(userInfo);
      }
      setLoading(false);  // Đặt loading là false sau khi dữ liệu đã được tải
    };

    fetchUserInfo();
    
  },[])

  // Hiển thị loader hoặc null khi dữ liệu đang được tải
  if (loading) {
    return <div>
      <Spin tip="Loading" size="large" fullscreen >
      </Spin>
    </div>;  // Bạn có thể thay thế bằng component loader tùy ý
  }

  return (
    <GlobalContext.Provider value={{ user, setUser,currentContest,setCurrentContest,fullScreen,setFullScreen,clearContext}}>
      {children}
    </GlobalContext.Provider>
  );
};

export { GlobalContext, GlobalProvider };
