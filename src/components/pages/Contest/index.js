import React, { useState, useEffect, useContext } from 'react';
import { Button, Spin, Pagination, message } from 'antd';
import ContestCard from './components/contestCard';
import { PAGE_SIZE } from '../../../config/data';
import { checkJoinContest, getContests } from '../../../services/contestService';
import { GlobalContext } from '../../../globalContext';

const ContestPage = () => {
    const {user} = useContext(GlobalContext)
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contestJoinStatus,setContestJoinStatus] = useState([])
    const [pagination, setPagination] = useState({
        current: 1,   // Current page
        pageSize: 6, // Records per page
        total: 0      // Total records, fetched from the server
    });

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

    const getStatusUserJoin= (contests) => {
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
                {/* <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Available Contests</h1> */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {contests.map((contest) => (
                        <ContestCard contest={contest} joinStatus={contestJoinStatus}></ContestCard>

                    ))}
                </div>

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
