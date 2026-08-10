import { useNavigate } from "react-router-dom"
import { XCircle } from "lucide-react"
import "./payment-failed.css"

export default function PaymentFailed() {
  const navigate = useNavigate()

  return (
    <div className="payment-page payment-failed">
      <XCircle size={80} className="status-icon" />

      <h1 className="title">Thanh toán thất bại!</h1>
      <p className="subtitle">
        Đã có lỗi xảy ra trong quá trình thanh toán. Bạn vui lòng thử lại.
      </p>

      <button
        onClick={() => navigate("/")}
        className="action-button"
      >
        Quay lại trang chủ
      </button>
    </div>
  )
}