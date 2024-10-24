
import axiosInstance from "../axios/axiosIntance";


export const getContests = async(params) => {
    const  { data } =  await axiosInstance.get(`/api/contest`,params);
    return data;
}

export const joinContest = async(payload) => {
    const  { data } =  await axiosInstance.post(`/api/user-contest/join`,payload);
    return data;
}

export const checkJoinContest = async(payload) => {
    const  { data } =  await axiosInstance.post(`/api/user-contest/check-join`,payload);
    return data;
}