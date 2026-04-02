import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout/Layout'
import Dashboard from './components/Dashboard/Dashboard'
import ReciboTable from './components/Recibos/ReciboTable'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            borderRadius: '10px',
          },
          success: {
            iconTheme: { primary: '#FFD700', secondary: '#111' },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="actividad" element={<ReciboTable />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
