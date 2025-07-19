import React from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import './App.css';
import './styles/variables.css';
import './styles/components.css';

function App() {
  return (
    <AppProvider>
      <div className="app">
        <Header />
        <main className="main-content">
          <Home />
        </main>
        <Footer />
      </div>
    </AppProvider>
  );
}

export default App;
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
