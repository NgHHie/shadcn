import { ApiEnpoint } from "../config/ApiEnpoint"
import { MEDIA_TYPE } from "../config/data"
import { fetchApiGet, responseOk } from "./FetchUtil"
import { getAuthenticator } from "./localStorage"
import { isValid } from "./Util"


export const getUserInfo = async () => {
    if (isValid(getAuthenticator())) {
        const response = await fetchApiGet(ApiEnpoint.getUserInfo)
        if (responseOk(response)) {
            console.log(response.data)
            return response.data
        }
    }
}