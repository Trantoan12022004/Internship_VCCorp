import React from "react";
import Header from "../Header";
import Footer from "../Footer";
import styles from "./Layout.module.css";

const Layout = ({ children, title = "My Vite React App", subtitle }) => {
    return (
        <div className={styles.layout}>
            <Header title={title} subtitle={subtitle} />
            <main className={styles.main}>{children}</main>
            <Footer />
        </div>
    );
};

export default Layout;
