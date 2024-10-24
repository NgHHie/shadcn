import React, { useEffect, useState } from 'react';
import { Button, Spin, Tag, Progress, Input } from 'antd';
import moment from 'moment';

const { TextArea } = Input;

const ContestInfoPage = ({ contestId }) => {
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Dummy function to fetch contest data (Replace with your actual API call)
  const fetchContestInfo = async (id) => {
    // Simulating an API call with a timeout
    setLoading(true);
    setTimeout(() => {
      // Replace this object with actual fetched data
      const mockContestData = {
        id: id,
        name: 'Cuộc Thi SQL - Luyện Tập',
        description: 'Cuộc thi này giúp bạn nâng cao kỹ năng SQL của mình thông qua các bài tập từ cơ bản đến nâng cao.',
        duration: 120, // Duration in minutes
        rules: [
          'Thí sinh cần có kiến thức cơ bản về SQL và sử dụng các câu lệnh như SELECT, INSERT, UPDATE, DELETE, JOIN, GROUP BY, ORDER BY, v.v.',
          'Thí sinh phải tự mình làm bài, không được sao chép từ nguồn khác.',
          'Mỗi câu truy vấn SQL phải đảm bảo tính chính xác và hiệu quả.',
          'Các bài nộp không đạt yêu cầu về thời gian hoặc sử dụng tài nguyên vượt mức sẽ bị trừ điểm.',
          'Ban tổ chức có quyền quyết định cuối cùng về kết quả của cuộc thi.'
        ].join('\n'), // Join rules into a single string for TextArea
        status: 'OPEN',
        startTime: moment().add(1, 'hour'), // 1 hour from now
        endTime: moment().add(3, 'hours'),  // 3 hours from now
      };
      setContest(mockContestData);
      setLoading(false);
    }, 1000);
  };

  // Calculate remaining time (update every second)
  useEffect(() => {
    const interval = setInterval(() => {
      if (contest) {
        const now = moment();
        const endTime = contest.endTime;
        const remaining = endTime.diff(now, 'seconds');
        setTimeRemaining(remaining > 0 ? moment.utc(remaining * 1000).format('HH:mm:ss') : '00:00:00');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [contest]);

  // Fetch contest info when component mounts
  useEffect(() => {
    fetchContestInfo(contestId);
  }, [contestId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!contest) {
    return <div className="text-center text-red-500">Contest not found!</div>;
  }

  return (
    <div className="flex justify-center items-center mt-5">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl p-8 mx-4 flex flex-col justify-between animate-fadeIn">
        <div>
          <h1 className="text-xl font-extrabold text-center mb-4" style={{ color: '#bb2019' }}>
            {contest.name}
          </h1>

          <p className="text-lg text-gray-700 line-clamp-3 mb-6 text-center">{contest.description}</p>

          <div className="grid grid-cols-2 gap-6 mb-4">
            {/* Contest Duration and Time Remaining */}
            <div className="p-4 bg-white shadow-md rounded-lg border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold mb-2 text-blue-600">Thông Tin Cuộc Thi</h3>
              <p className="text-gray-700 text-md mb-1">
                <strong>Thời Lượng:</strong> {contest.duration} phút
              </p>
              <p className="text-gray-700 text-md mb-1">
                <strong>Thời Gian Còn Lại:</strong> {timeRemaining}
              </p>
            </div>

            {/* Contest Rules with TextArea */}
            <div className="p-4 bg-white shadow-md rounded-lg border-l-4 border-green-500">
              <h3 className="text-lg font-semibold mb-2 text-green-600">Quy Tắc</h3>
              <TextArea 
                value={contest.rules} 
                readOnly 
                className="bg-gray-50 border-none resize-none shadow-sm text-gray-700" 
                autoSize={{ minRows: 4, maxRows: 6 }} 
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <Progress 
              percent={((moment().diff(contest.startTime, 'minutes') / contest.duration) * 100).toFixed(2)} 
              status={contest.status === 'OPEN' ? 'active' : 'exception'} 
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center mt-4">
          <Button 
            type="primary" 
            className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold py-3 rounded-full transition-all duration-300 shadow-md"
            disabled={contest.status !== 'OPEN'}
            onClick={() => alert('Contest Started!')}
          >
            Bắt đầu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContestInfoPage;
