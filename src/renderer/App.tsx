import { Routes, Route } from 'react-router-dom';

import './App.css';
import { Home, HowToPlay } from './pages';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" />
        <Route path="/play" />
        <Route path="/how-to-play" element={<HowToPlay />} />
      </Routes>
    </>
  );
}

export default App;
