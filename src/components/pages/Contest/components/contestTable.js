
import React, { useContext, useEffect, useState } from 'react';
import { message, Pagination, Select, Spin, Table, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from '../../../../globalContext';
import { CONTEST_STATUS } from '../../../../config/data';
import { ApiEnpoint } from '../../../../config/ApiEnpoint';
import { fetchApiPost, responseOk } from '../../../../utils/FetchUtil';

const { Option } = Select;

const TableQuestionContest = () => {
    const {currentContest} = useContext(GlobalContext)
    const [questions, setQuestions] = useState([])
    const [completes, setCompletes] = useState([])
    const { user } = useContext(GlobalContext)
    const [totalPage, setTotalPage] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [loading, setLoading] = useState(true)
    const navi = useNavigate()

    const getQuestions = async (page) => {
        if (currentContest ) {
            setQuestions(currentContest?.questions)
            setTotalPage(currentContest?.questions?.length)
            setLoading(false)
            
            const questionIds = currentContest?.questions.map(question => question.id);
            if (user?.id) {
                const payload = {
                    "userId": user?.id,
                    "questionIds": questionIds
                }
                const response = await fetchApiPost(ApiEnpoint.checkQuestionContestComplete, payload)
                if (responseOk(response)) {
                    setCompletes(response.data)
                }
            } else {
                setCompletes([])
            }

            return
        }
    }

    const handleRedirect = (questionId,questionContestId) => {
        navi(`${questionId}/${questionContestId}`)
    }

    const getColorQuestionComplete = (questionId) => {
        const question = completes.find(q => q.questionId === questionId);

        if (question) {
            return question.status === 'AC' ? 'bg-[#54c985]' : 'bg-[#eb857a]';
        }

        return ''; // Trả về chuỗi rỗng nếu không có màu đặc biệt
    };

    const handleChangePage = (page) => {
        setCurrentPage(page)
        getQuestions(page)
    }

    const columns = [
        {
            title: 'Mã',
            dataIndex: ['question','questionCode'],
            key: 'questionCode',
            render: (text, record) => (
                <span
                    role="img"
                    aria-label="calendar"
                    className="cursor-pointer"
                    onClick={() => handleRedirect(record?.question?.id,record?.id)}
                >
                    {text}
                </span>
            ),
        },
        {
            title: 'Câu hỏi',
            dataIndex: ['question','title'],
            key: 'title',
            render: (text, record) => (
                <span
                    className="cursor-pointer title-question"
                    onClick={() => handleRedirect(record?.question?.id,record?.id)}
                >
                    {text}
                </span>
            ),
        },
    ];

    useEffect(() => {
        getQuestions()

    }, [user])

    return (
        <div className="database-list-container">
            {
                loading ? (
                    <div className="spin-center">
                        <div className='flex flex-col'>
                            <Spin></Spin>
                            <p>Loading...</p>
                        </div>

                    </div>
                ) : (
                    <Table
                        className="database-table"
                        columns={columns}
                        dataSource={questions}
                        rowKey={(record) => record.id}
                        rowClassName={(record) => `${getColorQuestionComplete(record.id)}`}
                        pagination={false} // Adjust page size as needed
                    />
                )
            }

            <div className='empty-div'></div>
            <div className='pagination-container pagination-custom mt-3'>
                <Pagination align="end" defaultCurrent={currentPage} total={totalPage} pageSize={totalPage} onChange={handleChangePage} />
            </div>
        </div>
    );
};

export default TableQuestionContest;
