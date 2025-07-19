import React, { createContext, useContext, useReducer, useEffect } from "react";
import authService from "../services/auth";

// Initial state
const initialState = {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
};

// Action types
const AUTH_ACTIONS = {
    LOGIN_START: "LOGIN_START",
    LOGIN_SUCCESS: "LOGIN_SUCCESS",
    LOGIN_FAILURE: "LOGIN_FAILURE",
    LOGOUT: "LOGOUT",
    SET_LOADING: "SET_LOADING",
    SET_ERROR: "SET_ERROR",
    CLEAR_ERROR: "CLEAR_ERROR",
};

// Reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN_START:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case AUTH_ACTIONS.LOGIN_SUCCESS:
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                loading: false,
                error: null,
            };
        case AUTH_ACTIONS.LOGIN_FAILURE:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                loading: false,
                error: action.payload,
            };
        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                loading: false,
                error: null,
            };
        case AUTH_ACTIONS.SET_LOADING:
            return {
                ...state,
                loading: action.payload,
            };
        case AUTH_ACTIONS.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                loading: false,
            };
        case AUTH_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
};

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Check if user is already authenticated on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = authService.getToken();
                const user = authService.getCurrentUser();

                if (token && user) {
                    dispatch({
                        type: AUTH_ACTIONS.LOGIN_SUCCESS,
                        payload: user,
                    });
                } else {
                    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
                }
            } catch (error) {
                dispatch({
                    type: AUTH_ACTIONS.SET_ERROR,
                    payload: error.message,
                });
            }
        };

        checkAuth();
    }, []);

    // Login function
    const login = async (email, password) => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START });

        try {
            const response = await authService.login(email, password);

            if (response.success) {
                dispatch({
                    type: AUTH_ACTIONS.LOGIN_SUCCESS,
                    payload: response.user,
                });
                return { success: true };
            } else {
                dispatch({
                    type: AUTH_ACTIONS.LOGIN_FAILURE,
                    payload: response.error,
                });
                return { success: false, error: response.error };
            }
        } catch (error) {
            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: error.message,
            });
            return { success: false, error: error.message };
        }
    };

    // Register function
    const register = async (name, email, password) => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START });

        try {
            const response = await authService.register(name, email, password);

            if (response.success) {
                dispatch({
                    type: AUTH_ACTIONS.LOGIN_SUCCESS,
                    payload: response.user,
                });
                return { success: true };
            } else {
                dispatch({
                    type: AUTH_ACTIONS.LOGIN_FAILURE,
                    payload: response.error,
                });
                return { success: false, error: response.error };
            }
        } catch (error) {
            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: error.message,
            });
            return { success: false, error: error.message };
        }
    };

    // Logout function
    const logout = () => {
        authService.logout();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
    };

    // Clear error function
    const clearError = () => {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    };

    // Change password function
    const changePassword = async (currentPassword, newPassword) => {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

        try {
            const response = await authService.changePassword(currentPassword, newPassword);
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });

            if (response.success) {
                return { success: true };
            } else {
                dispatch({
                    type: AUTH_ACTIONS.SET_ERROR,
                    payload: response.error,
                });
                return { success: false, error: response.error };
            }
        } catch (error) {
            dispatch({
                type: AUTH_ACTIONS.SET_ERROR,
                payload: error.message,
            });
            return { success: false, error: error.message };
        }
    };

    const value = {
        ...state,
        login,
        register,
        logout,
        clearError,
        changePassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
