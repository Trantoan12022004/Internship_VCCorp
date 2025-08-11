import axios from "axios";

const API_BASE_URL = "http://192.168.102.11:5000/api";

// Service để gọi API để hỏi đ
const getTask = () => {
    return axios.get(`${API_BASE_URL}/task/get`);
};

const updateTask = (id, data) => {
    return axios.put(`${API_BASE_URL}/task/${id}`, data);
};

const createTask = (data) => {
    return axios.post(`${API_BASE_URL}/task/create`, data);
};

const deleteTask = (id) => {
    return axios.delete(`${API_BASE_URL}/task/${id}`);
};

const loadCalendar = () => {
    return axios.get(`${API_BASE_URL}/task/get-google-calendar`);
}
const suggestAI = (data) => {
    return axios.get(`${API_BASE_URL}/task/suggest-time`, data);
}
export { getTask, updateTask, createTask, deleteTask, loadCalendar, suggestAI };
