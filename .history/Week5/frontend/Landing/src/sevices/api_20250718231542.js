import axios from "axios";

const API_BASE_URL = 'http://localhost:5000/api';

// Service để gọi API để hỏi đáp
const chatWithGemini = (data) => {
    return axios.post(`${API_BASE_URL}/nlsql/chat`, data);
};



export {
    analyzeQuery,
};