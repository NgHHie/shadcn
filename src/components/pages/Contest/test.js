import React, { useEffect, useState } from 'react';
import { Statistic } from 'antd';
import moment from 'moment';

const { Countdown } = Statistic;

// Dummy Problem Component (Replace this with your actual problem component)
const ProblemComponent = ({ problemData }) => (
  <div className="p-6 bg-white rounded-lg shadow-md">
    <h2 className="text-2xl font-semibold text-gray-800 mb-4">{problemData.title}</h2>
    <p className="text-gray-700">{problemData.description}</p>
  </div>
);

const ProblemPage = ({ contest }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Calculate remaining time based on contest end time
  useEffect(() => {
    if (contest && contest.endTime) {
      const now = moment();
      const endTime = moment(contest.endTime);
      const remaining = endTime.diff(now);

      if (remaining > 0) {
        setTimeRemaining(remaining);
      } else {
        setTimeRemaining(0);
      }
    }
  }, [contest]);

  // Dummy data for the problem (replace with actual API data)
  const problemData = {
    title: 'SQL Problem 1: Basic SELECT Query',
    description: 'Write an SQL query to select all users from the database who registered after January 1, 2020.',
  };

  // Handler for timer end (optional)
  const onTimerFinish = () => {
    alert('Time is up!');
  };

  return (
    <div className="relative min-h-screen bg-gray-100 p-6">
      {/* Timer on Top-Right Corner */}
      {timeRemaining !== null && (
        <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg">
          <Countdown
            title="Thời Gian Còn Lại"
            value={moment().valueOf() + timeRemaining}
            onFinish={onTimerFinish}
            format="HH:mm:ss"
            valueStyle={{ color: '#bb2019', fontWeight: 'bold' }}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto mt-10">
        {/* Replace with the actual Problem component */}
        <ProblemComponent problemData={problemData} />
      </div>
    </div>
  );
};

export default ProblemPage;
