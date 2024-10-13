// src/components/SubmitHistory.js
import React, { useState } from 'react';
import './style.scss';
import { formatDate } from '../../../utils/Util';
import { Pagination, Spin } from 'antd';
import { PAGE_SIZE } from '../../../config/data';

const SubmitHistory = ({ data, totalElements, onPage ,loading}) => {

  const [currentPage, setCurrentPage] = useState(0)

  const handlePageChange = (page) => {
    if (onPage) {
      onPage(page)
    }
  };
  if(loading) {
    return (
      <div className='text-center'>
        <Spin></Spin>
        <p className='mt-2'>Loading...</p>
      </div>
    )
  }
  return (
    <div className="submit-history">
      <h3 className='text-[17px] mb-2'>Trạng thái giải bài</h3>
      <table>
        <thead>
          <tr className='thead-custom'>
            <th className='text-left'>Bài tập</th>
            <th className='text-left'>Tài khoản</th>
            <th className='text-left'>Thời gian</th>
            <th className='text-center'>Trạng thái</th>
            <th className='text-center'>Thời gian thực thi</th>
            <th className='text-center'>Kết quả</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((submission, index) => (
            <tr key={index}>
              <td>{submission?.question?.title}</td>
              <td>{submission?.user?.userCode} ({submission?.user?.fullName})</td>
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
              <td className='text-center'>{submission?.timeout} ms</td>
              <td className='text-center !text-red-500'>
                {!submission?.totalTest || submission?.totalTest === 0 ? '/' : `${submission?.testPass}/${submission?.totalTest}`}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end mt-3">
        <Pagination
          defaultCurrent={currentPage}
          total={totalElements}
          pageSize={PAGE_SIZE}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default SubmitHistory;
