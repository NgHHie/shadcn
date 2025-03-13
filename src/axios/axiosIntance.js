import axios from 'axios';
import { getAuthenticator, getRefreshToken, setAuthenticator, setRefreshToken } from '../utils/localStorage';
import { ApiEnpoint, BASE_URL } from '../config/ApiEnpoint';
import { endSession } from '../utils/FetchUtil';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

const publicApis = [
  ApiEnpoint.login,
  ApiEnpoint.register,
  /^\/question\/?.*$/
];


axiosInstance.interceptors.request.use(
  (config) => {
    const isPublicApi = publicApis.some((api) => 
      typeof api === 'string' ? config.url.includes(api) : api.test(config.url)
    );
    // If the request is not a public API, add the Authorization header
    if (!isPublicApi) {
      const token = getAuthenticator();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);


let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};


axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401) {
      if (!originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        return new Promise((resolve, reject) => {
          const refreshToken = getRefreshToken();
          const data = { refreshToken };

          axios.post(ApiEnpoint.refreshToken, data)
            .then(({ data }) => {
              if (data.status === 1 && data?.data !== null) {
                const newAccessToken = data.accessToken;
                setAuthenticator(newAccessToken);
                setRefreshToken(data.refreshToken);
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                processQueue(null, newAccessToken);
                resolve(axiosInstance(originalRequest));
              } else {
                endSession();
                processQueue(new Error('Invalid refresh token'), null);
                reject(new Error('Invalid refresh token'));
              }
            })
            .catch((err) => {
              processQueue(err, null);
              endSession();
              reject(err);
            })
            .finally(() => {
              isRefreshing = false;
            });
        });
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
