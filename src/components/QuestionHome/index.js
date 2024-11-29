
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
    const [pagination, setPagination] = useState({
        current: 0,
        pageSize: PAGE_SIZE,
        total: 0,
    });
    const [loading, setLoading] = useState(false)
    const navi = useNavigate()
    const [filter, setFilter] = useState({
        keyword: null,
        level: null,
        typeDatabaseId: null,
        typeQuestion: null

    })
    const handleOnchangeFilter = (value, type) => {
        const filterTemp = {
            ...filter,
            [type]: value,
        }
        setFilter(filterTemp);
    };

    const getQuestions = async () => {
        const params = { page: pagination?.current - 1 > 0 ? pagination?.current - 1  : 0, size: pagination?.pageSize };
        if (filter) {
            // Add filter fields dynamically if they have valid values
            Object.keys(filter).forEach((key) => {
                if (filter[key] !== null && filter[key] !== '' && filter[key] !== undefined) {
                    params[key] = filter[key];
                }
            });
        }
        const data = await fetchApiGet(ApiEnpoint.getQuestionList, params)
        setLoading(true)
        if (responseOk(data)) {
            setQuestions(data.data?.content)
            setPagination({
                ...pagination,
                total: data.data?.totalElements
            })
            const questionIds = data?.data?.content?.map(question => question.id);
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

    const handleChangePage = (page,size) => {
        setPagination({
            ...pagination,
            current: page,
            pageSize: size
        })
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

    }, [user,pagination?.current,pagination?.pageSize,filter])

    return (
        <div className="database-list-container">
            <div className="header">
                <Input
                    placeholder="Search by title or code"
                    value={filter?.keyword}
                    onChange={(e) => handleOnchangeFilter(e.target.value, 'keyword')}
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
            <Pagination
                    defaultCurrent={pagination.current}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    onChange={handleChangePage}
                    showSizeChanger
                />
            </div>
        </div>
    );
};

export default QuestionHome;
