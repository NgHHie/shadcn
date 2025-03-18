import { useEffect, useState } from "react";
import { ApiEnpoint } from "../../../config/ApiEnpoint";
import { getAllSubmitHis } from "../../../services/submitHistoryService";
import { fetchApiGet } from "../../../utils/FetchUtil";
import SubmitHistory from "../../common/submitHistory/submitHis";
import { PAGE_SIZE } from "../../../config/data";

export const SubmitPage = () => {
    const [submitHis,setSubmitHis] = useState([])
    const [totalElement,setTotalElement] = useState(0)
    const [loading,setLoading] = useState(false)
    const getPage =async (page,size) => {
        setLoading(true)
        const response = await getAllSubmitHis(page,size)
        if(response !== null) {
            setSubmitHis(response.content)
            setTotalElement(response.totalElements)
        }
        setLoading(false)
    }

    useEffect(() => {
        getPage(0,PAGE_SIZE)
    },[])
    return(
        <SubmitHistory data={submitHis} totalElements={totalElement} onPage={getPage} loading={loading}></SubmitHistory>
    );
}