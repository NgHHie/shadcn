import React, { useContext, useEffect, useState } from 'react';
import { Button, message, Progress, Tag } from 'antd';
import { formatDate } from '../../../../utils/Util';
import { GlobalContext } from '../../../../globalContext';
import { joinContest } from '../../../../services/contestService';
import { CONTEST_MODE, CONTEST_STATUS, CONTEST_TYPE } from '../../../../config/data';
import { useNavigate } from 'react-router-dom';

const ContestCard = ({ contest, joinStatus }) => {
    const { user } = useContext(GlobalContext)
    const [contestJoined, setContestJoined] = useState([])
    const navi = useNavigate()

    const getProgressPercentage = () => {
        const now = new Date();
        const startTime = new Date(contest?.startDatetime);
        const endTime = new Date(contest?.endDatetime);

        if (now < startTime) return 0; // Contest hasn't started
        if (now > endTime) return 100; // Contest has ended

        // Calculate the percentage of time passed
        const totalDuration = endTime - startTime;
        const elapsed = now - startTime;
        return Math.round((elapsed / totalDuration) * 100);
    };

    const hasUserJoinedContest = (contestId) => {
        const contest = contestJoined && contestJoined.find((status) => status?.contestId === contestId);
        return contest && contest?.joined === 1 ? true : false;
    };

    const handleJoinContest = (contestId) => {
        const payload = {
            'contest': {
                'id': contestId
            },
            'user': {
                'id': user?.id
            }
        }
        joinContest(payload)
            .then(response => {
                setContestJoined((prevState) =>
                    prevState.map((status) =>
                        status.contestId === contestId ? { ...status, joined: 1 } : status
                    )
                );
                message.success('Bạn đã tham gia thành công contest')
            })
            .catch(err => {
                message.warning(err?.response?.data ? err?.response?.data.description : 'Có lỗi xảy ra!')
            })
    };

    const handleDoContest = (contestId) => {
        navi(`/contest-wating/${contestId}`)
    }
    useEffect(() => {
        if (joinStatus) {
            setContestJoined(joinStatus)
        }
    }, [joinStatus?.length])

    return (
        <div key={contest.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">{contest.name}</h2>

            {/* Contest Description */}
            <div className="mb-4 line-clamp-3">
                <p className="text-gray-600">{contest?.description}</p>
            </div>

            {/* Display Start and End Times */}
            <div className="mb-4">
                <div className="flex items-center text-gray-500 text-sm mb-1">
                    <span role="img" aria-label="calendar" className="mr-2">📅</span>
                    <span>Bắt đầu: {formatDate(contest?.startDatetime)}</span>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                    <span role="img" aria-label="clock" className="mr-2">⏰</span>
                    <span>Kết thúc: {formatDate(contest?.endDatetime)}</span>
                </div>
            </div>
            <div>
                {
                    contest?.status === CONTEST_STATUS.OPEN ? (
                        <Tag color='green'>Đang mở</Tag>
                    ) : contest?.status === CONTEST_STATUS.CLOSE ? (
                        <Tag color='red'>Đã kết thúc</Tag>
                    ) : (
                        <Tag color='#f39c12'>Chưa mở</Tag>
                    )
                }


                {
                    contest?.mode === CONTEST_MODE.PRACTICE ? (
                        <Tag color='blue' className="animate-pulse">Thực hành</Tag>
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
            {/* Progress Bar */}
            <Progress percent={getProgressPercentage()} />
            <div className="mb-4">
            </div>

            {/* Users Joined */}
            <p className="text-gray-700 font-semibold mb-4">
                Số người tham gia: <span className="text-indigo-500">{contest?.numberUser}</span>
            </p>

            {/* Join Button */}
            {hasUserJoinedContest(contest?.id) ? (
                contest?.status === CONTEST_STATUS.OPEN ? (
                    <Button type="primary" className="w-full bg-primary hover:!bg-[#e74c3c]" onClick={() => handleDoContest(contest?.id)}>
                        Vào làm bài
                    </Button>
                ) : (
                    <Button type="primary" className="w-full bg-gray-500" disabled>
                        Đã tham gia
                    </Button>
                )

            ) : (
                <Button type="primary" className="w-full bg-blue-500 hover:bg-blue-600" onClick={() => handleJoinContest(contest.id)} disabled={contest?.status === CONTEST_STATUS.CLOSE ? true : false}>
                    Tham gia
                </Button>
            )}
        </div>
    );
};

export default ContestCard;
