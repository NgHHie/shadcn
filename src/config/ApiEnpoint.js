import { getUserInfo } from "../utils/masterData"

export const BASE_URL = process.env.REACT_APP_BASE_ENDPOINT_URL;


export const ApiEnpoint = {
    executeSql: `${BASE_URL}/api/executor`,
    executeSqlUser: `${BASE_URL}/api/manager/executor/user`,
    submitQuestion: `${BASE_URL}/api/manager/executor/submit`,
    submitFile : `${BASE_URL}/api/manager/executor/submit-file`,

    getSubmitHisAll: `${BASE_URL}/api/manager/submit-history`,
    getSubmitHisByUserId: `${BASE_URL}/api/manager/submit-history/user/`,
    checkQuestionComplete: `${BASE_URL}/api/manager/submit-history/check/complete`,
    getSubmitContestHisByUserId: `${BASE_URL}/api/manager/submit-contest/user`,
    checkQuestionContestComplete: `${BASE_URL}/api/manager/submit-contest/check/complete`,

    createTestCase: `${BASE_URL}/api/manager/executor/generate/testcase`,
    createQuestion: `${BASE_URL}/api/manager/question`,

    getQuestionDetailAdmin : `${BASE_URL}/api/manager/question/admin/`,
    getQuestionList : `${BASE_URL}/api/manager/question`,
    getQuestionDetail:  `${BASE_URL}/api/manager/question/`,
    getTableCreated: `${BASE_URL}/api/manager/table/created`,

    login: `${BASE_URL}/api/manager/user/auth/login`,
    register: `${BASE_URL}/api/manager/user/auth/register`,
    updateUser: `${BASE_URL}/api/manager/user/update`,

    getUserInfo: `${BASE_URL}/api/manager/user/info`,

    refreshToken:  `${BASE_URL}/api/manager/user/auth/refresh-token`,
}