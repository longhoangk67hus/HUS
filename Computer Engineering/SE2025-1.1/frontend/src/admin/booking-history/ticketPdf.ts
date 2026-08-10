// Use dynamic import to avoid bundler issues and keep startup light.
// This helper will try to load a Unicode font from `/fonts/NotoSans-Regular.ttf`
// placed in `frontend/public/fonts/` so Vietnamese accents render correctly.
import type { jsPDF as JsPDFType } from 'jspdf'

async function loadJsPdf(): Promise<typeof import('jspdf')> {
  return await import('jspdf')
}

interface BookingForPdf {
  bookingId?: number
  bookingCode?: string
  userName?: string
  userCode?: string
  movieTitle?: string
  theaterName?: string
  startTime?: string | Date
  bookingDate?: string | Date
  seatsCodes?: string[]
  finalAmount?: number
}

const formatCurrency = (value?: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0)
}

const formatDate = (date?: string | Date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export async function generateTicketPdf(booking: BookingForPdf) {
  try {
    const jsPdfModule = await loadJsPdf()
    const { jsPDF } = jsPdfModule as unknown as { jsPDF: typeof JsPDFType }

    // Ticket size: 57 x 140 mm
    const widthMm = 60
    const heightMm = 100

    // Create doc with mm units and custom size
    const doc = new jsPDF({ unit: 'mm', format: [widthMm, heightMm] })

    // Attempt to load a Unicode-capable font (Noto Sans) from public assets.
    // Place a TTF file at /fonts/NotoSans-Regular.ttf (frontend/public/fonts)
    let activeFont = 'helvetica'
    try {
      // Try local Arial first (you asked for Arial), then local NotoSans, then remote fallback
      const tried = [
        '/fonts/Arial.ttf',
        '/fonts/NotoSans-Regular.ttf',
        'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf'
      ]
      let blob: Blob | null = null
      let loadedUrl: string | null = null
      for (const fontUrl of tried) {
        try {
          const res = await fetch(fontUrl)
          if (res.ok) {
            blob = await res.blob()
            loadedUrl = fontUrl
            console.debug('ticketPdf: loaded font from', fontUrl)
            break
          } else {
            console.debug('ticketPdf: font not found at', fontUrl)
          }
        } catch (e) {
          console.debug('ticketPdf: font fetch failed for', fontUrl, e)
        }
      }

      if (blob) {
        // Use FileReader to get a dataURL (safer for large binaries)
        const dataUrl: string = await new Promise((resolve, reject) => {
          const fr = new FileReader()
          fr.onload = () => resolve(fr.result as string)
          fr.onerror = (e) => reject(e)
          fr.readAsDataURL(blob as Blob)
        })

        // dataUrl looks like: data:font/ttf;base64,AAAA...
        const base64 = dataUrl.split(',')[1] || ''
        if (!base64) throw new Error('Failed to convert font to base64')

        // derive font file name and a friendly family name from the loaded URL
        const fontFile = (loadedUrl && loadedUrl.split('/').pop()) || 'NotoSans-Regular.ttf'
        let fontFamily = 'NotoSans'
        const lf = fontFile.toLowerCase()
        if (lf.includes('arial')) fontFamily = 'Arial'
        else if (lf.includes('notosans') || lf.includes('noto')) fontFamily = 'NotoSans'
        else if (lf.includes('liberation')) fontFamily = 'LiberationSans'
        else fontFamily = fontFile.replace(/\.[^.]+$/, '')

        const registerFont = (vfsName: string, base64data: string) => {
          try {
            // Preferred: register on jsPDF global API
            if ((jsPdfModule as any)?.jsPDF?.API?.addFileToVFS) {
              ;(jsPdfModule as any).jsPDF.API.addFileToVFS(vfsName, base64data)
              ;(jsPdfModule as any).jsPDF.API.addFont(vfsName, fontFamily, 'normal')
              return true
            }

            // Try doc constructor API
            const ctorApi = (doc as any)?.constructor?.API
            if (ctorApi && ctorApi.addFileToVFS) {
              ctorApi.addFileToVFS(vfsName, base64data)
              ctorApi.addFont(vfsName, fontFamily, 'normal')
              return true
            }

            // Try instance methods
            if ((doc as any).addFileToVFS) {
              ;(doc as any).addFileToVFS(vfsName, base64data)
              ;(doc as any).addFont(vfsName, fontFamily, 'normal')
              return true
            }

            // Last fallback: module-level addFileToVFS
            if ((jsPdfModule as any).addFileToVFS) {
              ;(jsPdfModule as any).addFileToVFS(vfsName, base64data)
              if ((jsPdfModule as any).addFont) {
                (jsPdfModule as any).addFont(vfsName, fontFamily, 'normal')
              }
              return true
            }

            return false
          } catch (e) {
            console.warn('registerFont error', e)
            return false
          }
        }

        const registered = registerFont(fontFile, base64)
        if (registered) {
          activeFont = fontFamily
          try { doc.setFont(activeFont, 'normal') } catch (e) { try { doc.setFont(activeFont) } catch (_) { /* ignore */ } }
        } else {
          console.warn('Could not register font for jsPDF; accents may still be wrong')
          try { doc.setFont(activeFont, 'normal') } catch (e) { /* ignore */ }
        }
        console.debug('ticketPdf font active:', activeFont, 'registered:', registered)
      } else {
        console.warn('Could not load font from tried locations — accents may render incorrectly', tried)
      }
    } catch (fontErr) {
      console.warn('Font load failed:', fontErr)
    }

    // Layout for small ticket with wrapping and nicer styling
    const marginLeft = 5
    const marginRight = 5

    // If jsPDF font registration failed or is unreliable, render ticket to a canvas
    // and embed as an image into the PDF. This ensures browser-rendered fonts
    // (which support Vietnamese) are used.
    const renderTicketToDataUrl = (): string => {
      // DPI for rendering: 150 is a good balance for clarity and size
      const DPI = 150
      const pxPerMm = DPI / 25.4
      const w = Math.round(widthMm * pxPerMm)
      const h = Math.round(heightMm * pxPerMm)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      // white background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)

      // helper to convert mm to px
      const mm = (v: number) => Math.round(v * pxPerMm)

      const marginPx = mm(marginLeft)
      const rightPx = w - mm(marginRight)

      // border
      ctx.strokeStyle = '#000'
      ctx.lineWidth = Math.max(1, Math.round(1 * pxPerMm * 0.05))
      ctx.strokeRect(mm(2), mm(2), w - mm(4), h - mm(4))

      // Cinema name first, then ticket title, with a bit more spacing
      ctx.fillStyle = '#000'
      ctx.textAlign = 'center'
      // Cinema name (big, bold)
      ctx.font = `bold ${Math.round(10 * pxPerMm * 0.35)}px ${activeFont}, Arial, sans-serif`
      ctx.fillText('🎥 CINEMAX', w / 2, mm(6))

      // Ticket title under cinema name, with extra spacing (moved further down)
      ctx.font = `${Math.round(14 * pxPerMm * 0.35)}px ${activeFont}, Arial, sans-serif`
      ctx.fillText('VÉ XEM PHIM', w / 2, mm(14))

      // Cinema address line (if available)
      ctx.font = `${Math.round(8 * pxPerMm * 0.35)}px ${activeFont}, Arial, sans-serif`
      const cinemaAddress = (booking as any).theaterAddress || booking.theaterName || ''
      if (cinemaAddress) ctx.fillText(cinemaAddress, w / 2, mm(18))

      // separator: place a bit further down when address exists
      let yPx = cinemaAddress ? mm(21) : mm(16)
      ctx.beginPath()
      ctx.moveTo(marginPx, yPx)
      ctx.lineTo(rightPx, yPx)
      ctx.strokeStyle = '#666'
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.textAlign = 'left'
      const labelFontPx = Math.round(8 * pxPerMm * 0.35)
      const valueFontPx = Math.round(9 * pxPerMm * 0.35)

      const drawLabelValue = (label: string, value: string) => {
        yPx += mm(4)
        ctx.font = `bold ${labelFontPx}px ${activeFont}, Arial, sans-serif`
        ctx.fillText(label, marginPx, yPx)
        const labelW = ctx.measureText(label).width
        ctx.font = `${valueFontPx}px ${activeFont}, Arial, sans-serif`
        const lines = wrapText(ctx, value, rightPx - (marginPx + labelW + mm(2)))
        for (const ln of lines) {
          ctx.fillText(ln, marginPx + labelW + mm(2), yPx)
          yPx += mm(4)
        }
      }

      const wrapText = (ctx2: CanvasRenderingContext2D, text: string, maxWidth: number) => {
        const words = text.split(' ')
        const lines: string[] = []
        let cur = ''
        for (const wword of words) {
          const test = cur ? cur + ' ' + wword : wword
          const tw = ctx2.measureText(test).width
          if (tw > maxWidth && cur) {
            lines.push(cur)
            cur = wword
          } else {
            cur = test
          }
        }
        if (cur) lines.push(cur)
        return lines
      }

      drawLabelValue('Phim:', booking.movieTitle || '')
      drawLabelValue('Mã:', booking.bookingCode || '')
      drawLabelValue('Rạp:', booking.theaterName || '')
      // Phòng / Screen name: try many common property shapes used in project APIs
      const asAny = booking as any
      const roomName = asAny.roomName
        || (typeof asAny.room === 'string' ? asAny.room : (asAny.room && (asAny.room.name || asAny.room.roomName)))
        || asAny.theaterRoom
        || asAny.screenName
        || asAny.screen
        || (asAny.showtime && (asAny.showtime.room || asAny.showtime.screen || asAny.showtime.roomName))
        || (asAny.theater && (asAny.theater.room || asAny.theater.screen || asAny.theater.roomName))
        || ''
      drawLabelValue('Phòng:', roomName || '-')
      drawLabelValue('Suất:', formatDate(booking.startTime))
      drawLabelValue('Ghế:', booking.seatsCodes?.join(', ') || '')

      yPx += mm(4)
      // total
      ctx.font = `bold ${Math.round(12 * pxPerMm * 0.35)}px ${activeFont}, Arial, sans-serif`
      const totalText = `Tổng: ${formatCurrency(booking.finalAmount)}`
      const totalWpx = ctx.measureText(totalText).width
      ctx.fillText(totalText, rightPx - totalWpx, yPx)

      yPx += mm(8)
      ctx.font = `${Math.round(7 * pxPerMm * 0.35)}px ${activeFont}, Arial, sans-serif`
      const dashY = yPx + mm(4)
      ctx.strokeStyle = '#999'
      ctx.lineWidth = 1
      let curXpx = marginPx
      const dashPx = mm(0.8)
      const gapPx = mm(0.6)
      while (curXpx < rightPx) {
        const x2 = Math.min(curXpx + dashPx, rightPx)
        ctx.beginPath()
        ctx.moveTo(curXpx, dashY)
        ctx.lineTo(x2, dashY)
        ctx.stroke()
        curXpx += dashPx + gapPx
      }

      return canvas.toDataURL('image/png')
    }

    const imgData = renderTicketToDataUrl()
    doc.addImage(imgData, 'PNG', 0, 0, widthMm, heightMm)
    const fileName = `${booking.bookingCode || 'ticket'}_${booking.bookingId || ''}.pdf`
    doc.save(fileName)
  } catch (err) {
    console.error('generateTicketPdf error:', err)
    alert('Lỗi khi xuất vé: ' + (err as Error).message)
  }
}
