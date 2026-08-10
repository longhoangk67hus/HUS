import { Routes, Route } from "react-router-dom"
import Home from "./pages/home.tsx"
import Movies from "./pages/movies.tsx"
import News from "./pages/news.tsx"
import Price from "./pages/price.tsx"
import Purchase from "./pages/purchase.tsx"
import Login from "./pages/login.tsx"
import Theaters from "./pages/theaters.tsx"
import Booking from "./pages/booking.tsx"
import Payment from "./pages/payment"
import { AuthProvider } from "./context/AuthContext"
import ScrollToTop from "./components/ScrollToTop"
import AdminLayout from "./admin/layout/AdminLayout.tsx"
import { useAuth } from "./context/useAuth"
import AdminHome from "./admin/AdminHome.tsx"
import AdminMovies from "./admin/movies/Movies.tsx"
import AdminShowtimes from "./admin/showtimes/Showtimes.tsx"
import AdminManualBooking from "./admin/manual-booking/ManualBooking.tsx"
import BookingHistory from "./admin/booking-history/BookingHistory.tsx"
import Statistics from "./admin/statistics/Statistics.tsx"
import PaymentSuccess from "./pages/payment-success.tsx"
import PaymentFailed from "./pages/payment-failed.tsx"

// Wrapper to ensure routes only render after auth is loaded
function AppRoutes() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/purchase" element={<Purchase />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/theaters" element={<Theaters />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/news" element={<News />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />
        <Route path="/price" element={<Price />} />
        <Route path="/login" element={<Login />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />
      {/* Admin layout - shows AdminHeader when user is authenticated and has ADMIN role */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminHome />} />
        <Route path="movies" element={<AdminMovies />} />
        <Route path="showtimes" element={<AdminShowtimes />} />
        <Route path="manual-booking" element={<AdminManualBooking />} />
        <Route path="booking-history" element={<BookingHistory />} />
        <Route path="statistics" element={<Statistics />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <AppRoutes />
    </AuthProvider>
  )
}
