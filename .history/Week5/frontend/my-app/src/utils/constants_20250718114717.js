// App Configuration
export const APP_CONFIG = {
    APP_NAME: "My Vite React App",
    VERSION: "1.0.0",
    AUTHOR: "React Developer",
    DESCRIPTION: "Modern React application built with Vite",
};

// API Configuration
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
    TIMEOUT: 30000,
    VERSION: "v1",
};

// Storage Keys
export const STORAGE_KEYS = {
    USER: "user",
    TOKEN: "token",
    THEME: "theme",
    LANGUAGE: "language",
    SETTINGS: "settings",
};

// Route Paths
export const ROUTES = {
    HOME: "/",
    ABOUT: "/about",
    CONTACT: "/contact",
    PRODUCTS: "/products",
    PRODUCT_DETAIL: "/products/:id",
    LOGIN: "/login",
    REGISTER: "/register",
    PROFILE: "/profile",
    NOT_FOUND: "/404",
};

// HTTP Status Codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};

// User Roles
export const USER_ROLES = {
    ADMIN: "admin",
    USER: "user",
    MODERATOR: "moderator",
};

// Theme Options
export const THEMES = {
    LIGHT: "light",
    DARK: "dark",
    SYSTEM: "system",
};

// Language Options
export const LANGUAGES = {
    VI: "vi",
    EN: "en",
};

// Common Messages
export const MESSAGES = {
    LOADING: "Đang tải...",
    ERROR: "Có lỗi xảy ra",
    SUCCESS: "Thành công",
    CONFIRM: "Bạn có chắc chắn?",
    CANCEL: "Hủy bỏ",
    SAVE: "Lưu",
    DELETE: "Xóa",
    EDIT: "Sửa",
    ADD: "Thêm",
    SEARCH: "Tìm kiếm",
    NO_DATA: "Không có dữ liệu",
    NETWORK_ERROR: "Lỗi kết nối mạng",
};

// Validation Rules
export const VALIDATION_RULES = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[0-9]{10,11}$/,
    PASSWORD_MIN_LENGTH: 8,
    NAME_MAX_LENGTH: 50,
    TEXT_MAX_LENGTH: 500,
};

// Date Formats
export const DATE_FORMATS = {
    DD_MM_YYYY: "DD/MM/YYYY",
    MM_DD_YYYY: "MM/DD/YYYY",
    YYYY_MM_DD: "YYYY-MM-DD",
    DD_MM_YYYY_HH_MM: "DD/MM/YYYY HH:mm",
};

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
};
