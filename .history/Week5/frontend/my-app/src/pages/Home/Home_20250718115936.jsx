import React, { useState } from 'react';
import Button from '../../components/ui/Button/Button';
import Card from '../../components/ui/Card/Card';
import Input from '../../components/ui/Input/Input';
import styles from './Home.module.css';

const Home = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  return (
    <div className={styles.home}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Welcome to My App</h1>
          <p className={styles.subtitle}>
            A modern React application built with Vite and organized structure
          </p>
        </div>

        <div className={styles.content}>
          <div className={styles.grid}>
            <Card
              title="Counter Example"
              subtitle="Interactive counter component"
              hoverable
            >
              <div className={styles.counter}>
                <p className={styles.countText}>Count: {count}</p>
                <div className={styles.buttons}>
                  <Button 
                    variant="primary" 
                    onClick={() => setCount(count + 1)}
                  >
                    Increment
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => setCount(count - 1)}
                  >
                    Decrement
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={() => setCount(0)}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </Card>

            <Card
              title="Input Example"
              subtitle="Form input component"
              hoverable
            >
              <div className={styles.inputDemo}>
                <Input
                  label="Your Name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                {name && (
                  <p className={styles.greeting}>Hello, {name}!</p>
                )}
              </div>
            </Card>

            <Card
              title="Features"
              subtitle="What's included in this app"
              hoverable
            >
              <ul className={styles.features}>
                <li>⚛️ React 18</li>
                <li>⚡ Vite</li>
                <li>🎨 CSS Modules</li>
                <li>📱 Responsive Design</li>
                <li>🔧 Organized Structure</li>
                <li>🎯 TypeScript Ready</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
