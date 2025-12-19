import { useState, useEffect } from 'react';
import { Link, Route, Routes, BrowserRouter } from 'react-router-dom';
import Home from './components/Home';
import FindPairs from './components/FindPairs';
import Plotter from './components/Plotter';
import TradePage from './components/TradePage';
import AnalyzePage from './components/AnalyzePage';
import './app.css';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item): initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.log(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

function App() {
  return (
    <BrowserRouter>
      <nav id="nav-bar">
        <Link to="/" className='link'>Home</Link>
        <Link to="/find_pairs" className='link'>Find Pairs</Link>
        <Link to="/plotter" className='link'>Plotter</Link>
        <Link to="/trade" className='link'>Trade</Link>
        <Link to="/analyze" className='link'>Analyze</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/find_pairs" element={<FindPairs />} />
        <Route path="/plotter" element={<Plotter />} />
        <Route path="/trade" element={<TradePage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
