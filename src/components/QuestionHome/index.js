
import React, { useContext, useEffect, useState } from 'react';
import './style.scss';
import { Input, Pagination, Select, Spin, Table, Tag } from 'antd';
import { fetchApiGet, fetchApiPost, responseOk } from '../../utils/FetchUtil';
import { ApiEnpoint } from '../../config/ApiEnpoint';
import toast, { NotifyType } from '../../utils/Toast';
import { useNavigate } from 'react-router-dom';
import { removeSessionItem } from '../../utils/SessionStorage';
import { generateUUIDFromUserId } from '../../utils/test';
import { GlobalContext } from '../../globalContext';
import { PAGE_SIZE } from '../../config/data';
import { PAGE_SIZE_QUESTION } from '../../services/QuestionService';
import { SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

const QuestionHome = () => {
    const [questions, setQuestions] = useState([])
    const [completes, setCompletes] = useState([])
    const { user } = useContext(GlobalContext)
    const [totalPage, setTotalPage] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [loading, setLoading] = useState(false)
    const navi = useNavigate()

    const getQuestions = async (page) => {
        const params = { page: page ? page - 1 : 0, size: PAGE_SIZE_QUESTION };
        const data = await fetchApiGet(ApiEnpoint.getQuestionList, params)
        setLoading(true)
        if (responseOk(data)) {
            setQuestions(data.data?.content)
            setTotalPage(data?.data?.totalElements)
            const questionIds = data.data?.content.map(question => question.id);
            if (user?.id) {
                const payload = {
                    "userId": user?.id,
                    "questionIds": questionIds
                }
                const response = await fetchApiPost(ApiEnpoint.checkQuestionComplete, payload)
                if (responseOk(response)) {
                    setCompletes(response.data)
                }
            } else {
                setCompletes([])
            }

        } else {
            toast(NotifyType.ERROR, "Có lỗi xảy ra!")
        }
        setLoading(false)
    }

    const handleRedirect = (questionId) => {
        navi(`/question-detail/${questionId}`)
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
            dataIndex: 'questionCode',
            key: 'questionCode',
            render: (text, record) => (
                <span
                    role="img"
                    aria-label="calendar"
                    className="cursor-pointer"
                    onClick={() => handleRedirect(record.id)}
                >
                    {text}
                </span>
            ),
        },
        {
            title: 'Câu hỏi',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <span
                    className="cursor-pointer title-question"
                    onClick={() => handleRedirect(record.id)}
                >
                    {text}
                </span>
            ),
        },
        {
            title: 'Số lần sub',
            dataIndex: 'totalSub',
            key: 'totalSub',
            align: 'center',
        },
        {
            title: 'Tỉ lệ đúng',
            dataIndex: 'acceptance',
            key: 'acceptance',
            align: 'center',
            render: (acceptance) => `${acceptance.toFixed(1)}%`,
        },
        {
            title: 'Độ khó',
            dataIndex: 'level',
            key: 'level',
            align: 'center',
            render: (level) => (
                <Tag
                    className={`capitalize rounded-full px-3 py-1`}
                    color={getColorForLevel(level)}
                >
                    {level.toLowerCase()}
                </Tag>
            ),
        },
    ];

    const getColorForLevel = (level) => {
        switch (level?.toLowerCase()) {
          case 'easy':
            return 'green';
          case 'medium':
            return 'orange';
          case 'hard':
            return 'red';
          default:
            return 'default';
        }
      };

    useEffect(() => {
        getQuestions()

    }, [user])

    return (
        <div className="database-list-container">
            <div className="header">
                        <div className="filters">
                            <Select
                                placeholder="Chọn loại câu hỏi"
                                style={{ width: 200, marginRight: 10 }}
                                className='select-custom'
                            >
                                <Option value="easy">Easy</Option>
                                <Option value="medium">Medium</Option>
                                <Option value="hard">Hard</Option>
                            </Select>
                            <Select
                                placeholder="Chọn loại database"
                                style={{ width: 200 }}
                                className='select-custom'
                            >
                                <Option value="mysql">MySQL</Option>
                                <Option value="postgresql">PostgreSQL</Option>
                                <Option value="mongodb">MongoDB</Option>
                                <Option value="sqlite">SQLite</Option>
                            </Select>
                        </div>
                        <Input
                            placeholder="Search by title or code"
                            //   value={searchTerm}
                            //   onChange={handleSearch}
                            prefix={<SearchOutlined />}
                            className='w-[20%] rounded-full'
                        />
                    </div>
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
                <Pagination align="end" defaultCurrent={currentPage} total={totalPage} pageSize={PAGE_SIZE_QUESTION} onChange={handleChangePage} />
            </div>
        </div>
    );
};

export default QuestionHome;
