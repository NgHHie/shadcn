// src/components/SubmitHistory.js
import React, { useContext, useState } from 'react';
import './style.scss';
import { formatDate } from '../../../utils/Util';
import { Pagination, Spin, Tag } from 'antd';
import { PAGE_SIZE, ROLE_NAME } from '../../../config/data';
import UserQueryDetailModal from '../modal/userQueryDetail';
import { GlobalContext } from '../../../globalContext';
import { useLocation } from 'react-router-dom';

const SubmitHistory = ({ data, totalElements, onPage, loading }) => {
  const location = useLocation();
  const [submitIdSelected, setSubmitIdSelec] = useState('')
  const { appState, setAppState, user } = useContext(GlobalContext);

  const onChangeSelectSubmit = (submitId) => {
    if (location?.pathname.startsWith("/question-detail/")) {
      if (user?.isPremium) {
        setSubmitIdSelec(submitId)
        setAppState({ ...appState, showUserQueryDetailModal: true })
      }
    }
  }

  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: PAGE_SIZE
  })

  const handlePageChange = (page, size) => {
    if (onPage) {
      onPage(page, size)
      setPagination({
        currentPage: page,
        size: size
      })
    }
  };

  return (
    <div className="submit-history">
      <h3 className='text-[17px] mb-2'>Trạng thái giải bài</h3>
      <UserQueryDetailModal submitId={submitIdSelected}></UserQueryDetailModal>
      {
        !loading ? (
          <table>
            <thead>
              <tr className='thead-custom'>
                <th className='text-left'>Mã</th>
                <th className='text-left'>Bài tập</th>
                <th className='text-left'>Tài khoản</th>
                <th className='text-left'>Thời gian</th>
                <th className='text-center'>Trạng thái</th>
                <th className='text-center'>Thời gian thực thi</th>
                <th className='text-center'>Kết quả</th>
                <th className='text-center'>Database</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((submission, index) => (
                <tr key={index} className='cursor-pointer' onClick={() => onChangeSelectSubmit(submission?.id)}>
                  <td>{submission?.question?.questionCode}</td>
                  <td>{submission?.question?.title}</td>
                  <td>{submission?.user?.userCode} ({submission?.user?.fullName ? submission?.user?.fullName : submission?.user?.lastName + ' ' + submission?.user?.firstName})</td>
                  <td>{formatDate(submission?.timeSubmit)}</td>
                  <td className={`text-center ${submission?.status?.toLowerCase()}`}>
                    {
                      submission?.status ? (
                        submission?.status
                      ) : (
                        <Spin></Spin>
                      )
                    }

                  </td>
                  <td className='text-center'>{submission?.timeout ? submission?.timeout : submission?.timeExec} ms</td>
                  <td className='text-center !text-red-500'>
                    {!submission?.totalTest || submission?.totalTest === 0 ? '/' : `${submission?.testPass}/${submission?.totalTest}`}
                  </td>
                  <td className='text-center'>
                    <Tag color='blue'>{submission?.database?.name}</Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className='flex flex-col justify-center items-center mx-auto'>
            <Spin></Spin>
            Loading
          </div>
        )
      }
      <div className="flex justify-end mt-3">
        <Pagination
          defaultCurrent={pagination?.currentPage}
          total={totalElements}
          pageSize={pagination?.size}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default SubmitHistory;
