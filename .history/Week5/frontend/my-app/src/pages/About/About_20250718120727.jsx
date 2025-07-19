import React from "react";
import Card from "../../components/ui/Card/Card";
import styles from "./About.module.css";

const About = () => {
    return (
        <div className={styles.about}>
            <div className={styles.container}>
                <div className={styles.hero}>
                    <h1 className={styles.title}>About My App</h1>
                    <p className={styles.subtitle}>Learn more about this React application</p>
                </div>

                <div className={styles.content}>
                    <Card title="Our Mission" subtitle="What we aim to achieve" hoverable>
                        <p>
                            This application showcases a well-structured React project using modern development practices. It demonstrates component organization, styling with CSS
                            modules, and responsive design principles.
                        </p>
                    </Card>

                    <Card title="Technology Stack" subtitle="Tools and frameworks we use" hoverable>
                        <ul className={styles.techList}>
                            <li>React 18 - Modern UI library</li>
                            <li>Vite - Fast build tool</li>
                            <li>CSS Modules - Scoped styling</li>
                            <li>ES6+ - Modern JavaScript</li>
                        </ul>
                    </Card>

                    <Card title="Features" subtitle="What makes this app special" hoverable>
                        <ul className={styles.featureList}>
                            <li>✅ Component-based architecture</li>
                            <li>✅ Responsive design</li>
                            <li>✅ Modern CSS with variables</li>
                            <li>✅ Organized project structure</li>
                            <li>✅ Reusable UI components</li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default About;
