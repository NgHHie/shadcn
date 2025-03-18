import axiosInstance from "../axios/axiosIntance";

export const getTopUser = async(payload,params) => {
    const queryParams = new URLSearchParams(params).toString();
    const  { data } =  await axiosInstance.post(`/api/manager/stats/top-user?${queryParams}`,payload);
    return data;
}