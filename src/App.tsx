import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainMenuScreen from './screens/MainMenuScreen';
import MapSelectionScreen from './screens/MapSelectionScreen';
import ForgeScreen from './screens/ForgeScreen';
import InventoryScreen from './screens/InventoryScreen';
import LearningReportScreen from './screens/LearningReportScreen';
import { PhaserGame } from './phaser/PhaserGame';
import './styles/global.css';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<MainMenuScreen />} />
        <Route path="/map" element={<MapSelectionScreen />} />
        <Route path="/game/:unitId/:stageId" element={<PhaserGame />} />
        <Route path="/forge" element={<ForgeScreen />} />
        <Route path="/inventory" element={<InventoryScreen />} />
        <Route path="/report" element={<LearningReportScreen />} />
      </Routes>
    </div>
  );
}

export default App;
