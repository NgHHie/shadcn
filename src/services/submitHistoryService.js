import { ApiEnpoint } from "../config/ApiEnpoint"
import { PAGE_SIZE } from "../config/data"
import { fetchApiGet, responseOk } from "../utils/FetchUtil"
import { getUrlPage } from "../utils/Util"


export const getAllSubmitHis = async (page) => {
    const url = getUrlPage(`${ApiEnpoint.getSubmitHisAll}`, page, PAGE_SIZE)
    const data = await fetchApiGet(url)
    if (responseOk(data)) {
        return data.data
    }
    return null;
}