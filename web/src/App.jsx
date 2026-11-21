import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Offers from './pages/Offers'
import OfferDetail from './pages/OfferDetail'
import Orders from './pages/Orders'
import StudentDashboard from './pages/StudentDashboard'
import MerchantOffers from './pages/MerchantOffers'
import MerchantDashboard from './pages/MerchantDashboard'
import ScanQR from './pages/ScanQR'
import AdminMerchants from './pages/AdminMerchants'
import AdminUsers from './pages/AdminUsers'
import AdminDashboard from './pages/AdminDashboard'

const etudiant = (page) => (
  <ProtectedRoute roles={['student']}>{page}</ProtectedRoute>
)
const commercant = (page) => (
  <ProtectedRoute roles={['merchant']}>{page}</ProtectedRoute>
)
const admin = (page) => (
  <ProtectedRoute roles={['admin']}>{page}</ProtectedRoute>
)

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/offers" element={etudiant(<Offers />)} />
      <Route path="/offers/:id" element={etudiant(<OfferDetail />)} />
      <Route path="/orders" element={etudiant(<Orders />)} />
      <Route path="/dashboard" element={etudiant(<StudentDashboard />)} />

      <Route path="/merchant/offers" element={commercant(<MerchantOffers />)} />
      <Route path="/merchant/dashboard" element={commercant(<MerchantDashboard />)} />
      <Route path="/merchant/scan" element={commercant(<ScanQR />)} />

      <Route path="/admin/merchants" element={admin(<AdminMerchants />)} />
      <Route path="/admin/users" element={admin(<AdminUsers />)} />
      <Route path="/admin/dashboard" element={admin(<AdminDashboard />)} />
    </Routes>
  )
}

export default App