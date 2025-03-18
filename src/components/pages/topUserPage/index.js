import { useEffect, useState } from "react";
import TopUser from "../../common/topUser/topUser";
import { getTopUser } from "../../../services/statService";
import { CONTEST_TYPE, PAGE_SIZE } from "../../../config/data";

export const TopUserPage = () => {
    const [data,setData] = useState([])
    const [loading,setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        current: 0,
        pageSize: PAGE_SIZE,
        total: 0,
    })

    const getPage =async (page) => {
        const params = {
            page: page - 1 >= 0 ? page - 1 : 0,
            size: pagination.pageSize
        }
        setLoading(true)
        getTopUser({contestType: CONTEST_TYPE.PRACTICE},params)
         .then(response => {
            console.log(response)
            setData(response.content)
            setPagination({
                current: page,
                pageSize: PAGE_SIZE,
                total: response?.totalElements
            })
         })
         .catch(err => {

         })
         .finally(() => {
            setLoading(false)
         })
    }

    useEffect(() => {
        getPage(0)
    },[])

    return(
        <TopUser data={data} totalElements={pagination?.total} onPage={getPage} loading={loading}></TopUser>
    );
}