
import axiosInstance from "../axios/axiosIntance";


export const createTopic = async(payload) => {
    const  { data } =  await axiosInstance.post(`/api/manager/topics`,payload);
    return data;
}

export const getTopics = async(params) => {
    const  { data } =  await axiosInstance.get(`/api/manager/topics`,{
        params: params
    });
    return data;
}


export const getTopicDetail = async(topicId) => {
    const  { data } =  await axiosInstance.get(`/api/manager/topics/${topicId}`);
    return data;
}

export const getNumberTopicNew = async() => {
    const  { data } =  await axiosInstance.get(`/api/manager/topics/count-new`);
    return data;
}