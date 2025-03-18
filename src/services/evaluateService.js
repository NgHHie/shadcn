
import axiosInstance from "../axios/axiosIntance";


export const getEvaluate = async(submitHisId) => {
    const  { data } =  await axiosInstance.get(`/api/manager/executor/evaluate/${submitHisId}`);
    return data;
}