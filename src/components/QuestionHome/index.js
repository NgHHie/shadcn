
import React, { useContext, useEffect, useState } from 'react';
import './style.scss';
import { Pagination, Select } from 'antd';
import { fetchApiGet, fetchApiPost, responseOk } from '../../utils/FetchUtil';
import { ApiEnpoint } from '../../config/ApiEnpoint';
import toast, { NotifyType } from '../../utils/Toast';
import { useNavigate } from 'react-router-dom';
import { removeSessionItem } from '../../utils/SessionStorage';
import { generateUUIDFromUserId } from '../../utils/test';
import { GlobalContext } from '../../globalContext';
import { PAGE_SIZE } from '../../config/data';
import { PAGE_SIZE_QUESTION } from '../../services/QuestionService';

const { Option } = Select;

const QuestionHome = () => {
    const [questions, setQuestions] = useState([])
    const [completes, setCompletes] = useState([])
    const { user } = useContext(GlobalContext)
    const [totalPage,setTotalPage] = useState(0)
    const [currentPage,setCurrentPage] = useState(0)
    const navi = useNavigate()

    const getQuestions = async (page) => {
        const params = { page: page ? page - 1 : 0, size: PAGE_SIZE_QUESTION };
        const data = await fetchApiGet(ApiEnpoint.getQuestionList,params)
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
                if(responseOk(response)) {
                    console.log(response.data)
                    setCompletes(response.data)
                }
            } else {
                setCompletes([])
            }

        } else {
            toast(NotifyType.ERROR, "Có lỗi xảy ra!")
        }
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
                <div className="search-container">
                    <input type="text" placeholder="Search questions" />
                    <i class="fa-solid fa-magnifying-glass icon-search"></i>
                </div>
            </div>
            <table className="database-table">
                <thead>
                    <tr>
                        <th className='cursor-pointer'>Mã</th>
                        <th className='cursor-pointer'>Câu hỏi</th>
                        <th className='text-center'>Tỉ lệ đúng</th>
                        <th className='text-center '>Độ khó</th>
                    </tr>
                </thead>
                <tbody>
                    {questions?.map((item, index) => (
                        <tr key={index} className={getColorQuestionComplete(item.id)}>
                            <td className='cursor-pointer' onClick={() => handleRedirect(item.id)}><span role="img" aria-label="calendar">{item?.questionCode}</span></td>
                            <td className='cursor-pointer title-question' onClick={() => handleRedirect(item.id)}>{item?.title}</td>
                            <td className='text-center'>{item?.acceptance.toFixed(1)}%</td>
                            <td className={`text-center capitalize text-center`}>
                                <span className={`bg-[#ecf0f1] px-2 py-[5px] rounded-xl text-[14px] ${item?.level?.toLowerCase()}`}>{item?.level?.toLowerCase()}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className='empty-div'></div>
            <div className='pagination-container pagination-custom'>
                <Pagination align="end" defaultCurrent={currentPage} total={totalPage} pageSize={PAGE_SIZE_QUESTION} onChange={handleChangePage}/>
            </div>
        </div>
    );
};

export default QuestionHome;
