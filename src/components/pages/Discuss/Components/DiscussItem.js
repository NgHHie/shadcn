import React from 'react';
import { Avatar, List, Typography } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { formatCountNumber, getFullName } from '../../../../utils/Util';
import { formatDistanceToNow } from 'date-fns';
import { vi } from "date-fns/locale";

const { Text } = Typography;

const DiscussionItem = ({ topic, onSelect }) => {

  const handleClick = (value) => {
    if (onSelect) {
      onSelect(value)
    }
  }
  return (
    <List.Item key={topic?.id} className="bg-white !p-4 rounded-lg shadow-md hover:bg-gray-100 cursor-pointer mb-2" onClick={() => handleClick(topic)}>
      <List.Item.Meta
        avatar={<Avatar className="w-12 h-12 text-2xl"
          src={topic?.user?.avatar ? topic?.user?.avatar : '/assets/avatar.png'}
        >{getFullName(topic?.user?.lastName, topic?.user?.firstName)}</Avatar>}
        title={<Text strong>{topic?.title}</Text>}
        description={
          <div className="flex justify-between text-sm text-gray-500">
            <span>
              {topic?.user?.firstName +` đã tạo `}
              {topic?.createdAt
                ? formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true, locale: vi })
                  .replace(/^dưới\s/, '')
                : 'Không có dữ liệu thời gian'}
            </span>

            <span className="flex items-center">
              <EyeOutlined />
              {formatCountNumber(topic?.views)}
            </span>
          </div>
        }
      />
    </List.Item>
  );
};

export default DiscussionItem;
