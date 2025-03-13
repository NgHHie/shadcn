import axios from "axios";
import { StatusCodes } from "http-status-codes";
import toast, { NotifyType } from "./Toast";
import axiosInstance from "../axios/axiosIntance";
import { getAuthenticator } from "./localStorage";
import { ApiEnpoint } from "../config/ApiEnpoint";

export const endSession = () => {

}
export const fetchApiGet = async (apiUrl,params) => {
  try {
    //   const token = isValid(getAuthenticator()) ? getAuthenticator() : accessToken;

    const response = await axiosInstance.get(apiUrl,{
      params: params
    });

    return response;
  } catch (error) {
    let statusResponse = null;

    if (axios.isAxiosError(error)) {
      statusResponse = error.response?.status;
    }

    if (statusResponse === StatusCodes.UNAUTHORIZED) {
      endSession();
      return null;
    }

    console.error('There was a problem with your fetch operation:', error);

    return error.response;
  }
};


export const fetchApiPost = async (apiUrl, postData, contentType) => {
  try {
    const response = await axiosInstance.post(apiUrl, postData, {
      headers: {
        'Content-Type': contentType,
      },
    });
    return response;
  } catch (error) {
    let statusResponse = null;

    if (axios.isAxiosError(error)) {
      statusResponse = error.response?.status;

      if (statusResponse === StatusCodes.UNAUTHORIZED) {
        endSession();
        return null;
      }
      console.log(error.response)
      return error.response;
    }
    toast(NotifyType.ERROR, 'Có lỗi xảy ra!')
    console.error('There was a problem with your fetch operation:', error);
    return null;
  }
};

export const fetchApiPut = async (apiUrl, postData, contentType) => {
  try {
    const response = await axiosInstance.put(apiUrl, postData, {
      headers: {
        'Content-Type': contentType,
      },
    });
    return response;
  } catch (error) {
    let statusResponse = null;

    if (axios.isAxiosError(error)) {
      statusResponse = error.response?.status;

      if (statusResponse === StatusCodes.UNAUTHORIZED) {
        endSession();
        return null;
      }
    }

    console.error('There was a problem with your fetch operation:', error);
    return error.response;
  }
};

export const fetchDownloadFile = async (url) => {
  if (url === undefined) {
    return
  }
  try {

    await axiosInstance.get(url); // Đợi phản hồi từ fetch

  } catch (error) {
    console.error('There was a problem with your fetch operation:', error);
  }
}

export const fetchApiUploadFile = async (postData) => {
  try {
    const response = await axiosInstance.post(ApiEnpoint.submitFile, postData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response;
  } catch (error) {
    let statusResponse = null;

    if (axios.isAxiosError(error)) {
      statusResponse = error.response?.status;

      if (statusResponse === StatusCodes.INTERNAL_SERVER_ERROR) {
        return null;
      }

      if (statusResponse === StatusCodes.UNAUTHORIZED) {
        endSession();
        return null;
      }
      return error.response;
    }

    console.error('There was a problem with your fetch operation:', error);
    return null;
  }
};

export const responseOk = (response) => {
  if (response && response.status >= 200 && response.status < 300) {
    return true;
  }
  return false;
} 