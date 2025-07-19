import apiService from "./api";

// Authentication service
class AuthService {
    // Login user
    async login(email, password) {
        try {
            const response = await apiService.post("/auth/login", { email, password });

            if (response.token) {
                localStorage.setItem("authToken", response.token);
                localStorage.setItem("user", JSON.stringify(response.user));
            }

            return response;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    }

    // Register user
    async register(name, email, password) {
        try {
            const response = await apiService.post("/auth/register", { name, email, password });

            if (response.token) {
                localStorage.setItem("authToken", response.token);
                localStorage.setItem("user", JSON.stringify(response.user));
            }

            return response;
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        }
    }

    // Logout user
    logout() {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
    }

    // Get current user
    getCurrentUser() {
        try {
            const user = localStorage.getItem("user");
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error("Error getting current user:", error);
            return null;
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem("authToken");
        return !!token;
    }

    // Get auth token
    getToken() {
        return localStorage.getItem("authToken");
    }

    // Refresh token
    async refreshToken() {
        try {
            const response = await apiService.post("/auth/refresh");

            if (response.token) {
                localStorage.setItem("authToken", response.token);
            }

            return response;
        } catch (error) {
            console.error("Token refresh failed:", error);
            this.logout();
            throw error;
        }
    }

    // Change password
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await apiService.post("/auth/change-password", {
                currentPassword,
                newPassword,
            });

            return response;
        } catch (error) {
            console.error("Password change failed:", error);
            throw error;
        }
    }

    // Request password reset
    async requestPasswordReset(email) {
        try {
            const response = await apiService.post("/auth/forgot-password", { email });
            return response;
        } catch (error) {
            console.error("Password reset request failed:", error);
            throw error;
        }
    }

    // Reset password with token
    async resetPassword(token, newPassword) {
        try {
            const response = await apiService.post("/auth/reset-password", {
                token,
                newPassword,
            });

            return response;
        } catch (error) {
            console.error("Password reset failed:", error);
            throw error;
        }
    }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
