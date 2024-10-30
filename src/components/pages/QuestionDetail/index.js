import React, { useContext, useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button, Input, Tabs, Upload } from 'antd';
import './style.scss';
import { fetchApiGet, fetchApiPost, fetchApiUploadFile, responseOk } from '../../../utils/FetchUtil';
import { ApiEnpoint } from '../../../config/ApiEnpoint';
import { useParams } from 'react-router-dom';
import SqlEditor from '../../Ide';
import SubmitHistory from '../../common/submitHistory/submitHis';
import { MEDIA_TYPE, PAGE_SIZE } from '../../../config/data';
import { v4 as uuidv4 } from 'uuid';
import { getUrlPage, isValid } from '../../../utils/Util';
import { GlobalContext } from '../../../globalContext';
import { disconnectSocket, getSocket } from '../../../config/SocketConfig';
import toast, { NotifyType } from '../../../utils/Toast';
import { CommentOutlined, FileTextOutlined, HistoryOutlined, LeftOutlined, UploadOutlined } from '@ant-design/icons';
import CommentSection from '../Comment';
const { TextArea } = Input;

const QuestionDetail = ({ questionContest }) => {
    const { questionId, questionContestId } = useParams()
    const [question, setQuestion] = useState({})
    const [sqlCommand, setSqlCommand] = useState('');
    const [submitHistory, setSubmitHistory] = useState([])
    const [totaSubmit, setTotalSubmit] = useState(0)
    const { user } = useContext(GlobalContext)
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const leftPanelRef = useRef(null);
    const rightPanelRef = useRef(null);
    const [activeTab, setActiveTab] = useState('1');
    const fileInputRef = useRef(null);
    const [selectData, setSelectData] = useState('')
    const [loadingSubmit, setLoadingSubmit] = useState(false)

    const onSelectData = (value) => {
        setSelectData(value)
    }
    const handleMouseDown = (e) => {
        const startX = e.clientX;
        const startWidthLeft = leftPanelRef.current.offsetWidth;
        const startWidthRight = rightPanelRef.current.offsetWidth;

        const onMouseMove = (e) => {
            const deltaX = e.clientX - startX;
            leftPanelRef.current.style.width = `${startWidthLeft + deltaX}px`;
            rightPanelRef.current.style.width = `${startWidthRight - deltaX}px`;
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setFileName(selectedFile.name);
    };

    const getQuestionDetail = async () => {
        const data = await fetchApiGet(`${ApiEnpoint.getQuestionDetail}${questionId}`)
        if (data !== null) {
            setQuestion(data.data)
        }
    }

    const getSubmitHis = async (page) => {
        let url = getUrlPage(`${ApiEnpoint.getSubmitHisByUserId}${user?.id}?questionId=${questionId}`, page, PAGE_SIZE)
        if (questionContestId) {
            url = getUrlPage(`${ApiEnpoint.getSubmitContestHisByUserId}?questionContestId=${questionContestId}`, page, PAGE_SIZE)
        }
        const data = await fetchApiGet(url)
        if (responseOk(data)) {
            setSubmitHistory(data.data?.content)
            setTotalSubmit(data.data?.totalElements)
        }
    }

    const onPageSubmit = (page) => {
        getSubmitHis(page)
    }

    const onChangeSql = (value) => {
        setSqlCommand(value)
    }

    const resetFileInput = () => {
        setFile(null);
        setFileName('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmitFile = async () => {
        if (!file) {
            toast(NotifyType.WARNING, "Vui lòng tải file kết quả!")
            return;
        }
        if (!selectData) {
            toast(NotifyType.WARNING, "Vui lòng chọn database!")
            return;
        }
        setLoadingSubmit(true)
        const formData = new FormData();
        formData.append('file', file);

        // Add additional data to the form
        formData.append('questionId', question?.id);
        formData.append('questionContestId', questionContestId);
        formData.append('typeDatabaseId', selectData)
        formData.append('isSubmitContest', questionContestId ? true : false)

        const response = await fetchApiUploadFile(formData)
        if (responseOk(response)) {
            setSubmitHistory((prevHistory) => {
                // Update the specific submission
                const updatedHistory = [...(prevHistory || []), {
                    id: response.data?.submitId,
                    time: new Date().toISOString(), // Update time with response time or specific time if needed
                    status: response.data.statusSubmit,
                    timeSubmit: response.data.timeSubmit,
                    timeout: response.data.timeExec,
                    testPass: response.data?.testPass,
                    totalTest: response.data?.totalTest,
                    question: { title: question?.title },
                    user: { userCode: user?.userCode, fullName: `${user?.firstName} ${user?.lastName}` }
                }]
                // Sort the updated array by created_at or time in descending order (most recent first)
                updatedHistory.sort((a, b) => new Date(b?.timeSubmit) - new Date(a?.timeSubmit));
                resetFileInput()
                return updatedHistory.slice(0, PAGE_SIZE);
            });
        }
        setLoadingSubmit(false)
    };

    const handleSubmitDirect = async () => {
        if (!sqlCommand) {
            toast(NotifyType.WARNING, "Vui lòng nhập query")
            return
        }
        if (!selectData) {
            toast(NotifyType.WARNING, "Vui lòng chọn database!")
            return;
        }
        const data = {
            'sql': sqlCommand,
            'questionId': question?.id,
            'questionContestId': questionContestId ? questionContestId : null,
            'typeDatabaseId': selectData,
            'isSubmitContest': questionContestId ? true : false
        }
        setLoadingSubmit(true)
        const response = await fetchApiPost(ApiEnpoint.submitQuestion, data, MEDIA_TYPE.JSON)
        if (response !== null) {
            setSubmitHistory((prevHistory) => {
                // Update the specific submission
                const updatedHistory = [...(prevHistory || []), {
                    id: response.data?.submitId,
                    time: new Date().toISOString(), // Update time with response time or specific time if needed
                    status: response.data.statusSubmit,
                    timeSubmit: response.data.timeSubmit,
                    timeout: response.data.timeExec,
                    testPass: response.data?.testPass,
                    totalTest: response.data?.totalTest,
                    question: { title: question?.title },
                    user: { userCode: user?.userCode, fullName: `${user?.firstName} ${user?.lastName}` }
                }]
                // Sort the updated array by created_at or time in descending order (most recent first)
                updatedHistory.sort((a, b) => new Date(b?.timeSubmit) - new Date(a?.timeSubmit));
                return updatedHistory.slice(0, PAGE_SIZE);
            });
        }
        setLoadingSubmit(false)
    }
    const handleSubmit = () => {
        if (!user) {
            toast(NotifyType.WARNING, "Vui lòng đăng nhập!")
            return
        }
        setActiveTab('2')
        if (file) {
            handleSubmitFile()
        } else {
            handleSubmitDirect()
        }
    }
    const subsscribeTopic = (topic) => {
        getSocket().subscribe(topic, message => {
            let response = JSON.parse(message.body);
            console.log(response)
            if (!isValid(response)) return
            setSubmitHistory((prevHistory) => {
                // Ensure prevHistory is an array
                const historyArray = prevHistory ?? [];

                const updatedHistory = historyArray.map((item) => {
                    if (item?.id === response.submitId) {
                        return {
                            ...item,
                            status: response.statusSubmit,
                            timeout: response.timeExec,
                            testPass: response.testPass,
                            totalTest: response.totalTest,
                        };
                    }
                    return item;
                });

                // Return the updated history, sliced to the required page size
                return updatedHistory.slice(0, PAGE_SIZE);
            });
        })
    }

    useEffect(() => {
        getQuestionDetail()
        getSubmitHis(0)
    }, [])

    useEffect(() => {
        getSocket().onConnect = () => {
            console.log('STOMP: connected');
            subsscribeTopic(`/topic/submit/${user?.id}`);
        }

        return () => {
            disconnectSocket()
        };
    }, [])

    return (
        <div className="question-detail-layout !min-h-screen">
            <div ref={leftPanelRef} className="left-panel">
                <Tabs activeKey={activeTab} onChange={setActiveTab} className='ml-2 p-2 rounded-md'>
                    <Tabs.TabPane tab={<><FileTextOutlined /> Đề bài</>} key="1">
                        {/* Container to allow scrolling for "Đề bài" */}
                        <div className="scrollable-tab-content">
                            <div className="question-description">
                                <h2 className="question-title">
                                    {question?.questionCode} - {question?.title}
                                </h2>
                                <ReactQuill value={question?.content} readOnly={true} theme="bubble" />
                            </div>
                        </div>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={<><HistoryOutlined /> Lịch sử submit</>} key="2">
                        {/* Container to allow scrolling for "Lịch sử submit" */}
                        <div className="scrollable-tab-content">
                            <div className="main-submit-container">
                                <SubmitHistory data={submitHistory} totalElements={totaSubmit} onPage={onPageSubmit} currentPageSize={5} loading={loadingSubmit} />
                            </div>
                        </div>
                    </Tabs.TabPane>
                    {
                        !questionContestId && (
                            <Tabs.TabPane tab={<><CommentOutlined /> Thảo luận</>} key="3">
                                {/* Container to allow scrolling for "Thảo luận" */}
                                <div className="">
                                    <div className="discussion-container">
                                        <CommentSection questionId={question?.id}></CommentSection>
                                    </div>
                                </div>
                            </Tabs.TabPane>
                        )
                    }

                </Tabs>
            </div>

            {/* Divider for Resizing */}
            <div className="divider" onMouseDown={handleMouseDown} />

            {/* Right Section for IDE, Terminal Output */}
            <div ref={rightPanelRef} className="right-panel">
                <div className="sql-input-container">
                    <SqlEditor
                        prefixCode={question?.prefixCode}
                        setQuery={onChangeSql}
                        questionId={question?.id}
                        hasSubmit={true}
                        databases={question?.questionDetails}
                        onSelectData={onSelectData}
                    />
                    <div className="action-container">
                        <div className="file-upload-container">
                            <input
                                type="file"
                                id="file"
                                onChange={handleFileChange}
                                accept=".sql"
                                ref={fileInputRef}
                                className='file-input'
                                onClick={(event) => {
                                    event.target.value = ''; // Reset input to ensure onChange fires again
                                }}
                            />
                            <label htmlFor="file" className="custom-file-label">
                                Upload File
                            </label>
                            {fileName && <p className="file-name">{fileName}</p>}
                        </div>
                        <div className="pagination-container mb-5">
                            <button className="btn-submit" onClick={handleSubmit}>
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionDetail;
