import React from 'react'
import styles from './Header.module.css'

const Header = ({ title, subtitle, className = '' }) => {
  return (
    <header className={`${styles.header} ${className}`}>
      <div className={styles.container}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </header>
  )
}

export default Header
