// Helper functions for common operations

// Format currency
export const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
    }).format(amount);
};

// Format date
export const formatDate = (date, format = "MM/DD/YYYY") => {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const options = {};

    switch (format) {
        case "SHORT":
            return d.toLocaleDateString();
        case "LONG":
            options.year = "numeric";
            options.month = "long";
            options.day = "numeric";
            return d.toLocaleDateString("en-US", options);
        case "DATETIME":
            return d.toLocaleString();
        case "TIME":
            return d.toLocaleTimeString();
        default:
            return d.toLocaleDateString();
    }
};

// Format file size
export const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// Capitalize first letter
export const capitalize = (str) => {
    if (!str || typeof str !== "string") return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Generate random ID
export const generateId = (length = 8) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Debounce function
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle function
export const throttle = (func, limit) => {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

// Deep clone object
export const deepClone = (obj) => {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map((item) => deepClone(item));
    if (typeof obj === "object") {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
};

// Check if object is empty
export const isEmpty = (obj) => {
    if (obj === null || obj === undefined) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === "string") return obj.trim().length === 0;
    if (typeof obj === "object") return Object.keys(obj).length === 0;
    return false;
};

// Remove duplicates from array
export const removeDuplicates = (arr, key) => {
    if (!Array.isArray(arr)) return [];

    if (key) {
        const seen = new Set();
        return arr.filter((item) => {
            const keyValue = item[key];
            if (seen.has(keyValue)) {
                return false;
            }
            seen.add(keyValue);
            return true;
        });
    }

    return [...new Set(arr)];
};

// Sort array of objects by key
export const sortBy = (arr, key, direction = "asc") => {
    if (!Array.isArray(arr)) return [];

    return arr.sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];

        if (aValue < bValue) return direction === "asc" ? -1 : 1;
        if (aValue > bValue) return direction === "asc" ? 1 : -1;
        return 0;
    });
};

// Group array of objects by key
export const groupBy = (arr, key) => {
    if (!Array.isArray(arr)) return {};

    return arr.reduce((groups, item) => {
        const group = item[key];
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
    }, {});
};

// Truncate string
export const truncate = (str, length = 100, ending = "...") => {
    if (!str || typeof str !== "string") return "";
    if (str.length <= length) return str;
    return str.substring(0, length - ending.length) + ending;
};

// Convert object to query string
export const objectToQueryString = (obj) => {
    if (!obj || typeof obj !== "object") return "";

    const params = new URLSearchParams();
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] !== null && obj[key] !== undefined) {
            params.append(key, obj[key]);
        }
    }
    return params.toString();
};

// Parse query string to object
export const queryStringToObject = (queryString) => {
    if (!queryString) return {};

    const params = new URLSearchParams(queryString);
    const obj = {};
    for (const [key, value] of params.entries()) {
        obj[key] = value;
    }
    return obj;
};

// Check if device is mobile
export const isMobile = () => {
    return window.innerWidth < 768;
};

// Check if device is tablet
export const isTablet = () => {
    return window.innerWidth >= 768 && window.innerWidth < 1024;
};

// Check if device is desktop
export const isDesktop = () => {
    return window.innerWidth >= 1024;
};

// Scroll to element
export const scrollToElement = (elementId, offset = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
        const elementPosition = element.offsetTop;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
        });
    }
};

// Copy text to clipboard
export const copyToClipboard = async (text) => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                document.execCommand("copy");
                textArea.remove();
                return true;
            } catch (err) {
                textArea.remove();
                return false;
            }
        }
    } catch (err) {
        console.error("Failed to copy text: ", err);
        return false;
    }
};
