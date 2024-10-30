import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import { Avatar, Button } from "antd";
import TextArea from "antd/es/input/TextArea";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useEffect, useState } from "react";
import { formatCountNumber } from "../../../../utils/Util";
import { updateCountLike } from "../../../../services/commentService";


function Comment({ comment, onData }) {
  const [currentComment, setCurrentComment] = useState({})

  const toggleLike = () => {
    const likeStatus = currentComment?.isUserLike
    const payload = {
      'commentId': comment?.id
    }
    updateCountLike(payload)
      .then(response => {
        const updatedCountLike = likeStatus ? currentComment?.countLike - 1 : currentComment?.countLike + 1;
      
        const updatedComment = {
          ...currentComment,
          isUserLike: !likeStatus,
          countLike: updatedCountLike
        };

        setCurrentComment(updatedComment)
        if (onData) {
          onData(updatedComment)
        }
      })
  };

  useEffect(() => {
    setCurrentComment(comment)
  }, [comment])

  return (
    <div className="flex items-start space-x-4 w-[95%]">
      <Avatar src={currentComment?.user?.avatar ? currentComment?.user?.avatar : '/assets/avatar.png'} alt={currentComment?.user?.firstName} />
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">{currentComment?.user?.firstName || currentComment?.user?.lastName
            ? `${currentComment?.user?.firstName || ''} ${currentComment?.user?.lastName || ''}`.trim()
            : "Anonymous"}</div>

          {currentComment?.createdAt && (
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(currentComment?.createdAt), { addSuffix: true, locale: vi })
                .replace(/^dưới\s/, '')}
            </span>
          )}
        </div>
        <TextArea
          value={comment?.content}
          readOnly
          autoSize={{ minRows: 1, maxRows: 50 }}
          className="text-gray-700 bg-transparent border-none resize-none focus:outline-none"
        />
        <Button
          type="text"
          onClick={toggleLike}
          icon={currentComment?.isUserLike ? <HeartFilled style={{ color: 'red' }} /> : <HeartOutlined />}
        >
          {formatCountNumber(currentComment?.countLike)}
        </Button>
      </div>
    </div>
  );
}

export default Comment;