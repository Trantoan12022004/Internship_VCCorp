import React from 'react';
import styles from './Loading.module.css';

const Loading = ({ size = 'medium', text = 'Loading...' }) => {
  return (
    <div className={styles.loading}>
      <div className={`${styles.spinner} ${styles[size]}`}></div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
};

export default Loading;
