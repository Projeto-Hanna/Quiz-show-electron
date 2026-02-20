import { Routes, Route } from 'react-router-dom';

import './App.css';
import { Home, HowToPlay, PlayGame, Settings, TestGame } from './pages';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<TestGame />} />
        <Route path="/play" element={<PlayGame />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  );
}

export default App;
