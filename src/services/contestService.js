
import axiosInstance from "../axios/axiosIntance";


export const getContests = async(params) => {
    const  { data } =  await axiosInstance.get(`/api/manager/contest`,{
        params: params
    });
    return data;
}

export const joinContest = async(payload) => {
    const  { data } =  await axiosInstance.post(`/api/manager/user-contest/join`,payload);
    return data;
}

export const checkJoinContest = async(payload) => {
    const  { data } =  await axiosInstance.post(`/api/manager/user-contest/check-join`,payload);
    return data;
}

export const getContestWaitingById = async(contestId) => {
    const  { data } =  await axiosInstance.get(`/api/manager/contest/waiting/${contestId}`);
    return data;
}

export const getContestDetail = async(contestId) => {
    const  { data } =  await axiosInstance.get(`/api/manager/contest/${contestId}`);
    return data;
}

export const getContestJoinedByUser = async() => {
    const  { data } =  await axiosInstance.get(`/api/manager/contest/user/joined`);
    return data;
}

export const getCurrentContestExamRunning = async() => {
    const {data} = await axiosInstance.get(`/api/manager/contest/user/current-contest/exam`)
    return data;
}

export const getNumberContestOpening = async() => {
    const {data} = await axiosInstance.get(`/api/manager/contest/count/opening`)
    return data;
}