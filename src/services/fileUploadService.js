import axiosInstance from "../axios/axiosIntance";

export const uploadFile = async(formData) => {
    const { data } = await axiosInstance.post("/api/media/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return data;
}

export const downloadFile = async(url) => {
    const { data } = await axiosInstance.get(url);
    return data;
}