import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppRoutes from "./routes/AppRoutes";
import "./assets/styles/globals.css";
import "./App.css";

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <div className="App">
                    <AppRoutes />
                </div>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
