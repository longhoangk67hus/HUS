import { useState, useEffect } from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { seatTypesAPI, moviesAPI } from "../services/api"
import "./price.css"

interface TicketPrice {
  id: number
  type: string
  price: number
  description: string
  icon: string
}

const Price = () => {
  const [prices, setPrices] = useState<TicketPrice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setIsLoading(true)
      try {
        // Fetch seat types from API (these may include name, id, priceMultiplier, icon)
        const types = await seatTypesAPI.list()
        const seatTypes = Array.isArray(types) ? types : []

        // Try to get a base price from API (use first now-showing movie's price as a default)
        let base = 120000
        try {
          const movies = await moviesAPI.nowShowing?.()
          const first = Array.isArray(movies) ? movies[0] : undefined
          // movie entity may expose basePrice or BasePrice under different shapes
          if (first) base = Number((first as any).basePrice ?? (first as any).BasePrice ?? base)
        } catch (e) {
          // ignore — keep fallback
        }

        if (!mounted) return

        // Map seat types into price cards using their multiplier
        const mapped: TicketPrice[] = (seatTypes.length ? seatTypes : [
          { seatTypeId: 1, typeName: 'Vé Thường', priceMultiplier: 1, icon: '🎬' }
        ] as any).map((t: any, idx: number) => ({
          id: Number(t.seatTypeId ?? t.id ?? idx + 1),
          type: String(t.typeName ?? t.name ?? `Loại ${idx+1}`),
          price: Math.round(base * (Number(t.priceMultiplier ?? t.multiplier ?? 1))),
          description: String(t.description ?? t.note ?? ''),
          icon: String(t.icon ?? '🎟️')
        }))

        // store computed prices only; base not stored in component state
        setPrices(mapped)
      } catch (err) {
        console.error('Failed to load prices', err)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  if (isLoading) {
    return (
      <div className="price-page">
        <Header />
        <main className="price-container">
          <div className="loading">Đang tải giá vé...</div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="price-page">
      <Header />
      <main className="price-container">
        <section className="price-section">
          <div className="section-header">
            <h2>💰 Bảng Giá Vé</h2>
          </div>
          <div className="price-grid">
            {prices.map((item) => (
              <div key={item.id} className="price-card">
                <div className="price-icon">{item.icon}</div>
                <h3 className="price-type">{item.type}</h3>
                <p className="price-description">{item.description}</p>
                <div className="price-amount">
                  <span className="currency">₫</span>
                  <span className="amount">{item.price.toLocaleString("vi-VN")}</span>
                </div>
                {/* <button className="book-ticket-btn">Đặt Vé Ngay</button> */}
              </div>
            ))}
          </div>

        </section>
      </main>
      <Footer />
    </div>
  )
}

export default Price
