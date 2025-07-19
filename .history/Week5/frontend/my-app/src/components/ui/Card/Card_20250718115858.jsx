import React from 'react';
import styles from './Card.module.css';

const Card = ({ 
  children, 
  title, 
  subtitle, 
  className = '',
  hoverable = false,
  ...props 
}) => {
  const cardClass = `${styles.card} ${hoverable ? styles.hoverable : ''} ${className}`;

  return (
    <div className={cardClass} {...props}>
      {(title || subtitle) && (
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      )}
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default Card;
