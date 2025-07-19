import axios from "axios";

const API_BASE_URL = 'http://localhost:5000/api';

// Service để gọi API phân tích natural language
const analyzeQuery = (data) => {
    return axios.post(`${API_BASE_URL}/nlsql/analyze`, data);
};

// Service để test kết nối Gemini
const testGeminiConnection = () => {
    return axios.get(`${API_BASE_URL}/nlsql/test`);
};

// Service để chuyển đổi ngôn ngữ tự nhiên sang SQL
const translateToSQL = (data) => {
    return axios.post(`${API_BASE_URL}/nlsql/translate`, data);
};

export {
    analyzeQuery,
    testGeminiConnection,
    translateToSQL
};