import type React from "react"
import { useState, useEffect } from "react"
import toast from 'react-hot-toast'
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../context/useAuth"
// import Header from "../components/Header"
import Footer from "../components/Footer"
import "./login.css"

const Login = () => {
  const [userName, setUserName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignup, setIsSignup] = useState(false)
  const [searchParams] = useSearchParams()

  // Nếu có ?signup=1 thì mặc định mở tab đăng ký
  useEffect(() => {
    const s = searchParams.get("signup")
    setIsSignup(s === "1" || s === "true")
  }, [searchParams])

  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login, signup, user } = useAuth()
  const navigate = useNavigate()

  // Theo dõi trạng thái user và chuyển trang sau khi đăng nhập
  useEffect(() => {
    if (user) {
      if (user.roles?.includes("ADMIN")) {
        navigate("/admin")
      } else {
        navigate("/")
      }
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (isSignup) {
        await signup(userName, password, name, email)
        // Notify user and switch to login view
        toast.success('Tạo tài khoản thành công. Vui lòng đăng nhập.')
        setIsSignup(false)
        // clear sensitive fields
        setPassword('')
        setUserName('')
        setEmail('')
        setName('')
      } else {
        await login(userName, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xác thực thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* <Header /> */}
      <button
        className="back-home-btn"
        onClick={() => navigate("/")}
        title="Quay lại trang chủ"
      >
        ← Quay lại trang chủ
      </button>

      <main className="login-container">
        <div className="login-card">
          <h2>{isSignup ? "📝 Đăng ký tài khoản" : "🔐 Đăng nhập"}</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            {isSignup && (
              <div className="form-groupp">
                <label>Họ và tên</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignup}
                  placeholder="Nhập họ và tên"
                />
              </div>
            )}

            <div className="form-groupp">
              <label>Tên đăng nhập</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                placeholder={isSignup ? "Tạo tên đăng nhập" : "Nhập tên đăng nhập"}
              />
            </div>

            {isSignup && (
              <div className="form-groupp">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
            )}

            <div className="form-groupp">
              <label>Mật khẩu</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading
                ? "Đang xử lý..."
                : isSignup
                ? "✓ Đăng ký"
                : "✓ Đăng nhập"}
            </button>
          </form>

          <div className="toggle-section">
            <p>
              {isSignup ? "Đã có tài khoản?" : "Bạn chưa có tài khoản?"}{" "}
              <button
                className="toggle-btn"
                onClick={() => setIsSignup(!isSignup)}
                type="button"
              >
                {isSignup ? "Đăng nhập ngay" : "Đăng ký ngay"}
              </button>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Login
