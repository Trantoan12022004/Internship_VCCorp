import React, { useState } from 'react'
import Layout from '../../components/common/Layout'
import Button from '../../components/ui/Button'
import styles from './Home.module.css'

const Home = () => {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleIncrement = () => {
    setLoading(true)
    setTimeout(() => {
      setCount(prev => prev + 1)
      setLoading(false)
    }, 500)
  }

  const handleReset = () => {
    setCount(0)
  }

  return (
    <Layout title="🏠 Trang Chủ" subtitle="Chào mừng bạn đến với My Vite React App">
      <div className={styles.container}>
        <section className={styles.hero}>
          <h2 className={styles.heroTitle}>Ứng dụng React hiện đại</h2>
          <p className={styles.heroDescription}>
            Được xây dựng với Vite, React 19 và CSS Modules
          </p>
        </section>

        <section className={styles.demo}>
          <div className={styles.card}>
            <h3>Demo Counter</h3>
            <div className={styles.counter}>
              <span className={styles.counterValue}>{count}</span>
            </div>
            <div className={styles.actions}>
              <Button 
                onClick={handleIncrement}
                loading={loading}
                disabled={loading}
              >
                Tăng
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleReset}
                disabled={count === 0}
              >
                Reset
              </Button>
            </div>
          </div>
        </section>

        <section className={styles.features}>
          <h3>Tính năng nổi bật</h3>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <h4>⚡ Vite</h4>
              <p>Build tool nhanh chóng và hiệu quả</p>
            </div>
            <div className={styles.featureCard}>
              <h4>⚛️ React 19</h4>
              <p>Phiên bản React mới nhất</p>
            </div>
            <div className={styles.featureCard}>
              <h4>🎨 CSS Modules</h4>
              <p>Styling được scope và tối ưu</p>
            </div>
            <div className={styles.featureCard}>
              <h4>📱 Responsive</h4>
              <p>Tương thích mọi thiết bị</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default Home
