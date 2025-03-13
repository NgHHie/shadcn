import { EyeOutlined } from '@ant-design/icons';
import { Avatar, Divider, message } from 'antd';
import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import CommentSection from '../../Comment';
import { useParams } from 'react-router-dom';
import { getTopicDetail } from '../../../../services/topicService';
import { formatCountNumber, getFullName } from '../../../../utils/Util';
import { vi } from 'date-fns/locale';
import { formatDistanceToNow } from 'date-fns';

const DiscussDetail = () => {
    const { topicId } = useParams()
    const [topic, setTopic] = useState({})

    const getData = () => {
        if (!topicId) {
            return
        }
        getTopicDetail(topicId)
            .then(response => {
                setTopic(response)
            })
            .catch(err => {
                message.error("Có lỗi xảy ra")
            })
    }

    useEffect(() => {
        getData()
    }, [])

    return (
        <div className="mt-6 p-4 border border-gray-300 rounded-lg shadow-lg w-[60%] mx-auto bg-white">
            <div className="flex items-center">
                <Avatar className="" src={topic?.user?.avatar ? topic?.user?.avatar : '/assets/avatar.png'}>{getFullName(topic?.user?.lastName, topic?.user?.firstName)}</Avatar>

                <div className='flex items-center'>
                    <div className="text-gray-800">{getFullName(topic?.user?.lastName, topic?.user?.firstName)}</div>
                    <div className="text-sm text-gray-400 ml-3">{topic?.createdAt
                        ? formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true, locale: vi })
                            .replace(/^dưới\s/, '')
                        : 'Không có dữ liệu thời gian'}</div>
                    <div className="text-sm text-gray-500">{formatCountNumber(topic?.views)} views</div>
                </div>
            </div>

            {/* Content Section */}
            <div className="mt-2">
                <ReactQuill value={topic?.content} readOnly={true} theme="bubble" />
            </div>
            <Divider></Divider>
            <div>
                <CommentSection parentId={topicId}></CommentSection>
            </div>
        </div>
    );
};

export default DiscussDetail;
