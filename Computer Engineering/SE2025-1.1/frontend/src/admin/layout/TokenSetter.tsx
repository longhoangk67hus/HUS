import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setAuthToken, authAPI } from '../servicesAdmin/api'
import './TokenSetter.css'

const TokenSetter: React.FC = () => {
  const [token, setToken] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const navigate = useNavigate()

  const applyToken = async () => {
    setMessage(null)
    setAuthToken(token || null)
    // try to validate token by calling /me
    try {
      await authAPI.me()
      setMessage('Token đã được lưu và hợp lệ (user found).')
      navigate('/admin')
    } catch (err: any) {
      // network errors or invalid token
      const aerr = err as unknown as { isNetworkError?: boolean }
      if (aerr?.isNetworkError) {
        setMessage('Lỗi kết nối tới backend. Token vẫn được lưu cục bộ.')
      } else {
        setMessage('Token đã lưu nhưng không hợp lệ hoặc không có quyền ADMIN.')
      }
    }
  }

  const clearToken = () => {
    setToken('')
    setAuthToken(null)
    setMessage('Token đã xóa')
  }

  return (
    <div className="token-setter">
      <label>Developer / Manual token</label>
      <div className="token-controls">
        <input
          placeholder="Paste JWT token here"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button className="btn" onClick={applyToken}>
          Apply
        </button>
        <button className="btn btn-ghost" onClick={clearToken}>
          Clear
        </button>
      </div>
      {message && <div className="token-message">{message}</div>}
    </div>
  )
}

export default TokenSetter
