
import axiosInstance from "../axios/axiosIntance";


export const sendComment = async(payload) => {
    const  { data } =  await axiosInstance.post(`/api/comments`,payload);
    return data;
}

export const getCommentByQuestionId = async(questionId,params) => {
    const  { data } =  await axiosInstance.get(`/api/comments/question/${questionId}`, {
        params: params
    });
    return data;
}

export const updateCountLike = async(payload) => {
    const  { data } =  await axiosInstance.post(`/api/comments/like`,payload)
    return data;
}

