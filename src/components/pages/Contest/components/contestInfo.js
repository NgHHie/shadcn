import React from 'react';

const ContestInfo = () => {
  return (
    <div className="bg-blue-50 p-6 rounded-lg shadow-md max-w-3xl mx-auto my-4">
      <div className="flex items-start">
        {/* Left Section */}
        <div className="flex flex-col w-1/2 flex-1">
          <h2 className="text-lg font-bold text-blue-900">TOÁN HỌC - ĐỀ SỐ 06 (T-2)</h2>
          <div className="mt-2">
            <p className="text-base">
              <span className="">Môn học:</span> <span className="font-bold">Toán</span>
            </p>
            <p className="text-base">
              <span >Số lượng câu hỏi:</span> <span className="font-bold">22</span>
            </p>
            <p className="text-base">
              <span >Thời gian làm:</span> <span className="font-bold">90 phút</span>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-l-1 border-gray-300 w-[1px] h-[20vh]">
            
        </div>

        {/* Right Section */}
        <div className="flex flex-col w-1/2 flex-1 ml-3">
          <h3 className="text-base font-bold text-blue-900">Thời gian còn lại</h3>
          <p className="text-2xl font-semibold text-red-600">
            84 <span className="text-base font-normal">phút</span> <span className="text-red-400 font-semibold">09</span> <span className="text-base font-normal">giây</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContestInfo;
