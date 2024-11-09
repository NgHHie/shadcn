// src/components/SubmitHistory.js
import React, { useState } from 'react';
import { Avatar, Pagination, Spin } from 'antd';
import { PAGE_SIZE } from '../../../config/data';

const TopUser = ({ data, totalElements, onPage, loading }) => {

  const [currentPage, setCurrentPage] = useState(0)

  const handlePageChange = (page) => {
    if (onPage) {
      onPage(page)
    }
  };

  if (loading) {
    return (
      <div className='text-center'>
        <Spin></Spin>
        <p className='mt-2'>Loading...</p>
      </div>
    )
  }
  return (
    <div className="submit-history">
      <h3 className='text-[17px] mb-2'>Top user</h3>
      <table>
        <thead>
          <tr className='thead-custom'>
            <th className="text-center">Avatar</th>
            <th className='text-left'>Tên người dùng</th>
            <th className='text-center'>Số câu đã làm</th>
            <th className='text-center'>Tổng điểm</th>
            <th className='text-center'>Rank</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((submission, index) => (
            <tr key={index}>
              <td className="text-center">
                <Avatar
                  src={'/assets/avatar.png'}
                  size={64}
                  alt={submission?.fullName}
                  className={submission?.rank <= 3 ? 'border-4 border-yellow-400' : ''}
                />
              </td>
              <td>{submission?.fullName}</td>
              <td className='text-center'>{submission?.numQuestionDone}</td>
              <td className="text-center font-bold">
                <span className={`px-4 py-2 rounded-full ${submission?.totalPoints > 100 ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                  {submission?.totalPoints}
                </span>
              </td>
              <td className="text-center font-bold">
                <span className={`px-4 py-2 rounded-full ${submission?.rank <= 3 ? 'bg-[#2ed172b3] text-white'  : 'bg-blue-100 text-blue-700'}`}>
                  {submission?.rank}
                </span>
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

export default TopUser;
