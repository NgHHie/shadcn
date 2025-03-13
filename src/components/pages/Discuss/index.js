import React, { useContext, useEffect, useState } from 'react';
import { Input, Button, Dropdown, Menu, Avatar, List, Space, Typography, Pagination, message } from 'antd';
import { SearchOutlined, FilterOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import 'tailwindcss/tailwind.css';
import DiscussionItem from './Components/DiscussItem';
import CreateDiscussionModal from './Components/CreateDiscussModal';
import { GlobalContext } from '../../../globalContext';
import { useNavigate } from 'react-router-dom';
import { getTopics } from '../../../services/topicService';
import { PAGE_SIZE } from '../../../config/data';

const { Text } = Typography;

const Discuss = () => {
    const { appState, setAppState } = useContext(GlobalContext)
    const [topics, setTopics] = useState([])
    const [pagination, setPagination] = useState({
        current: 0,
        pageSize: PAGE_SIZE,
        total: 0,
    });
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState({
        keyword: null,
        direction: null,
    })
    const navi = useNavigate()

    const handleOnchangeFilter = (value, type) => {
        const filterTemp = {
            ...filter,
            [type]: value,
        }
        console.log(filterTemp)
        setFilter(filterTemp);
    };


    const getTopicData = () => {
        const params = { page: pagination?.current - 1 > 0 ? pagination?.current - 1 : 0, size: pagination?.pageSize };
        if (filter) {
            Object.keys(filter).forEach((key) => {
                if (filter[key] !== null && filter[key] !== '' && filter[key] !== undefined) {
                    params[key] = filter[key];
                }
            });
        }
        setLoading(true)
        getTopics(params)
            .then(response => {
                setTopics(response?.content)
                setPagination({
                    ...pagination,
                    total: response?.totalElements
                })
            })
            .catch(err => {

            })
            .finally(() => {
                setLoading(false)
            })
    }

    const handleCreateDiscussion = () => {
        setAppState({ ...appState, showCreateDiscusstionModal: true })
    };

    const handleSelectDiscuss = (value) => {
        navi(`/discuss/${value?.id}`)
    }

    const menu = (
        <Menu onClick={(e) => handleOnchangeFilter(e.key, 'sort')}>
            <Menu.Item key="desc">Mới nhất</Menu.Item>
            <Menu.Item key="asc">Cũ nhất</Menu.Item>
        </Menu>
    );

    const handlePaginationChange = (page, pageSize) => {
        setPagination({
            current: page,
            pageSize,
        });
    };

    useEffect(() => {
        getTopicData()

    }, [pagination?.current, pagination?.pageSize, filter])

    return (
        <div className="space-y-6 p-4 w-[60%] mx-auto min-w-[600px]">
            <CreateDiscussionModal onCreate={getTopicData}></CreateDiscussionModal>
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-lg">
                <div className="flex space-x-4 items-center">
                    <Dropdown overlay={menu} trigger={['click']}>
                        <Button icon={<FilterOutlined />}>Filter</Button>
                    </Dropdown>
                    <Input
                        className="w-60"
                        value={filter?.keyword}
                        onChange={(e) => handleOnchangeFilter(e.target.value, 'keyword')}
                        placeholder="Nhập tiêu đề thảo luận"
                        prefix={<SearchOutlined />}
                    />
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateDiscussion}
                >
                    Tạo bài
                </Button>
            </div>

            <List
                itemLayout="horizontal"
                dataSource={topics}
                loading={loading}
                renderItem={(topic) => <DiscussionItem topic={topic} onSelect={handleSelectDiscuss} />}
            />

            <div className="flex justify-center mt-6">
                <Pagination
                    defaultCurrent={pagination.current}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    onChange={handlePaginationChange}
                />
            </div>
        </div>
    );
};

export default Discuss;
