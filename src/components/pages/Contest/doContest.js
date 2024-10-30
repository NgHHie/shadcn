import React, { useContext, useEffect, useState } from 'react';
import { Button, message, Spin, Tooltip } from 'antd';
import { HomeFilled, HomeOutlined, InfoCircleOutlined, LeftCircleFilled } from '@ant-design/icons';
import QuestionHome from '../../QuestionHome';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { getContestDetail } from '../../../services/contestService';
import TableQuestionContest from './components/contestTable';
import { CONTEST_MODE, CONTEST_STATUS } from '../../../config/data';
import { formatTimeCountDown } from '../../../utils/Util';
import { GlobalContext } from '../../../globalContext';

const ExamPage = () => {
    const { contestId } = useParams()
    const { setFullScreen } = useContext(GlobalContext)
    const [contest, setContest] = useState(null)
    const { currentContest, setCurrentContest } = useContext(GlobalContext)
    const [timeLeft, setTimeLeft] = useState(0);  // Contest: 84 minutes and 9 seconds
    const navi = useNavigate()

    const handleClickHome = () => {
        navi(`/contest-joined/${contestId}`)
    }
    const getData = () => {
        getContestDetail(contestId)
            .then(response => {
                setContest(response)
                setCurrentContest(response)
                if (response?.startDatetime && response?.endDatetime) {
                    if (response?.status === CONTEST_STATUS.CLOSE) {
                        message.info("Cuộc thi đã kết thúc!")
                        navi('/')
                    }
                    const endTime = new Date(response?.endDatetime).getTime();
                    const now = new Date().getTime();

                    setTimeLeft(Math.floor((endTime - now) / 1000));
                }
                if (response?.mode === CONTEST_MODE.EXAM) {
                    setFullScreen(true)
                }
            })
            .catch(err => {
                message.info("Cuộc thi không tồn tại")
                navi('/')
            })
    }

    useEffect(() => {
        // Start the interval when the component mounts
        const contestTimer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime > 0) {
                    return prevTime - 1; // Decrement time if still above 0
                } else {
                    message.info("Bài thi đã kết thúc!")
                    setTimeout(() => {
                        navi('/');
                    }, 500);
                    clearInterval(contestTimer); // Clear the interval when timeLeft reaches 0
                    return 0; // Ensure timeLeft does not go negative
                }
            });
        }, 1000);

        // Cleanup the interval when the component unmounts
        return () => clearInterval(contestTimer);
    }, []); // Empty dependency array to create the interval only once


    useEffect(() => {
        getData()
    }, [contestId])

    if (!contest) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }
    return (
        <div className="min-h-screen">
            <div className="bg-white p-7 rounded-lg shadow-lg w-[98%] relative mt-2 m-auto min-h-screen">
                {/* Header Section */}
                <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                        <div
                            className="cursor-pointer border text-blue-500 px-2 py-1 rounded-full transition-transform duration-200 hover:scale-110"
                            onClick={handleClickHome}
                        >
                            <HomeOutlined className="" />
                        </div>
                        <span className="text-[#2980b9] text-lg font-semibold">{contest?.name}</span>
                    </div>
                    <div>
                        <span className="text-red-600 font-semibold text-[13px]">
                            Thời gian còn lại <br />
                            <span className='text-[15px]'>{formatTimeCountDown(timeLeft)}</span>

                        </span>
                    </div>
                </div>
                <div>
                    <Outlet></Outlet>
                </div>
            </div>
        </div>
    );
};

export default ExamPage;
