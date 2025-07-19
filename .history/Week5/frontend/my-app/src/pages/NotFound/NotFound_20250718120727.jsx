import React from "react";
import Button from "../../components/ui/Button/Button";
import Card from "../../components/ui/Card/Card";
import styles from "./NotFound.module.css";

const NotFound = () => {
    return (
        <div className={styles.notFound}>
            <div className={styles.container}>
                <Card className={styles.card}>
                    <div className={styles.content}>
                        <h1 className={styles.title}>404</h1>
                        <h2 className={styles.subtitle}>Page Not Found</h2>
                        <p className={styles.message}>The page you're looking for doesn't exist or has been moved.</p>
                        <div className={styles.actions}>
                            <Button variant="primary" onClick={() => window.history.back()}>
                                Go Back
                            </Button>
                            <Button variant="secondary" onClick={() => (window.location.href = "/")}>
                                Go Home
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default NotFound;
