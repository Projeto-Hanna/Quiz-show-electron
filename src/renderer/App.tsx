import { Routes, Route } from 'react-router-dom';

import './App.css';
import {
  Home,
  HowToPlay,
  PlayGame,
  Settings,
  TestGame,
  HostCreate,
  HostDashboard,
  PlayerJoin,
  PlayerRoom,
  MultiplayerMenu,
} from './pages';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<TestGame />} />
        <Route path="/play" element={<PlayGame />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/multiplayer" element={<MultiplayerMenu />} />
        <Route path="/multiplayer/host/create" element={<HostCreate />} />
        <Route path="/multiplayer/host/:roomId" element={<HostDashboard />} />
        <Route path="/multiplayer/join" element={<PlayerJoin />} />
        <Route path="/multiplayer/room/:roomId" element={<PlayerRoom />} />
      </Routes>
    </>
  );
}

export default App;
