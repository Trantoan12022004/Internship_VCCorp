import React from "react";
import styles from "./Footer.module.css";

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.section}>
                        <h3>My App</h3>
                        <p>A simple React Vite application</p>
                    </div>
                    <div className={styles.section}>
                        <h4>Quick Links</h4>
                        <ul className={styles.links}>
                            <li>
                                <a href="/">Home</a>
                            </li>
                            <li>
                                <a href="/about">About</a>
                            </li>
                            <li>
                                <a href="/contact">Contact</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className={styles.bottom}>
                    <p>&copy; 2025 My App. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
