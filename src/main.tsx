import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppMain from './AppMain'
import AppDashboard from './AppDashboard'
import './index.css';
import './Database.css'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/dashboard/*" element={<AppDashboard />} />
      <Route path="/*" element={<AppMain />} />
    </Routes>
  </BrowserRouter>
)