import { useState, useEffect } from "react";

// Mock authentication hook
const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate checking for existing auth token
        const token = localStorage.getItem("authToken");
        if (token) {
            // Mock user data
            setUser({
                id: 1,
                name: "John Doe",
                email: "john@example.com",
            });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            // Mock login API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const mockUser = {
                id: 1,
                name: "John Doe",
                email: email,
            };

            setUser(mockUser);
            localStorage.setItem("authToken", "mock-token-123");
            return { success: true, user: mockUser };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("authToken");
    };

    const register = async (name, email, password) => {
        setLoading(true);
        try {
            // Mock register API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const mockUser = {
                id: 1,
                name: name,
                email: email,
            };

            setUser(mockUser);
            localStorage.setItem("authToken", "mock-token-123");
            return { success: true, user: mockUser };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        user,
        loading,
        login,
        logout,
        register,
        isAuthenticated: !!user,
    };
};

export default useAuth;
