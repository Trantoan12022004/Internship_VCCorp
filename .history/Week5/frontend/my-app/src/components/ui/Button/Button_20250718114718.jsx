import React from "react";
import styles from "./Button.module.css";

const Button = ({ children, variant = "primary", size = "medium", onClick, disabled = false, type = "button", loading = false, className = "", ...props }) => {
    const buttonClass = `
    ${styles.button} 
    ${styles[variant]} 
    ${styles[size]} 
    ${disabled ? styles.disabled : ""}
    ${loading ? styles.loading : ""}
    ${className}
  `.trim();

    return (
        <button className={buttonClass} onClick={onClick} disabled={disabled || loading} type={type} {...props}>
            {loading && <span className={styles.spinner}></span>}
            <span className={loading ? styles.hiddenText : ""}>{children}</span>
        </button>
    );
};

export default Button;
