import React from 'react';
import Button from '../components/ui/Button';

const Home = () => {
  return (
    <div className="home">
      <h1>Welcome to Home Page</h1>
      <Button onClick={() => console.log('Button clicked')}>
        Click me
      </Button>
    </div>
  );
};

export default Home;
