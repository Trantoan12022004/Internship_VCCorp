import axios from "axios";

const API_BASE_URL = 'http://localhost:5000/api';

// Service để gọi API để hỏi đáp
const analyzeQuery = (data) => {
    return axios.post(`${API_BASE_URL}/nlsql/test`, data);
};



export {
    analyzeQuery,
};