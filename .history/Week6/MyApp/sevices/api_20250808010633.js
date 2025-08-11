import axios from "axios";

const API_BASE_URL = "http://192.168.102.11:5000/api";

// Service để gọi API để hỏi đ
const getTask = () => {
    return axios.get(`${API_BASE_URL}/task/get`);
};
const updateTask = () => {
    return axios.(`${API_BASE_URL}/task/get`);
};

 



export { getTask,  };
