import { getUserInfo } from "../utils/masterData"

export const BASE_URL = process.env.REACT_APP_BASE_ENDPOINT_URL;


export const ApiEnpoint = {
    executeSql: `${BASE_URL}/api/executor`,
    executeSqlUser: `${BASE_URL}/api/executor/user`,
    submitQuestion: `${BASE_URL}/api/executor/submit`,
    submitFile : `${BASE_URL}/api/executor/submit-file`,

    getSubmitHisAll: `${BASE_URL}/api/submit-history`,
    getSubmitHisByUserId: `${BASE_URL}/api/submit-history/user/`,
    checkQuestionComplete: `${BASE_URL}/api/submit-history/check/complete`,
    getSubmitContestHisByUserId: `${BASE_URL}/api/submit-contest/user`,
    checkQuestionContestComplete: `${BASE_URL}/api/submit-contest/check/complete`,

    createTestCase: `${BASE_URL}/api/executor/generate/testcase`,
    createQuestion: `${BASE_URL}/api/question`,

    getQuestionDetailAdmin : `${BASE_URL}/api/question/admin/`,
    getQuestionList : `${BASE_URL}/api/question`,
    getQuestionDetail:  `${BASE_URL}/api/question/`,
    getTableCreated: `${BASE_URL}/api/table/created`,

    login: `${BASE_URL}/api/user/auth/login`,
    register: `${BASE_URL}/api/user/auth/register`,

    getUserInfo: `${BASE_URL}/api/user/info`,

    refreshToken:  `${BASE_URL}/api/user/auth/refresh-token`,
}