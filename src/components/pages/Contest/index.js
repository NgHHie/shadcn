import React, { useState, useEffect, useContext } from 'react';
import { Button, Spin, Pagination, message, Divider, Empty } from 'antd';
import ContestCard from './components/contestCard';
import { PAGE_SIZE } from '../../../config/data';
import { checkJoinContest, getContestJoinedByUser, getContests } from '../../../services/contestService';
import { GlobalContext } from '../../../globalContext';

const ContestPage = () => {
    const { user } = useContext(GlobalContext)
    const [contests, setContests] = useState([]);
    const [contestJoined, setContestJoined] = useState([])
    const [loading, setLoading] = useState(true);
    const [contestJoinStatus, setContestJoinStatus] = useState([])
    const [pagination, setPagination] = useState({
        current: 1,   // Current page
        pageSize: 6, // Records per page
        total: 0      // Total records, fetched from the server
    });

    const getContestJoined = () => {
        getContestJoinedByUser()
            .then(response => {
                setContestJoined(response)
            })

    }
    const fetchData = async () => {
        setLoading(true)
        const params = {
            page: pagination?.current - 1 >= 0 ? pagination?.current - 1 : 0,
            size: pagination?.pageSize
        }
        getContests(params)
            .then(response => {
                setContests(response?.content)
                setPagination({ ...pagination, total: response?.totalElements })
                getStatusUserJoin(response?.content)
            })
            .finally(() => {
                setLoading(false)
            })
    };

    const getStatusUserJoin = (contests) => {
        const contestIds = contests.map(contest => contest?.id);
        const payload = {
            'userId': user?.id,
            'contestIds': contestIds
        }
        checkJoinContest(payload)
            .then(response => {
                setContestJoinStatus(response)
            })

    }

    const handlePageChange = (page, pageSize) => {
        setPagination({
            ...pagination,
            current: page,
            pageSize: pageSize
        })
    }

    useEffect(() => {
        fetchData();

    }, [pagination?.current, pagination?.pageSize]);

    useEffect(() => {
        getContestJoined()
    }, [user])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Cuộc thi đang tham gia</h3>
                {contestJoined && contestJoined?.length === 0 ? (
                    // Render an icon and text if `contestJoined` is empty
                    <div className="flex items-center justify-center mt-6 w-full">
                        <Empty description="Bạn đang không tham gia cuộc thi nào" />
                    </div>
                ) : (
                    // Render the list of contests if `contestJoined` is not empty
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {contestJoined.map((contest) => (
                            <ContestCard key={contest.id} contest={contest} joinStatus={contestJoinStatus} isJoined={true}/>
                        ))}
                    </div>
                )}

                <Divider></Divider>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Cuộc thi hiện tại</h3>
                {
                    !contests || contests?.length === 0 ? (
                        <div className="flex items-center justify-center mt-6 w-full">
                            <Empty description="Không có cuộc thi nào" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {contests?.map((contest) => (
                                <ContestCard contest={contest} joinStatus={contestJoinStatus}></ContestCard>

                            ))}
                        </div>
                    )
                }


                {/* Pagination */}
                <div className="flex justify-center mt-8">
                    <Pagination
                        defaultCurrent={pagination.current}
                        total={pagination.total}
                        pageSize={pagination.pageSize}
                        onChange={handlePageChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default ContestPage;
