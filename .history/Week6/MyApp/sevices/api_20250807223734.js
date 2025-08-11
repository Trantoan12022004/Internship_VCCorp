import axios from "axios";

const API_BASE_URL = 'http://192.168.102.11:5000/api';

// Service để gọi API để hỏi đ
const analyzeQuery = (data) => {
    return axios.post(`${API_BASE_URL}/task/stats`, data);
};



export {
    analyzeQuery,
};