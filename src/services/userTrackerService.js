import axiosInstance from "../axios/axiosIntance";


export const sendLogTracker = async(payload) => {
    const  { data } =  await axiosInstance.post(`/api/manager/tracker/push`,payload);
    return data;
}