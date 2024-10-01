import { useEffect, useState } from "react";
import { ApiEnpoint } from "../../../config/ApiEnpoint";
import { getAllSubmitHis } from "../../../services/submitHistoryService";
import { fetchApiGet } from "../../../utils/FetchUtil";
import SubmitHistory from "../../common/submitHistory/submitHis";

export const SubmitPage = () => {
    const [submitHis,setSubmitHis] = useState([])
    const [totalElement,setTotalElement] = useState(0)
    const getPage =async (page) => {
        const response = await getAllSubmitHis(page)
        if(response !== null) {
            setSubmitHis(response.content)
            setTotalElement(response.totalElements)
        }
    }

    useEffect(() => {
        getPage(0)
    },[])
    return(
        <SubmitHistory data={submitHis} totalElements={totalElement} onPage={getPage}></SubmitHistory>
    );
}