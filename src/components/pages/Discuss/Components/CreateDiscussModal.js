// CreateDiscussionModal.js

import React, { useContext, useState } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { GlobalContext } from '../../../../globalContext';
import TextEditor from '../../../common/TextEditor';
import { createTopic } from '../../../../services/topicService';

const CreateDiscussionModal = ({ onCreate }) => {
    const { appState,setAppState } = useContext(GlobalContext);
    const {user} = useContext(GlobalContext)
    const [topic,setTopic] = useState({})

    const handleTitleChange = (e) => {
        setTopic({...topic,title: e.target.value})
    }
    const handleContentChange = (value) => {
        setTopic({...topic,content: value})
    }

    const handleSubmit = () => {
        if (topic?.title && topic?.content) {
            const payload = {
                ...topic,
                user: {
                    id: user?.id
                }
            }
           createTopic(payload)
            .then(response => {
                message.success("Tạo bài đăng thành công!")
                if(onCreate) {
                    onCreate()
                }
                onClose()
            })
            .catch(err => {
                message.error("Có lỗi xảy ra!")
            })
        } else {
            message.warning('Vui lòng nhập đủ tiêu đề và nội dung!');
        }
    };

    const onClose = () => {
        setAppState({ ...appState, showCreateDiscusstionModal: false })
    }
    return (
        <Modal
            title="Tạo bài đăng"
            visible={appState?.showCreateDiscusstionModal}
            width={800}
            onCancel={onClose}
            footer={null}
            destroyOnClose={true}
        >
            <div className="space-y-4 min-h-[30vh]">
                <div>
                    <Input
                        placeholder="Enter topic title"
                        value={topic?.title}
                        onChange={handleTitleChange}
                    />
                </div>
                <div>
                    <TextEditor value={topic?.content} onChange={handleContentChange}></TextEditor>
                </div>
                <div className="flex justify-end">
                    <Button onClick={onClose} className="mr-3">
                        Hủy
                    </Button>
                    <Button type="primary" onClick={handleSubmit}>
                        Đăng bài
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default CreateDiscussionModal;
