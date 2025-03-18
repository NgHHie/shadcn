import axiosInstance from "../axios/axiosIntance"
import { ApiEnpoint } from "../config/ApiEnpoint"
import { PAGE_SIZE } from "../config/data"
import { fetchApiGet, responseOk } from "../utils/FetchUtil"
import { getUrlPage } from "../utils/Util"


export const getAllSubmitHis = async (page,size) => {
    const url = getUrlPage(`${ApiEnpoint.getSubmitHisAll}`, page, size)
    const data = await fetchApiGet(url)
    if (responseOk(data)) {
        return data.data
    }
    return null;
}

export const getSubmitDetail = async (id) => {
    const  { data } =  await axiosInstance.get(`/api/manager/submit-history/${id}`);
    return data;
}

export const updateEvaluate = async (payload) => {
    const  { data } =  await axiosInstance.put(`/api/manager/submit-history/update-evaluate`,payload);
    return data;
}