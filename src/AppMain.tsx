import React from "react";
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import DeepAnalysis from './components/dashboard/Features/DeepAnalysis';
import Upgrade from "./pages/Upgrade";

const AppMain = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/deep-analysis" element={<DeepAnalysis />} />
      <Route path="/upgrade" element={<Upgrade />} />
      <Route path="/*" element={<Landing />} />
    </Routes>
  );
};

export default AppMain;