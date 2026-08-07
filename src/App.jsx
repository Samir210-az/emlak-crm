import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<Dashboard />} />
    </Routes>
  )
}
