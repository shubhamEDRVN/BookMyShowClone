import React from 'react';
import './App.css';
import BsState from './Context/BsState';
import Home from './Pages/Home';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import ScrollToTop from './Components/ScrollToTop/ScrollToTop';
import { ToastProvider } from './Components/Toast/Toast';

function App() {
  return (
    <div className="App">
      <ToastProvider>
        <BsState>
          <Navbar />
          <main>
            <Home />
          </main>
          <Footer />
          <ScrollToTop />
        </BsState>
      </ToastProvider>
    </div>
  );
}

export default App;
