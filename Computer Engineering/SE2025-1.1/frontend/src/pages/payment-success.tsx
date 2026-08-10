  
import { useNavigate } from "react-router-dom"
import { CheckCircle } from "lucide-react"
import "./payment-success.css"

export default function PaymentSuccess() {
  const navigate = useNavigate()

  return (
    <div className="payment-page payment-success">
      <CheckCircle size={80} className="status-icon" />

      <h1 className="title">Thanh toán thành công!</h1>
      <p className="subtitle">
        Cảm ơn bạn đã thanh toán. Vé của bạn đã được xác nhận.
      </p>

      <button
        onClick={() => navigate("/news")}
        className="action-button"
      >
        Xem lịch sử đặt vé
      </button>
    </div>
  )
}