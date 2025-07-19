import React, { useState } from "react";
import Button from "../../components/ui/Button/Button";
import Card from "../../components/ui/Card/Card";
import Input from "../../components/ui/Input/Input";
import styles from "./Contact.module.css";

const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Thank you for your message! (This is a demo form)");
        setFormData({ name: "", email: "", message: "" });
    };

    return (
        <div className={styles.contact}>
            <div className={styles.container}>
                <div className={styles.hero}>
                    <h1 className={styles.title}>Contact Us</h1>
                    <p className={styles.subtitle}>Get in touch with us for any questions or feedback</p>
                </div>

                <div className={styles.content}>
                    <Card title="Send us a message" subtitle="Fill out the form below" className={styles.formCard}>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <Input label="Name" name="name" placeholder="Your full name" value={formData.name} onChange={handleInputChange} required />

                            <Input label="Email" type="email" name="email" placeholder="your.email@example.com" value={formData.email} onChange={handleInputChange} required />

                            <div className={styles.textareaGroup}>
                                <label className={styles.label}>
                                    Message <span className={styles.required}>*</span>
                                </label>
                                <textarea
                                    name="message"
                                    placeholder="Your message here..."
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    className={styles.textarea}
                                    rows="5"
                                />
                            </div>

                            <Button type="submit" variant="primary" size="large">
                                Send Message
                            </Button>
                        </form>
                    </Card>

                    <Card title="Get in Touch" subtitle="Other ways to reach us" hoverable>
                        <div className={styles.contactInfo}>
                            <div className={styles.contactItem}>
                                <h4>Email</h4>
                                <p>contact@myapp.com</p>
                            </div>

                            <div className={styles.contactItem}>
                                <h4>Phone</h4>
                                <p>+1 (555) 123-4567</p>
                            </div>

                            <div className={styles.contactItem}>
                                <h4>Address</h4>
                                <p>
                                    123 Main Street
                                    <br />
                                    City, State 12345
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Contact;
