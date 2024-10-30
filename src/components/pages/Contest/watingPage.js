import React, { useState, useEffect, useContext } from 'react';
import { Button, message, Tag } from 'antd';
import { getContestWaitingById } from '../../../services/contestService';
import { useNavigate, useParams } from 'react-router-dom';
import { formatTimeCountDown } from '../../../utils/Util';
import { CONTEST_MODE, CONTEST_STATUS } from '../../../config/data';
import { GlobalContext } from '../../../globalContext';

const ContestWaitingPage = () => {
    const { contestId } = useParams()
    const [contest, setContest] = useState([])
    const [timeToStart, setTimeToStart] = useState(0); // Pre-contest: 5 minutes countdown
    const [timeLeft, setTimeLeft] = useState(0);  // Contest: 84 minutes and 9 seconds
    const [isContestStarted, setIsContestStarted] = useState(false); // Indicates if the contest has started
    const {fullScreen, setFullScreen} = useContext(GlobalContext)
    const navi = useNavigate()

    const getData = () => {
        if (!contestId) {
            navi('/')
        }
        getContestWaitingById(contestId)
            .then(response => {
                setContest(response)
                if (response?.startDatetime && response?.endDatetime) {
                    if (response?.status === CONTEST_STATUS.CLOSE) {
                        message.info("Cuộc thi đã kết thúc!")
                        navi('/')
                    }
                    if(response?.mode === CONTEST_MODE.EXAM) {
                        setFullScreen(true)
                    } else {
                        setFullScreen(false)
                    }
                    const startTime = new Date(response?.startDatetime).getTime();
                    const endTime = new Date(response?.endDatetime).getTime();
                    const now = new Date().getTime();

                    if (now < startTime) {
                        setTimeToStart(Math.floor((startTime - now) / 1000));
                        setTimeLeft(Math.floor((endTime - startTime) / 1000)); // Contest duration
                    } else {
                        setIsContestStarted(true);
                        setTimeLeft(Math.floor((endTime - now) / 1000));
                    }
                }
            })
            .catch(err => {
                message.info('Bài thi không tồn tại!')
                navi('/')
            })
    }
    useEffect(() => {
        getData()
    }, [])

    useEffect(() => {
        // Start the interval when the component mounts
        const preContestTimer = setInterval(() => {
            setTimeToStart((prevTime) => {
            if (prevTime > 0) {
              return prevTime - 1; // Decrement time if still above 0
            } else {
              clearInterval(preContestTimer); // Clear the interval when timeLeft reaches 0
              return 0; // Ensure timeLeft does not go negative
            }
          });
        }, 1000);
    
        // Cleanup the interval when the component unmounts
        return () => clearInterval(preContestTimer);
      }, []); // Empty dependency array to create the interval only once

    useEffect(() => {
        // Start the interval when the component mounts
        const contestTimer = setInterval(() => {
          setTimeLeft((prevTime) => {
            if (prevTime > 0) {
              return prevTime - 1; // Decrement time if still above 0
            } else {
              clearInterval(contestTimer); // Clear the interval when timeLeft reaches 0
              return 0; // Ensure timeLeft does not go negative
            }
          });
        }, 1000);
    
        // Cleanup the interval when the component unmounts
        return () => clearInterval(contestTimer);
      }, []);


    // Handle Start Button Click
    const handleStart = () => {
        navi(`/contest-joined/${contestId}`)
    };


    return (
        <div className="h-screen  m-auto w-[95%] mt-5 overflow-y-hidden">
            <div className="bg-white shadow-md rounded-md w-full p-6 mb-8 animate-fadeIn">
                <div className="flex justify-between bg-blue-50 p-4 rounded-md mb-4">
                    <div className='text-gray-700'>
                        <div className='flex items-center mb-2'>
                            <h1 className="text-xl font-bold text-blue-600 mr-1">{contest?.name}</h1>
                            {
                                contest?.mode === CONTEST_MODE.PRACTICE ? (
                                    <Tag color='blue' className="">Thực hành</Tag>
                                ) : (
                                    <div className="relative inline-block">
                                        <span className="absolute inline-flex h-full w-full rounded-full border-1 border-[#3498db] animate-ping opacity-75"></span>
                                        <Tag
                                            color='blue'
                                            className="relative font-bold bg-yellow-200 text-yellow-800 border-yellow-500"
                                        >
                                            Kiểm tra
                                        </Tag>
                                    </div>
                                )
                            }
                        </div>

                        <p>Số lượng câu hỏi: <span className="font-semibold">{contest?.numberQuestion}</span></p>
                        <p>Số người tham gia: <span className="font-semibold">{contest?.numberUser}</span></p>
                        <p>Thời gian làm: <span className="font-semibold">{formatTimeCountDown(contest?.duration * 60)}</span></p>
                    </div>
                    {
                        isContestStarted ? (
                            <div className="text-right">
                                <p className="text-gray-500">Thời gian còn lại</p>
                                <p className="text-red-500 text-xl font-bold">{formatTimeCountDown(timeLeft)}</p>
                            </div>
                        ) : (
                            <div className="text-right">
                                <p className="text-red-500 text-xl font-bold">Chưa đến giờ làm bài</p>
                            </div>
                        )
                    }
                </div>
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Nội quy làm bài:</h2>
                    <div className="border rounded-md p-4 bg-gray-50 text-gray-600">
                        <ul className="list-disc list-inside space-y-2">
                            <li>Không sử dụng tài liệu trong suốt thời gian làm bài.</li>
                            <li>Không gian lận hoặc nhờ người khác giúp đỡ.</li>
                            <li>Đảm bảo nộp bài trước khi thời gian kết thúc.</li>
                            <li>Tuân thủ quy định của kỳ thi để tránh bị hủy kết quả.</li>
                        </ul>
                    </div>
                </div>
                <div className="flex justify-center">
                    {isContestStarted ? (
                        <Button
                            type="primary"
                            danger
                            className="relative px-6 py-3 font-semibold text-white rounded-md bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-400 transition-all duration-300"
                            onClick={handleStart}
                        >
                            <span className="absolute inset-0 border-1 border-red-500 rounded-md animate-ping"></span>
                            <span className="relative">Bắt đầu</span>
                        </Button>

                    ) : (
                        <div className="text-red-500 text-xl font-medium">
                            <span className='!font-normal !text-gray-600 '>Bài thi bắt đầu sau: </span>

                            {formatTimeCountDown(timeToStart)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContestWaitingPage;
