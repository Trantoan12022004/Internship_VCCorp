import React from 'react'
import styles from './Footer.module.css'

const Footer = ({ className = '' }) => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className={`${styles.footer} ${className}`}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.title}>My Vite React App</h3>
            <p className={styles.description}>
              Ứng dụng React hiện đại được xây dựng với Vite
            </p>
          </div>
          
          <div className={styles.section}>
            <h4>Liên kết</h4>
            <ul className={styles.links}>
              <li><a href="/">Trang chủ</a></li>
              <li><a href="/about">Giới thiệu</a></li>
              <li><a href="/contact">Liên hệ</a></li>
            </ul>
          </div>
          
          <div className={styles.section}>
            <h4>Hỗ trợ</h4>
            <ul className={styles.links}>
              <li><a href="/help">Trợ giúp</a></li>
              <li><a href="/privacy">Chính sách</a></li>
              <li><a href="/terms">Điều khoản</a></li>
            </ul>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p>&copy; {currentYear} My Vite React App. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
