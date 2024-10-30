import React, { useContext, useEffect, useRef, useState } from 'react';
import Comment from './components/comment';
import { Avatar, Button, Input, List, message, Spin } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { GlobalContext } from '../../../globalContext';
import { getCommentByQuestionId, sendComment } from '../../../services/commentService';
import { DownOutlined, LoadingOutlined } from '@ant-design/icons';
import { PAGE_SIZE } from '../../../config/data';



function CommentSection({ questionId }) {
  const { user } = useContext(GlobalContext)
  const [comments, setComments] = useState([]);
  const [newMessage, setNewMessage] = useState({});
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const commentsEndRef = useRef(null); 

  // Function to load comments
  const loadMoreComments = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const params = {
        page: page,
        size: PAGE_SIZE
      }
      const response = await getCommentByQuestionId(questionId, params)
      const newComments = response?.content;
      if (!newComments) return
      setComments((prevComments) => [...prevComments, ...newComments]);
      setHasMore(!response?.last);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };
  // Function to handle adding a new comment
  const handleSendComment = () => {
    if (!newMessage.content || !newMessage?.content?.trim()) return;
    if (!user) {
      message.info("Vui lòng đăng nhập!")
      return;
    }

    const newComment = {
      ...newMessage,
      user: {
        id: user?.id
      },
      question: {
        id: questionId
      }
    };

    sendComment(newComment)
      .then(response => {
        const res = {
          ...response,
          user: {
            id: user?.id,
            firstName: user?.firstName,
            lastName: user?.lastName
          }
        }
        setComments([...comments, res]);
        setNewMessage({})
        scrollToBottom();
      })

  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevents form submission if wrapped in a form element
      handleSendComment();
    }
  };

  const updateComment = (updatedComment) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === updatedComment.id ? { ...comment, ...updatedComment } : comment
      )
    );
  };

  const loadMore = hasMore && !loading ? (
    <div  className="text-center mt-3 cursor-pointer text-blue-500 hover:text-blue-600 flex items-center justify-center" onClick={loadMoreComments}>
        <DownOutlined /> Load more
    </div>
  ) : loading ? (
    <div className="text-center mt-3">
      <Spin />
    </div>
  ) : null;
  
  const scrollToBottom = () => {
    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100); // Small delay to ensure rendering
  };

  useEffect(() => {
    loadMoreComments()
  }, [])
  return (
    <div className="p-6 bg-gray-100 rounded-lg overflow-hidden">
      {/* New Comment Input Area at the Top */}
      <div className="flex items-start py-5 border-b border-gray-300 mb-5">
        {/* User Avatar */}
        <Avatar src="/assets/avatar.png" />

        {/* Comment Input Area */}
        <div className="flex-1">
          <TextArea
            value={newMessage?.content}
            onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
            placeholder="Viết bình luận..."
            autoSize={{ minRows: 1, maxRows: 10 }}
            bordered={false}
            className="border-b border-gray-300 focus:outline-none"
          />
        </div>

        {/* Emoji and Buttons */}
        <div className="flex items-center space-x-2">

          <Button type="text" onClick={() => setNewMessage({ ...newMessage, content: '' })} className="text-gray-500">
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleSendComment}
            disabled={!newMessage?.content ? true : false}
            className="bg-red-700"
          >
            Bình luận
          </Button>
        </div>
      </div>

      {/* Scrollable List of Comments */}
      <div className="h-[80vh] overflow-y-auto mt-4">
        <List
          itemLayout="horizontal"
          dataSource={comments}
          loadMore={loadMore}
          renderItem={(comment) => (
            <List.Item key={comment?.id}>
              {/* Use your existing Comment component to render each item */}
              <Comment comment={comment} onData={updateComment}/>
            </List.Item>
          )}
        />
        <div ref={commentsEndRef} />
      </div>
    </div>
  );
}

export default CommentSection;