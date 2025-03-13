import axiosInstance from "../axios/axiosIntance";


export const sendLogTracker = async(payload) => {
    const  { data } =  await axiosInstance.post(`/api/tracker/push`,payload);
    return data;
}