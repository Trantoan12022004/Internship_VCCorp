import axios from "axios";

const API_BASE_URL = 'http://localhost:5000/api';

// Service để gọi API phân tích natural language
const analyzeQuery = (data) => {
    return axios.post(`${API_BASE_URL}/nlsql/te`, data);
};



export {
    analyzeQuery,
};